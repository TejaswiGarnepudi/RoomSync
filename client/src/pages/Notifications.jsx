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
      console.error('Failed to mark all as read:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationRead(notif._id);
        setNotifications(prev => prev.map(n => (n._id === notif._id ? { ...n, read: true } : n)));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    const link = getEntityLink(notif);
    if (link) {
      navigate(link);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="pb-6 border-b border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
              Household Notifications
            </h1>
            <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88] mt-1 tracking-[-0.02em]">
              Real-time updates on chores, split settlements, grocery items, and favors.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} isLoading={actionLoading}>
              Mark all read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-xs'
                : 'text-[#71716E] dark:text-[#8E8E88] hover:bg-[#EAE8E1] dark:hover:bg-[#1E1E1C]'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeTab === 'unread'
                ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-xs'
                : 'text-[#71716E] dark:text-[#8E8E88] hover:bg-[#EAE8E1] dark:hover:bg-[#1E1E1C]'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Notifications List Card */}
        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-7 shadow-sm">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-xs text-[#71716E] dark:text-[#8E8E88]">
              <div className="text-3xl mb-2 opacity-75">🕊️</div>
              <p className="font-medium text-sm text-[#1A1A1A] dark:text-white">All caught up</p>
              <p className="mt-0.5">No notifications to display.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8E7E1]/60 dark:divide-[#2A2A28]">
              {notifications.map((notif) => {
                const icon = getEntityIcon(notif.type);
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 flex items-start gap-4 cursor-pointer transition-colors hover:bg-[#FAF9F5] dark:hover:bg-[#181816] rounded-2xl ${
                      !notif.read ? 'bg-[#FAF9F5]/80 dark:bg-[#181816]' : ''
                    }`}
                  >
                    <div className="size-10 rounded-2xl bg-[#EAE8E1] dark:bg-[#1E1E1C] flex items-center justify-center text-lg shrink-0 mt-0.5">
                      {icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm ${!notif.read ? 'font-semibold text-[#1A1A1A] dark:text-white' : 'font-medium text-[#71716E] dark:text-[#A8A7A0]'}`}>
                          {notif.title}
                        </span>
                        <span className="text-[11px] text-[#71716E] dark:text-[#888880] shrink-0">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={(e) => handleMarkRead(notif._id, e)}
                        title="Mark as read"
                        className="size-2.5 rounded-full bg-[#1A1A1A] dark:bg-white shrink-0 mt-2 hover:scale-150 transition-transform cursor-pointer"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
