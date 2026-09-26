import React, { useContext, useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationDropdown from '../components/NotificationDropdown';
import GlobalSearchModal from '../components/GlobalSearchModal';

export default function AppLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState(null); // 'household' | 'tasks' | 'finance' | 'calendar' | 'user'
  const navRef = useRef(null);

  // Track scroll position for smooth navbar glass elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns and drawer on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const toggleDropdown = (name) => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  const isHouseholdActive = ['/household', '/join'].some(p => location.pathname.startsWith(p));
  const isTasksActive = ['/chores', '/shopping', '/help', '/decisions'].some(p => location.pathname.startsWith(p));
  const isFinanceActive = ['/expenses', '/contribution'].some(p => location.pathname.startsWith(p));
  const isCalendarActive = ['/calendar', '/household-calendar'].some(p => location.pathname.startsWith(p));
  const isDashboardActive = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-[#F4EDE3] text-[#234653] flex flex-col font-sans selection:bg-[#F2D4C8] selection:text-[#234653]">
      {/* Stylish & Elegant Top Main Navigation Bar */}
      <nav ref={navRef} className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-[#F4EDE3]/95 backdrop-blur-md shadow-xs border-b border-[#E8DEC8]' : 'bg-[#F4EDE3]/85 backdrop-blur-md border-b border-[#E8DEC8]/80'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand Logo with refined icon & typography */}
            <div className="flex items-center gap-7">
              <Link to="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-2xl bg-[#234653] text-[#FFF9F1] flex items-center justify-center font-serif text-base font-bold shadow-xs group-hover:bg-[#17272C] group-hover:scale-105 group-active:scale-95 transition-all duration-200">
                  ✦
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[#234653] font-serif-editorial tracking-tight leading-none group-hover:text-[#17272C] transition-colors">
                    RoomSync
                  </span>
                  <span className="text-[9px] uppercase font-bold text-[#3E737C] tracking-widest mt-0.5 opacity-70">
                    Household OS
                  </span>
                </div>
              </Link>

              {/* Center/Main Navigation Pill Container */}
              <div className="hidden lg:flex items-center p-1 bg-[#FAF5ED]/80 rounded-2xl border border-[#E8DEC8]/70 shadow-2xs space-x-1">
                {/* Dashboard Link */}
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    isDashboardActive
                      ? 'bg-[#FFF9F1] text-[#234653] shadow-2xs border border-[#E8DEC8]'
                      : 'text-[#3E737C] hover:text-[#234653] hover:bg-[#FFF9F1]/60'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Household Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('household')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      isHouseholdActive || activeDropdown === 'household'
                        ? 'bg-[#FFF9F1] text-[#234653] shadow-2xs border border-[#E8DEC8]'
                        : 'text-[#3E737C] hover:text-[#234653] hover:bg-[#FFF9F1]/60'
                    }`}
                  >
                    <span>Household</span>
                    <svg className={`w-3 h-3 text-[#3E737C] transition-transform duration-200 ${activeDropdown === 'household' ? 'rotate-180 text-[#234653]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeDropdown === 'household' && (
                    <div className="absolute left-0 mt-2.5 w-56 bg-[#FFF9F1]/95 backdrop-blur-md border border-[#E8DEC8] rounded-2xl shadow-xl py-2 z-50 animate-dropdown">
                      <Link
                        to="/household"
                        className="group flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="p-1 rounded-lg bg-[#FAF5ED] group-hover:bg-[#F2D4C8] text-sm transition-colors">🏠</span>
                        <div>
                          <span className="font-semibold block">My Household</span>
                          <span className="text-[10px] text-[#3E737C]">Overview & address</span>
                        </div>
                      </Link>
                      <Link
                        to="/household"
                        className="group flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="p-1 rounded-lg bg-[#FAF5ED] group-hover:bg-[#F2D4C8] text-sm transition-colors">👥</span>
                        <div>
                          <span className="font-semibold block">Members & Invites</span>
                          <span className="text-[10px] text-[#3E737C]">Manage roommates</span>
                        </div>
                      </Link>
                      <div className="border-t border-[#E8DEC8]/60 my-1"></div>
                      <Link
                        to="/household"
                        className="group flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="p-1 rounded-lg bg-[#FAF5ED] group-hover:bg-[#F2D4C8] text-sm transition-colors">⚙️</span>
                        <div>
                          <span className="font-semibold block">Settings</span>
                          <span className="text-[10px] text-[#3E737C]">Household preferences</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Tasks Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('tasks')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      isTasksActive || activeDropdown === 'tasks'
                        ? 'bg-[#FFF9F1] text-[#234653] shadow-2xs border border-[#E8DEC8]'
                        : 'text-[#3E737C] hover:text-[#234653] hover:bg-[#FFF9F1]/60'
                    }`}
                  >
                    <span>Tasks</span>
                    <svg className={`w-3 h-3 text-[#3E737C] transition-transform duration-200 ${activeDropdown === 'tasks' ? 'rotate-180 text-[#234653]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeDropdown === 'tasks' && (
                    <div className="absolute left-0 mt-2.5 w-56 bg-[#FFF9F1]/95 backdrop-blur-md border border-[#E8DEC8] rounded-2xl shadow-xl py-2 z-50 animate-dropdown">
                      <Link
                        to="/chores"
                        className="group flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="p-1 rounded-lg bg-[#FAF5ED] group-hover:bg-[#DCE8E8] text-sm transition-colors">🧹</span>
                        <div>
                          <span className="font-semibold block">Chores Board</span>
                          <span className="text-[10px] text-[#3E737C]">Fair rotations & tracking</span>
                        </div>
                      </Link>
                      <Link
                        to="/shopping"
                        className="group flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="p-1 rounded-lg bg-[#FAF5ED] group-hover:bg-[#DCE8E8] text-sm transition-colors">🛍️</span>
                        <div>
                          <span className="font-semibold block">Shopping Lists</span>
                          <span className="text-[10px] text-[#3E737C]">Shared groceries & items</span>
                        </div>
                      </Link>
                      <Link
                        to="/help"
                        className="group flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="p-1 rounded-lg bg-[#FAF5ED] group-hover:bg-[#DCE8E8] text-sm transition-colors">🤝</span>
                        <div>
                          <span className="font-semibold block">Help & Favors</span>
                          <span className="text-[10px] text-[#3E737C]">Roommate assistance</span>
                        </div>
                      </Link>
                      <Link
                        to="/decisions"
                        className="group flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="p-1 rounded-lg bg-[#FAF5ED] group-hover:bg-[#DCE8E8] text-sm transition-colors">🗳️</span>
                        <div>
                          <span className="font-semibold block">Decisions & Polls</span>
                          <span className="text-[10px] text-[#3E737C]">Vote & resolve topics</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Finance Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('finance')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      isFinanceActive || activeDropdown === 'finance'
                        ? 'bg-[#FFF9F1] text-[#234653] shadow-2xs border border-[#E8DEC8]'
                        : 'text-[#3E737C] hover:text-[#234653] hover:bg-[#FFF9F1]/60'
                    }`}
                  >
                    <span>Finance</span>
                    <svg className={`w-3 h-3 text-[#3E737C] transition-transform duration-200 ${activeDropdown === 'finance' ? 'rotate-180 text-[#234653]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeDropdown === 'finance' && (
                    <div className="absolute left-0 mt-2.5 w-56 bg-[#FFF9F1]/95 backdrop-blur-md border border-[#E8DEC8] rounded-2xl shadow-xl py-2 z-50 animate-dropdown">
                      <Link
                        to="/expenses"
                        className="group flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="p-1 rounded-lg bg-[#FAF5ED] group-hover:bg-[#F2D4C8] text-sm transition-colors">💰</span>
                        <div>
                          <span className="font-semibold block">Expenses & Splits</span>
                          <span className="text-[10px] text-[#3E737C]">Balances & settlements</span>
                        </div>
                      </Link>
                      <Link
                        to="/contribution"
                        className="group flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="p-1 rounded-lg bg-[#FAF5ED] group-hover:bg-[#F2D4C8] text-sm transition-colors">📊</span>
                        <div>
                          <span className="font-semibold block">Workload Insights</span>
                          <span className="text-[10px] text-[#3E737C]">Fair shared contributions</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Calendar Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('calendar')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      isCalendarActive || activeDropdown === 'calendar'
                        ? 'bg-[#FFF9F1] text-[#234653] shadow-2xs border border-[#E8DEC8]'
                        : 'text-[#3E737C] hover:text-[#234653] hover:bg-[#FFF9F1]/60'
                    }`}
                  >
                    <span>Calendar</span>
                    <svg className={`w-3 h-3 text-[#3E737C] transition-transform duration-200 ${activeDropdown === 'calendar' ? 'rotate-180 text-[#234653]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeDropdown === 'calendar' && (
                    <div className="absolute left-0 mt-2.5 w-56 bg-[#FFF9F1]/95 backdrop-blur-md border border-[#E8DEC8] rounded-2xl shadow-xl py-2 z-50 animate-dropdown">
                      <Link
                        to="/household-calendar"
                        className="group flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="p-1 rounded-lg bg-[#FAF5ED] group-hover:bg-[#DCE8E8] text-sm transition-colors">📅</span>
                        <div>
                          <span className="font-semibold block">Household Calendar</span>
                          <span className="text-[10px] text-[#3E737C]">All chores & events</span>
                        </div>
                      </Link>
                      <Link
                        to="/calendar"
                        className="group flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="p-1 rounded-lg bg-[#FAF5ED] group-hover:bg-[#DCE8E8] text-sm transition-colors">🗓️</span>
                        <div>
                          <span className="font-semibold block">My Schedule</span>
                          <span className="text-[10px] text-[#3E737C]">Personal availability</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Search, Notifications, User Menu, Mobile Toggle */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Stylish Search Trigger Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                title="Search household (Ctrl+K)"
                className="p-2 sm:px-3 sm:py-2 text-[#3E737C] hover:text-[#234653] bg-[#FAF5ED]/80 hover:bg-[#FFF9F1] border border-[#E8DEC8]/80 hover:border-[#3E737C]/40 rounded-2xl transition-all duration-200 flex items-center gap-2 shadow-2xs hover:shadow-xs group active:scale-95"
              >
                <svg className="w-4 h-4 text-[#3E737C] group-hover:text-[#234653] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline-block text-xs font-medium text-[#3E737C] group-hover:text-[#234653]">Search</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-[#FFF9F1] text-[#3E737C] rounded-md border border-[#E8DEC8] shadow-2xs">
                  ⌘K
                </kbd>
              </button>

              {/* Notification Dropdown */}
              <NotificationDropdown />

              {/* User Avatar + Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('user')}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-[#FAF5ED]/80 hover:bg-[#FFF9F1] transition-all duration-200 border border-[#E8DEC8]/80 hover:border-[#3E737C]/40 shadow-2xs active:scale-95"
                  aria-label="User account menu"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-xl bg-[#234653] text-[#FFF9F1] font-semibold flex items-center justify-center text-xs shadow-2xs font-serif">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    {/* Synchronized dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#E86F5A] border-2 border-[#FFF9F1] rounded-full"></span>
                  </div>

                  <span className="hidden sm:inline-block text-xs font-semibold text-[#234653] max-w-[100px] truncate text-left">
                    {user?.name || 'Account'}
                  </span>
                  <svg className={`w-3 h-3 text-[#3E737C] transition-transform duration-200 ${activeDropdown === 'user' ? 'rotate-180 text-[#234653]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeDropdown === 'user' && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-[#FFF9F1]/95 backdrop-blur-md border border-[#E8DEC8] rounded-2xl shadow-xl py-2 z-50 animate-dropdown">
                    <div className="px-4 py-3 border-b border-[#E8DEC8]/60 bg-[#FAF5ED]/60 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#234653] text-[#FFF9F1] font-bold flex items-center justify-center text-sm font-serif shadow-2xs">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#234653] font-serif-editorial truncate">{user?.name}</p>
                        <p className="text-[10px] text-[#3E737C] truncate mt-0.5">{user?.email}</p>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/household"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="text-sm">🏠</span> Household Profile
                      </Link>
                      <Link
                        to="/calendar"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="text-sm">🗓️</span> My Availability
                      </Link>
                      <Link
                        to="/household"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                      >
                        <span className="text-sm">⚙️</span> Household Settings
                      </Link>
                    </div>

                    <div className="border-t border-[#E8DEC8]/60 pt-1">
                      <button
                        type="button"
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#E86F5A] hover:bg-[#FBF1EB] font-semibold transition-colors text-left"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Drawer Hamburger Button */}
              <div className="flex lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(true)}
                  className="p-2 rounded-2xl text-[#3E737C] hover:text-[#234653] bg-[#FAF5ED]/80 hover:bg-[#FFF9F1] border border-[#E8DEC8]/80 transition-all active:scale-95"
                  aria-label="Open mobile navigation menu"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Slide-over) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#17272C]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          ></div>

          {/* Drawer Content */}
          <div className="relative ml-auto w-4/5 max-w-sm bg-[#FFF9F1] border-l border-[#E8DEC8] h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-fade-in-up">
            {/* Drawer Header */}
            <div className="p-5 bg-[#FAF5ED] border-b border-[#E8DEC8] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#234653] text-[#FFF9F1] flex items-center justify-center font-serif text-sm font-bold">
                  ✦
                </div>
                <span className="font-bold text-[#234653] text-base font-serif-editorial">RoomSync</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-xl text-[#3E737C] hover:text-[#234653] hover:bg-[#F4EDE3]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 space-y-6 flex-1 bg-[#FFF9F1]">
              <div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    isDashboardActive ? 'bg-[#FBF1EB] text-[#234653] border border-[#F2D4C8] shadow-2xs' : 'text-[#3E737C] hover:bg-[#FAF5ED]'
                  }`}
                >
                  <span>📊</span> Dashboard
                </Link>
              </div>

              {/* Household Group */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#3E737C] tracking-wider px-3">
                  Household
                </span>
                <Link
                  to="/household"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#234653] hover:bg-[#FAF5ED] transition-colors"
                >
                  <span>🏠</span> My Household
                </Link>
                <Link
                  to="/household"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#234653] hover:bg-[#FAF5ED] transition-colors"
                >
                  <span>👥</span> Members & Invites
                </Link>
              </div>

              {/* Tasks Group */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#3E737C] tracking-wider px-3">
                  Tasks & Rhythm
                </span>
                <Link
                  to="/chores"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#234653] hover:bg-[#FAF5ED] transition-colors"
                >
                  <span>🧹</span> Chores Board
                </Link>
                <Link
                  to="/shopping"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#234653] hover:bg-[#FAF5ED] transition-colors"
                >
                  <span>🛍️</span> Shopping Lists
                </Link>
                <Link
                  to="/help"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#234653] hover:bg-[#FAF5ED] transition-colors"
                >
                  <span>🤝</span> Help & Favors
                </Link>
                <Link
                  to="/decisions"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#234653] hover:bg-[#FAF5ED] transition-colors"
                >
                  <span>🗳️</span> Decisions & Polls
                </Link>
              </div>

              {/* Finance Group */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#3E737C] tracking-wider px-3">
                  Finance
                </span>
                <Link
                  to="/expenses"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#234653] hover:bg-[#FAF5ED] transition-colors"
                >
                  <span>💰</span> Expenses & Splits
                </Link>
                <Link
                  to="/contribution"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#234653] hover:bg-[#FAF5ED] transition-colors"
                >
                  <span>📊</span> Workload Contributions
                </Link>
              </div>

              {/* Calendar Group */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#3E737C] tracking-wider px-3">
                  Calendar
                </span>
                <Link
                  to="/household-calendar"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#234653] hover:bg-[#FAF5ED] transition-colors"
                >
                  <span>📅</span> Household Calendar
                </Link>
                <Link
                  to="/calendar"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#234653] hover:bg-[#FAF5ED] transition-colors"
                >
                  <span>🗓️</span> My Schedule
                </Link>
              </div>
            </div>

            {/* Drawer Footer with User Info and Sign Out */}
            <div className="p-5 border-t border-[#E8DEC8] bg-[#FAF5ED]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#234653] text-[#FFF9F1] font-semibold flex items-center justify-center text-xs font-serif">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#234653] truncate font-serif-editorial">{user?.name}</p>
                  <p className="text-[10px] text-[#3E737C] truncate">{user?.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  logout();
                }}
                className="w-full py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-[#E86F5A] hover:bg-[#FBF1EB] rounded-xl flex items-center justify-center gap-2 transition-colors border border-[#F2D4C8] shadow-2xs active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Layout Container with smooth entrance */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1 w-full animate-fade-in-up">
        {children || <Outlet />}
      </main>

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
