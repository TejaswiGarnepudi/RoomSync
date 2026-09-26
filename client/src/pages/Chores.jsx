import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';
import { getMyHousehold } from '../services/householdService';
import {
  getChores,
  createChore,
  claimChore,
  completeChore,
  getHouseholdWorkload,
  getSmartRecommendation,
  assignSmartRecommendation
} from '../services/choreService';

const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: '📋' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { id: 'bathroom', name: 'Bathroom', icon: '🧼' },
  { id: 'garbage', name: 'Garbage', icon: '🗑️' },
  { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
  { id: 'general', name: 'General', icon: '📦' }
];

const getCategoryIcon = (category) => {
  const match = CATEGORIES.find(c => c.id === category);
  return match ? match.icon : '📌';
};

// Helper: Format YYYY-MM-DD
const formatDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Helper: Format 24h time to 12h AM/PM
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

export default function Chores() {
  const { user } = useContext(AuthContext);
  const [household, setHousehold] = useState(null);
  const [choresList, setChoresList] = useState([]);
  const [workloads, setWorkloads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cleaning',
    estimatedDuration: 30,
    priority: 'medium',
    dueDate: formatDateStr(new Date()),
    dueTime: '18:00',
    assignmentType: 'smart',
    assignedTo: '',
    recurrenceType: 'none',
    recurrenceInterval: 1
  });

  // Smart Recommendation Modal State
  const [smartRecModalOpen, setSmartRecModalOpen] = useState(false);
  const [smartRecData, setSmartRecData] = useState(null);
  const [smartRecChore, setSmartRecChore] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [assigningSmart, setAssigningSmart] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [hhRes, choresRes, wlRes] = await Promise.all([
        getMyHousehold(),
        getChores(),
        getHouseholdWorkload()
      ]);

      setHousehold(hhRes.data.data.household);
      setChoresList(choresRes.data.data.chores || []);
      setWorkloads(wlRes.data.data.workloads || []);
    } catch (err) {
      console.error('Failed to load chores data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        estimatedDuration: Number(formData.estimatedDuration),
        priority: formData.priority,
        dueDate: formData.dueDate,
        dueTime: formData.dueTime,
        assignmentType: formData.assignmentType,
        assignedTo: formData.assignmentType === 'manual' ? formData.assignedTo : null,
        recurrence: {
          type: formData.recurrenceType,
          interval: Number(formData.recurrenceInterval)
        }
      };

      const res = await createChore(payload);
      const newChore = res.data.data.chore;
      setIsCreateModalOpen(false);

      // If smart assignment selected, open recommendation flow
      if (formData.assignmentType === 'smart') {
        openSmartRecommendationModal(newChore);
      }

      fetchDashboardData();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create chore');
    } finally {
      setCreating(false);
    }
  };

  const openSmartRecommendationModal = async (chore) => {
    setSmartRecChore(chore);
    setSmartRecModalOpen(true);
    setLoadingRec(true);
    setSmartRecData(null);

    try {
      const res = await getSmartRecommendation(chore._id);
      setSmartRecData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch recommendation:', err);
    } finally {
      setLoadingRec(false);
    }
  };

  const handleConfirmSmartAssign = async () => {
    if (!smartRecChore || !smartRecData || !smartRecData.recommendedUser) return;
    setAssigningSmart(true);

    try {
      await assignSmartRecommendation(smartRecChore._id, {
        userId: smartRecData.recommendedUser._id,
        startTime: smartRecData.startTime,
        endTime: smartRecData.endTime
      });
      setSmartRecModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign smart recommendation');
    } finally {
      setAssigningSmart(false);
    }
  };

  const handleClaim = async (choreId) => {
    try {
      await claimChore(choreId);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim chore');
    }
  };

  const handleComplete = async (choreId) => {
    try {
      await completeChore(choreId);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete chore');
    }
  };

  // Filtered lists
  const todayStr = formatDateStr(new Date());

  const filteredChores = choresList.filter(c => {
    // Tab filter
    if (activeTab === 'my') {
      const isAssignedToMe = c.assignedTo?._id === user._id || c.assignedTo === user._id;
      if (!isAssignedToMe) return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && c.category !== selectedCategory) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = c.title?.toLowerCase().includes(query);
      const matchDesc = c.description?.toLowerCase().includes(query);
      const matchUser = c.assignedTo?.name?.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchUser) return false;
    }
    return true;
  });

  const overdueChores = filteredChores.filter(c => c.status === 'overdue');
  const todayChores = filteredChores.filter(c => c.dueDate === todayStr && c.status !== 'completed' && c.status !== 'overdue');
  const upcomingChores = filteredChores.filter(c => c.dueDate > todayStr && c.status !== 'completed');
  const completedChores = filteredChores.filter(c => c.status === 'completed');

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Household Chores</h1>
          <p className="text-stone-600 mt-1">
            Coordinate tasks, track workloads, and use smart availability scheduling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/chores/history">
            <Button variant="secondary">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Chore History
            </Button>
          </Link>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Chore
          </Button>
        </div>
      </div>

      {/* Roommate Workload Summary Strip */}
      <div className="mb-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Fair Workload Balance
            </span>
            <span className="text-xs text-stone-400">Calculated by pending chore minutes</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {workloads.map((w) => {
              const isCurrentUser = w.user._id === user._id;
              return (
                <div
                  key={w.user._id}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrentUser ? 'bg-teal-50/50 border-teal-200' : 'bg-stone-50 border-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">
                      {w.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-stone-800 truncate">
                      {w.user.name} {isCurrentUser && '(You)'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-stone-500">{w.pendingCount} pending</span>
                    <span className="font-bold text-stone-800">{w.pendingMinutes}m load</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters & Tabs Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* All vs My Chores Toggle */}
        <div className="flex items-center space-x-2">
          <div className="bg-stone-100 p-1 rounded-lg flex text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Chores ({choresList.filter(c => c.status !== 'completed').length})
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'my'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              My Chores ({choresList.filter(c => (c.assignedTo?._id === user._id || c.assignedTo === user._id) && c.status !== 'completed').length})
            </button>
          </div>
        </div>

        {/* Category Pills & Search */}
        <div className="flex flex-wrap items-center gap-2 flex-1 md:justify-end">
          <div className="w-full sm:w-48">
            <Input
              id="search"
              placeholder="Search chores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-0 text-xs"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-xs font-medium text-stone-700 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chores Groups */}
      <div className="space-y-8">
        {/* OVERDUE SECTION */}
        {overdueChores.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h2 className="text-base font-bold text-rose-900 uppercase tracking-wide">
                Overdue Chores ({overdueChores.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overdueChores.map((chore) => (
                <ChoreCard
                  key={chore._id}
                  chore={chore}
                  currentUser={user}
                  onClaim={() => handleClaim(chore._id)}
                  onComplete={() => handleComplete(chore._id)}
                  onSmartRecommend={() => openSmartRecommendationModal(chore)}
                />
              ))}
            </div>
          </div>
        )}

        {/* TODAY SECTION */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <h2 className="text-base font-bold text-stone-900 uppercase tracking-wide">
              Due Today ({todayChores.length})
            </h2>
          </div>
          {todayChores.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-6 text-center text-stone-500 text-sm">
              ✨ No chores due today. Enjoy your day!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayChores.map((chore) => (
                <ChoreCard
                  key={chore._id}
                  chore={chore}
                  currentUser={user}
                  onClaim={() => handleClaim(chore._id)}
                  onComplete={() => handleComplete(chore._id)}
                  onSmartRecommend={() => openSmartRecommendationModal(chore)}
                />
              ))}
            </div>
          )}
        </div>

        {/* UPCOMING SECTION */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-400"></span>
            <h2 className="text-base font-bold text-stone-700 uppercase tracking-wide">
              Upcoming ({upcomingChores.length})
            </h2>
          </div>
          {upcomingChores.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-6 text-center text-stone-500 text-sm">
              No upcoming scheduled chores.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingChores.map((chore) => (
                <ChoreCard
                  key={chore._id}
                  chore={chore}
                  currentUser={user}
                  onClaim={() => handleClaim(chore._id)}
                  onComplete={() => handleComplete(chore._id)}
                  onSmartRecommend={() => openSmartRecommendationModal(chore)}
                />
              ))}
            </div>
          )}
        </div>

        {/* RECENTLY COMPLETED SECTION */}
        {completedChores.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h2 className="text-base font-bold text-stone-700 uppercase tracking-wide">
                Recently Completed ({completedChores.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedChores.slice(0, 6).map((chore) => (
                <ChoreCard
                  key={chore._id}
                  chore={chore}
                  currentUser={user}
                  onClaim={() => handleClaim(chore._id)}
                  onComplete={() => handleComplete(chore._id)}
                  onSmartRecommend={() => openSmartRecommendationModal(chore)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CREATE CHORE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Household Chore"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {createError}
            </div>
          )}

          <Input
            label="Chore Title"
            id="title"
            type="text"
            placeholder="e.g. Clean Kitchen Sink, Wash Dishes"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />

          <Input
            label="Description (Optional)"
            id="description"
            type="text"
            placeholder="e.g. Wipe down counters and empty trash"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Input
                label="Duration (mins)"
                id="duration"
                type="number"
                min="1"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                label="Due Date"
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                label="Due Time"
                id="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Recurrence</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, recurrenceType: 'none' }))}
                className={`py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                  formData.recurrenceType === 'none'
                    ? 'bg-teal-50 border-teal-500 text-teal-900'
                    : 'bg-white border-stone-200 text-stone-600'
                }`}
              >
                One-Time
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, recurrenceType: 'daily' }))}
                className={`py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                  formData.recurrenceType === 'daily'
                    ? 'bg-teal-50 border-teal-500 text-teal-900'
                    : 'bg-white border-stone-200 text-stone-600'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, recurrenceType: 'weekly' }))}
                className={`py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                  formData.recurrenceType === 'weekly'
                    ? 'bg-teal-50 border-teal-500 text-teal-900'
                    : 'bg-white border-stone-200 text-stone-600'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>

          {/* Assignment Mode */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Assignment Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, assignmentType: 'smart' }))}
                className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                  formData.assignmentType === 'smart'
                    ? 'bg-teal-50 border-teal-500 text-teal-900'
                    : 'bg-white border-stone-200 text-stone-600'
                }`}
              >
                <span className="font-bold block">✨ Smart</span>
                <span className="text-3xs opacity-80">Auto-recommend by availability</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, assignmentType: 'unassigned' }))}
                className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                  formData.assignmentType === 'unassigned'
                    ? 'bg-teal-50 border-teal-500 text-teal-900'
                    : 'bg-white border-stone-200 text-stone-600'
                }`}
              >
                <span className="font-bold block">Open Claim</span>
                <span className="text-3xs opacity-80">Anyone can claim</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, assignmentType: 'manual' }))}
                className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                  formData.assignmentType === 'manual'
                    ? 'bg-teal-50 border-teal-500 text-teal-900'
                    : 'bg-white border-stone-200 text-stone-600'
                }`}
              >
                <span className="font-bold block">Manual</span>
                <span className="text-3xs opacity-80">Pick specific person</span>
              </button>
            </div>
          </div>

          {formData.assignmentType === 'manual' && household && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Assign to Roommate</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">-- Select Roommate --</option>
                {household.members.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={creating}>
              Create Chore
            </Button>
          </div>
        </form>
      </Modal>

      {/* SMART RECOMMENDATION MODAL */}
      <Modal
        isOpen={smartRecModalOpen}
        onClose={() => setSmartRecModalOpen(false)}
        title="✨ Smart Chore Recommendation"
      >
        {loadingRec ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <LoadingSpinner />
            <p className="text-xs text-stone-500">
              Evaluating roommate availability, workload balances, and rotation history...
            </p>
          </div>
        ) : smartRecData && smartRecData.recommendedUser ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-teal-50 to-teal-100/60 p-4 rounded-xl border border-teal-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-base">
                  {smartRecData.recommendedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-xs uppercase font-semibold text-teal-700">Recommended Roommate</span>
                  <h3 className="text-lg font-bold text-stone-900">{smartRecData.recommendedUser.name}</h3>
                </div>
              </div>

              <div className="mt-3 bg-white/80 p-2.5 rounded-lg border border-teal-200/60 text-xs">
                <span className="font-semibold text-stone-800">Suggested Time Slot:</span>{' '}
                <span className="font-mono text-teal-800 font-bold">
                  {formatTime12h(smartRecData.startTime)} – {formatTime12h(smartRecData.endTime)}
                </span>
              </div>
            </div>

            {/* Explanations */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-2">
                Why was {smartRecData.recommendedUser.name} chosen?
              </span>
              <ul className="space-y-1.5">
                {smartRecData.reasons?.map((reason, idx) => (
                  <li key={idx} className="flex items-start text-xs text-stone-700">
                    <span className="text-teal-600 font-bold mr-2">✓</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
              <Button variant="secondary" size="sm" onClick={() => setSmartRecModalOpen(false)}>
                Decide Later
              </Button>
              <Button size="sm" onClick={handleConfirmSmartAssign} isLoading={assigningSmart}>
                Assign to {smartRecData.recommendedUser.name}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-3">
            <p className="text-sm text-stone-600">
              No suitable roommate recommendation found for this time slot.
            </p>
            <Button variant="secondary" size="sm" onClick={() => setSmartRecModalOpen(false)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

// Reusable Chore Card Component
function ChoreCard({ chore, currentUser, onClaim, onComplete, onSmartRecommend }) {
  const isAssignedToMe = chore.assignedTo?._id === currentUser._id || chore.assignedTo === currentUser._id;
  const isOverdue = chore.status === 'overdue';
  const isCompleted = chore.status === 'completed';

  const priorityStyles = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div
      className={`bg-white border rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between ${
        isOverdue
          ? 'border-rose-300 ring-1 ring-rose-300'
          : isCompleted
          ? 'border-stone-200 bg-stone-50/50 opacity-80'
          : 'border-stone-200'
      }`}
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-base flex items-center gap-1.5 font-medium text-stone-800">
            <span>{getCategoryIcon(chore.category)}</span>
            <span className="truncate">{chore.title}</span>
          </span>

          <span
            className={`text-3xs px-2 py-0.5 rounded-full font-bold uppercase border ${
              priorityStyles[chore.priority] || priorityStyles.medium
            }`}
          >
            {chore.priority}
          </span>
        </div>

        {chore.description && (
          <p className="text-xs text-stone-500 line-clamp-2 mb-3">
            {chore.description}
          </p>
        )}

        {/* Due Date & Duration details */}
        <div className="flex items-center justify-between text-xs text-stone-600 mb-3 bg-stone-50 p-2 rounded-lg">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {chore.dueDate} {formatTime12h(chore.dueTime)}
          </span>

          <span className="font-semibold text-stone-700">
            ⏱️ {chore.estimatedDuration} mins
          </span>
        </div>
      </div>

      {/* Assignee Footer & Actions */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {chore.assignedTo ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-3xs font-bold flex items-center justify-center">
                {chore.assignedTo.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-stone-700 truncate max-w-[100px]">
                {chore.assignedTo.name} {isAssignedToMe && '(You)'}
              </span>
            </div>
          ) : (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Unassigned
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!isCompleted && !chore.assignedTo && (
            <>
              <Button size="sm" variant="ghost" onClick={onSmartRecommend} title="Smart Assign">
                ✨
              </Button>
              <Button size="sm" variant="secondary" onClick={onClaim}>
                Claim
              </Button>
            </>
          )}

          {!isCompleted && chore.assignedTo && isAssignedToMe && (
            <Button size="sm" onClick={onComplete}>
              ✓ Done
            </Button>
          )}

          {isCompleted && (
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
              ✓ Completed
            </span>
          )}

          <Link to={`/chores/${chore._id}`}>
            <Button size="sm" variant="ghost">
              Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
