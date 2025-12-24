const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  reviewDate: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  applicantInfo: {
    livingSituation: String,
    hasOtherPets: Boolean,
    experienceWithPets: String,
    reasonForAdoption: String,
    agreeToTerms: Boolean
  },
  contactInfo: {
    phone: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  }
});

module.exports = mongoose.model('Adoption', adoptionSchema);

