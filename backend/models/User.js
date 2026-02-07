const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  skillsOffered: {
    type: [String],
    default: [],
  },
  skillsWanted: {
    type: [String],
    default: [],
  },
  availability: {
    type: String,
    enum: ['Weekdays', 'Weekends', 'Flexible'],
    default: 'Flexible',
  },
  bio: {
    type: String,
    default: '',
  },
  skillPoints: {
    type: Number,
    default: 0,
  },
  credits: {
    type: Number,
    default: 10,
  },
  badges: {
    type: [String],
    default: [],
  },
  completedSwaps: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);