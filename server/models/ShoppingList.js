const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema({
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Shopping list name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  shoppingDate: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Shopping date is required'],
    index: true
  },
  shoppingTime: {
    type: String, // Format: HH:MM
    default: '17:00'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['planned', 'shopping', 'completed', 'cancelled'],
    default: 'planned',
    index: true
  },
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

shoppingListSchema.index({ householdId: 1, shoppingDate: 1 });
shoppingListSchema.index({ householdId: 1, status: 1 });

module.exports = mongoose.model('ShoppingList', shoppingListSchema);
