const Chore = require('../models/Chore');
const Expense = require('../models/Expense');
const ShoppingList = require('../models/ShoppingList');
const ShoppingItem = require('../models/ShoppingItem');
const HelpRequest = require('../models/HelpRequest');
const Poll = require('../models/Poll');
const { getUserHousehold } = require('../services/availabilityService');

// @desc    Global search across all household entities
// @route   GET /api/search?q=...
// @access  Private
exports.globalSearch = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household to search');
    }

    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({
        success: true,
        data: {
          query: '',
          results: { chores: [], expenses: [], shopping: [], help: [], polls: [] },
          totalMatches: 0
        }
      });
    }

    const regex = new RegExp(q.trim(), 'i');

    const [chores, expenses, shoppingLists, shoppingItems, helpRequests, polls] = await Promise.all([
      Chore.find({
        householdId: household._id,
        $or: [{ title: regex }, { description: regex }, { category: regex }]
      }).limit(5).lean(),

      Expense.find({
        householdId: household._id,
        $or: [{ title: regex }, { category: regex }, { notes: regex }]
      }).limit(5).lean(),

      ShoppingList.find({
        householdId: household._id,
        $or: [{ name: regex }, { store: regex }]
      }).limit(5).lean(),

      ShoppingItem.find({
        householdId: household._id,
        name: regex
      }).populate('listId', 'name').limit(5).lean(),

      HelpRequest.find({
        householdId: household._id,
        $or: [{ title: regex }, { description: regex }, { location: regex }, { fromLocation: regex }, { toLocation: regex }]
      }).limit(5).lean(),

      Poll.find({
        householdId: household._id,
        $or: [{ title: regex }, { description: regex }, { 'options.text': regex }]
      }).limit(5).lean()
    ]);

    const totalMatches = chores.length + expenses.length + shoppingLists.length + shoppingItems.length + helpRequests.length + polls.length;

    res.status(200).json({
      success: true,
      data: {
        query: q.trim(),
        results: {
          chores,
          expenses,
          shoppingLists,
          shoppingItems,
          helpRequests,
          polls
        },
        totalMatches
      }
    });
  } catch (error) {
    next(error);
  }
};
