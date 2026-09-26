const Chore = require('../models/Chore');
const Expense = require('../models/Expense');
const ShoppingList = require('../models/ShoppingList');
const HelpRequest = require('../models/HelpRequest');
const Poll = require('../models/Poll');
const Household = require('../models/Household');
const { getRecentActivities } = require('./activityService');
const { getHouseholdContributionSummary } = require('./contributionService');
const { calculateHouseholdBalances } = require('./expenseBalanceService');

const formatDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Get comprehensive consolidated dashboard summary
 */
const getDashboardSummary = async (userId, householdId) => {
  const todayStr = formatDateStr(new Date());

  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekStr = formatDateStr(nextWeekDate);

  // Parallel database calls
  const [
    household,
    todayChores,
    upcomingChores,
    overdueChores,
    userChores,
    openHelp,
    userAcceptedHelp,
    todayHelp,
    activePolls,
    dueShopping,
    userShopping,
    allExpenses,
    activities,
    contribution
  ] = await Promise.all([
    Household.findById(householdId).populate('members', 'name email profilePhoto'),
    // Today's chores
    Chore.find({ householdId, dueDate: todayStr }).populate('assignedTo', 'name email profilePhoto'),
    // Upcoming 7-day chores
    Chore.find({ householdId, dueDate: { $gte: todayStr, $lte: nextWeekStr }, status: { $ne: 'completed' } })
      .populate('assignedTo', 'name email profilePhoto')
      .sort({ dueDate: 1, dueTime: 1 })
      .limit(6),
    // Overdue chores
    Chore.find({ householdId, status: 'overdue' }).populate('assignedTo', 'name email profilePhoto'),
    // User pending chores
    Chore.find({ householdId, assignedTo: userId, status: { $in: ['pending', 'in_progress', 'overdue'] } }),
    // Open help requests
    HelpRequest.find({ householdId, status: 'open' }).populate('requester', 'name email profilePhoto'),
    // User accepted help requests
    HelpRequest.find({ householdId, acceptedBy: userId, status: { $in: ['accepted', 'in_progress'] } }).populate('requester', 'name email profilePhoto'),
    // Today's help
    HelpRequest.find({ householdId, date: todayStr }).populate('requester acceptedBy', 'name email profilePhoto'),
    // Active Polls
    Poll.find({ householdId, status: 'active' }).populate('createdBy', 'name email profilePhoto'),
    // Shopping Lists & due items
    ShoppingList.find({ householdId, targetDate: { $lte: nextWeekStr }, status: { $ne: 'completed' } }).populate('assignedTo', 'name email profilePhoto'),
    // User assigned shopping
    ShoppingList.find({ householdId, assignedTo: userId, status: { $ne: 'completed' } }),
    // Active expenses for balance calculation
    Expense.find({ householdId }).populate('paidBy splits.userId', 'name email profilePhoto'),
    // Activity feed
    getRecentActivities(householdId, 10),
    // Contribution summary for current month
    getHouseholdContributionSummary({ householdId, period: 'month', requestingUserId: userId }).catch(() => null)
  ]);

  // Calculate user pending financial balances
  let userBalanceInfo = null;
  if (allExpenses && allExpenses.length > 0) {
    try {
      const balanceData = await calculateHouseholdBalances(householdId);
      if (balanceData && balanceData.memberBalances) {
        userBalanceInfo = balanceData.memberBalances.find(m => m.user._id.toString() === userId.toString());
      }
    } catch (e) {
      console.error('Balance calculation error:', e.message);
    }
  }

  // Generate factual household alerts
  const alerts = [];
  if (overdueChores.length > 0) {
    alerts.push({
      type: 'overdue_chore',
      severity: 'high',
      title: `${overdueChores.length} Overdue Chore${overdueChores.length > 1 ? 's' : ''}`,
      message: `${overdueChores[0].title} needs immediate attention.`,
      link: '/chores'
    });
  }

  if (openHelp.length > 0) {
    alerts.push({
      type: 'open_help',
      severity: 'medium',
      title: `${openHelp.length} Open Help Request${openHelp.length > 1 ? 's' : ''}`,
      message: `${openHelp[0].requester?.name || 'A roommate'} is looking for assistance: "${openHelp[0].title}".`,
      link: '/help'
    });
  }

  if (activePolls.length > 0) {
    alerts.push({
      type: 'active_poll',
      severity: 'low',
      title: `${activePolls.length} Decision Poll${activePolls.length > 1 ? 's' : ''} Open`,
      message: `Vote on "${activePolls[0].title}".`,
      link: '/decisions'
    });
  }

  if (userBalanceInfo && userBalanceInfo.pendingOwed > 0) {
    alerts.push({
      type: 'pending_payment',
      severity: 'medium',
      title: 'Pending Expense Balances',
      message: `You owe ₹${userBalanceInfo.pendingOwed.toFixed(2)} across shared household expenses.`,
      link: '/expenses'
    });
  }

  // Consolidate "Your Responsibilities" (What do I need to do?)
  const myResponsibilities = {
    choresCount: userChores.length,
    chores: userChores.slice(0, 4),
    helpProvidingCount: userAcceptedHelp.length,
    helpProviding: userAcceptedHelp.slice(0, 3),
    shoppingAssignedCount: userShopping.length,
    shoppingAssigned: userShopping.slice(0, 3),
    pendingOwed: userBalanceInfo?.pendingOwed || 0,
    pendingReceivable: userBalanceInfo?.pendingReceivable || 0,
    totalActiveTasks: userChores.length + userAcceptedHelp.length + userShopping.length
  };

  // Consolidate "Today's Agenda"
  const todayAgenda = {
    date: todayStr,
    chores: todayChores,
    help: todayHelp,
    totalItems: todayChores.length + todayHelp.length
  };

  return {
    household: {
      _id: household._id,
      name: household.name,
      inviteCode: household.inviteCode,
      membersCount: household.members?.length || 1,
      members: household.members
    },
    todayAgenda,
    myResponsibilities,
    alerts,
    recentActivities: activities,
    contributionPreview: contribution,
    upcomingSchedule: {
      chores: upcomingChores,
      shopping: dueShopping,
      polls: activePolls
    },
    overviewCounts: {
      openChores: overdueChores.length + userChores.length,
      openHelpRequests: openHelp.length,
      activePolls: activePolls.length,
      upcomingShopping: dueShopping.length,
      pendingOwed: userBalanceInfo?.pendingOwed || 0
    }
  };
};

module.exports = {
  getDashboardSummary
};
