const Chore = require('../models/Chore');
const ChoreHistory = require('../models/ChoreHistory');

// Helper: Add days to YYYY-MM-DD
const addDaysToDateStr = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const nY = date.getFullYear();
  const nM = String(date.getMonth() + 1).padStart(2, '0');
  const nD = String(date.getDate()).padStart(2, '0');
  return `${nY}-${nM}-${nD}`;
};

/**
 * Calculate the next due date based on recurrence configuration
 */
const getNextOccurrenceDate = (chore) => {
  const { recurrence, dueDate } = chore;
  if (!recurrence || recurrence.type === 'none') return null;

  const interval = recurrence.interval || 1;

  if (recurrence.type === 'daily') {
    return addDaysToDateStr(dueDate, interval);
  }

  if (recurrence.type === 'weekly' || recurrence.type === 'custom_weekly') {
    return addDaysToDateStr(dueDate, 7 * interval);
  }

  return null;
};

/**
 * Create next occurrence for a completed recurring chore
 */
const createNextOccurrence = async (completedChore, actorUserId) => {
  if (!completedChore.recurrence || completedChore.recurrence.type === 'none') {
    return null;
  }

  const nextDueDate = getNextOccurrenceDate(completedChore);
  if (!nextDueDate) return null;

  // Check recurrence end date
  if (completedChore.recurrenceEndDate && nextDueDate > completedChore.recurrenceEndDate) {
    return null;
  }

  // Determine parent ID
  const parentId = completedChore.parentChoreId || completedChore._id;

  // Create next occurrence
  const nextChore = await Chore.create({
    householdId: completedChore.householdId,
    title: completedChore.title,
    description: completedChore.description,
    category: completedChore.category,
    estimatedDuration: completedChore.estimatedDuration,
    priority: completedChore.priority,
    dueDate: nextDueDate,
    dueTime: completedChore.dueTime,
    startTime: null,
    status: 'pending',
    assignmentType: completedChore.assignmentType === 'smart' ? 'smart' : (completedChore.assignmentType === 'claimed' ? 'unassigned' : 'unassigned'),
    assignedTo: null, // Left unassigned to allow rotation/claiming for next cycle
    createdBy: actorUserId,
    recurrence: completedChore.recurrence,
    recurrenceEndDate: completedChore.recurrenceEndDate,
    parentChoreId: parentId
  });

  // Record history
  await ChoreHistory.create({
    choreId: nextChore._id,
    householdId: nextChore.householdId,
    userId: actorUserId,
    action: 'created',
    notes: `Recurring occurrence automatically generated for ${nextDueDate}`
  });

  return nextChore;
};

module.exports = {
  getNextOccurrenceDate,
  createNextOccurrence
};
