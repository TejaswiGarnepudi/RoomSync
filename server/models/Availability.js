const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
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
  date: {
    type: String, // Format: YYYY-MM-DD (e.g., "2026-10-05")
    required: function() {
      return this.recurrenceType === 'none';
    },
    index: true
  },
  startTime: {
    type: String, // Format: HH:MM in 24h format (e.g., "09:00", "17:30")
    required: true
  },
  endTime: {
    type: String, // Format: HH:MM in 24h format (e.g., "17:00", "19:00")
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'busy'],
    default: 'available',
    required: true
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  visibility: {
    type: String,
    enum: ['private', 'household'],
    default: 'household',
    required: true
  },
  recurrenceType: {
    type: String,
    enum: ['none', 'weekly'],
    default: 'none',
    required: true
  },
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
    min: 0,
    max: 6,
    required: function() {
      return this.recurrenceType === 'weekly';
    }
  },
  recurrenceEndDate: {
    type: String, // Format: YYYY-MM-DD (optional end date for weekly recurrence)
    default: null
  }
}, {
  timestamps: true
});

// Indexes for fast lookups
availabilitySchema.index({ userId: 1, date: 1 });
availabilitySchema.index({ householdId: 1, date: 1 });
availabilitySchema.index({ householdId: 1, recurrenceType: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);
