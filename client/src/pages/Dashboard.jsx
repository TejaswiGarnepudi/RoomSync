import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMyHousehold, createHousehold } from '../services/householdService';
import { getDashboardSummary } from '../services/dashboardService';
import { getHouseholdAvailability } from '../services/availabilityService';
import { getShoppingLists, getShoppingListById, updateShoppingItem } from '../services/shoppingService';
import { completeChore, claimChore } from '../services/choreService';
import { getExpenses } from '../services/expenseService';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import GlobalSearchModal from '../components/GlobalSearchModal';

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

const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  return { day, month };
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
  const [availabilityList, setAvailabilityList] = useState([]);
  const [groceryItems, setGroceryItems] = useState([]);
  const [recentExpensesList, setRecentExpensesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Global Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Household create/join state (for non-household users)
  const [inviteCode, setInviteCode] = useState('');
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Calendar mini-widget current date
  const [currentDate] = useState(new Date());

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];

      const [hhRes, sumRes, availRes, listsRes, expRes] = await Promise.all([
        getMyHousehold().catch(() => ({ data: { data: { household: null } } })),
        getDashboardSummary().catch(() => ({ data: { data: null } })),
        getHouseholdAvailability({ startDate: todayStr, endDate: todayStr }).catch(() => ({ data: { data: { availability: [] } } })),
        getShoppingLists({ limit: 1 }).catch(() => ({ data: { data: { shoppingLists: [] } } })),
        getExpenses({ limit: 5 }).catch(() => ({ data: { data: { expenses: [] } } }))
      ]);

      const hhData = hhRes.data.data.household;
      setHousehold(hhData);
      setSummary(sumRes.data.data);
      setAvailabilityList(availRes.data.data?.availability || []);
      setRecentExpensesList(expRes.data.data?.expenses || []);

      // Load grocery items from first active list if available
      const lists = listsRes.data.data?.shoppingLists || [];
      if (lists.length > 0) {
        const fullListRes = await getShoppingListById(lists[0]._id).catch(() => null);
        if (fullListRes?.data?.data?.items) {
          setGroceryItems(fullListRes.data.data.items);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user?._id]);

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

  // Toggle grocery item checkbox directly from dashboard
  const handleToggleGroceryItem = async (item) => {
    try {
      const newStatus = item.status === 'purchased' ? 'pending' : 'purchased';
      await updateShoppingItem(item._id, { status: newStatus });
      setGroceryItems(prev => prev.map(i => i._id === item._id ? { ...i, status: newStatus } : i));
    } catch (err) {
      console.error('Failed to toggle grocery item:', err);
    }
  };

  // Complete chore directly from dashboard
  const handleCompleteChore = async (choreId) => {
    try {
      await completeChore(choreId);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete chore');
    }
  };

  if (loading && !household && !summary) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center py-32 space-y-3 animate-fade-in-up">
          <LoadingSpinner />
          <p className="text-xs text-[#71716E] dark:text-[#8E8E88] font-medium tracking-wide">
            Synchronizing household journal...
          </p>
        </div>
      </AppLayout>
    );
  }

  // Non-household welcome flow
  if (!household) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-8 space-y-8 animate-fade-in-up">
          <div className="rounded-3xl border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="w-full md:w-1/2 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white text-xs font-medium border border-transparent dark:border-[#2E2E2A]">
                <span>🏠</span> Welcome to RoomSync
              </span>
              <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white leading-tight">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}.
              </h1>
              <p className="text-sm text-[#71716E] dark:text-[#A8A7A0] leading-relaxed">
                Start by creating a shared household space for your apartment or joining your flatmates with an invite code.
              </p>
            </div>
            <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden border border-[#E8E7E1] dark:border-[#2A2A28] bg-[#FAF9F5] dark:bg-[#1E1E1C]">
              <img
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"
                alt="RoomSync shared living room"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-7 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="size-11 rounded-2xl bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white flex items-center justify-center font-bold text-lg mb-4">
                  ✦
                </div>
                <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-[-0.03em]">Create a Household</h2>
                <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-1 leading-relaxed">
                  Start fresh. You'll receive a shareable invite code to give to your roommates.
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <Input
                  label="Household Name"
                  value={newHouseholdName}
                  onChange={(e) => setNewHouseholdName(e.target.value)}
                  placeholder="e.g. The Maple Flat #3B"
                  error={createError}
                  required
                />
                <Button type="submit" fullWidth isLoading={isCreating}>
                  Create Household &rarr;
                </Button>
              </form>
            </div>

            <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-7 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="size-11 rounded-2xl bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white flex items-center justify-center font-bold text-lg mb-4">
                  🔑
                </div>
                <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-[-0.03em]">Join Existing Household</h2>
                <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-1 leading-relaxed">
                  Have an 8-character invite code from your flatmate? Enter it below.
                </p>
              </div>

              <form onSubmit={handleJoin} className="space-y-4 pt-2">
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
    todayAgenda = { chores: [], help: [] },
    myResponsibilities = {},
    alerts = [],
    recentActivities = [],
    upcomingSchedule = { chores: [], shopping: [], polls: [] },
    overviewCounts = {}
  } = summary || {};

  // Calendar matrix calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDateNum = currentDate.getDate();

  // Calculate expenses summary
  const totalExpensesAmount = recentExpensesList.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-7 animate-fade-in-up">
        {/* ======================================================== */}
        {/* 1. TOP PAGE HEADER & GREETING */}
        {/* ======================================================== */}
        <header className="pb-5 border-b border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-[34px] font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white flex items-center gap-2">
              <span>{getGreeting()}, {user?.name?.split(' ')[0] || 'Tejaswi'}!</span>
              <span className="text-2xl select-none">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88] tracking-[-0.02em]">
              Same house. Different dreams. One sync.
            </p>
          </div>

          {/* Household Context Badge with Copyable Invite Code */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] border border-transparent dark:border-[#2E2E2A] text-xs font-medium text-[#1A1A1A] dark:text-[#FAF9F5]">
              <span>🏠</span>
              <span>{household.name}</span>
              <span className="text-[#71716E] dark:text-[#8E8E88]">•</span>
              <button
                onClick={handleCopyCode}
                title="Click to copy invite code"
                className="font-mono text-[11px] font-semibold underline text-[#1A1A1A] dark:text-white hover:opacity-75 transition-opacity cursor-pointer"
              >
                {copiedInvite ? '✓ Copied' : household.inviteCode}
              </button>
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. ALERTS (IF ANY) */}
        {/* ======================================================== */}
        {alerts && alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className="p-3.5 px-4.5 rounded-2xl border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] flex items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base">
                    {alert.severity === 'high' ? '⚠️' : alert.severity === 'medium' ? '🔔' : 'ℹ️'}
                  </span>
                  <div className="truncate">
                    <strong className="font-semibold text-[#1A1A1A] dark:text-white">{alert.title}: </strong>
                    <span className="text-[#71716E] dark:text-[#8E8E88]">{alert.message}</span>
                  </div>
                </div>

                <Link
                  to={alert.link}
                  className="shrink-0 font-medium px-3 py-1 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-white dark:hover:text-[#1A1A1A] transition-all text-[11px]"
                >
                  Resolve &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. TOP TIER: HERO BANNER (LEFT 65%) + HOUSEHOLD AT A GLANCE (RIGHT 35%) */}
        {/* ======================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* A. Hero Banner Card */}
          <div className="lg:col-span-8 relative overflow-hidden rounded-[28px] border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-7 sm:p-9 flex flex-col justify-between shadow-sm min-h-[220px]">
            {/* Background ambient pattern */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 dark:opacity-20 pointer-events-none hidden sm:block">
              <img
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#141413] to-transparent" />
            </div>

            <div className="relative z-10 max-w-lg space-y-2.5">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
                  Your Home in Sync
                </h2>
                <span className="text-xl">🏠</span>
              </div>
              <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#A8A7A0] leading-relaxed max-w-md">
                Manage your space, share responsibilities, keep everyone in the loop — all in one place.
              </p>
            </div>

            {/* Sticky Note Interactive Tags + CTA */}
            <div className="relative z-10 pt-6 flex flex-wrap items-center gap-3">
              <Link to="/household">
                <Button size="sm">
                  View All Features &rarr;
                </Button>
              </Link>

              <Link
                to="/help"
                className="px-3.5 py-1.5 rounded-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E8E7E1] dark:border-[#2E2E2A] text-xs font-medium text-[#1A1A1A] dark:text-[#FAF9F5] hover:border-[#1A1A1A]/40 transition-colors shadow-2xs"
              >
                Help someone? 🤝
              </Link>

              <Link
                to="/shopping"
                className="px-3.5 py-1.5 rounded-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E8E7E1] dark:border-[#2E2E2A] text-xs font-medium text-[#1A1A1A] dark:text-[#FAF9F5] hover:border-[#1A1A1A]/40 transition-colors shadow-2xs"
              >
                Groceries to buy? 🛒
              </Link>

              <Link
                to="/chores"
                className="px-3.5 py-1.5 rounded-full bg-[#FAF9F5] dark:bg-[#1E1E1C] border border-[#E8E7E1] dark:border-[#2E2E2A] text-xs font-medium text-[#1A1A1A] dark:text-[#FAF9F5] hover:border-[#1A1A1A]/40 transition-colors shadow-2xs"
              >
                Chores sorted? 🧹
              </Link>
            </div>
          </div>

          {/* B. Household at a Glance (2x2 KPI Grid) */}
          <div className="lg:col-span-4 rounded-[28px] border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-6 sm:p-7 flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
              <div className="flex items-center gap-2">
                <span className="text-base">🏠</span>
                <h3 className="text-sm font-medium tracking-tight text-[#1A1A1A] dark:text-white">
                  Household at a Glance
                </h3>
              </div>
              <Link to="/household" className="text-[11px] text-[#71716E] dark:text-[#8E8E88] hover:underline">
                Details &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Metric 1: Roommates */}
              <Link
                to="/household"
                className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] hover:border-[#1A1A1A]/30 dark:hover:border-white/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="size-8 rounded-xl bg-[#EAE8E1] dark:bg-[#1E1E1C] flex items-center justify-center text-sm">
                    👥
                  </span>
                  <span className="text-2xl font-medium text-[#1A1A1A] dark:text-white tracking-tight">
                    {household.membersCount || household.members?.length || 1}
                  </span>
                </div>
                <span className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-2 block font-medium">
                  Roommates
                </span>
              </Link>

              {/* Metric 2: Active Help Requests */}
              <Link
                to="/help"
                className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] hover:border-[#1A1A1A]/30 dark:hover:border-white/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="size-8 rounded-xl bg-[#EAE8E1] dark:bg-[#1E1E1C] flex items-center justify-center text-sm">
                    🤝
                  </span>
                  <span className="text-2xl font-medium text-[#1A1A1A] dark:text-white tracking-tight">
                    {overviewCounts?.openHelpRequests || 0}
                  </span>
                </div>
                <span className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-2 block font-medium">
                  Active Help Requests
                </span>
              </Link>

              {/* Metric 3: Pending Groceries */}
              <Link
                to="/shopping"
                className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] hover:border-[#1A1A1A]/30 dark:hover:border-white/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="size-8 rounded-xl bg-[#EAE8E1] dark:bg-[#1E1E1C] flex items-center justify-center text-sm">
                    🛍️
                  </span>
                  <span className="text-2xl font-medium text-[#1A1A1A] dark:text-white tracking-tight">
                    {overviewCounts?.upcomingShopping || groceryItems.filter(i => i.status !== 'purchased').length || 0}
                  </span>
                </div>
                <span className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-2 block font-medium">
                  Pending Groceries
                </span>
              </Link>

              {/* Metric 4: Upcoming Chores */}
              <Link
                to="/chores"
                className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] hover:border-[#1A1A1A]/30 dark:hover:border-white/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="size-8 rounded-xl bg-[#EAE8E1] dark:bg-[#1E1E1C] flex items-center justify-center text-sm">
                    🧹
                  </span>
                  <span className="text-2xl font-medium text-[#1A1A1A] dark:text-white tracking-tight">
                    {overviewCounts?.openChores || 0}
                  </span>
                </div>
                <span className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-2 block font-medium">
                  Upcoming Chores
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. MIDDLE TIER (4-CARD GRID): AVAILABILITY, HELP REQUESTS, QUICK ACTIONS, UPCOMING EVENTS */}
        {/* ======================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Roommate Availability */}
          <div className="rounded-[28px] border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-5 sm:p-6 flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
              <div className="flex items-center gap-2">
                <span className="text-sm">🗓️</span>
                <h3 className="text-xs font-semibold tracking-tight text-[#1A1A1A] dark:text-white uppercase tracking-wider">
                  Roommate Availability
                </h3>
              </div>
              <Link to="/calendar" className="text-[11px] text-[#71716E] dark:text-[#8E8E88] hover:underline">
                View all &rarr;
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {household.members?.slice(0, 4).map((member) => {
                const isCurrent = member._id === user?._id;
                const memberAvail = availabilityList.find(a => a.user?._id === member._id || a.user === member._id);
                const isFree = memberAvail ? memberAvail.status === 'available' : true;

                return (
                  <div key={member._id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-7 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white font-semibold flex items-center justify-center text-[10px] shrink-0">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="truncate">
                        <span className="font-medium text-[#1A1A1A] dark:text-white block truncate">
                          {member.name} {isCurrent && <span className="text-[#71716E] font-normal">(You)</span>}
                        </span>
                        <span className="text-[10px] text-[#71716E] dark:text-[#8E8E88] flex items-center gap-1 mt-0.5">
                          <span className={`size-1.5 rounded-full ${isFree ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {isFree ? 'Free Today' : 'Busy'}
                        </span>
                      </div>
                    </div>

                    <Link to="/household-calendar" className="text-[#71716E] hover:text-[#1A1A1A] dark:hover:text-white px-1">
                      &rarr;
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Recent Help Requests */}
          <div className="rounded-[28px] border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-5 sm:p-6 flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
              <div className="flex items-center gap-2">
                <span className="text-sm">🤝</span>
                <h3 className="text-xs font-semibold tracking-tight text-[#1A1A1A] dark:text-white uppercase tracking-wider">
                  Recent Help Requests
                </h3>
              </div>
              <Link to="/help" className="text-[11px] text-[#71716E] dark:text-[#8E8E88] hover:underline">
                View all &rarr;
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {(todayAgenda?.help?.length === 0 && (!myResponsibilities.helpProviding || myResponsibilities.helpProviding.length === 0)) ? (
                <div className="text-center py-6 text-xs text-[#71716E] dark:text-[#8E8E88]">
                  No active requests. Everything is calm!
                </div>
              ) : (
                [...(todayAgenda?.help || []), ...(myResponsibilities?.helpProviding || [])].slice(0, 3).map((h) => (
                  <Link
                    key={h._id}
                    to={`/help/${h._id}`}
                    className="block p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] hover:border-[#1A1A1A]/30 dark:hover:border-white/20 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#1A1A1A] dark:text-white truncate block">
                        {h.title}
                      </span>
                      <span className="text-[10px] text-[#71716E] dark:text-[#8E8E88] shrink-0">
                        {h.urgency || 'Open'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#71716E] dark:text-[#8E8E88] block mt-0.5">
                      By {h.requester?.name || 'Flatmate'} • {formatTime12h(h.startTime) || 'Flexible'}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Card 3: Quick Actions (2x2 Grid) */}
          <div className="rounded-[28px] border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-5 sm:p-6 flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚡</span>
                <h3 className="text-xs font-semibold tracking-tight text-[#1A1A1A] dark:text-white uppercase tracking-wider">
                  Quick Actions
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 flex-1">
              <Link
                to="/help"
                className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] hover:border-[#1A1A1A]/30 dark:hover:border-white/20 transition-all flex flex-col items-center justify-center text-center group"
              >
                <span className="text-lg mb-1">🤝</span>
                <span className="text-[11px] font-medium text-[#1A1A1A] dark:text-white leading-tight">
                  Add Help Request
                </span>
              </Link>

              <Link
                to="/shopping"
                className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] hover:border-[#1A1A1A]/30 dark:hover:border-white/20 transition-all flex flex-col items-center justify-center text-center group"
              >
                <span className="text-lg mb-1">🛒</span>
                <span className="text-[11px] font-medium text-[#1A1A1A] dark:text-white leading-tight">
                  Add Groceries
                </span>
              </Link>

              <Link
                to="/chores"
                className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] hover:border-[#1A1A1A]/30 dark:hover:border-white/20 transition-all flex flex-col items-center justify-center text-center group"
              >
                <span className="text-lg mb-1">🧹</span>
                <span className="text-[11px] font-medium text-[#1A1A1A] dark:text-white leading-tight">
                  Add Chore
                </span>
              </Link>

              <Link
                to="/expenses"
                className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] hover:border-[#1A1A1A]/30 dark:hover:border-white/20 transition-all flex flex-col items-center justify-center text-center group"
              >
                <span className="text-lg mb-1">💰</span>
                <span className="text-[11px] font-medium text-[#1A1A1A] dark:text-white leading-tight">
                  Split Expense
                </span>
              </Link>
            </div>
          </div>

          {/* Card 4: Upcoming Events / Agenda */}
          <div className="rounded-[28px] border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-5 sm:p-6 flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
              <div className="flex items-center gap-2">
                <span className="text-sm">📅</span>
                <h3 className="text-xs font-semibold tracking-tight text-[#1A1A1A] dark:text-white uppercase tracking-wider">
                  Upcoming Events
                </h3>
              </div>
              <Link to="/household-calendar" className="text-[11px] text-[#71716E] dark:text-[#8E8E88] hover:underline">
                View all &rarr;
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {(upcomingSchedule?.chores?.length === 0 && todayAgenda?.chores?.length === 0) ? (
                <div className="text-center py-6 text-xs text-[#71716E] dark:text-[#8E8E88]">
                  No upcoming events scheduled this week.
                </div>
              ) : (
                [...(todayAgenda?.chores || []), ...(upcomingSchedule?.chores || [])].slice(0, 3).map((ev) => {
                  const dateMeta = formatDateShort(ev.dueDate || new Date());
                  return (
                    <div key={ev._id} className="flex items-center gap-3 text-xs">
                      <div className="size-10 rounded-xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col items-center justify-center shrink-0">
                        <span className="font-bold text-[#1A1A1A] dark:text-white text-xs leading-none">{dateMeta.day}</span>
                        <span className="text-[9px] uppercase text-[#71716E] dark:text-[#8E8E88] mt-0.5">{dateMeta.month}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-[#1A1A1A] dark:text-white block truncate">{ev.title}</span>
                        <span className="text-[10px] text-[#71716E] dark:text-[#8E8E88] block">
                          {formatTime12h(ev.dueTime) || 'Scheduled'} • {ev.assignedTo?.name || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. BOTTOM TIER (5 MODULES): CALENDAR, GROCERIES, CHORES, EXPENSES, RECENT ACTIVITY */}
        {/* ======================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Card 1: Household Calendar Mini Widget (Col span 3) */}
          <div className="lg:col-span-3 rounded-[28px] border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-5 sm:p-6 flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
              <h3 className="text-xs font-semibold text-[#1A1A1A] dark:text-white uppercase tracking-wider">
                {monthName} {year}
              </h3>
              <Link to="/household-calendar" className="text-[11px] text-[#71716E] dark:text-[#8E8E88] hover:underline">
                View &rarr;
              </Link>
            </div>

            {/* 7-Day Day Names */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-[#71716E] dark:text-[#8E8E88]">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="py-1 opacity-20 text-[11px]">.</div>
              ))}
              {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isToday = dayNum === todayDateNum;
                return (
                  <div
                    key={dayNum}
                    className={`py-1 rounded-lg text-xs font-medium transition-colors ${
                      isToday
                        ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-bold shadow-2xs'
                        : 'text-[#1A1A1A] dark:text-[#FAF9F5] hover:bg-[#FAF9F5] dark:hover:bg-[#181816]'
                    }`}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#E8E7E1] dark:border-[#2A2A28] text-center">
              <span className="text-[10px] text-[#71716E] dark:text-[#8E8E88]">
                {todayAgenda?.totalItems || 0} scheduled tasks today
              </span>
            </div>
          </div>

          {/* Card 2: Groceries & Essentials Checklist (Col span 2) */}
          <div className="lg:col-span-2 rounded-[28px] border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-5 sm:p-6 flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
              <h3 className="text-xs font-semibold text-[#1A1A1A] dark:text-white uppercase tracking-wider truncate">
                Groceries
              </h3>
              <Link to="/shopping" className="text-[11px] text-[#71716E] dark:text-[#8E8E88] hover:underline">
                View &rarr;
              </Link>
            </div>

            <div className="space-y-2 flex-1">
              {groceryItems.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#71716E] dark:text-[#8E8E88]">
                  Pantry is fully stocked!
                </div>
              ) : (
                groceryItems.slice(0, 4).map((item) => {
                  const isDone = item.status === 'purchased';
                  return (
                    <div
                      key={item._id}
                      onClick={() => handleToggleGroceryItem(item)}
                      className="flex items-center gap-2 text-xs cursor-pointer select-none py-1 group"
                    >
                      <span className={`size-4 rounded-md flex items-center justify-center text-[10px] transition-colors shrink-0 ${
                        isDone
                          ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                          : 'border border-[#71716E]/40 dark:border-white/30'
                      }`}>
                        {isDone && '✓'}
                      </span>
                      <span className={`truncate text-xs ${isDone ? 'line-through text-[#71716E] dark:text-[#666660]' : 'text-[#1A1A1A] dark:text-white font-medium'}`}>
                        {item.name}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-[#E8E7E1] dark:border-[#2A2A28] text-[10px] text-[#71716E] dark:text-[#8E8E88] text-center">
              Small things, big comfort ♡
            </div>
          </div>

          {/* Card 3: Chores Rotation (Col span 2) */}
          <div className="lg:col-span-2 rounded-[28px] border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-5 sm:p-6 flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
              <h3 className="text-xs font-semibold text-[#1A1A1A] dark:text-white uppercase tracking-wider truncate">
                Chores
              </h3>
              <Link to="/chores" className="text-[11px] text-[#71716E] dark:text-[#8E8E88] hover:underline">
                View &rarr;
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {(todayAgenda?.chores?.length === 0 && myResponsibilities?.chores?.length === 0) ? (
                <div className="text-center py-6 text-xs text-[#71716E] dark:text-[#8E8E88]">
                  All chores up to date!
                </div>
              ) : (
                [...(todayAgenda?.chores || []), ...(myResponsibilities?.chores || [])].slice(0, 3).map((ch) => {
                  const isDone = ch.status === 'completed';
                  return (
                    <div key={ch._id} className="flex items-center justify-between text-xs py-0.5">
                      <div className="min-w-0 pr-1">
                        <span className={`font-medium block truncate ${isDone ? 'line-through text-[#71716E]' : 'text-[#1A1A1A] dark:text-white'}`}>
                          {ch.title}
                        </span>
                        <span className="text-[10px] text-[#71716E] dark:text-[#8E8E88]">
                          {ch.assignedTo?.name ? ch.assignedTo.name : 'Unassigned'}
                        </span>
                      </div>

                      {!isDone && (
                        <button
                          onClick={() => handleCompleteChore(ch._id)}
                          title="Mark complete"
                          className="size-5 rounded-full border border-[#71716E]/40 hover:border-[#1A1A1A] dark:hover:border-white flex items-center justify-center text-[10px] shrink-0 cursor-pointer"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-[#E8E7E1] dark:border-[#2A2A28] text-[10px] text-[#71716E] dark:text-[#8E8E88] text-center">
              Fair workload balance
            </div>
          </div>

          {/* Card 4: Monthly Expenses & Splits (Col span 2) */}
          <div className="lg:col-span-2 rounded-[28px] border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-5 sm:p-6 flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
              <h3 className="text-xs font-semibold text-[#1A1A1A] dark:text-white uppercase tracking-wider truncate">
                Monthly Expenses
              </h3>
              <Link to="/expenses" className="text-[11px] text-[#71716E] dark:text-[#8E8E88] hover:underline">
                View &rarr;
              </Link>
            </div>

            {/* Total Balance Pill */}
            <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] text-center">
              <span className="text-[10px] text-[#71716E] dark:text-[#8E8E88] uppercase block">Total logged</span>
              <span className="text-base font-semibold text-[#1A1A1A] dark:text-white block mt-0.5">
                ₹{totalExpensesAmount.toLocaleString()}
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#71716E] dark:text-[#8E8E88]">
                <span>Pending due</span>
                <span className="font-semibold text-[#1A1A1A] dark:text-white">₹{myResponsibilities?.pendingOwed?.toFixed(0) || 0}</span>
              </div>
              <div className="flex justify-between text-[#71716E] dark:text-[#8E8E88]">
                <span>Shared splits</span>
                <span className="font-medium text-[#1A1A1A] dark:text-white">{recentExpensesList.length} total</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E8E7E1] dark:border-[#2A2A28] text-[10px] text-[#71716E] dark:text-[#8E8E88] text-center">
              Debt minimized splits
            </div>
          </div>

          {/* Card 5: Recent Household Activity (Col span 3) */}
          <div className="lg:col-span-3 rounded-[28px] border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] p-5 sm:p-6 flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-semibold text-[#1A1A1A] dark:text-white uppercase tracking-wider">
                  Recent Activity
                </h3>
              </div>
              <Link to="/notifications" className="text-[11px] text-[#71716E] dark:text-[#8E8E88] hover:underline">
                View &rarr;
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {recentActivities.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#71716E] dark:text-[#8E8E88]">
                  No recent activities recorded.
                </div>
              ) : (
                recentActivities.slice(0, 3).map((act) => (
                  <div key={act._id} className="flex items-start gap-2.5 text-xs">
                    <div className="size-6 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white font-semibold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {act.actor?.name ? act.actor.name.charAt(0).toUpperCase() : 'R'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[#1A1A1A] dark:text-[#FAF9F5] text-xs leading-snug line-clamp-2">
                        <strong>{act.actor?.name === user?.name ? 'You' : act.actor?.name || 'Roommate'}</strong>{' '}
                        {act.message?.replace(act.actor?.name, '').trim() || act.message}
                      </p>
                      <span className="text-[10px] text-[#71716E] dark:text-[#8E8E88] block mt-0.5">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#E8E7E1] dark:border-[#2A2A28] text-[10px] text-[#71716E] dark:text-[#8E8E88] text-center">
              Live household rhythm
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 6. BOTTOM BANNER / HOUSEHOLD SLOGAN */}
        {/* ======================================================== */}
        <footer className="p-4 px-6 rounded-2xl border border-[#E8E7E1] dark:border-[#2A2A28] bg-white/60 dark:bg-[#141413]/60 flex items-center justify-between text-xs text-[#71716E] dark:text-[#8E8E88]">
          <div className="flex items-center gap-2">
            <span>🌱</span>
            <span>Different people. Different habits. Same home.</span>
          </div>
          <span className="font-mono text-[11px] font-medium text-[#1A1A1A] dark:text-white">
            {household.name}
          </span>
        </footer>
      </div>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </AppLayout>
  );
}
