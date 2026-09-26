const HouseholdActivity = require('../models/HouseholdActivity');

/**
 * Log a household activity event
 */
const logActivity = async ({
  householdId,
  actor,
  type,
  message,
  entityType = 'system',
  entityId = null,
  io = null
}) => {
  try {
    if (!householdId || !actor || !message) return null;

    const activity = await HouseholdActivity.create({
      householdId,
      actor,
      type,
      message: message.trim(),
      entityType,
      entityId
    });

    const populated = await HouseholdActivity.findById(activity._id)
      .populate('actor', 'name email profilePhoto');

    if (io) {
      io.to(`household:${householdId}`).emit('activity:new', populated);
    }

    return populated;
  } catch (err) {
    console.error('Error logging activity:', err.message);
    return null;
  }
};

/**
 * Get recent household activities
 */
const getRecentActivities = async (householdId, limit = 15) => {
  try {
    return await HouseholdActivity.find({ householdId })
      .populate('actor', 'name email profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  } catch (err) {
    console.error('Error fetching activities:', err.message);
    return [];
  }
};

module.exports = {
  logActivity,
  getRecentActivities
};
