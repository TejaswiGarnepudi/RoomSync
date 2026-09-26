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

      // If chore is not completed and unassigned, automatically check smart recommendation
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
      setSelectedAssignee('');
      fetchChoreData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign chore');
    } finally {
      setAssigningManual(false);
    }
  };

  const handleConfirmSmart = async () => {
    if (!recommendation || !recommendation.recommendedUser) return;
    setAssigningSmart(true);
    try {
      await assignSmartRecommendation(id, {
        userId: recommendation.recommendedUser._id,
        startTime: recommendation.startTime,
        endTime: recommendation.endTime
      });
      fetchChoreData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm smart assignment');
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
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (error || !chore) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto mt-12">
          <Card title="Error">
            <p className="text-stone-600 mb-4">{error || 'Chore not found'}</p>
            <Link to="/chores">
              <Button>Back to Chores</Button>
            </Link>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const isAssignedToMe = chore.assignedTo?._id === user._id || chore.assignedTo === user._id;
  const isCreator = chore.createdBy?._id === user._id || chore.createdBy === user._id;
  const isOwner = household?.owner?._id === user._id || household?.owner === user._id;
  const isCompleted = chore.status === 'completed';

  return (
    <AppLayout>
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/chores" className="inline-flex items-center text-sm font-medium text-stone-600 hover:text-teal-600 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Chores
        </Link>

        {(isCreator || isOwner) && (
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete Chore
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (Col 1 & 2) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 mb-1 block">
                  {chore.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
                  {chore.title}
                </h1>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                  chore.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : chore.status === 'overdue'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {chore.status}
              </span>
            </div>

            {chore.description && (
              <p className="text-stone-600 text-sm mb-6 bg-stone-50 p-4 rounded-xl border border-stone-100">
                {chore.description}
              </p>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-100">
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                <span className="text-3xs font-semibold text-stone-500 uppercase block">Due Date</span>
                <span className="text-sm font-bold text-stone-800">{chore.dueDate}</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                <span className="text-3xs font-semibold text-stone-500 uppercase block">Due Time</span>
                <span className="text-sm font-bold text-stone-800">{formatTime12h(chore.dueTime)}</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                <span className="text-3xs font-semibold text-stone-500 uppercase block">Duration</span>
                <span className="text-sm font-bold text-stone-800">{chore.estimatedDuration} mins</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                <span className="text-3xs font-semibold text-stone-500 uppercase block">Priority</span>
                <span className="text-sm font-bold capitalize text-stone-800">{chore.priority}</span>
              </div>
            </div>

            {/* Recurrence Banner if recurring */}
            {chore.recurrence && chore.recurrence.type !== 'none' && (
              <div className="mt-4 p-3 bg-teal-50/60 rounded-lg border border-teal-100 flex items-center gap-2 text-xs text-teal-900 font-medium">
                <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Recurring task: Repeating {chore.recurrence.type} (Interval: {chore.recurrence.interval || 1})</span>
              </div>
            )}
          </Card>

          {/* Smart Recommendation Card */}
          {!isCompleted && !chore.assignedTo && (
            <Card title="✨ Smart Assignment Engine">
              {loadingRec ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-2">
                  <LoadingSpinner />
                  <p className="text-xs text-stone-500">Calculating best roommate fit...</p>
                </div>
              ) : recommendation && recommendation.recommendedUser ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-teal-50 p-4 rounded-xl border border-teal-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center">
                        {recommendation.recommendedUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-3xs uppercase font-bold text-teal-700">Top Candidate</span>
                        <h3 className="text-base font-bold text-stone-900">{recommendation.recommendedUser.name}</h3>
                        <p className="text-xs text-teal-800">
                          Recommended Time: {formatTime12h(recommendation.startTime)} – {formatTime12h(recommendation.endTime)}
                        </p>
                      </div>
                    </div>

                    <Button size="sm" onClick={handleConfirmSmart} isLoading={assigningSmart}>
                      Assign to {recommendation.recommendedUser.name}
                    </Button>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-2">
                      Recommendation Factors:
                    </span>
                    <ul className="space-y-1">
                      {recommendation.reasons?.map((r, i) => (
                        <li key={i} className="text-xs text-stone-700 flex items-center gap-2">
                          <span className="text-teal-600 font-bold">✓</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-500">No automatic availability match found for this deadline.</p>
              )}
            </Card>
          )}

          {/* History / Audit Log */}
          <Card title="Activity Timeline">
            {history.length === 0 ? (
              <p className="text-stone-500 text-sm">No activity recorded yet.</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {history.map((h) => (
                  <li key={h._id} className="py-3 flex items-start justify-between text-xs">
                    <div>
                      <span className="font-semibold text-stone-800">
                        {h.userId?.name || 'User'}
                      </span>{' '}
                      <span className="text-stone-600 font-medium">
                        {h.action === 'created' && 'created this chore'}
                        {h.action === 'claimed' && 'claimed this chore'}
                        {h.action === 'assigned' && `assigned to ${h.newAssignee?.name || 'a member'}`}
                        {h.action === 'reassigned' && `reassigned from ${h.previousAssignee?.name || 'previous'} to ${h.newAssignee?.name || 'new'}`}
                        {h.action === 'completed' && 'marked this chore as completed'}
                        {h.action === 'marked_overdue' && 'marked this chore as overdue'}
                        {h.action === 'updated' && 'updated chore details'}
                      </span>
                      {h.notes && (
                        <p className="text-3xs text-stone-400 mt-0.5">{h.notes}</p>
                      )}
                    </div>
                    <span className="text-stone-400 whitespace-nowrap ml-4">
                      {new Date(h.timestamp).toLocaleDateString()} {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Sidebar Actions (Col 3) */}
        <div className="space-y-6">
          {/* Assignment Status Card */}
          <Card title="Assignment">
            <div className="space-y-4">
              <div>
                <span className="text-3xs font-semibold uppercase tracking-wider text-stone-500 block mb-1">
                  Current Assignee
                </span>
                {chore.assignedTo ? (
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm">
                      {chore.assignedTo.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 text-sm">{chore.assignedTo.name}</p>
                      <p className="text-3xs text-stone-500">{chore.assignedTo.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-medium">
                    Unassigned — Open for any roommate to claim.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                {!isCompleted && !chore.assignedTo && (
                  <Button fullWidth onClick={handleClaim}>
                    Claim this Chore
                  </Button>
                )}

                {!isCompleted && chore.assignedTo && (isAssignedToMe || isOwner) && (
                  <Button fullWidth onClick={handleComplete}>
                    ✓ Mark as Completed
                  </Button>
                )}

                {isCompleted && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-emerald-800 text-xs font-semibold">
                    ✓ Completed on {new Date(chore.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Manual Reassignment Card */}
          {!isCompleted && household && (
            <Card title="Manual Assignment">
              <div className="space-y-3">
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">-- Choose Roommate --</option>
                  {household.members.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>

                <Button
                  fullWidth
                  variant="secondary"
                  size="sm"
                  onClick={handleManualAssign}
                  isLoading={assigningManual}
                  disabled={!selectedAssignee}
                >
                  Assign to Roommate
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
