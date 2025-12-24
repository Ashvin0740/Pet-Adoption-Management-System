const express = require('express');
const { body, validationResult } = require('express-validator');
const Adoption = require('../models/Adoption');
const Pet = require('../models/Pet');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all adoptions
router.get('/', auth, async (req, res) => {
  try {
    // Admins should not access this endpoint (they use admin dashboard)
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot view user applications from this endpoint. Use admin dashboard.' });
    }
    
    let query = { applicant: req.user._id };

    const adoptions = await Adoption.find(query)
      .populate('pet')
      .populate('applicant', 'name email phone')
      .populate('reviewedBy', 'name email')
      .sort({ applicationDate: -1 });

    res.json(adoptions);
  } catch (error) {
    console.error('Get adoptions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single adoption
router.get('/:id', auth, async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id)
      .populate('pet')
      .populate('applicant', 'name email phone address')
      .populate('reviewedBy', 'name email');

    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }

    // Check authorization
    if (adoption.applicant._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(adoption);
  } catch (error) {
    console.error('Get adoption error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create adoption application
router.post('/', auth, [
  body('pet').notEmpty().withMessage('Pet ID is required'),
], async (req, res) => {
  try {
    // Admins cannot submit adoption applications
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Administrators cannot submit adoption applications' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pet, applicantInfo, contactInfo, notes } = req.body;

    // Validate agreeToTerms
    if (!applicantInfo?.agreeToTerms) {
      return res.status(400).json({ message: 'You must agree to the terms and conditions' });
    }

    // Check if pet exists and is available
    const petDoc = await Pet.findById(pet);
    if (!petDoc) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    if (petDoc.status !== 'Available') {
      return res.status(400).json({ message: 'Pet is not available for adoption' });
    }

    // Check if user already applied
    const existingApplication = await Adoption.findOne({
      pet,
      applicant: req.user._id,
      status: { $in: ['Pending', 'Approved'] }
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this pet' });
    }

    const adoption = new Adoption({
      pet,
      applicant: req.user._id,
      applicantInfo,
      contactInfo: contactInfo || {
        phone: req.user.phone,
        email: req.user.email,
        address: req.user.address
      },
      notes
    });

    await adoption.save();

    // Update pet status to pending
    petDoc.status = 'Pending';
    await petDoc.save();

    await adoption.populate('pet');
    await adoption.populate('applicant', 'name email phone');

    res.status(201).json(adoption);
  } catch (error) {
    console.error('Create adoption error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update adoption status (admin only)
router.put('/:id/status', adminAuth, [
  body('status').isIn(['Pending', 'Approved', 'Rejected', 'Cancelled']).withMessage('Invalid status'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes } = req.body;

    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }

    adoption.status = status;
    adoption.reviewDate = new Date();
    adoption.reviewedBy = req.user._id;
    if (notes) adoption.notes = notes;

    await adoption.save();

    // Update pet status
    const pet = await Pet.findById(adoption.pet);
    if (status === 'Approved') {
      pet.status = 'Adopted';
      pet.adoptedBy = adoption.applicant;
    } else if (status === 'Rejected' || status === 'Cancelled') {
      // Check if there are other pending applications
      const pendingApplications = await Adoption.countDocuments({
        pet: adoption.pet,
        status: 'Pending',
        _id: { $ne: adoption._id }
      });

      if (pendingApplications === 0) {
        pet.status = 'Available';
      }
    }

    await pet.save();

    await adoption.populate('pet');
    await adoption.populate('applicant', 'name email phone');
    await adoption.populate('reviewedBy', 'name email');

    res.json(adoption);
  } catch (error) {
    console.error('Update adoption status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel own adoption application
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    // Admins cannot cancel applications (they approve/reject them)
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Administrators cannot cancel adoption applications' });
    }

    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }

    if (adoption.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (adoption.status !== 'Pending') {
      return res.status(400).json({ message: 'Can only cancel pending applications' });
    }

    adoption.status = 'Cancelled';
    await adoption.save();

    // Update pet status
    const pet = await Pet.findById(adoption.pet);
    const pendingApplications = await Adoption.countDocuments({
      pet: adoption.pet,
      status: 'Pending',
      _id: { $ne: adoption._id }
    });

    if (pendingApplications === 0) {
      pet.status = 'Available';
      await pet.save();
    }

    await adoption.populate('pet');
    await adoption.populate('applicant', 'name email phone');

    res.json(adoption);
  } catch (error) {
    console.error('Cancel adoption error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

