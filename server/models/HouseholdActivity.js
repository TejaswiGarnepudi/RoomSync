const mongoose = require('mongoose');

const householdActivitySchema = new mongoose.Schema({
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
    index: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  entityType: {
    type: String,
    enum: ['chore', 'help', 'poll', 'expense', 'shopping', 'calendar', 'household', 'system'],
    default: 'system'
  },
  entityId: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

householdActivitySchema.index({ householdId: 1, createdAt: -1 });

module.exports = mongoose.model('HouseholdActivity', householdActivitySchema);
