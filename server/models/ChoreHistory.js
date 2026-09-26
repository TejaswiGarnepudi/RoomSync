const mongoose = require('mongoose');

const choreHistorySchema = new mongoose.Schema({
  choreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chore',
    required: true,
    index: true
  },
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: [
      'created',
      'assigned',
      'claimed',
      'reassigned',
      'completed',
      'marked_overdue',
      'unassigned',
      'updated',
      'cancelled'
    ],
    required: true
  },
  previousAssignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  newAssignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for historical queries
choreHistorySchema.index({ householdId: 1, timestamp: -1 });
choreHistorySchema.index({ choreId: 1, timestamp: -1 });

module.exports = mongoose.model('ChoreHistory', choreHistorySchema);
