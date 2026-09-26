const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
  optionId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: [true, 'Option text is required'],
    trim: true
  }
}, { _id: false });

const pollSchema = new mongoose.Schema({
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Poll question/title is required'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  options: {
    type: [pollOptionSchema],
    validate: [
      (val) => val.length >= 2,
      'A poll must have at least 2 options'
    ]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  allowMultiple: {
    type: Boolean,
    default: false
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  deadline: {
    type: Date,
    default: null,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'expired'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true
});

pollSchema.index({ householdId: 1, status: 1 });
pollSchema.index({ householdId: 1, deadline: 1 });

module.exports = mongoose.model('Poll', pollSchema);
