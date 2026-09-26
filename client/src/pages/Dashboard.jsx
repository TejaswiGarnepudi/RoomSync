import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMyHousehold, createHousehold } from '../services/householdService';
import { getDashboardSummary } from '../services/dashboardService';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import GlobalSearchModal from '../components/GlobalSearchModal';
import TiltCard from '../components/motion/TiltCard';
import ScrollReveal from '../components/motion/ScrollReveal';

const formatTime12h = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [household, setHousehold] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Action Dropdown State
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef(null);

  // Global Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Household create/join state
  const [inviteCode, setInviteCode] = useState('');
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [hhRes, sumRes] = await Promise.all([
        getMyHousehold().catch(() => ({ data: { data: { household: null } } })),
        getDashboardSummary().catch(() => ({ data: { data: null } }))
      ]);

      setHousehold(hhRes.data.data.household);
      setSummary(sumRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user?._id]);

  // Handle outside click for Add menu
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCopyCode = () => {
    if (household?.inviteCode) {
      navigator.clipboard.writeText(household.inviteCode);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      navigate(`/join/${inviteCode.trim()}`);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newHouseholdName.trim()) return;
    setIsCreating(true);
    setCreateError('');
    try {
      const res = await createHousehold({ name: newHouseholdName });
      setHousehold(res.data.data.household);
      fetchDashboard();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create household');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center py-32 space-y-3 animate-fade-in-up">
          <LoadingSpinner />
          <p className="text-xs text-[#3E737C] font-medium tracking-wide">Synchronizing household journal...</p>
        </div>
      </AppLayout>
    );
  }

  // State when user does not have a household yet
  if (!household) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-8 space-y-8 animate-fade-in-up">
          {/* Welcome Card with Artwork & Hover Lift */}
          <div className="rounded-3xl border border-[#E8DEC8] bg-[#FFF9F1] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm hover-lift overflow-hidden group">
            <div className="w-full md:w-1/2 aspect-4/3 rounded-2xl overflow-hidden border border-[#E8DEC8]">
              <img
                src="/assets/hero-living-room.jpg"
                alt="RoomSync shared living room"
                className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="w-full md:w-1/2 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5ED] text-[#234653] text-xs font-semibold border border-[#E8DEC8] shadow-2xs">
                <span>🏠</span> Welcome to RoomSync
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#234653] font-serif-editorial tracking-tight">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-xs text-[#3E737C] leading-relaxed">
                Create a shared household journal for your home, or join your roommates with an invite code.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Card */}
            <div className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-6 shadow-2xs space-y-4 flex flex-col justify-between hover-lift">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F2D4C8] text-[#234653] flex items-center justify-center font-bold text-lg mb-3 shadow-2xs">
                  ✦
                </div>
                <h2 className="text-base font-bold text-[#234653] font-serif-editorial">Create a Household</h2>
                <p className="text-xs text-[#3E737C] mt-1 leading-relaxed">
                  Start fresh. You'll receive a unique invite code to share with your roommates.
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-3 pt-2">
                <Input
                  label="Household Name"
                  value={newHouseholdName}
                  onChange={(e) => setNewHouseholdName(e.target.value)}
                  placeholder="e.g. Maple Flat #3B"
                  error={createError}
                  required
                />
                <Button type="submit" fullWidth loading={isCreating}>
                  Create Household
                </Button>
              </form>
            </div>

            {/* Join Card */}
            <div className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-6 shadow-2xs space-y-4 flex flex-col justify-between hover-lift">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#DCE8E8] text-[#234653] flex items-center justify-center font-bold text-lg mb-3 shadow-2xs">
                  🔑
                </div>
                <h2 className="text-base font-bold text-[#234653] font-serif-editorial">Join Existing Household</h2>
                <p className="text-xs text-[#3E737C] mt-1 leading-relaxed">
                  Have an 8-character invite code from your roommate? Enter it below.
                </p>
              </div>

              <form onSubmit={handleJoin} className="space-y-3 pt-2">
                <Input
                  label="Roommate Invite Code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUNRISE7"
                  required
                />
                <Button type="submit" variant="secondary" fullWidth>
                  Join Household &rarr;
                </Button>
              </form>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const {
    todayAgenda,
    myResponsibilities,
    alerts,
    recentActivities,
    contributionPreview,
    overviewCounts,
    upcomingSchedule
  } = summary || {};

  // Group recent activities by relative date
  const groupedActivities = (recentActivities || []).reduce((acc, act) => {
    const actDate = new Date(act.createdAt);
    const today = new Date();
    const isToday = actDate.toDateString() === today.toDateString();
    const groupKey = isToday ? 'TODAY' : 'EARLIER';
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(act);
    return acc;
  }, {});

  // Calculate user contribution percentage
  const totalMins = contributionPreview?.totalHouseholdMinutes || 0;
  const userMins = contributionPreview?.userContribution?.totalMinutes || 0;
  const userPct = totalMins > 0 ? Math.round((userMins / totalMins) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* ======================================================== */}
        {/* SECTION: CONTEXTUAL HEADER & UNIFIED ACTION BAR */}
        {/* ======================================================== */}
        <header className="pb-6 border-b border-[#E8DEC8] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#234653] font-serif-editorial tracking-tight">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
              </h1>

              {/* Household contextual badge with quick invite copy */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5ED] border border-[#E8DEC8] text-xs font-semibold text-[#234653] shadow-2xs hover:border-[#3E737C]/40 transition-colors">
                <span>🏠</span>
                <span>{household.name}</span>
                <span className="text-[#E8DEC8]">•</span>
                <button
                  onClick={handleCopyCode}
                  title="Click to copy invite code"
                  className="font-mono text-[11px] text-[#E86F5A] hover:text-[#D65D48] transition-colors cursor-pointer active:scale-95"
                >
                  {copiedInvite ? '✓ Copied' : household.inviteCode}
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#3E737C]">
              Here is what needs your attention today in your household.
            </p>
          </div>

          {/* Right Header Actions: Compact + Add Dropdown & Search */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {/* Quick Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="px-3 py-2 text-xs font-medium text-[#234653] bg-[#FFF9F1] border border-[#E8DEC8] hover:border-[#3E737C]/40 rounded-xl hover:bg-[#FAF5ED] transition-all duration-200 flex items-center gap-2 shadow-2xs hover:shadow-xs active:scale-95"
            >
              <svg className="w-4 h-4 text-[#3E737C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#FAF5ED] text-[#3E737C] rounded-md border border-[#E8DEC8]">
                Ctrl+K
              </kbd>
            </button>

            {/* Compact + Add Dropdown with Coral Action */}
            <div className="relative" ref={addMenuRef}>
              <button
                type="button"
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#FFF9F1] bg-[#E86F5A] hover:bg-[#D65D48] hover-glow-coral rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-xs hover:shadow active:scale-95"
              >
                <span>+ Add</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isAddMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#FFF9F1]/95 backdrop-blur-md border border-[#E8DEC8] rounded-2xl shadow-xl py-2 z-30 animate-dropdown">
                  <Link
                    to="/chores"
                    onClick={() => setIsAddMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                  >
                    <span className="p-1 rounded-lg bg-[#FAF5ED] text-sm">🧹</span> Add Chore
                  </Link>
                  <Link
                    to="/expenses"
                    onClick={() => setIsAddMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                  >
                    <span className="p-1 rounded-lg bg-[#FAF5ED] text-sm">💰</span> Add Expense
                  </Link>
                  <Link
                    to="/shopping"
                    onClick={() => setIsAddMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                  >
                    <span className="p-1 rounded-lg bg-[#FAF5ED] text-sm">🛍️</span> Add Shopping Item
                  </Link>
                  <Link
                    to="/help"
                    onClick={() => setIsAddMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                  >
                    <span className="p-1 rounded-lg bg-[#FAF5ED] text-sm">🤝</span> Request Help
                  </Link>
                  <Link
                    to="/decisions"
                    onClick={() => setIsAddMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#234653] hover:bg-[#FAF5ED] font-medium transition-colors"
                  >
                    <span className="p-1 rounded-lg bg-[#FAF5ED] text-sm">🗳️</span> Add Decision
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* ALERTS BANNER */}
        {/* ======================================================== */}
        {alerts && alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`p-3.5 px-4 rounded-2xl border flex items-center justify-between gap-3 text-xs hover-lift ${
                  alert.severity === 'high'
                    ? 'bg-[#FBF1EB] border-[#F2D4C8] text-[#234653]'
                    : alert.severity === 'medium'
                    ? 'bg-[#FAF5ED] border-[#E7A83C]/40 text-[#234653]'
                    : 'bg-[#EFF6F6] border-[#DCE8E8] text-[#234653]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base">
                    {alert.severity === 'high' ? '⚠️' : alert.severity === 'medium' ? '🔔' : 'ℹ️'}
                  </span>
                  <div className="truncate">
                    <strong className="font-bold text-[#234653]">{alert.title}: </strong>
                    <span className="text-[#3E737C]">{alert.message}</span>
                  </div>
                </div>

                <Link
                  to={alert.link}
                  className="shrink-0 font-bold hover:underline px-3 py-1 rounded-xl bg-[#FFF9F1] border border-[#E8DEC8] text-[#E86F5A] text-[11px] shadow-2xs hover:shadow-xs active:scale-95 transition-all"
                >
                  Resolve &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* MAIN ASYMMETRIC GRID LAYOUT */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ======================================================== */}
          {/* LEFT DOMINANT COLUMN (8 COLS ON DESKTOP) */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-8">
            {/* ---------------------------------------------------- */}
            {/* 1. PRIMARY SECTION: TODAY'S HOUSEHOLD AGENDA WITH COMPANION ARTWORK */}
            {/* ---------------------------------------------------- */}
            <section className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-6 sm:p-7 shadow-2xs space-y-5 hover-lift">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
                <div className="flex items-center gap-2">
                  <span className="text-base">🗓️</span>
                  <h2 className="text-base font-bold text-[#234653] font-serif-editorial">Today's household agenda</h2>
                </div>
                <Link
                  to="/household-calendar"
                  className="text-xs font-semibold text-[#E86F5A] hover:text-[#D65D48] transition-colors"
                >
                  View full calendar &rarr;
                </Link>
              </div>

              {/* Visual Mini Banner Card */}
              <div className="rounded-2xl overflow-hidden border border-[#E8DEC8]/80 bg-[#FAF5ED] flex flex-col sm:flex-row items-center gap-4 p-3.5 group">
                <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-[#E8DEC8]/70">
                  <img
                    src="/assets/kitchen-counter.jpg"
                    alt="Kitchen Counter Rhythm"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E86F5A] block">
                    Morning Rhythm
                  </span>
                  <p className="text-xs font-semibold text-[#234653] mt-0.5">
                    {todayAgenda?.totalItems > 0 
                      ? `${todayAgenda.totalItems} tasks coordinated across your home today.` 
                      : 'All morning chores and favors are up to date.'}
                  </p>
                  <span className="text-[10px] text-[#3E737C]">
                    Shared harmony • {household.members?.length || 1} roommates active
                  </span>
                </div>
              </div>

              {(!todayAgenda || todayAgenda.totalItems === 0) ? (
                /* Compact, intentional empty state */
                <div className="text-center py-8 px-4 border border-dashed border-[#E8DEC8] rounded-2xl bg-[#FAF5ED]">
                  <div className="text-2xl mb-1">☀️</div>
                  <h3 className="text-xs font-bold text-[#234653]">Nothing scheduled today</h3>
                  <p className="text-[11px] text-[#3E737C] mt-0.5">Your household is all caught up.</p>
                  <Link
                    to="/household-calendar"
                    className="inline-block mt-3 text-xs font-semibold text-[#E86F5A] hover:underline"
                  >
                    View household calendar &rarr;
                  </Link>
                </div>
              ) : (
                /* Agenda Timeline List with Hover Effects */
                <div className="divide-y divide-[#E8DEC8]/50 pt-1">
                  {todayAgenda.chores?.map((chore) => {
                    const isUserChore = chore.assignedTo?._id === user?._id;
                    const isCompleted = chore.status === 'completed';
                    return (
                      <div
                        key={chore._id}
                        className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-[#FAF5ED] px-3 rounded-xl transition-all duration-150 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-[11px] font-semibold text-[#3E737C] w-16 shrink-0">
                            {formatTime12h(chore.dueTime) || 'All day'}
                          </span>
                          <span className="p-1.5 bg-[#FAF5ED] group-hover:bg-[#F2D4C8] text-[#234653] rounded-lg text-sm shrink-0 border border-[#E8DEC8]/60 transition-colors">
                            🧹
                          </span>
                          <div className="truncate">
                            <span className={`font-bold block truncate ${isCompleted ? 'line-through text-[#3E737C]' : 'text-[#234653]'}`}>
                              {chore.title}
                            </span>
                            <span className="text-[11px] text-[#3E737C]">
                              {isUserChore ? (
                                <strong className="text-[#E86F5A]">Assigned to You</strong>
                              ) : (
                                `Assigned to ${chore.assignedTo?.name || 'Unassigned'}`
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              isCompleted
                                ? 'bg-[#DCE8E8] text-[#234653]'
                                : chore.status === 'in_progress'
                                ? 'bg-[#F2D4C8] text-[#234653]'
                                : 'bg-[#FAF5ED] text-[#3E737C] border border-[#E8DEC8]'
                            }`}
                          >
                            {chore.status?.replace('_', ' ') || 'Pending'}
                          </span>
                          <Link
                            to={`/chores/${chore._id}`}
                            className="text-[#3E737C] hover:text-[#234653] group-hover:translate-x-0.5 transition-transform px-2 py-1 font-bold"
                          >
                            &rarr;
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  {todayAgenda.help?.map((h) => (
                    <div
                      key={h._id}
                      className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-[#FAF5ED] px-3 rounded-xl transition-all duration-150 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-[11px] font-semibold text-[#3E737C] w-16 shrink-0">
                          {formatTime12h(h.startTime) || 'Flexible'}
                        </span>
                        <span className="p-1.5 bg-[#FBF1EB] text-[#234653] rounded-lg text-sm shrink-0 border border-[#F2D4C8] group-hover:bg-[#DCE8E8] transition-colors">
                          🤝
                        </span>
                        <div className="truncate">
                          <span className="font-bold text-[#234653] block truncate">{h.title}</span>
                          <span className="text-[11px] text-[#3E737C]">
                            Requested by {h.requester?.name || 'Roommate'} • {h.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            h.status === 'completed'
                              ? 'bg-[#DCE8E8] text-[#234653]'
                              : h.status === 'accepted'
                              ? 'bg-[#F2D4C8] text-[#234653]'
                              : 'bg-[#FAF5ED] text-[#E7A83C] border border-[#E8DEC8]'
                          }`}
                        >
                          {h.status || 'Open'}
                        </span>
                        <Link
                          to={`/help/${h._id}`}
                          className="text-[#3E737C] hover:text-[#234653] group-hover:translate-x-0.5 transition-transform px-2 py-1 font-bold"
                        >
                          &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ---------------------------------------------------- */}
            {/* 2. MY RESPONSIBILITIES (Personal Actionable Inbox) */}
            {/* ---------------------------------------------------- */}
            <section className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4 hover-lift">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
                <div>
                  <h2 className="text-base font-bold text-[#234653] font-serif-editorial">My responsibilities</h2>
                  <p className="text-[11px] text-[#3E737C]">Items requiring your direct action</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF5ED] text-[#234653] border border-[#E8DEC8] shadow-2xs">
                    {myResponsibilities?.totalActiveTasks || 0} active
                  </span>
                </div>
              </div>

              {(!myResponsibilities || (myResponsibilities.totalActiveTasks === 0 && myResponsibilities.pendingOwed === 0)) ? (
                /* Compact Empty State */
                <div className="text-center py-6 border border-dashed border-[#E8DEC8] rounded-2xl bg-[#FAF5ED]">
                  <div className="text-xl mb-1">🕊️</div>
                  <h3 className="text-xs font-bold text-[#234653]">You're all caught up!</h3>
                  <p className="text-[11px] text-[#3E737C]">No pending chores, shopping runs, or unsettled balances for you.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Chores assigned to user */}
                  {myResponsibilities.chores && myResponsibilities.chores.length > 0 && (
                    <div className="p-4 rounded-2xl border border-[#E8DEC8] bg-[#FAF5ED] space-y-2.5 hover:border-[#3E737C]/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#3E737C] uppercase tracking-wider">
                          🧹 Your Chores ({myResponsibilities.choresCount})
                        </span>
                        <Link to="/chores" className="text-[10px] font-semibold text-[#E86F5A] hover:underline">
                          Board &rarr;
                        </Link>
                      </div>

                      <div className="space-y-1.5">
                        {myResponsibilities.chores.map((c) => (
                          <Link
                            key={c._id}
                            to={`/chores/${c._id}`}
                            className="block p-2.5 bg-[#FFF9F1] rounded-xl border border-[#E8DEC8]/80 hover:border-[#3E737C]/60 hover:shadow-2xs transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-[#234653] truncate block">
                                {c.title}
                              </span>
                              <span className="text-[10px] font-bold text-[#E86F5A] bg-[#FBF1EB] px-2 py-0.5 rounded-full shrink-0 border border-[#F2D4C8]">
                                {c.status === 'overdue' ? 'Overdue' : 'Due ' + formatDateLabel(c.dueDate)}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shopping runs assigned to user */}
                  {myResponsibilities.shoppingAssigned && myResponsibilities.shoppingAssigned.length > 0 && (
                    <div className="p-4 rounded-2xl border border-[#E8DEC8] bg-[#FAF5ED] space-y-2.5 hover:border-[#3E737C]/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#3E737C] uppercase tracking-wider">
                          🛍️ Shopping Assigned ({myResponsibilities.shoppingAssignedCount})
                        </span>
                        <Link to="/shopping" className="text-[10px] font-semibold text-[#E86F5A] hover:underline">
                          Lists &rarr;
                        </Link>
                      </div>

                      <div className="space-y-1.5">
                        {myResponsibilities.shoppingAssigned.map((s) => (
                          <Link
                            key={s._id}
                            to="/shopping"
                            className="block p-2.5 bg-[#FFF9F1] rounded-xl border border-[#E8DEC8]/80 hover:border-[#3E737C]/60 hover:shadow-2xs transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-[#234653] truncate block">
                                {s.title || s.name || 'Grocery List'}
                              </span>
                              <span className="text-[10px] text-[#3E737C]">
                                {s.items?.length || 0} items
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Favors accepted by user */}
                  {myResponsibilities.helpProviding && myResponsibilities.helpProviding.length > 0 && (
                    <div className="p-4 rounded-2xl border border-[#E8DEC8] bg-[#FAF5ED] space-y-2.5 hover:border-[#3E737C]/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#3E737C] uppercase tracking-wider">
                          🤝 Favors Accepted ({myResponsibilities.helpProvidingCount})
                        </span>
                        <Link to="/help" className="text-[10px] font-semibold text-[#E86F5A] hover:underline">
                          View &rarr;
                        </Link>
                      </div>

                      <div className="space-y-1.5">
                        {myResponsibilities.helpProviding.map((h) => (
                          <Link
                            key={h._id}
                            to={`/help/${h._id}`}
                            className="block p-2.5 bg-[#FFF9F1] rounded-xl border border-[#E8DEC8]/80 hover:border-[#3E737C]/60 hover:shadow-2xs transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-[#234653] truncate block">
                                {h.title}
                              </span>
                              <span className="text-[10px] text-[#234653] bg-[#DCE8E8] px-2 py-0.5 rounded-full">
                                For {h.requester?.name || 'Roommate'}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financial Balance / Owed Card */}
                  <div className="p-4 rounded-2xl border border-[#E8DEC8] bg-[#FAF5ED] space-y-2.5 hover:border-[#3E737C]/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#3E737C] uppercase tracking-wider">
                        💰 Your Expense Balance
                      </span>
                      <Link to="/expenses" className="text-[10px] font-semibold text-[#E86F5A] hover:underline">
                        Settle &rarr;
                      </Link>
                    </div>

                    <div className="p-3 bg-[#FFF9F1] rounded-xl border border-[#E8DEC8]/80 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="text-[10px] text-[#3E737C] block">Pending Balance</span>
                        <span className={`text-base font-bold font-serif-editorial ${myResponsibilities.pendingOwed > 0 ? 'text-[#E86F5A]' : 'text-[#234653]'}`}>
                          {myResponsibilities.pendingOwed > 0
                            ? `You owe ₹${myResponsibilities.pendingOwed.toFixed(2)}`
                            : 'All Settled Up'}
                        </span>
                      </div>
                      <Link
                        to="/expenses"
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#FAF5ED] hover:bg-[#FBF1EB] text-[#234653] border border-[#E8DEC8] transition-all active:scale-95 shadow-2xs"
                      >
                        Splits
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* ---------------------------------------------------- */}
            {/* 3. RECENT ACTIVITY TIMELINE */}
            {/* ---------------------------------------------------- */}
            <section className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4 hover-lift">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <h2 className="text-base font-bold text-[#234653] font-serif-editorial">Household activity</h2>
                </div>
                <span className="text-[11px] text-[#3E737C] font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E86F5A] animate-pulse"></span>
                  Live rhythm
                </span>
              </div>

              {(!recentActivities || recentActivities.length === 0) ? (
                <div className="text-center py-6 text-[#3E737C] text-xs">
                  Your household activity will appear here.
                </div>
              ) : (
                <div className="space-y-5">
                  {Object.entries(groupedActivities).map(([groupLabel, items]) => (
                    <div key={groupLabel} className="space-y-3">
                      <span className="text-[10px] font-bold text-[#3E737C] uppercase tracking-wider block font-serif-editorial">
                        {groupLabel}
                      </span>

                      <div className="space-y-2 border-l-2 border-[#E8DEC8] ml-2 pl-3.5">
                        {items.map((act) => (
                          <div key={act._id} className="relative flex items-start gap-3 text-xs py-1 group">
                            {/* Dot indicator */}
                            <div className="w-6 h-6 rounded-full bg-[#DCE8E8] text-[#234653] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-serif group-hover:scale-110 transition-transform shadow-2xs">
                              {act.actor?.name ? act.actor.name.charAt(0).toUpperCase() : 'R'}
                            </div>

                            <div className="flex-1 min-w-0 bg-[#FAF5ED]/60 group-hover:bg-[#FAF5ED] p-2 rounded-xl transition-colors">
                              <p className="text-[#234653] leading-snug">
                                <strong className="font-semibold text-[#17272C]">
                                  {act.actor?.name === user?.name ? 'You' : act.actor?.name || 'Roommate'}
                                </strong>{' '}
                                {act.message?.replace(act.actor?.name, '').trim() || act.message}
                              </p>
                              <span className="text-[10px] text-[#3E737C]/80 mt-0.5 block font-mono">
                                {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ======================================================== */}
          {/* RIGHT SUPPORTING COLUMN (4 COLS ON DESKTOP) */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* ---------------------------------------------------- */}
            {/* A. HOUSEHOLD PULSE / SNAPSHOT */}
            {/* ---------------------------------------------------- */}
            <div className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-6 shadow-2xs space-y-3.5 hover-lift">
              <span className="text-[10px] font-bold text-[#3E737C] uppercase tracking-wider block font-serif-editorial">
                Household pulse
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Chores Pulse */}
                <TiltCard maxTilt={4} spotlightColor="rgba(35, 70, 83, 0.08)" className="rounded-2xl shadow-2xs">
                  <Link
                    to="/chores"
                    className="block p-3.5 bg-[#FAF5ED] rounded-2xl border border-[#E8DEC8] hover:border-[#3E737C]/60 hover:bg-[#FFF9F1] transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-[#3E737C] text-[11px] font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#234653]"></span>
                      Chores
                    </div>
                    <span className="text-xl font-bold text-[#234653] font-serif-editorial block mt-1 group-hover:scale-105 transition-transform">
                      {overviewCounts?.openChores || 0}
                    </span>
                    <span className="text-[10px] text-[#3E737C]">open tasks</span>
                  </Link>
                </TiltCard>

                {/* Expenses Pulse */}
                <TiltCard maxTilt={4} spotlightColor="rgba(232, 111, 90, 0.08)" className="rounded-2xl shadow-2xs">
                  <Link
                    to="/expenses"
                    className="block p-3.5 bg-[#FAF5ED] rounded-2xl border border-[#E8DEC8] hover:border-[#3E737C]/60 hover:bg-[#FFF9F1] transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-[#3E737C] text-[11px] font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#E86F5A]"></span>
                      Expenses
                    </div>
                    <span className="text-xl font-bold text-[#234653] font-serif-editorial block mt-1 group-hover:scale-105 transition-transform">
                      {overviewCounts?.pendingOwed > 0 ? '₹' + overviewCounts.pendingOwed.toFixed(0) : '₹0'}
                    </span>
                    <span className="text-[10px] text-[#3E737C]">
                      {overviewCounts?.pendingOwed > 0 ? 'pending due' : 'all settled'}
                    </span>
                  </Link>
                </TiltCard>

                {/* Shopping Pulse */}
                <TiltCard maxTilt={4} spotlightColor="rgba(231, 168, 60, 0.08)" className="rounded-2xl shadow-2xs">
                  <Link
                    to="/shopping"
                    className="block p-3.5 bg-[#FAF5ED] rounded-2xl border border-[#E8DEC8] hover:border-[#3E737C]/60 hover:bg-[#FFF9F1] transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-[#3E737C] text-[11px] font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#E7A83C]"></span>
                      Shopping
                    </div>
                    <span className="text-xl font-bold text-[#234653] font-serif-editorial block mt-1 group-hover:scale-105 transition-transform">
                      {overviewCounts?.upcomingShopping || 0}
                    </span>
                    <span className="text-[10px] text-[#3E737C]">lists active</span>
                  </Link>
                </TiltCard>

                {/* Help / Decisions Pulse */}
                <TiltCard maxTilt={4} spotlightColor="rgba(62, 115, 124, 0.08)" className="rounded-2xl shadow-2xs">
                  <Link
                    to="/decisions"
                    className="block p-3.5 bg-[#FAF5ED] rounded-2xl border border-[#E8DEC8] hover:border-[#3E737C]/60 hover:bg-[#FFF9F1] transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-[#3E737C] text-[11px] font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#3E737C]"></span>
                      Decisions
                    </div>
                    <span className="text-xl font-bold text-[#234653] font-serif-editorial block mt-1 group-hover:scale-105 transition-transform">
                      {overviewCounts?.activePolls || 0}
                    </span>
                    <span className="text-[10px] text-[#3E737C]">active votes</span>
                  </Link>
                </TiltCard>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* B. CONTRIBUTION / BALANCE MODULE */}
            {/* ---------------------------------------------------- */}
            <div className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-6 shadow-2xs space-y-3.5 hover-lift">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#3E737C] uppercase tracking-wider font-serif-editorial">
                  Household contributions
                </span>
                <Link
                  to="/contribution"
                  className="text-[11px] font-semibold text-[#E86F5A] hover:text-[#D65D48] transition-colors"
                >
                  Details &rarr;
                </Link>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-[#3E737C]">Your monthly contribution</span>
                  <span className="text-xl font-bold text-[#234653] font-serif-editorial">{userPct}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#FAF5ED] border border-[#E8DEC8] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#234653] h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(userPct, 100)}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#3E737C] pt-1">
                  <span>Your time: <strong className="text-[#234653]">{userMins} min</strong></span>
                  <span>Household total: <strong className="text-[#234653]">{totalMins} min</strong></span>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* C. CALENDAR PREVIEW (UP NEXT) */}
            {/* ---------------------------------------------------- */}
            <div className="bg-[#FFF9F1] border border-[#E8DEC8] rounded-3xl p-6 shadow-2xs space-y-3.5 hover-lift">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#3E737C] uppercase tracking-wider font-serif-editorial">
                  Up next
                </span>
                <Link
                  to="/household-calendar"
                  className="text-[11px] font-semibold text-[#E86F5A] hover:text-[#D65D48] transition-colors"
                >
                  Calendar &rarr;
                </Link>
              </div>

              {(!upcomingSchedule?.chores || upcomingSchedule.chores.length === 0) ? (
                <p className="text-xs text-[#3E737C] py-2">No upcoming scheduled tasks this week.</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {upcomingSchedule.chores.slice(0, 3).map((ch) => (
                    <div
                      key={ch._id}
                      className="p-3 rounded-2xl bg-[#FAF5ED] border border-[#E8DEC8] flex items-center justify-between hover:bg-[#FFF9F1] transition-colors group"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-[#234653] block truncate">{ch.title}</span>
                        <span className="text-[10px] text-[#3E737C]">
                          {formatDateLabel(ch.dueDate)} • {ch.assignedTo?.name || 'Unassigned'}
                        </span>
                      </div>
                      <Link
                        to={`/chores/${ch._id}`}
                        className="text-[#3E737C] hover:text-[#234653] group-hover:translate-x-0.5 transition-transform text-xs px-1 font-bold"
                      >
                        &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ---------------------------------------------------- */}
            {/* D. HOUSEHOLD ROOMMATE CODE */}
            {/* ---------------------------------------------------- */}
            <div className="p-5 rounded-3xl bg-[#234653] text-[#FFF9F1] space-y-2 shadow-xs hover-lift group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#F2D4C8] tracking-widest font-serif-editorial">
                  Roommate Invite Code
                </span>
                <Link to="/household" className="text-xs font-semibold text-[#DCE8E8] hover:text-white transition-colors">
                  Manage &rarr;
                </Link>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-lg font-bold text-white tracking-widest">
                  {household.inviteCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-[#FFF9F1] hover:bg-[#FBF1EB] text-xs font-semibold text-[#234653] transition-all active:scale-95 shadow-2xs"
                >
                  {copiedInvite ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </AppLayout>
  );
}
