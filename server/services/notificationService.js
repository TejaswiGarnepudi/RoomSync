const Notification = require('../models/Notification');

/**
 * Create a single in-app notification and emit real-time event if socket is connected
 */
const createNotification = async ({
  userId,
  householdId,
  type,
  title,
  message,
  entityType = 'system',
  entityId = null,
  io = null
}) => {
  try {
    if (!userId || !householdId || !type || !title || !message) {
      return null;
    }

    const notification = await Notification.create({
      userId,
      householdId,
      type,
      title: title.trim(),
      message: message.trim(),
      entityType,
      entityId,
      read: false
    });

    // Real-time socket emission to specific user
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', {
        _id: notification._id,
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        entityType: notification.entityType,
        entityId: notification.entityId,
        read: notification.read,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (err) {
    console.error('Error creating notification:', err.message);
    return null;
  }
};

/**
 * Create notifications for multiple users in a household
 */
const createBulkNotifications = async ({
  userIds = [],
  householdId,
  type,
  title,
  message,
  entityType = 'system',
  entityId = null,
  io = null
}) => {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0 || !householdId) {
      return [];
    }

    const docs = userIds.map(uId => ({
      userId: uId,
      householdId,
      type,
      title: title.trim(),
      message: message.trim(),
      entityType,
      entityId,
      read: false
    }));

    const createdNotifications = await Notification.insertMany(docs);

    if (io) {
      createdNotifications.forEach(notif => {
        io.to(`user:${notif.userId}`).emit('notification:new', {
          _id: notif._id,
          id: notif._id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          entityType: notif.entityType,
          entityId: notif.entityId,
          read: notif.read,
          createdAt: notif.createdAt
        });
      });
    }

    return createdNotifications;
  } catch (err) {
    console.error('Error creating bulk notifications:', err.message);
    return [];
  }
};

/**
 * Fetch notifications for a user with read/unread filter and pagination
 */
const getUserNotifications = async (userId, { read, page = 1, limit = 20 } = {}) => {
  const query = { userId };
  if (read !== undefined && read !== null && read !== 'all') {
    query.read = read === true || read === 'true';
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ userId, read: false })
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1
  };
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
  const unreadCount = await Notification.countDocuments({ userId, read: false });
  return { notification, unreadCount };
};

/**
 * Mark all notifications for a user as read
 */
const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, read: false }, { read: true });
  return { success: true, unreadCount: 0 };
};

/**
 * Get total unread count for badge
 */
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ userId, read: false });
};

module.exports = {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
