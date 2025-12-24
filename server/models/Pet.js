const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other']
  },
  breed: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 0
  },
  ageUnit: {
    type: String,
    enum: ['months', 'years'],
    default: 'months'
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Unknown'],
    required: true
  },
  size: {
    type: String,
    enum: ['Small', 'Medium', 'Large'],
    required: true
  },
  color: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Available', 'Adopted', 'Pending', 'Not Available'],
    default: 'Available'
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  healthStatus: {
    vaccinated: { type: Boolean, default: false },
    spayedNeutered: { type: Boolean, default: false },
    healthNotes: String
  },
  specialNeeds: [{
    type: String
  }],
  adoptionFee: {
    type: Number,
    default: 0
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adoptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

petSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Pet', petSchema);

