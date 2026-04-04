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
  // More granular status tracking
  detailedStatus: {
    type: String,
    enum: ['pending', 'accepted-not-scheduled', 'accepted-scheduled', 'accepted-confirmed', 'rejected', 'accepted-completed'],
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
  // Meeting confirmation fields
  requesterConfirmed: {
    type: Boolean,
    default: false,
  },
  recipientConfirmed: {
    type: Boolean,
    default: false,
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

// Pre-save middleware to update detailedStatus based on status
swapSchema.pre('save', function(next) {
  if (this.status === 'pending') {
    this.detailedStatus = 'pending';
  } else if (this.status === 'accepted' && !this.proposedTime) {
    this.detailedStatus = 'accepted-not-scheduled';
  } else if (this.status === 'accepted' && this.proposedTime && !this.isFullyConfirmed()) {
    this.detailedStatus = 'accepted-scheduled';
  } else if (this.status === 'accepted' && this.proposedTime && this.isFullyConfirmed()) {
    this.detailedStatus = 'accepted-confirmed';
  } else if (this.status === 'rejected') {
    this.detailedStatus = 'rejected';
  } else if (this.status === 'completed') {
    this.detailedStatus = 'accepted-completed';
  }
  next();
});

// Instance method to check if both parties have confirmed the meeting
swapSchema.methods.isFullyConfirmed = function() {
  return this.requesterConfirmed && this.recipientConfirmed;
};

module.exports = mongoose.model('Swap', swapSchema);