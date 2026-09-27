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

  const handleCancel = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await cancelHelpRequest(id, cancelReason || 'Cancelled by user');
      setIsCancelModalOpen(false);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this request?')) return;
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
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (error || !request) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Link to="/help" className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white">
            &larr; Back to Help Board
          </Link>
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-2xl border border-rose-200 dark:border-rose-900/50">
            {error || 'Help request not found'}
          </div>
        </div>
      </AppLayout>
    );
  }

  const isRequester = request.requester?._id === user?._id || request.requester === user?._id;
  const isHelper = request.acceptedBy?._id === user?._id || request.acceptedBy === user?._id;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <Link to="/help" className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white transition-colors flex items-center gap-1.5">
            &larr; Back to Help Board
          </Link>
          {isRequester && (
            <div className="flex items-center gap-2">
              {request.status !== 'completed' && request.status !== 'cancelled' && (
                <Button variant="outline" size="sm" onClick={() => setIsCancelModalOpen(true)}>
                  Cancel Request
                </Button>
              )}
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Main Details Card */}
        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-7 sm:p-9 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{getTypeIcon(request.type)}</span>
                <span className="text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88]">
                  {request.type}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                  request.urgency === 'urgent'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : request.urgency === 'high'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#71716E] dark:text-[#8E8E88]'
                }`}>
                  {request.urgency} urgency
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#1A1A1A] dark:text-white">
                {request.title}
              </h1>
            </div>

            <div className="shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                request.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : request.status === 'in_progress'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  : request.status === 'accepted'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : request.status === 'cancelled'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  : 'bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-[#FAF9F5]'
              }`}>
                {request.status?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Description */}
          {request.description && (
            <div className="space-y-1">
              <h3 className="text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88]">
                Description
              </h3>
              <p className="text-sm text-[#1A1A1A] dark:text-[#FAF9F5] leading-relaxed">
                {request.description}
              </p>
            </div>
          )}

          {/* Key Meta Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28]">
              <span className="text-[10px] uppercase font-medium text-[#71716E] dark:text-[#8E8E88] block">Date</span>
              <span className="text-sm font-medium text-[#1A1A1A] dark:text-white mt-1 block">{request.date}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28]">
              <span className="text-[10px] uppercase font-medium text-[#71716E] dark:text-[#8E8E88] block">Requested By</span>
              <span className="text-sm font-medium text-[#1A1A1A] dark:text-white mt-1 block">
                {request.requester?.name || 'Flatmate'} {isRequester && '(You)'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28]">
              <span className="text-[10px] uppercase font-medium text-[#71716E] dark:text-[#8E8E88] block">Helper</span>
              <span className="text-sm font-medium text-[#1A1A1A] dark:text-white mt-1 block">
                {request.acceptedBy?.name || 'Unassigned / Open'} {isHelper && '(You)'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#E8E7E1] dark:border-[#2A2A28] flex flex-wrap gap-3">
            {request.status === 'open' && !isRequester && (
              <Button onClick={handleAccept} isLoading={actionLoading}>
                Accept this Favor &rarr;
              </Button>
            )}
            {request.status === 'accepted' && isHelper && (
              <Button onClick={handleStart} isLoading={actionLoading}>
                Start Favor
              </Button>
            )}
            {request.status === 'in_progress' && (isHelper || isRequester) && (
              <Button onClick={handleComplete} isLoading={actionLoading}>
                Mark as Completed ✓
              </Button>
            )}
          </div>
        </div>

        {/* Smart Recommendations */}
        {request.status === 'open' && recommendations.length > 0 && (
          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <h3 className="text-base font-medium tracking-tight text-[#1A1A1A] dark:text-white">
              Suggested Roommates Free Right Now
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.user?._id}
                  className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] flex items-center justify-between"
                >
                  <div>
                    <span className="text-sm font-medium text-[#1A1A1A] dark:text-white block">{rec.user?.name}</span>
                    <span className="text-xs text-[#71716E] dark:text-[#8E8E88]">{rec.reason || 'Available right now'}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {rec.matchScore ? `${rec.matchScore}% Match` : 'Free'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Favor Request">
        <form onSubmit={handleCancel} className="space-y-4 text-xs">
          <Input
            label="Reason for cancellation (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Handled it myself / no longer needed"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsCancelModalOpen(false)}>
              Keep Active
            </Button>
            <Button variant="danger" type="submit" isLoading={actionLoading}>
              Confirm Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
