const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Pet = require('../models/Pet');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all pets with filters
router.get('/', async (req, res) => {
  try {
    const {
      type,
      gender,
      size,
      status,
      minAge,
      maxAge,
      search,
      location,
      postedBy,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (gender) query.gender = gender;
    if (size) query.size = size;
    if (status) query.status = status;
    if (location) query['location.city'] = new RegExp(location, 'i');
    if (postedBy) query.postedBy = postedBy;
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { breed: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const pets = await Pet.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Pet.countDocuments(query);

    res.json({
      pets,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single pet
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('postedBy', 'name email phone')
      .populate('adoptedBy', 'name email');

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json(pet);
  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create pet (requires admin auth)
router.post('/', adminAuth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('age').isNumeric().withMessage('Age must be a number'),
  body('gender').notEmpty().withMessage('Gender is required'),
  body('size').notEmpty().withMessage('Size is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const petData = {
      ...req.body,
      postedBy: req.user._id
    };

    const pet = new Pet(petData);
    await pet.save();
    await pet.populate('postedBy', 'name email');

    res.status(201).json(pet);
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update pet (requires admin auth)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    Object.assign(pet, req.body);
    pet.updatedAt = Date.now();
    await pet.save();
    await pet.populate('postedBy', 'name email');

    res.json(pet);
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete pet (requires admin auth)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

