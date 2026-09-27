import React, { useContext, useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from '../components/NotificationDropdown';
import GlobalSearchModal from '../components/GlobalSearchModal';

export default function AppLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      active: location.pathname === '/dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="2" />
          <rect x="14" y="3" width="7" height="5" rx="2" />
          <rect x="14" y="12" width="7" height="9" rx="2" />
          <rect x="3" y="16" width="7" height="5" rx="2" />
        </svg>
      )
    },
    {
      to: '/chores',
      label: 'Chores',
      active: location.pathname.startsWith('/chores'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
      )
    },
    {
      to: '/shopping',
      label: 'Groceries',
      active: location.pathname.startsWith('/shopping'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      )
    },
    {
      to: '/expenses',
      label: 'Expenses',
      active: location.pathname.startsWith('/expenses'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )
    },
    {
      to: '/household-calendar',
      label: 'Calendar',
      active: location.pathname.includes('calendar'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      to: '/help',
      label: 'Help & Favors',
      active: location.pathname.startsWith('/help'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      )
    },
    {
      to: '/decisions',
      label: 'Decisions',
      active: location.pathname.startsWith('/decisions'),
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 16 4-4 4 4" />
          <path d="m13 8 4-4 4 4" />
          <path d="M7 12V3" />
          <path d="M17 4v17" />
        </svg>
      )
    },
    {
      to: '/household',
      label: 'Roommates',
      active: location.pathname === '/household',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
  ];

  const secondaryItems = [
    {
      to: '/contribution',
      label: 'Workload Insights',
      active: location.pathname === '/contribution',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      )
    },
    {
      to: '/calendar',
      label: 'My Availability',
      active: location.pathname === '/calendar',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      to: '/notifications',
      label: 'Notifications',
      active: location.pathname === '/notifications',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      )
    },
    {
      to: '/settings',
      label: 'Account Settings',
      active: location.pathname === '/settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    },
  ];

  // Derive current page title for desktop top bar
  const getCurrentPageTitle = () => {
    const all = [...navItems, ...secondaryItems];
    const match = all.find(item => item.active);
    return match ? match.label : 'Household';
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0E0E0D] text-[#1A1A1A] dark:text-[#FAF9F5] flex font-sans transition-colors duration-300 antialiased selection:bg-[#1A1A1A] selection:text-white dark:selection:bg-white dark:selection:text-[#1A1A1A]">
      
      {/* ========================================================================= */}
      {/* DESKTOP SIDE TOOLBAR / SIDEBAR (Fixed Left w-64 / w-72) */}
      {/* ========================================================================= */}
      <aside className="fixed inset-y-0 left-0 w-64 xl:w-72 bg-[#FAF9F5] dark:bg-[#0E0E0D] border-r border-[#E8E7E1] dark:border-[#2A2A28] z-30 hidden lg:flex flex-col justify-between py-6 px-4 xl:px-5 transition-colors duration-300 select-none">
        
        {/* Top: Brand Logo */}
        <div className="space-y-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-2 py-1 group transition-transform duration-200"
          >
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none" className="text-[#1A1A1A] dark:text-white transition-transform group-hover:scale-105">
              <rect x="4" y="4" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
              <rect x="13" y="13" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
              <path d="M13 20h14M20 13v14" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span className="text-xl font-medium tracking-[-1px] text-[#1A1A1A] dark:text-white">
              roomsync
            </span>
          </Link>
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex-1 py-4 overflow-y-auto space-y-6 no-scrollbar">
          {/* Main Menu Links */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold text-[#8E8E88] dark:text-[#6C6C68] uppercase tracking-wider mb-2">
              Menu
            </p>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium tracking-[-0.015em] transition-all duration-200 group ${
                  item.active
                    ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-semibold shadow-xs'
                    : 'text-[#71716E] dark:text-[#A8A7A0] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#EAE8E1]/60 dark:hover:bg-[#1C1C1A]'
                }`}
              >
                <span className={`shrink-0 transition-transform group-hover:scale-110 ${item.active ? 'text-white dark:text-[#1A1A1A]' : 'text-[#8E8E88] dark:text-[#888880]'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Insights & Preferences */}
          <div className="space-y-1 pt-2 border-t border-[#E8E7E1] dark:border-[#2A2A28]/60">
            <p className="px-3 text-[10px] font-semibold text-[#8E8E88] dark:text-[#6C6C68] uppercase tracking-wider mb-2">
              Insights & Tools
            </p>
            {secondaryItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium tracking-[-0.015em] transition-all duration-200 group ${
                  item.active
                    ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-semibold shadow-xs'
                    : 'text-[#71716E] dark:text-[#A8A7A0] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#EAE8E1]/60 dark:hover:bg-[#1C1C1A]'
                }`}
              >
                <span className={`shrink-0 transition-transform group-hover:scale-110 ${item.active ? 'text-white dark:text-[#1A1A1A]' : 'text-[#8E8E88] dark:text-[#888880]'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="pt-4 border-t border-[#E8E7E1] dark:border-[#2A2A28] px-2 text-[11px] text-[#8E8E88] dark:text-[#6C6C68] flex items-center justify-between">
          <span>RoomSync &copy; {new Date().getFullYear()}</span>
          <span className="size-1.5 rounded-full bg-emerald-500 inline-block" title="System Online"></span>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE (with Top Bar on Desktop + Header on Mobile) */}
      {/* ========================================================================= */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-h-screen transition-all duration-300">
        
        {/* ========================================================================= */}
        {/* TOP BAR HEADER (Search, Theme Toggle, Notifications, Profile at TOP RIGHT) */}
        {/* ========================================================================= */}
        <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 dark:bg-[#0E0E0D]/90 backdrop-blur-[24px] border-b border-[#E8E7E1] dark:border-[#2A2A28] transition-colors duration-300">
          <div className="w-full px-4 sm:px-8 lg:px-10 h-18 flex items-center justify-between">
            
            {/* Left: Mobile Brand / Desktop Current Section Title */}
            <div className="flex items-center gap-3">
              {/* Mobile Brand Link (< lg) */}
              <Link to="/dashboard" className="flex lg:hidden items-center gap-2 group">
                <svg width="26" height="26" viewBox="0 0 40 40" fill="none" className="text-[#1A1A1A] dark:text-white">
                  <rect x="4" y="4" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="13" y="13" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M13 20h14M20 13v14" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <span className="text-lg font-medium tracking-[-0.8px] text-[#1A1A1A] dark:text-white">
                  roomsync
                </span>
              </Link>

              {/* Desktop Current Page Title indicator */}
              <div className="hidden lg:flex items-center gap-2 text-xs text-[#71716E] dark:text-[#8E8E88]">
                <span>Household</span>
                <span>/</span>
                <span className="font-semibold text-[#1A1A1A] dark:text-white">{getCurrentPageTitle()}</span>
              </div>
            </div>

            {/* TOP RIGHT CONTROLS: Search | Theme | Notifications | Profile */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              
              {/* 1. Quick Search Button (⌘K) */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                title="Search household (⌘K or Ctrl+K)"
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full border border-[#E8E7E1] dark:border-[#2E2E2A] bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#71716E] dark:text-[#A8A7A0] hover:text-[#1A1A1A] dark:hover:text-white transition-all text-xs font-medium cursor-pointer shadow-2xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#141413] text-[#71716E] dark:text-[#8E8E88] rounded-md border border-[#E8E7E1] dark:border-[#2E2E2A]">
                  ⌘K
                </kbd>
              </button>

              {/* 2. Theme Toggle (Dark / Light) */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
                className="size-9 rounded-full border border-[#E8E7E1] dark:border-[#2E2E2A] bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-[#FAF9F5] flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-2xs"
              >
                <span className="text-sm font-bold select-none">{isDark ? '☼' : '☾'}</span>
              </button>

              {/* 3. Notification Dropdown */}
              <NotificationDropdown align="right" direction="down" />

              {/* 4. User Profile Dropdown Pill */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 h-9 pl-1 pr-3 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] border border-[#E8E7E1] dark:border-[#2E2E2A] hover:bg-[#E2E1DA] dark:hover:bg-[#252522] transition-all cursor-pointer shadow-2xs"
                  aria-label="User account menu"
                >
                  <div className="size-7 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-semibold flex items-center justify-center text-[10px] shrink-0 overflow-hidden">
                    {user?.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user?.name || 'Profile'}
                        className="size-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-[#1A1A1A] dark:text-white max-w-[90px] sm:max-w-[120px] truncate text-left">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-[#71716E] dark:text-[#8E8E88] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {/* Profile Popup Menu (Downward) */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-2xl shadow-xl py-2 z-50 animate-dropdown text-xs">
                    <div className="px-4 py-3 border-b border-[#E8E7E1] dark:border-[#2A2A28] bg-[#FAF9F5] dark:bg-[#181816] flex items-center gap-3">
                      <div className="size-9 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-semibold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                        {user?.profilePhoto ? (
                          <img
                            src={user.profilePhoto}
                            alt={user?.name || 'Profile'}
                            className="size-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#1A1A1A] dark:text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-[#71716E] dark:text-[#8E8E88] truncate mt-0.5">{user?.email}</p>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 font-medium transition-colors ${
                          location.pathname === '/settings'
                            ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                            : 'text-[#1A1A1A] dark:text-white hover:bg-[#FAF9F5] dark:hover:bg-[#181816]'
                        }`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        <span>⚙️ Account Settings</span>
                      </Link>

                      <Link
                        to="/household"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[#71716E] dark:text-[#A8A7A0] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#FAF9F5] dark:hover:bg-[#181816] transition-colors"
                      >
                        <span>🏠</span> My Household
                      </Link>
                      <Link
                        to="/calendar"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[#71716E] dark:text-[#A8A7A0] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#FAF9F5] dark:hover:bg-[#181816] transition-colors"
                      >
                        <span>🗓️</span> My Availability
                      </Link>
                      <Link
                        to="/contribution"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[#71716E] dark:text-[#A8A7A0] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#FAF9F5] dark:hover:bg-[#181816] transition-colors"
                      >
                        <span>📊</span> Workload Insights
                      </Link>
                    </div>

                    <div className="border-t border-[#E8E7E1] dark:border-[#2A2A28] pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium transition-colors text-left cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>


              {/* Mobile Drawer Hamburger Button (< lg) */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                className="lg:hidden size-9 rounded-full border border-[#E8E7E1] dark:border-[#2E2E2A] bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white flex items-center justify-center cursor-pointer ml-1"
                aria-label="Toggle navigation menu"
              >
                {mobileDrawerOpen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Drawer Overlay */}
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />
            
            <div className="relative w-72 max-w-[80vw] bg-[#FAF9F5] dark:bg-[#0E0E0D] h-full flex flex-col justify-between p-6 z-10 border-r border-[#E8E7E1] dark:border-[#2A2A28] animate-fade-in-up">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Link to="/dashboard" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-2.5">
                    <svg width="26" height="26" viewBox="0 0 40 40" fill="none" className="text-[#1A1A1A] dark:text-white">
                      <rect x="4" y="4" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
                      <rect x="13" y="13" width="23" height="23" rx="8" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M13 20h14M20 13v14" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                    <span className="text-lg font-medium tracking-[-0.8px] text-[#1A1A1A] dark:text-white">
                      roomsync
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="size-7 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] flex items-center justify-center text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Mobile Navigation List */}
                <nav className="space-y-1 overflow-y-auto max-h-[60vh] no-scrollbar">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        item.active
                          ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-semibold'
                          : 'text-[#71716E] dark:text-[#8E8E88] hover:bg-[#EAE8E1] dark:hover:bg-[#1E1E1C]'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  
                  <div className="pt-2 border-t border-[#E8E7E1] dark:border-[#2A2A28]">
                    {secondaryItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          item.active
                            ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-semibold'
                            : 'text-[#71716E] dark:text-[#8E8E88] hover:bg-[#EAE8E1] dark:hover:bg-[#1E1E1C]'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </nav>
              </div>

              {/* Mobile Drawer Footer with User Sign Out */}
              <div className="pt-4 border-t border-[#E8E7E1] dark:border-[#2A2A28] flex items-center justify-between">
                <Link
                  to="/settings"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                >
                  <div className="size-7 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-semibold flex items-center justify-center text-xs overflow-hidden shrink-0">
                    {user?.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user?.name || 'Profile'}
                        className="size-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-[#1A1A1A] dark:text-white truncate max-w-[120px]">
                    {user?.name}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    logout();
                  }}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Container */}
        <main className="max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-8 lg:px-10 flex-1 w-full animate-fade-in-up">
          {children || <Outlet />}
        </main>
      </div>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
