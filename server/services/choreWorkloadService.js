const Chore = require('../models/Chore');
const Household = require('../models/Household');

/**
 * Calculate the chore workload for all members in a household
 * Primary metric: estimated duration in minutes of pending assigned chores.
 */
const calculateHouseholdWorkloads = async (householdId) => {
  const household = await Household.findById(householdId).populate('members', 'name email profilePhoto');
  if (!household || !household.members) return [];

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const memberWorkloads = [];

  for (const member of household.members) {
    const memberId = member._id;

    // 1. Pending assigned chores
    const pendingChores = await Chore.find({
      householdId,
      assignedTo: memberId,
      status: { $in: ['assigned', 'in_progress', 'pending', 'overdue'] }
    });

    const pendingCount = pendingChores.length;
    const pendingMinutes = pendingChores.reduce((acc, c) => acc + (c.estimatedDuration || 0), 0);

    // 2. Completed chores in the last 7 days
    const recentCompletedChores = await Chore.find({
      householdId,
      completedBy: memberId,
      status: 'completed',
      completedAt: { $gte: sevenDaysAgo }
    });

    const completedWeekCount = recentCompletedChores.length;
    const completedWeekMinutes = recentCompletedChores.reduce((acc, c) => acc + (c.estimatedDuration || 0), 0);

    // Workload score: weighted sum (pending minutes is primary, recent completed is secondary)
    const workloadScore = pendingMinutes + Math.round(completedWeekMinutes * 0.3);

    memberWorkloads.push({
      user: {
        _id: member._id,
        name: member.name,
        email: member.email,
        profilePhoto: member.profilePhoto
      },
      pendingCount,
      pendingMinutes,
      completedWeekCount,
      completedWeekMinutes,
      workloadScore
    });
  }

  // Sort from least loaded to most loaded
  return memberWorkloads.sort((a, b) => a.workloadScore - b.workloadScore);
};

/**
 * Get workload stats for a single user
 */
const getUserWorkload = async (userId, householdId) => {
  const workloads = await calculateHouseholdWorkloads(householdId);
  return workloads.find(w => w.user._id.toString() === userId.toString()) || null;
};

module.exports = {
  calculateHouseholdWorkloads,
  getUserWorkload
};
