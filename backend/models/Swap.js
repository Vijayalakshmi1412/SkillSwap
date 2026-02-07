const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requesterSkill: {
    type: String,
    required: true,
  },
  recipientSkill: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  message: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  completedDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Swap', swapSchema);