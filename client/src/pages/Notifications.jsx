import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../services/notificationService';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSecs = Math.floor((now - date) / 1000);

  if (diffSecs < 60) return 'Just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getEntityIcon = (type) => {
  if (type.startsWith('chore')) return '🧹';
  if (type.startsWith('help')) return '🤝';
  if (type.startsWith('poll')) return '🗳️';
  if (type.startsWith('expense')) return '💰';
  if (type.startsWith('shopping')) return '🛍️';
  return '🔔';
};

const getEntityLink = (notification) => {
  const { entityType, entityId } = notification;
  if (!entityId) return null;
  switch (entityType) {
    case 'chore':
      return `/chores/${entityId}`;
    case 'help':
      return `/help/${entityId}`;
    case 'expense':
      return `/expenses/${entityId}`;
    case 'shopping':
      return `/shopping`;
    case 'poll':
      return `/decisions`;
    default:
      return null;
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications({
        read: activeTab === 'unread' ? false : 'all',
        limit: 50
      });
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setActionLoading(true);
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markNotificationRead(notif._id).catch(() => {});
    }
    const link = getEntityLink(notif);
    if (link) {
      navigate(link);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>🔔</span> Notification Center
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Stay updated on chore assignments, roommate favors, bill settlements, and household votes.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              loading={actionLoading}
              onClick={handleMarkAllRead}
              className="shadow-xs self-start sm:self-auto"
            >
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Tabs & List Card */}
        <Card className="p-6">
          <div className="flex border-b border-stone-200 pb-3 mb-6 gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'unread'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
              <div className="text-4xl mb-3">🔔</div>
              <h3 className="text-base font-semibold text-stone-800">
                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {activeTab === 'unread'
                  ? 'You are all caught up with your household updates!'
                  : 'When chores are assigned or roommate favors are posted, they will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const icon = getEntityIcon(notif.type);
                const link = getEntityLink(notif);

                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      !notif.read
                        ? 'bg-teal-50/30 border-teal-200 shadow-2xs hover:bg-teal-50/60'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center text-xl shrink-0">
                        {icon}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-bold ${!notif.read ? 'text-teal-950' : 'text-stone-900'}`}>
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white">
                              NEW
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-600 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-400">
                          <span>{formatTimeAgo(notif.createdAt)}</span>
                          {link && (
                            <>
                              <span>•</span>
                              <span className="text-teal-700 font-semibold hover:underline">
                                View details →
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={(e) => handleMarkRead(notif._id, e)}
                        title="Mark as read"
                        className="text-xs font-semibold text-stone-400 hover:text-teal-700 px-2 py-1 rounded-md hover:bg-stone-100 transition-colors shrink-0"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
