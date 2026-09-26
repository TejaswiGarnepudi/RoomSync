const Expense = require('../models/Expense');
const Household = require('../models/Household');

/**
 * Calculate net balances and individual obligations for all members in a household
 */
const calculateHouseholdBalances = async (householdId) => {
  const household = await Household.findById(householdId).populate('members', 'name email profilePhoto');
  if (!household || !household.members) {
    return { memberBalances: [], totalHouseholdSpending: 0, categoryBreakdown: {} };
  }

  const expenses = await Expense.find({ householdId });

  let totalHouseholdSpending = 0;
  const categoryBreakdown = {};

  // Initialize member balances
  const balancesMap = {};
  household.members.forEach(member => {
    const mId = member._id.toString();
    balancesMap[mId] = {
      user: {
        _id: member._id,
        name: member.name,
        email: member.email,
        profilePhoto: member.profilePhoto
      },
      totalPaid: 0,
      totalShare: 0,
      pendingOwed: 0, // money this user needs to pay to others
      pendingReceivable: 0, // money others need to pay to this user
      netBalance: 0,
      status: 'settled' // 'receivable' | 'payable' | 'settled'
    };
  });

  for (const expense of expenses) {
    totalHouseholdSpending += expense.amount;

    // Category breakdown
    categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;

    const payerId = expense.paidBy.toString();
    if (balancesMap[payerId]) {
      balancesMap[payerId].totalPaid += expense.amount;
    }

    for (const participant of expense.participants) {
      const pUserId = participant.user ? participant.user.toString() : null;
      if (!pUserId || !balancesMap[pUserId]) continue;

      balancesMap[pUserId].totalShare += participant.shareAmount;

      // If participant is not the payer and share is pending
      if (pUserId !== payerId && participant.paidStatus === 'pending') {
        balancesMap[pUserId].pendingOwed += participant.shareAmount;
        if (balancesMap[payerId]) {
          balancesMap[payerId].pendingReceivable += participant.shareAmount;
        }
      }
    }
  }

  // Calculate net balances and status
  const memberBalances = Object.values(balancesMap).map(b => {
    // Net balance is pendingReceivable minus pendingOwed
    const netBalance = Math.round((b.pendingReceivable - b.pendingOwed) * 100) / 100;
    let status = 'settled';
    if (netBalance > 0.01) {
      status = 'receivable';
    } else if (netBalance < -0.01) {
      status = 'payable';
    }

    return {
      ...b,
      totalPaid: Math.round(b.totalPaid * 100) / 100,
      totalShare: Math.round(b.totalShare * 100) / 100,
      pendingOwed: Math.round(b.pendingOwed * 100) / 100,
      pendingReceivable: Math.round(b.pendingReceivable * 100) / 100,
      netBalance,
      status
    };
  });

  return {
    memberBalances,
    totalHouseholdSpending: Math.round(totalHouseholdSpending * 100) / 100,
    categoryBreakdown
  };
};

module.exports = {
  calculateHouseholdBalances
};
