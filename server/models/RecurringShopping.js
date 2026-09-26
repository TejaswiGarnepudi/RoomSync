const mongoose = require('mongoose');

const recurringShoppingSchema = new mongoose.Schema({
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
    index: true
  },
  itemName: {
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
  estimatedPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  recurrenceType: {
    type: String,
    enum: ['weekly', 'monthly', 'custom_days'],
    default: 'monthly',
    required: true
  },
  interval: {
    type: Number,
    default: 1, // e.g. every 1 month, every 2 weeks, or every 30 days
    min: 1
  },
  nextDueDate: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

recurringShoppingSchema.index({ householdId: 1, nextDueDate: 1 });

module.exports = mongoose.model('RecurringShopping', recurringShoppingSchema);
