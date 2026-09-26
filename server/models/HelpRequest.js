const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
    index: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  type: {
    type: String,
    enum: ['lift', 'pickup', 'shopping', 'moving', 'delivery', 'errand', 'other'],
    default: 'errand',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Date is required'],
    index: true
  },
  startTime: {
    type: String, // Format: HH:MM (24h)
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String, // Format: HH:MM (24h)
    required: [true, 'End time is required']
  },
  location: {
    type: String,
    default: '',
    trim: true
  },
  fromLocation: {
    type: String,
    default: '',
    trim: true
  },
  toLocation: {
    type: String,
    default: '',
    trim: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired'],
    default: 'open',
    index: true
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

helpRequestSchema.index({ householdId: 1, status: 1 });
helpRequestSchema.index({ householdId: 1, date: 1 });
helpRequestSchema.index({ requester: 1, status: 1 });
helpRequestSchema.index({ acceptedBy: 1, status: 1 });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
