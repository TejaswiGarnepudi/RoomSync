import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';
import { getMyHousehold } from '../services/householdService';
import {
  getChoreById,
  deleteChore,
  claimChore,
  assignChore,
  completeChore,
  getSmartRecommendation,
  assignSmartRecommendation
} from '../services/choreService';

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

export default function ChoreDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [household, setHousehold] = useState(null);
  const [chore, setChore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Smart recommendation state
  const [recommendation, setRecommendation] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [assigningSmart, setAssigningSmart] = useState(false);

  // Manual Assign State
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [assigningManual, setAssigningManual] = useState(false);

  const fetchChoreData = async () => {
    try {
      setLoading(true);
      const [hhRes, choreRes] = await Promise.all([
        getMyHousehold(),
        getChoreById(id)
      ]);
      setHousehold(hhRes.data.data.household);
      setChore(choreRes.data.data.chore);
      setHistory(choreRes.data.data.history || []);

      if (choreRes.data.data.chore && choreRes.data.data.chore.status !== 'completed' && !choreRes.data.data.chore.assignedTo) {
        fetchRecommendation();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load chore details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendation = async () => {
    try {
      setLoadingRec(true);
      const recRes = await getSmartRecommendation(id);
      setRecommendation(recRes.data.data);
    } catch (err) {
      console.error('Failed to get recommendation:', err);
    } finally {
      setLoadingRec(false);
    }
  };

  useEffect(() => {
    fetchChoreData();
  }, [id]);

  const handleClaim = async () => {
    try {
      await claimChore(id);
      fetchChoreData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim chore');
    }
  };

  const handleManualAssign = async () => {
    if (!selectedAssignee) return;
    setAssigningManual(true);
    try {
      await assignChore(id, selectedAssignee);
      fetchChoreData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign chore');
    } finally {
      setAssigningManual(false);
    }
  };

  const handleApplySmart = async () => {
    if (!recommendation?.recommendedUser?._id) return;
    setAssigningSmart(true);
    try {
      await assignSmartRecommendation(id, recommendation.recommendedUser._id);
      fetchChoreData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply smart suggestion');
    } finally {
      setAssigningSmart(false);
    }
  };

  const handleComplete = async () => {
    try {
      await completeChore(id);
      fetchChoreData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete chore');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this chore?')) return;
    try {
      await deleteChore(id);
      navigate('/chores');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete chore');
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

  if (error || !chore) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Link to="/chores" className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white">
            &larr; Back to Chores
          </Link>
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-2xl border border-rose-200 dark:border-rose-900/50">
            {error || 'Chore not found'}
          </div>
        </div>
      </AppLayout>
    );
  }

  const isCompleted = chore.status === 'completed';
  const isAssignedToUser = chore.assignedTo?._id === user?._id || chore.assignedTo === user?._id;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        {/* Header / Nav */}
        <div className="flex items-center justify-between">
          <Link to="/chores" className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white transition-colors flex items-center gap-1.5">
            &larr; Back to Chores Board
          </Link>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete Chore
          </Button>
        </div>

        {/* Main Details Card */}
        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-7 sm:p-9 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88]">
                  {chore.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                  isCompleted
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : chore.status === 'in_progress'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#71716E] dark:text-[#8E8E88]'
                }`}>
                  {chore.status?.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#1A1A1A] dark:text-white">
                {chore.title}
              </h1>
            </div>

            {!isCompleted && (
              <div className="flex items-center gap-2">
                {!chore.assignedTo && (
                  <Button variant="secondary" onClick={handleClaim}>
                    Claim Chore
                  </Button>
                )}
                {(isAssignedToUser || !chore.assignedTo) && (
                  <Button onClick={handleComplete}>
                    Mark Completed ✓
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {chore.description && (
            <div className="space-y-1">
              <h3 className="text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88]">Notes</h3>
              <p className="text-sm text-[#1A1A1A] dark:text-[#FAF9F5] leading-relaxed">{chore.description}</p>
            </div>
          )}

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28]">
              <span className="text-[10px] uppercase font-medium text-[#71716E] dark:text-[#8E8E88] block">Due Date</span>
              <span className="text-sm font-medium text-[#1A1A1A] dark:text-white mt-1 block">
                {chore.dueDate ? new Date(chore.dueDate).toLocaleDateString() : 'Today'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28]">
              <span className="text-[10px] uppercase font-medium text-[#71716E] dark:text-[#8E8E88] block">Estimated Time</span>
              <span className="text-sm font-medium text-[#1A1A1A] dark:text-white mt-1 block">
                {chore.estimatedDuration || 30} minutes
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28]">
              <span className="text-[10px] uppercase font-medium text-[#71716E] dark:text-[#8E8E88] block">Assigned Roommate</span>
              <span className="text-sm font-medium text-[#1A1A1A] dark:text-white mt-1 block">
                {chore.assignedTo?.name || 'Unassigned / Open'}
              </span>
            </div>
          </div>

          {/* Reassignment Controls if unassigned or open */}
          {!isCompleted && (
            <div className="pt-4 border-t border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs text-[#71716E] dark:text-[#8E8E88]">Assign to roommate:</span>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
              >
                <option value="" className="bg-white dark:bg-[#141413]">Select Roommate</option>
                {household?.members?.map((m) => (
                  <option key={m._id} value={m._id} className="bg-white dark:bg-[#141413]">{m.name}</option>
                ))}
              </select>
              <Button size="sm" variant="outline" onClick={handleManualAssign} isLoading={assigningManual}>
                Assign
              </Button>
            </div>
          )}
        </div>

        {/* Rotation History for this chore */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-7 shadow-sm space-y-3">
            <h3 className="text-base font-medium text-[#1A1A1A] dark:text-white">Chore Activity Log</h3>
            <div className="divide-y divide-[#E8E7E1]/60 dark:divide-[#2A2A28]">
              {history.map((h, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1A1A1A] dark:text-white capitalize">{h.action}</span>
                    <span className="text-[#71716E] dark:text-[#8E8E88]">by {h.user?.name || 'Roommate'}</span>
                  </div>
                  <span className="text-[11px] text-[#71716E] dark:text-[#8E8E88]">
                    {new Date(h.timestamp || h.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
