const RecurringShopping = require('../models/RecurringShopping');

// Helper: Format YYYY-MM-DD
const formatDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Helper: Add days
const addDays = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatDateStr(date);
};

// Helper: Add months
const addMonths = (dateStr, months) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setMonth(date.getMonth() + months);
  return formatDateStr(date);
};

/**
 * Calculate the next due date for a recurring shopping item
 */
const calculateNextDueDate = (recurrenceType, interval = 1, fromDateStr = null) => {
  const baseDate = fromDateStr || formatDateStr(new Date());

  if (recurrenceType === 'weekly') {
    return addDays(baseDate, 7 * interval);
  }
  if (recurrenceType === 'monthly') {
    return addMonths(baseDate, interval);
  }
  if (recurrenceType === 'custom_days') {
    return addDays(baseDate, interval);
  }

  return addDays(baseDate, 30);
};

/**
 * Check for due and upcoming recurring shopping items in a household
 */
const checkDueRecurringItems = async (householdId) => {
  const todayStr = formatDateStr(new Date());
  const sevenDaysLater = addDays(todayStr, 7);

  const activeItems = await RecurringShopping.find({
    householdId,
    active: true
  }).populate('createdBy', 'name email');

  const dueNow = activeItems.filter(i => i.nextDueDate <= todayStr);
  const dueSoon = activeItems.filter(i => i.nextDueDate > todayStr && i.nextDueDate <= sevenDaysLater);

  return {
    dueNow,
    dueSoon,
    dueItems: dueNow,
    upcomingItems: dueSoon,
    totalActiveCount: activeItems.length
  };
};

/**
 * Advance the next due date after purchase or list inclusion
 */
const advanceRecurringItemDueDate = async (itemId) => {
  const item = await RecurringShopping.findById(itemId);
  if (!item) return null;

  item.nextDueDate = calculateNextDueDate(item.recurrenceType, item.interval, item.nextDueDate);
  await item.save();
  return item;
};

module.exports = {
  calculateNextDueDate,
  checkDueRecurringItems,
  advanceRecurringItemDueDate
};
