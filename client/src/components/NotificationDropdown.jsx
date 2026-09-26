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

export default function NotificationDropdown() {
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
        className="relative p-2 text-[#3E737C] hover:text-[#234653] rounded-xl hover:bg-[#F4EDE3] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3E737C]/30"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-[#E86F5A] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#FFF9F1] shadow-2xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FFF9F1] border border-[#E8DEC8] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-100">
          {/* Header */}
          <div className="p-3.5 px-4 bg-[#FAF5ED] border-b border-[#E8DEC8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#234653] text-xs uppercase tracking-wider font-serif-editorial">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F2D4C8] text-[#234653]">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-[#E86F5A] hover:text-[#D65D48] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E8DEC8]/50">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#3E737C]">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-[#3E737C]">
                <div className="text-2xl mb-1.5">🕊️</div>
                <p className="text-xs font-medium text-[#234653]">Quiet and synchronized</p>
                <p className="text-[11px] text-[#3E737C]/80 mt-0.5">No new household notifications.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const icon = getEntityIcon(notif.type, notif.entityType);
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 px-4 flex items-start gap-3 cursor-pointer transition-colors hover:bg-[#FBF1EB]/50 ${
                      !notif.read ? 'bg-[#FBF1EB]' : 'bg-[#FFF9F1]'
                    }`}
                  >
                    <div className="text-base p-1.5 bg-[#F4EDE3] rounded-xl shrink-0 mt-0.5 border border-[#E8DEC8]/50">
                      {icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${!notif.read ? 'text-[#17272C]' : 'text-[#234653]'}`}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-[#3E737C]/70 shrink-0">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-[#3E737C] line-clamp-2 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={(e) => handleMarkRead(e, notif._id)}
                        title="Mark as read"
                        className="w-2 h-2 rounded-full bg-[#E86F5A] shrink-0 mt-2 hover:scale-150 transition-transform"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#FAF5ED] border-t border-[#E8DEC8] text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#234653] hover:text-[#E86F5A] block py-0.5 transition-colors"
            >
              View all notification history &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
