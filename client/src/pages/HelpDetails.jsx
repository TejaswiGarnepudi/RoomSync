import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';
import {
  getHelpRequestById,
  getHelpRecommendations,
  acceptHelpRequest,
  startHelpRequest,
  completeHelpRequest,
  cancelHelpRequest,
  deleteHelpRequest
} from '../services/helpService';

const HELP_TYPES = [
  { id: 'lift', name: 'Ride / Lift', icon: '🚗' },
  { id: 'pickup', name: 'Pickup', icon: '📦' },
  { id: 'moving', name: 'Moving Furniture', icon: '🛋️' },
  { id: 'delivery', name: 'Package / Delivery', icon: '🛍️' },
  { id: 'errand', name: 'Errand', icon: '🏃' },
  { id: 'other', name: 'Other Assistance', icon: '💡' }
];

const getTypeIcon = (type) => {
  const match = HELP_TYPES.find(t => t.id === type);
  return match ? match.icon : '🤝';
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

export default function HelpDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getHelpRequestById(id);
      const reqData = res.data.data.request;
      setRequest(reqData);

      if (reqData.status === 'open') {
        try {
          const recRes = await getHelpRecommendations(id);
          setRecommendations(recRes.data.data.recommendations || []);
        } catch (rErr) {
          console.error('Failed to load helper recommendations', rErr);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      await acceptHelpRequest(id);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      setActionLoading(true);
      await startHelpRequest(id);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setActionLoading(true);
      await completeHelpRequest(id);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      await cancelHelpRequest(id, cancelReason);
      setIsCancelModalOpen(false);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this help request?')) return;
    try {
      setActionLoading(true);
      await deleteHelpRequest(id);
      navigate('/help');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete request');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (error || !request) {
    return (
      <AppLayout>
        <Card className="text-center py-12">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Request Not Found</h2>
          <p className="text-stone-600 mb-6">{error || 'The requested favor does not exist.'}</p>
          <Link to="/help">
            <Button variant="primary">Back to Help</Button>
          </Link>
        </Card>
      </AppLayout>
    );
  }

  const isRequester = request.requester?._id === user?._id || request.requester === user?._id;
  const isHelper = request.acceptedBy?._id === user?._id || request.acceptedBy === user?._id;

  // Urgency styling
  let urgencyColor = 'bg-stone-100 text-stone-700 border-stone-200';
  if (request.urgency === 'urgent') urgencyColor = 'bg-rose-50 text-rose-700 border-rose-200';
  else if (request.urgency === 'high') urgencyColor = 'bg-amber-50 text-amber-700 border-amber-200';
  else if (request.urgency === 'medium') urgencyColor = 'bg-blue-50 text-blue-700 border-blue-200';
  else if (request.urgency === 'low') urgencyColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  // Status progression steps
  const steps = ['open', 'accepted', 'in_progress', 'completed'];
  const currentStepIndex = steps.indexOf(request.status);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/help"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            <span>←</span> Back to Help Requests
          </Link>

          {isRequester && request.status === 'open' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:bg-rose-50"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              Delete Request
            </Button>
          )}
        </div>

        {/* Main Details Card */}
        <Card className="p-6 md:p-8">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2.5 bg-stone-100 rounded-xl">
                {getTypeIcon(request.type)}
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                  {request.type} request
                </span>
                <h1 className="text-2xl font-bold text-stone-900">
                  {request.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${urgencyColor} capitalize`}>
                Urgency: {request.urgency}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-stone-100 text-stone-800 capitalize">
                Status: {request.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Lifecycle Step Tracker (If not cancelled) */}
          {request.status !== 'cancelled' ? (
            <div className="py-6 border-b border-stone-100">
              <div className="flex items-center justify-between relative max-w-xl mx-auto">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-stone-200 w-full z-0" />
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-600 z-0 transition-all duration-300"
                  style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((st, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div key={st} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          isDone
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-white border-2 border-stone-300 text-stone-400'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] font-semibold mt-1.5 capitalize ${
                          isCurrent ? 'text-teal-700 font-bold' : isDone ? 'text-stone-700' : 'text-stone-400'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-4 my-4 bg-rose-50 border border-rose-200 rounded-lg p-4 text-xs text-rose-700">
              <strong>This request was cancelled.</strong> Reason: {request.cancelReason || 'No reason provided.'}
            </div>
          )}

          {/* Description & Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                  Details & Instructions
                </h3>
                <p className="text-sm text-stone-700 whitespace-pre-line leading-relaxed bg-stone-50/70 p-4 rounded-xl border border-stone-100">
                  {request.description || 'No additional details provided.'}
                </p>
              </div>

              {/* Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {request.fromLocation && (
                  <div className="p-3 bg-white border border-stone-200 rounded-lg">
                    <span className="text-xs font-semibold text-stone-400 block">From Location</span>
                    <span className="text-sm font-medium text-stone-800">📍 {request.fromLocation}</span>
                  </div>
                )}
                {request.toLocation && (
                  <div className="p-3 bg-white border border-stone-200 rounded-lg">
                    <span className="text-xs font-semibold text-stone-400 block">Destination</span>
                    <span className="text-sm font-medium text-stone-800">🎯 {request.toLocation}</span>
                  </div>
                )}
                {request.location && !request.fromLocation && !request.toLocation && (
                  <div className="p-3 bg-white border border-stone-200 rounded-lg sm:col-span-2">
                    <span className="text-xs font-semibold text-stone-400 block">Location</span>
                    <span className="text-sm font-medium text-stone-800">📍 {request.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* People & Time Sidebar */}
            <div className="space-y-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                  Requested By
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs">
                    {request.requester?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-900">
                      {isRequester ? `${request.requester?.name} (You)` : request.requester?.name}
                    </div>
                    <div className="text-[11px] text-stone-500">{request.requester?.email}</div>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                  Helper Assigned
                </span>
                {request.acceptedBy ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                      {request.acceptedBy?.name?.charAt(0).toUpperCase() || 'H'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-900">
                        {isHelper ? `${request.acceptedBy?.name} (You)` : request.acceptedBy?.name}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-medium">Assigned Roommate</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-stone-500 italic">No roommate has accepted yet.</div>
                )}
              </div>

              <div className="pt-2 border-t border-stone-200 text-xs space-y-1.5 text-stone-600">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-semibold text-stone-800">
                    {new Date(request.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {request.startTime && (
                  <div className="flex justify-between">
                    <span>Time Window:</span>
                    <span className="font-semibold text-stone-800">
                      {formatTime12h(request.startTime)} - {formatTime12h(request.endTime)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {request.status === 'open' && !isRequester && (
                <Button
                  variant="primary"
                  loading={actionLoading}
                  onClick={handleAccept}
                  className="shadow-xs"
                >
                  🤝 I Can Help (Accept Request)
                </Button>
              )}

              {request.status === 'accepted' && isHelper && (
                <Button
                  variant="primary"
                  loading={actionLoading}
                  onClick={handleStart}
                  className="shadow-xs"
                >
                  🚀 Start Doing Favor
                </Button>
              )}

              {request.status === 'in_progress' && isHelper && (
                <Button
                  variant="primary"
                  loading={actionLoading}
                  onClick={handleComplete}
                  className="shadow-xs"
                >
                  ✅ Mark Done & Complete
                </Button>
              )}

              {request.status === 'completed' && (
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 bg-teal-50 px-4 py-2 rounded-lg border border-teal-200">
                  <span>🎉</span> Completed Successfully
                </div>
              )}
            </div>

            {(isRequester || isHelper) && request.status !== 'completed' && request.status !== 'cancelled' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-stone-500 hover:text-rose-600"
                onClick={() => setIsCancelModalOpen(true)}
              >
                Cancel Request
              </Button>
            )}
          </div>
        </Card>

        {/* Smart Roommate Availability Recommendations (Visible for Open Requests) */}
        {request.status === 'open' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span>🤖</span> Available Roommates & Recommendation Engine
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Calculated using individual schedules, recurring availability windows, and existing chore loads.
                </p>
              </div>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-xs text-stone-500 italic py-4 text-center">
                No other household roommates found to analyze.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map(rec => {
                  let badgeColor = 'bg-stone-100 text-stone-700';
                  let badgeText = 'Unavailable';
                  if (rec.status === 'full_match') {
                    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    badgeText = '⭐ Best Match';
                  } else if (rec.status === 'partial_match') {
                    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                    badgeText = '⚡ Partial Match';
                  } else if (rec.status === 'free_schedule') {
                    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                    badgeText = '🟢 Free Schedule';
                  }

                  return (
                    <div
                      key={rec.user._id}
                      className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                            {rec.user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-stone-900">{rec.user.name}</div>
                            <div className="text-[11px] text-stone-500">{rec.user.email}</div>
                          </div>
                        </div>

                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {badgeText}
                        </span>
                      </div>

                      {/* Reasons */}
                      <ul className="text-xs text-stone-600 space-y-1 bg-white p-2.5 rounded-lg border border-stone-200/60">
                        {rec.reasons.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-teal-600 font-bold">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Help Request"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Are you sure you want to cancel this request? You can optionally provide a reason for your roommates.
          </p>
          <textarea
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Found another ride / no longer needed..."
            className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <Button
              variant="ghost"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Keep Request
            </Button>
            <Button
              variant="danger"
              loading={actionLoading}
              onClick={handleCancel}
            >
              Confirm Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
