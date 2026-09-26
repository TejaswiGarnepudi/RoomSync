const mongoose = require('mongoose');

const choreSchema = new mongoose.Schema({
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Chore title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    enum: ['cleaning', 'kitchen', 'bathroom', 'garbage', 'maintenance', 'general', 'other'],
    default: 'general',
    required: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    required: true
  },
  dueDate: {
    type: String, // Format: YYYY-MM-DD (e.g. "2026-10-10")
    required: [true, 'Due date is required'],
    index: true
  },
  dueTime: {
    type: String, // Format: HH:MM in 24h format (e.g. "19:00")
    default: '23:59'
  },
  startTime: {
    type: String, // Optional scheduled start time (HH:MM) for calendar display
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'overdue', 'cancelled'],
    default: 'pending',
    index: true
  },
  assignmentType: {
    type: String,
    enum: ['manual', 'claimed', 'smart', 'unassigned'],
    default: 'unassigned'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recurrence: {
    type: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'custom_weekly'],
      default: 'none'
    },
    interval: {
      type: Number,
      default: 1 // every N days or weeks (e.g. 2 = every 2 weeks)
    },
    dayOfWeek: {
      type: Number, // 0=Sun, 1=Mon, ..., 6=Sat
      default: null
    }
  },
  recurrenceEndDate: {
    type: String, // Format: YYYY-MM-DD (optional end date)
    default: null
  },
  parentChoreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chore',
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for optimal queries
choreSchema.index({ householdId: 1, status: 1 });
choreSchema.index({ householdId: 1, dueDate: 1 });
choreSchema.index({ assignedTo: 1, status: 1 });
choreSchema.index({ householdId: 1, createdAt: -1 });

module.exports = mongoose.model('Chore', choreSchema);
