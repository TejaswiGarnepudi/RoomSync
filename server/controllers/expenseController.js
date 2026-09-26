const Expense = require('../models/Expense');
const Household = require('../models/Household');
const { getUserHousehold } = require('../services/availabilityService');
const { calculateHouseholdBalances } = require('../services/expenseBalanceService');
const { simplifyDebts } = require('../services/debtSimplificationService');
const { createNotification, createBulkNotifications } = require('../services/notificationService');
const { logActivity } = require('../services/activityService');

// @desc    Create a new shared expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household to add expenses');
    }

    const {
      title,
      description = '',
      category = 'household',
      amount,
      paidBy = req.user._id,
      expenseDate,
      splitType = 'equal',
      participants = []
    } = req.body;

    if (!title || !amount || !expenseDate) {
      res.status(400);
      throw new Error('Please provide title, amount, and expenseDate');
    }

    const totalAmount = Number(amount);
    if (totalAmount <= 0 || isNaN(totalAmount)) {
      res.status(400);
      throw new Error('Expense amount must be greater than 0');
    }

    // Validate payer is a household member
    const isPayerMember = household.members.some(m => m.toString() === paidBy.toString());
    if (!isPayerMember) {
      res.status(400);
      throw new Error('Payer must be a member of this household');
    }

    if (!participants || participants.length === 0) {
      res.status(400);
      throw new Error('Please select at least one participant for this expense');
    }

    // Validate all participants belong to the household
    const memberIds = household.members.map(m => m.toString());
    for (const p of participants) {
      const pId = p.user ? (p.user._id || p.user).toString() : p.toString();
      if (!memberIds.includes(pId)) {
        res.status(400);
        throw new Error('All participants must belong to this household');
      }
    }

    let computedParticipants = [];

    if (splitType === 'equal') {
      const participantCount = participants.length;
      const baseShare = Math.floor((totalAmount / participantCount) * 100) / 100;
      let remainder = Math.round((totalAmount - (baseShare * participantCount)) * 100) / 100;

      computedParticipants = participants.map((p, index) => {
        const pId = p.user ? (p.user._id || p.user) : p;
        // Distribute remainder cents to first participant
        let share = baseShare;
        if (index === 0 && remainder > 0) {
          share = Math.round((share + remainder) * 100) / 100;
        }

        const isPayer = pId.toString() === paidBy.toString();
        return {
          user: pId,
          shareAmount: share,
          percentage: Math.round((100 / participantCount) * 100) / 100,
          paidStatus: isPayer ? 'paid' : 'pending',
          paidAt: isPayer ? new Date() : null
        };
      });
    } else if (splitType === 'custom') {
      let customSum = 0;
      computedParticipants = participants.map(p => {
        const pId = p.user ? (p.user._id || p.user) : p;
        const share = Number(p.shareAmount || 0);
        customSum += share;
        const isPayer = pId.toString() === paidBy.toString();

        return {
          user: pId,
          shareAmount: Math.round(share * 100) / 100,
          percentage: null,
          paidStatus: isPayer ? 'paid' : (p.paidStatus || 'pending'),
          paidAt: isPayer ? new Date() : (p.paidStatus === 'paid' ? new Date() : null)
        };
      });

      if (Math.abs(customSum - totalAmount) > 0.05) {
        res.status(400);
        throw new Error(`Custom split amounts (total ₹${customSum}) must equal the expense total (₹${totalAmount})`);
      }
    } else if (splitType === 'percentage') {
      let percentageSum = 0;
      participants.forEach(p => {
        percentageSum += Number(p.percentage || 0);
      });

      if (Math.abs(percentageSum - 100) > 0.1) {
        res.status(400);
        throw new Error(`Split percentages (total ${percentageSum}%) must equal 100%`);
      }

      let calculatedSum = 0;
      computedParticipants = participants.map(p => {
        const pId = p.user ? (p.user._id || p.user) : p;
        const pct = Number(p.percentage || 0);
        const share = Math.round((totalAmount * (pct / 100)) * 100) / 100;
        calculatedSum += share;
        const isPayer = pId.toString() === paidBy.toString();

        return {
          user: pId,
          shareAmount: share,
          percentage: pct,
          paidStatus: isPayer ? 'paid' : (p.paidStatus || 'pending'),
          paidAt: isPayer ? new Date() : (p.paidStatus === 'paid' ? new Date() : null)
        };
      });

      // Adjust rounding cent
      const diff = Math.round((totalAmount - calculatedSum) * 100) / 100;
      if (diff !== 0 && computedParticipants.length > 0) {
        computedParticipants[0].shareAmount = Math.round((computedParticipants[0].shareAmount + diff) * 100) / 100;
      }
    } else {
      res.status(400);
      throw new Error('Invalid splitType. Must be "equal", "custom", or "percentage"');
    }

    // Determine initial expense status
    const allPaid = computedParticipants.every(p => p.paidStatus === 'paid');

    const expense = await Expense.create({
      householdId: household._id,
      title,
      description,
      category,
      amount: totalAmount,
      paidBy,
      expenseDate,
      splitType,
      participants: computedParticipants,
      status: allPaid ? 'settled' : 'pending',
      createdBy: req.user._id
    });

    const populated = await Expense.findById(expense._id)
      .populate('paidBy createdBy participants.user', 'name email profilePhoto');

    const io = req.app.get('io');
    const otherParticipantIds = computedParticipants
      .map(p => p.user.toString())
      .filter(uId => uId !== req.user._id.toString());

    if (otherParticipantIds.length > 0) {
      await createBulkNotifications({
        userIds: otherParticipantIds,
        householdId: household._id,
        type: 'expense_added',
        title: 'New Shared Expense',
        message: `${req.user.name} added "${expense.title}" (Total: ₹${totalAmount}).`,
        entityType: 'expense',
        entityId: expense._id,
        io
      });
    }

    await logActivity({
      householdId: household._id,
      actor: req.user._id,
      type: 'expense_added',
      message: `${req.user.name} added expense: "${expense.title}" (₹${totalAmount}).`,
      entityType: 'expense',
      entityId: expense._id,
      io
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { expense: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get household expenses
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household to view expenses');
    }

    const {
      category,
      paidBy,
      participant,
      status,
      startDate,
      endDate
    } = req.query;

    const filter = { householdId: household._id };

    if (category && category !== 'all') filter.category = category;
    if (paidBy) filter.paidBy = paidBy;
    if (status) filter.status = status;

    if (participant) {
      const pId = participant === 'me' ? req.user._id : participant;
      filter['participants.user'] = pId;
    }

    if (startDate && endDate) {
      filter.expenseDate = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.expenseDate = { $gte: startDate };
    } else if (endDate) {
      filter.expenseDate = { $lte: endDate };
    }

    const expenses = await Expense.find(filter)
      .populate('paidBy createdBy participants.user', 'name email profilePhoto')
      .sort({ expenseDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { expenses }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpenseById = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const expense = await Expense.findById(req.params.id)
      .populate('paidBy createdBy participants.user', 'name email profilePhoto');

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    if (expense.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized to view this expense');
    }

    res.status(200).json({
      success: true,
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    if (expense.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized to modify this expense');
    }

    const {
      title,
      description,
      category,
      amount,
      expenseDate
    } = req.body;

    if (title !== undefined) expense.title = title;
    if (description !== undefined) expense.description = description;
    if (category !== undefined) expense.category = category;
    if (expenseDate !== undefined) expense.expenseDate = expenseDate;

    if (amount !== undefined && Number(amount) !== expense.amount) {
      const newAmount = Number(amount);
      if (newAmount <= 0) {
        res.status(400);
        throw new Error('Amount must be greater than 0');
      }
      expense.amount = newAmount;

      // Recalculate equal shares if equal split
      if (expense.splitType === 'equal' && expense.participants.length > 0) {
        const count = expense.participants.length;
        const baseShare = Math.floor((newAmount / count) * 100) / 100;
        let rem = Math.round((newAmount - (baseShare * count)) * 100) / 100;

        expense.participants.forEach((p, idx) => {
          let s = baseShare;
          if (idx === 0 && rem > 0) s += rem;
          p.shareAmount = Math.round(s * 100) / 100;
        });
      }
    }

    await expense.save();

    const populated = await Expense.findById(expense._id)
      .populate('paidBy createdBy participants.user', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: { expense: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    if (expense.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized to delete this expense');
    }

    await Expense.deleteOne({ _id: expense._id });

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record settlement payment for an expense share
// @route   POST /api/expenses/:id/pay
// @access  Private
exports.recordPayment = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household');
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    if (expense.householdId.toString() !== household._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    const targetUserId = req.body.userId ? req.body.userId.toString() : req.user._id.toString();

    const participant = expense.participants.find(p => p.user.toString() === targetUserId);
    if (!participant) {
      res.status(404);
      throw new Error('Participant obligation not found in this expense');
    }

    participant.paidStatus = 'paid';
    participant.paidAt = new Date();

    // Check if all participants are settled
    const allPaid = expense.participants.every(p => p.paidStatus === 'paid');
    if (allPaid) {
      expense.status = 'settled';
    }

    await expense.save();

    const populated = await Expense.findById(expense._id)
      .populate('paidBy createdBy participants.user', 'name email profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Share marked as paid',
      data: { expense: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get household net balances
// @route   GET /api/expenses/balances
// @access  Private
exports.getHouseholdBalances = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household to view balances');
    }

    const balances = await calculateHouseholdBalances(household._id);

    // Format memberBalances for easy table rendering
    const formattedMembers = balances.memberBalances.map(m => ({
      ...m,
      userId: m.user?._id?.toString() || m.user?.toString(),
      name: m.user?.name || 'Roommate',
      email: m.user?.email || '',
      profilePhoto: m.user?.profilePhoto || ''
    }));

    const userBal = formattedMembers.find(m => m.userId === req.user._id.toString()) || {
      totalPaid: 0,
      totalShare: 0,
      pendingOwed: 0,
      pendingReceivable: 0,
      netBalance: 0,
      status: 'settled'
    };

    res.status(200).json({
      success: true,
      data: {
        memberBalances: formattedMembers,
        totalHouseholdSpending: balances.totalHouseholdSpending,
        householdTotalSpend: balances.totalHouseholdSpending,
        categoryBreakdown: balances.categoryBreakdown,
        userBalance: userBal
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get simplified debt settlements
// @route   GET /api/expenses/settlements
// @access  Private
exports.getSimplifiedSettlements = async (req, res, next) => {
  try {
    const household = await getUserHousehold(req.user._id);
    if (!household) {
      res.status(400);
      throw new Error('You must belong to a household to view settlements');
    }

    const { memberBalances } = await calculateHouseholdBalances(household._id);
    const settlements = simplifyDebts(memberBalances);

    res.status(200).json({
      success: true,
      data: { settlements }
    });
  } catch (error) {
    next(error);
  }
};
