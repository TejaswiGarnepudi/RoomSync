const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'chore_assigned',
      'chore_due',
      'chore_completed',
      'help_request',
      'help_accepted',
      'help_completed',
      'poll_created',
      'poll_ending',
      'poll_closed',
      'expense_added',
      'expense_payment',
      'shopping_assigned',
      'shopping_due',
      'system'
    ]
  },
  title: {
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
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ householdId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
