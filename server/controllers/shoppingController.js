const ShoppingList = require('../models/ShoppingList');
const ShoppingItem = require('../models/ShoppingItem');
const RecurringShopping = require('../models/RecurringShopping');
const Expense = require('../models/Expense');
const Household = require('../models/Household');
const { getUserHousehold } = require('../services/availabilityService');
const {
  calculateNextDueDate,
  checkDueRecurringItems,
  advanceRecurringItemDueDate
} = require('../services/shoppingRecurrenceService');
const { createNotification } = require('../services/notificationService');
const { logActivity } = require('../services/activityService');

// @desc    Create a new shopping list
// @route   POST /api/shopping/lists
// @access  Private
exports.createShoppingList = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household to create shopping lists');
    }

    const {
      name,
      description = '',
      shoppingDate,
      shoppingTime = '17:00',
      assignedTo: rawAssignedTo
    } = req.body;

    const assignedTo = rawAssignedTo && typeof rawAssignedTo === 'string' && rawAssignedTo.trim() !== '' ? rawAssignedTo.trim() : null;
    const finalShoppingDate = shoppingDate || new Date().toISOString().split('T')[0];

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Please provide shopping list name');
    }

    if (assignedTo) {
      const isMember = household.members.some(m => m.toString() === assignedTo.toString());
      if (!isMember) {
        res.status(400);
        throw new Error('Assigned roommate must belong to this household');
      }
    }

    const list = await ShoppingList.create({
      householdId: household._id,
      name: name.trim(),
      description,
      shoppingDate: finalShoppingDate,
      shoppingTime,
      assignedTo: assignedTo || null,
      status: 'planned',
      createdBy: req.user._id
    });

    const populated = await ShoppingList.findById(list._id)
      .populate('assignedTo createdBy', 'name email profilePhoto');

    const io = req.app.get('io');
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        userId: assignedTo,
        householdId: household._id,
        type: 'shopping_assigned',
        title: 'Shopping Responsibility Assigned',
        message: `${req.user.name} assigned you the shopping list: "${list.name}".`,
        entityType: 'shopping',
        entityId: list._id,
        io
      });
    }

    res.status(201).json({
      success: true,
      message: 'Shopping list created successfully',
      data: { shoppingList: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all household shopping lists
// @route   GET /api/shopping/lists
// @access  Private
exports.getShoppingLists = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household to view shopping lists');
    }

    const { status } = req.query;
    const filter = { householdId: household._id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const lists = await ShoppingList.find(filter)
      .populate('assignedTo createdBy', 'name email profilePhoto')
      .sort({ shoppingDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { shoppingLists: lists }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shopping list by ID with items
// @route   GET /api/shopping/lists/:id
// @access  Private
exports.getShoppingListById = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const list = await ShoppingList.findById(req.params.id)
      .populate('assignedTo createdBy', 'name email profilePhoto');

    if (!list) {
      res.status(404);
      throw new Error('Shopping list not found');
    }

    if (list.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const items = await ShoppingItem.find({ shoppingListId: list._id })
      .populate('addedBy', 'name email profilePhoto')
      .sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: {
        shoppingList: list,
        items
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update shopping list
// @route   PUT /api/shopping/lists/:id
// @access  Private
exports.updateShoppingList = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const list = await ShoppingList.findById(req.params.id);
    if (!list) {
      res.status(404);
      throw new Error('Shopping list not found');
    }

    if (list.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const {
      name,
      description,
      shoppingDate,
      shoppingTime,
      assignedTo,
      status
    } = req.body;

    if (name !== undefined) list.name = name;
    if (description !== undefined) list.description = description;
    if (shoppingDate !== undefined) list.shoppingDate = shoppingDate;
    if (shoppingTime !== undefined) list.shoppingTime = shoppingTime;
    if (assignedTo !== undefined) list.assignedTo = assignedTo || null;
    if (status !== undefined) list.status = status;

    await list.save();

    const populated = await ShoppingList.findById(list._id)
      .populate('assignedTo createdBy', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Shopping list updated successfully',
      data: { shoppingList: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shopping list
// @route   DELETE /api/shopping/lists/:id
// @access  Private
exports.deleteShoppingList = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const list = await ShoppingList.findById(req.params.id);
    if (!list) {
      res.status(404);
      throw new Error('Shopping list not found');
    }

    if (list.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    await ShoppingList.deleteOne({ _id: list._id });
    await ShoppingItem.deleteMany({ shoppingListId: list._id });

    res.status(200).json({
      success: true,
      message: 'Shopping list and items deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to a shopping list
// @route   POST /api/shopping/lists/:id/items
// @access  Private
exports.addItemToList = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const list = await ShoppingList.findById(req.params.id);
    if (!list) {
      res.status(404);
      throw new Error('Shopping list not found');
    }

    if (list.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const {
      name,
      quantity = 1,
      unit = 'pcs',
      category = 'groceries',
      priority = 'medium',
      estimatedPrice = 0
    } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Item name is required');
    }

    const item = await ShoppingItem.create({
      shoppingListId: list._id,
      householdId: household._id,
      name,
      quantity: Number(quantity),
      unit,
      category,
      priority,
      estimatedPrice: Number(estimatedPrice),
      addedBy: req.user._id,
      status: 'needed'
    });

    const populated = await ShoppingItem.findById(item._id)
      .populate('addedBy', 'name email profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Item added to shopping list',
      data: { item: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update shopping item (e.g. mark purchased)
// @route   PUT /api/shopping/items/:id
// @access  Private
exports.updateShoppingItem = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const item = await ShoppingItem.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Shopping item not found');
    }

    if (item.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const {
      name,
      quantity,
      unit,
      category,
      priority,
      estimatedPrice,
      actualPrice,
      status
    } = req.body;

    if (name !== undefined) item.name = name;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit !== undefined) item.unit = unit;
    if (category !== undefined) item.category = category;
    if (priority !== undefined) item.priority = priority;
    if (estimatedPrice !== undefined) item.estimatedPrice = Number(estimatedPrice);
    if (actualPrice !== undefined) item.actualPrice = Number(actualPrice);
    if (status !== undefined) item.status = status;

    await item.save();

    const populated = await ShoppingItem.findById(item._id)
      .populate('addedBy', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: { item: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shopping item
// @route   DELETE /api/shopping/items/:id
// @access  Private
exports.deleteShoppingItem = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const item = await ShoppingItem.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Shopping item not found');
    }

    if (item.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    await ShoppingItem.deleteOne({ _id: item._id });

    res.status(200).json({
      success: true,
      message: 'Item removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create recurring shopping item
// @route   POST /api/shopping/recurring
// @access  Private
exports.createRecurringItem = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const {
      itemName,
      quantity = 1,
      unit = 'pcs',
      category = 'groceries',
      estimatedPrice = 0,
      recurrenceType = 'monthly',
      interval = 1,
      nextDueDate
    } = req.body;

    if (!itemName) {
      res.status(400);
      throw new Error('Item name is required');
    }

    const finalDueDate = nextDueDate || calculateNextDueDate(recurrenceType, Number(interval));

    const recurring = await RecurringShopping.create({
      householdId: household._id,
      itemName,
      quantity: Number(quantity),
      unit,
      category,
      estimatedPrice: Number(estimatedPrice),
      recurrenceType,
      interval: Number(interval),
      nextDueDate: finalDueDate,
      active: true,
      createdBy: req.user._id
    });

    const populated = await RecurringShopping.findById(recurring._id)
      .populate('createdBy', 'name email profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Recurring shopping item created',
      data: { recurringItem: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recurring shopping items
// @route   GET /api/shopping/recurring
// @access  Private
exports.getRecurringItems = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const items = await RecurringShopping.find({ householdId: household._id })
      .populate('createdBy', 'name email profilePhoto')
      .sort({ nextDueDate: 1 });

    res.status(200).json({
      success: true,
      data: { recurringItems: items }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recurring item (e.g. pause / change interval)
// @route   PUT /api/shopping/recurring/:id
// @access  Private
exports.updateRecurringItem = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const item = await RecurringShopping.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Recurring item not found');
    }

    if (item.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const {
      itemName,
      quantity,
      unit,
      category,
      estimatedPrice,
      recurrenceType,
      interval,
      nextDueDate,
      active
    } = req.body;

    if (itemName !== undefined) item.itemName = itemName;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit !== undefined) item.unit = unit;
    if (category !== undefined) item.category = category;
    if (estimatedPrice !== undefined) item.estimatedPrice = Number(estimatedPrice);
    if (recurrenceType !== undefined) item.recurrenceType = recurrenceType;
    if (interval !== undefined) item.interval = Number(interval);
    if (nextDueDate !== undefined) item.nextDueDate = nextDueDate;
    if (active !== undefined) item.active = active;

    await item.save();

    const populated = await RecurringShopping.findById(item._id)
      .populate('createdBy', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Recurring item updated',
      data: { recurringItem: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recurring item
// @route   DELETE /api/shopping/recurring/:id
// @access  Private
exports.deleteRecurringItem = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const item = await RecurringShopping.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Recurring item not found');
    }

    if (item.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    await RecurringShopping.deleteOne({ _id: item._id });

    res.status(200).json({
      success: true,
      message: 'Recurring item removed'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming and due recurring shopping items
// @route   GET /api/shopping/upcoming
// @access  Private
exports.getUpcomingShopping = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const dueData = await checkDueRecurringItems(household._id);

    res.status(200).json({
      success: true,
      data: dueData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a shared expense from a completed shopping list
// @route   POST /api/shopping/lists/:id/generate-expense
// @access  Private
exports.generateExpenseFromList = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const list = await ShoppingList.findById(req.params.id);
    if (!list) {
      res.status(404);
      throw new Error('Shopping list not found');
    }

    if (list.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const items = await ShoppingItem.find({ shoppingListId: list._id });

    const totalCalculated = items.reduce((acc, item) => {
      const price = item.actualPrice > 0 ? item.actualPrice : (item.estimatedPrice > 0 ? item.estimatedPrice : 0);
      return acc + (price * (item.quantity || 1));
    }, 0);

    const expenseAmount = req.body.amount ? Number(req.body.amount) : Math.max(1, totalCalculated);
    const splitType = req.body.splitType || 'equal';
    const paidBy = req.body.paidBy || req.user._id;

    // Create equal split among all household members by default
    const memberCount = household.members.length;
    const baseShare = Math.floor((expenseAmount / memberCount) * 100) / 100;
    let remainder = Math.round((expenseAmount - (baseShare * memberCount)) * 100) / 100;

    const participants = household.members.map((mId, idx) => {
      let share = baseShare;
      if (idx === 0 && remainder > 0) share = Math.round((share + remainder) * 100) / 100;
      const isPayer = mId.toString() === paidBy.toString();

      return {
        user: mId,
        shareAmount: share,
        percentage: Math.round((100 / memberCount) * 100) / 100,
        paidStatus: isPayer ? 'paid' : 'pending',
        paidAt: isPayer ? new Date() : null
      };
    });

    const expense = await Expense.create({
      householdId: household._id,
      title: `${list.name} (Shopping)`,
      description: `Generated from shopping list completed on ${list.shoppingDate}`,
      category: 'groceries',
      amount: expenseAmount,
      paidBy,
      expenseDate: list.shoppingDate,
      splitType,
      participants,
      status: 'pending',
      createdBy: req.user._id
    });

    list.status = 'completed';
    list.expenseId = expense._id;
    await list.save();

    const populated = await Expense.findById(expense._id)
      .populate('paidBy createdBy participants.user', 'name email profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Expense created from shopping list',
      data: {
        expense: populated,
        shoppingList: list
      }
    });
  } catch (error) {
    next(error);
  }
};
