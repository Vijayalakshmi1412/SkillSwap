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
    enum: ['pending', 'accepted', 'rejected', 'scheduled', 'completed'],
    default: 'pending',
  },
  message: {
    type: String,
    default: '',
  },
  // Scheduling fields
  proposedTime: {
    type: Date,
  },
  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  confirmedTime: {
    type: Date,
  },
  meetingLink: {
    type: String,
  },
  // Completion tracking
  requesterCompleted: {
    type: Boolean,
    default: false,
  },
  recipientCompleted: {
    type: Boolean,
    default: false,
  },
  completedDate: {
    type: Date,
  },
  // Swap room data
  notes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  chat: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Swap', swapSchema);