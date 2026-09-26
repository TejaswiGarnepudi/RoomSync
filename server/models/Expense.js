const mongoose = require('mongoose');

const participantShareSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shareAmount: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    default: null
  },
  paidStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paidAt: {
    type: Date,
    default: null
  }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    enum: [
      'rent',
      'utilities',
      'electricity',
      'water',
      'internet',
      'groceries',
      'food',
      'household',
      'maintenance',
      'transport',
      'other'
    ],
    default: 'household',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Expense amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expenseDate: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Expense date is required'],
    index: true
  },
  splitType: {
    type: String,
    enum: ['equal', 'custom', 'percentage'],
    default: 'equal',
    required: true
  },
  participants: [participantShareSchema],
  status: {
    type: String,
    enum: ['pending', 'settled'],
    default: 'pending',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes
expenseSchema.index({ householdId: 1, expenseDate: -1 });
expenseSchema.index({ householdId: 1, category: 1 });
expenseSchema.index({ paidBy: 1, expenseDate: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
