const mongoose = require('mongoose');

const shoppingItemSchema = new mongoose.Schema({
  shoppingListId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShoppingList',
    default: null,
    index: true
  },
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0.1
  },
  unit: {
    type: String,
    default: 'pcs',
    trim: true
  },
  category: {
    type: String,
    enum: ['groceries', 'household', 'cleaning', 'toiletries', 'bathroom', 'kitchen', 'snacks', 'beverages', 'maintenance', 'other'],
    default: 'groceries'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  estimatedPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  actualPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['needed', 'purchased', 'unavailable'],
    default: 'needed',
    index: true
  }
}, {
  timestamps: true
});

shoppingItemSchema.index({ householdId: 1, status: 1 });

module.exports = mongoose.model('ShoppingItem', shoppingItemSchema);
