const Chore = require('../models/Chore');
const HelpRequest = require('../models/HelpRequest');
const ShoppingList = require('../models/ShoppingList');
const Household = require('../models/Household');

// Helper: parse HH:MM to minutes
const timeToMinutes = (tStr) => {
  if (!tStr) return 0;
  const [h, m] = tStr.split(':').map(Number);
  return (h * 60) + (m || 0);
};

// Helper: get date range boundaries
const getDateRange = (period = 'month', customStart = null, customEnd = null) => {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  if (period === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (period === 'custom' && customStart && customEnd) {
    start = new Date(customStart);
    start.setHours(0, 0, 0, 0);
    end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
  } else {
    // Default: current month
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
    startObj: start,
    endObj: end
  };
};

/**
 * Calculate transparent, factual workload contributions for all roommates
 */
const getHouseholdContributionSummary = async ({
  householdId,
  period = 'month',
  startDate = null,
  endDate = null,
  requestingUserId = null
}) => {
  const household = await Household.findById(householdId).populate('members', 'name email profilePhoto');
  if (!household) {
    throw new Error('Household not found');
  }

  const range = getDateRange(period, startDate, endDate);

  // 1. Completed Chores in range
  const completedChores = await Chore.find({
    householdId,
    status: 'completed',
    dueDate: { $gte: range.startDate, $lte: range.endDate },
    assignedTo: { $exists: true, $ne: null }
  }).lean();

  // 2. Completed Help Requests in range
  const completedHelp = await HelpRequest.find({
    householdId,
    status: 'completed',
    date: { $gte: range.startDate, $lte: range.endDate },
    acceptedBy: { $exists: true, $ne: null }
  }).lean();

  // 3. Completed Shopping in range
  const completedShopping = await ShoppingList.find({
    householdId,
    status: 'completed',
    targetDate: { $gte: range.startDate, $lte: range.endDate },
    assignedTo: { $exists: true, $ne: null }
  }).lean();

  // Aggregate stats per member
  const memberStats = {};
  household.members.forEach(m => {
    memberStats[m._id.toString()] = {
      userId: m._id,
      name: m.name,
      email: m.email,
      profilePhoto: m.profilePhoto,
      choreMinutes: 0,
      choresCount: 0,
      helpMinutes: 0,
      helpCount: 0,
      shoppingMinutes: 0,
      shoppingCount: 0,
      totalMinutes: 0,
      percentOfHousehold: 0
    };
  });

  // Tally Chores
  completedChores.forEach(c => {
    const uId = c.assignedTo?.toString();
    if (memberStats[uId]) {
      const dur = parseInt(c.estimatedDuration, 10) || 30;
      memberStats[uId].choreMinutes += dur;
      memberStats[uId].choresCount += 1;
      memberStats[uId].totalMinutes += dur;
    }
  });

  // Tally Help
  completedHelp.forEach(h => {
    const uId = h.acceptedBy?.toString();
    if (memberStats[uId]) {
      let dur = 45; // default 45 mins
      if (h.startTime && h.endTime) {
        const diff = timeToMinutes(h.endTime) - timeToMinutes(h.startTime);
        if (diff > 0) dur = diff;
      }
      memberStats[uId].helpMinutes += dur;
      memberStats[uId].helpCount += 1;
      memberStats[uId].totalMinutes += dur;
    }
  });

  // Tally Shopping (default 30 mins per completed list)
  completedShopping.forEach(s => {
    const uId = s.assignedTo?.toString();
    if (memberStats[uId]) {
      const dur = 30;
      memberStats[uId].shoppingMinutes += dur;
      memberStats[uId].shoppingCount += 1;
      memberStats[uId].totalMinutes += dur;
    }
  });

  const membersArray = Object.values(memberStats);
  const totalHouseholdMinutes = membersArray.reduce((acc, m) => acc + m.totalMinutes, 0);
  const totalHouseholdChores = membersArray.reduce((acc, m) => acc + m.choresCount, 0);
  const totalHouseholdHelp = membersArray.reduce((acc, m) => acc + m.helpCount, 0);
  const totalHouseholdShopping = membersArray.reduce((acc, m) => acc + m.shoppingCount, 0);

  // Calculate percentage of total workload
  membersArray.forEach(m => {
    m.percentOfHousehold = totalHouseholdMinutes > 0
      ? Math.round((m.totalMinutes / totalHouseholdMinutes) * 100)
      : 0;
  });

  // Extract requesting user's personal summary if specified
  const userContribution = requestingUserId
    ? memberStats[requestingUserId.toString()] || null
    : null;

  // Generate neutral, factual summary messages
  const periodLabel = period === 'week' ? 'this week' : period === 'custom' ? 'during this period' : 'this month';
  const insights = [
    `Household completed ${totalHouseholdMinutes} minutes of recorded shared responsibilities ${periodLabel}.`,
    `Chores: ${completedChores.length} completed (${membersArray.reduce((a, b) => a + b.choreMinutes, 0)} min).`,
    `Assistance provided: ${completedHelp.length} requests fulfilled (${membersArray.reduce((a, b) => a + b.helpMinutes, 0)} min).`,
    `Shopping runs: ${completedShopping.length} completed (${membersArray.reduce((a, b) => a + b.shoppingMinutes, 0)} min).`
  ];

  if (userContribution) {
    insights.push(`Your recorded household contribution: ${userContribution.totalMinutes} minutes (${userContribution.percentOfHousehold}% of total).`);
  }

  return {
    period,
    startDate: range.startDate,
    endDate: range.endDate,
    totalHouseholdMinutes,
    totalHouseholdChores,
    totalHouseholdHelp,
    totalHouseholdShopping,
    members: membersArray,
    userContribution,
    insights
  };
};

module.exports = {
  getHouseholdContributionSummary
};
