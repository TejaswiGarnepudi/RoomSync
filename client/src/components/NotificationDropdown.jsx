import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead
} from '../services/notificationService';
import { getSocket } from '../services/socket';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSecs = Math.floor((now - date) / 1000);

  if (diffSecs < 60) return 'Just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getEntityIcon = (type, entityType) => {
  if (type.startsWith('chore')) return '🧹';
  if (type.startsWith('help')) return '🤝';
  if (type.startsWith('poll')) return '🗳️';
  if (type.startsWith('expense')) return '💰';
  if (type.startsWith('shopping')) return '🛍️';
  if (entityType === 'calendar') return '📅';
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
    case 'calendar':
      return `/calendar`;
    default:
      return null;
  }
};

export default function NotificationDropdown({ align = 'right', direction = 'down' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotificationData = async () => {
    try {
      setLoading(true);
      const [listRes, countRes] = await Promise.all([
        getNotifications({ limit: 6 }),
        getUnreadNotificationCount()
      ]);
      setNotifications(listRes.data.data.notifications || []);
      setUnreadCount(countRes.data.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationData();

    // Listen on Socket.io for real-time notifications
    const socket = getSocket();
    if (socket) {
      const handleNewNotification = (notif) => {
        setNotifications(prev => [notif, ...prev.slice(0, 5)]);
        setUnreadCount(prev => prev + 1);
      };

      socket.on('notification:new', handleNewNotification);
      return () => {
        socket.off('notification:new', handleNewNotification);
      };
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotificationData();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
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
    setIsOpen(false);
    const link = getEntityLink(notif);
    if (link) {
      navigate(link);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="View notifications"
        className="relative size-9 rounded-full border border-[#E8E7E1] dark:border-[#2E2E2A] bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-[#FAF9F5] flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-2xs"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#FAF9F5] dark:border-[#0E0E0D]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute ${direction === 'up' ? 'bottom-full mb-2.5' : 'top-full mt-2.5'} ${align === 'left' ? 'left-0' : 'right-0'} w-80 sm:w-96 bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-2xl shadow-xl z-50 overflow-hidden animate-dropdown`}>
          {/* Header */}
          <div className="p-3.5 px-4 bg-[#FAF9F5] dark:bg-[#181816] border-b border-[#E8E7E1] dark:border-[#2A2A28] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#1A1A1A] dark:text-white text-xs uppercase tracking-wider">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EAE8E1] dark:bg-[#252522] text-[#1A1A1A] dark:text-[#FAF9F5]">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E7E1]/60 dark:divide-[#2A2A28]">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#71716E] dark:text-[#8E8E88]">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-[#71716E] dark:text-[#8E8E88]">
                <div className="text-xl mb-1.5 opacity-75">🕊️</div>
                <p className="text-xs font-medium text-[#1A1A1A] dark:text-white">Quiet and synchronized</p>
                <p className="text-[11px] text-[#71716E] dark:text-[#8E8E88] mt-0.5">No new household notifications.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const icon = getEntityIcon(notif.type, notif.entityType);
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 px-4 flex items-start gap-3 cursor-pointer transition-colors hover:bg-[#FAF9F5] dark:hover:bg-[#181816] ${
                      !notif.read ? 'bg-[#FAF9F5]/70 dark:bg-[#1A1A18]' : 'bg-white dark:bg-[#141413]'
                    }`}
                  >
                    <div className="text-sm p-1.5 bg-[#EAE8E1] dark:bg-[#20201E] rounded-xl shrink-0 mt-0.5 border border-transparent dark:border-[#2E2E2A]">
                      {icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${!notif.read ? 'font-semibold text-[#1A1A1A] dark:text-white' : 'text-[#71716E] dark:text-[#A8A7A0]'}`}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-[#71716E] dark:text-[#888880] shrink-0">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-[#71716E] dark:text-[#A8A7A0] line-clamp-2 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={(e) => handleMarkRead(e, notif._id)}
                        title="Mark as read"
                        className="size-2 rounded-full bg-[#1A1A1A] dark:bg-white shrink-0 mt-2 hover:scale-150 transition-transform cursor-pointer"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#FAF9F5] dark:bg-[#181816] border-t border-[#E8E7E1] dark:border-[#2A2A28] text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white block py-0.5 transition-colors"
            >
              View all notification history &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
