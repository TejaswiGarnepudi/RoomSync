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

const formatDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

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
    try {
      const res = await getSmartRecommendation(chore._id);
      setSmartRecData(res.data.data);
    } catch (err) {
      console.error('Failed to get smart recommendation:', err);
    } finally {
      setLoadingRec(false);
    }
  };

  const handleApplySmartAssignment = async () => {
    if (!smartRecChore || !smartRecData?.recommendedUser?._id) return;
    setAssigningSmart(true);
    try {
      await assignSmartRecommendation(smartRecChore._id, smartRecData.recommendedUser._id);
      setSmartRecModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign chore');
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  // Filter chores
  const filteredChores = choresList.filter(chore => {
    if (activeTab === 'my' && chore.assignedTo?._id !== user?._id && chore.assignedTo !== user?._id) {
      return false;
    }
    if (selectedCategory !== 'all' && chore.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = chore.title.toLowerCase().includes(q);
      const matchAssignee = (chore.assignedTo?.name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchAssignee) return false;
    }
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="pb-6 border-b border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
              Chores & Household Rhythm
            </h1>
            <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88] mt-1 tracking-[-0.02em]">
              Automated fair rotations, smart availability matching, and workload balancing.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/chores/history">
              <Button variant="outline" size="sm">
                Rotation Log ↗
              </Button>
            </Link>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              + New Chore
            </Button>
          </div>
        </div>

        {/* Workload Fair Balance Strip */}
        {workloads.length > 0 && (
          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-medium text-[#71716E] dark:text-[#8E8E88] tracking-wider">
                Household Workload Balance (Past 30 Days)
              </span>
              <span className="text-xs text-[#71716E] dark:text-[#8E8E88]">
                Fair distribution based on completion time
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              {workloads.map((wl) => (
                <div key={wl.user?._id || wl.userId} className="p-3 bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[10px] font-semibold flex items-center justify-center text-[#1A1A1A] dark:text-white">
                      {wl.user?.name ? wl.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-[#1A1A1A] dark:text-white block">{wl.user?.name}</span>
                      <span className="text-[10px] text-[#71716E] dark:text-[#8E8E88]">{wl.completedChores || 0} chores done</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#1A1A1A] dark:text-white">
                    {wl.totalMinutes || 0}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chores Section */}
        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          {/* Controls: Tabs, Filters, Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-xs'
                    : 'text-[#71716E] dark:text-[#8E8E88] hover:bg-[#FAF9F5] dark:hover:bg-[#181816]'
                }`}
              >
                All Chores ({choresList.length})
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  activeTab === 'my'
                    ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-xs'
                    : 'text-[#71716E] dark:text-[#8E8E88] hover:bg-[#FAF9F5] dark:hover:bg-[#181816]'
                }`}
              >
                My Chores ({choresList.filter(c => c.assignedTo?._id === user?._id || c.assignedTo === user?._id).length})
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search chores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48 px-3 py-1.5 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-full text-[#1A1A1A] dark:text-white placeholder-[#71716E] focus:outline-none"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-full text-[#1A1A1A] dark:text-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-[#141413]">{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chores Cards Grid */}
          {filteredChores.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#E8E7E1] dark:border-[#2A2A28] rounded-2xl bg-[#FAF9F5] dark:bg-[#181816]">
              <div className="text-3xl mb-2 opacity-75">🧹</div>
              <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-white">No chores found</h3>
              <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-1">
                {activeTab === 'my' ? 'You have no active chores assigned to you right now.' : 'All household chores are complete.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChores.map((chore) => {
                const isCompleted = chore.status === 'completed';
                const isAssignedToUser = chore.assignedTo?._id === user?._id || chore.assignedTo === user?._id;

                return (
                  <div
                    key={chore._id}
                    className={`p-5 rounded-3xl border border-[#E8E7E1] dark:border-[#2A2A28] bg-[#FAF9F5] dark:bg-[#181816] flex flex-col justify-between space-y-4 hover:border-[#1A1A1A]/30 dark:hover:border-white/20 transition-all shadow-2xs ${
                      isCompleted ? 'opacity-65' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88] flex items-center gap-1.5">
                          <span>{getCategoryIcon(chore.category)}</span>
                          <span className="capitalize">{chore.category}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : chore.status === 'in_progress'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#71716E] dark:text-[#8E8E88]'
                        }`}>
                          {chore.status?.replace('_', ' ')}
                        </span>
                      </div>

                      <Link to={`/chores/${chore._id}`}>
                        <h3 className={`text-sm font-medium hover:underline text-[#1A1A1A] dark:text-white ${isCompleted ? 'line-through' : ''}`}>
                          {chore.title}
                        </h3>
                      </Link>

                      {chore.description && (
                        <p className="text-xs text-[#71716E] dark:text-[#A8A7A0] line-clamp-2">
                          {chore.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E8E7E1] dark:border-[#2A2A28] space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-[#71716E] dark:text-[#8E8E88]">
                        <span>Due {formatDateStr(new Date(chore.dueDate))}</span>
                        <span>{chore.estimatedDuration || 30} mins</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-medium text-[#1A1A1A] dark:text-white">
                          {chore.assignedTo?.name ? chore.assignedTo.name : 'Unassigned'}
                        </span>

                        <div className="flex items-center gap-2">
                          {!isCompleted && !chore.assignedTo && (
                            <Button size="sm" variant="secondary" onClick={() => handleClaim(chore._id)}>
                              Claim
                            </Button>
                          )}
                          {!isCompleted && (isAssignedToUser || !chore.assignedTo) && (
                            <Button size="sm" onClick={() => handleComplete(chore._id)}>
                              Complete ✓
                            </Button>
                          )}
                          <Link
                            to={`/chores/${chore._id}`}
                            className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white px-1"
                          >
                            &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Chore Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Household Chore">
        {createError && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900/50">
            {createError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <Input
            label="Chore Title"
            value={formData.title}
            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Wipe kitchen counters, Take out recycling"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-[#141413]">{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Estimated Time (mins)</label>
              <input
                type="number"
                min="5"
                step="5"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData(p => ({ ...p, estimatedDuration: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Assignment Method</label>
              <select
                value={formData.assignmentType}
                onChange={(e) => setFormData(p => ({ ...p, assignmentType: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
              >
                <option value="smart" className="bg-white dark:bg-[#141413]">Smart Suggestion (Availability & Workload)</option>
                <option value="manual" className="bg-white dark:bg-[#141413]">Assign to Specific Roommate</option>
                <option value="unassigned" className="bg-white dark:bg-[#141413]">Leave Open for Claiming</option>
              </select>
            </div>
          </div>

          {formData.assignmentType === 'manual' && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Assign To</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData(p => ({ ...p, assignedTo: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
              >
                <option value="" className="bg-white dark:bg-[#141413]">Select Roommate</option>
                {household?.members?.map((m) => (
                  <option key={m._id} value={m._id} className="bg-white dark:bg-[#141413]">{m.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={creating}>
              Create Chore &rarr;
            </Button>
          </div>
        </form>
      </Modal>

      {/* Smart Recommendation Modal */}
      <Modal isOpen={smartRecModalOpen} onClose={() => setSmartRecModalOpen(false)} title="Smart Chore Suggestion">
        {loadingRec ? (
          <div className="py-10 text-center text-xs text-[#71716E] dark:text-[#8E8E88]">
            Analyzing flatmate availability and workload balances...
          </div>
        ) : smartRecData?.recommendedUser ? (
          <div className="space-y-4 text-xs">
            <p className="text-xs text-[#71716E] dark:text-[#8E8E88]">
              Based on who is free and who did the least chores this cycle, RoomSync suggests:
            </p>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-[#1A1A1A] dark:text-white block">
                  {smartRecData.recommendedUser.name}
                </span>
                <span className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5 block">
                  {smartRecData.reason || 'Free today & lowest chore balance'}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                Best Fit
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setSmartRecModalOpen(false)}>
                Skip
              </Button>
              <Button onClick={handleApplySmartAssignment} isLoading={assigningSmart}>
                Assign to {smartRecData.recommendedUser.name} &rarr;
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#71716E] dark:text-[#8E8E88]">
            No specific recommendation found. The chore remains open.
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
