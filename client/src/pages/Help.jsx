import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';
import { getMyHousehold } from '../services/householdService';
import {
  getHelpRequests,
  createHelpRequest,
  acceptHelpRequest,
  startHelpRequest,
  completeHelpRequest,
  cancelHelpRequest
} from '../services/helpService';

const HELP_TYPES = [
  { id: 'all', name: 'All Types', icon: '🤝' },
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

export default function Help() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [household, setHousehold] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'my_requests' | 'providing' | 'history'
  const [selectedType, setSelectedType] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'errand',
    date: formatDateStr(new Date()),
    startTime: '10:00',
    endTime: '11:00',
    urgency: 'medium',
    location: '',
    fromLocation: '',
    toLocation: ''
  });

  // Action Loading
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchHelpData = async () => {
    try {
      setLoading(true);
      const [hhRes, reqRes] = await Promise.all([
        getMyHousehold(),
        getHelpRequests()
      ]);
      setHousehold(hhRes.data.data.household);
      setRequests(reqRes.data.data.requests || []);
    } catch (err) {
      console.error('Failed to load help data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!formData.title.trim()) {
      setCreateError('Title is required');
      return;
    }
    if (!formData.date) {
      setCreateError('Date is required');
      return;
    }

    try {
      setCreating(true);
      const res = await createHelpRequest(formData);
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        type: 'errand',
        date: formatDateStr(new Date()),
        startTime: '10:00',
        endTime: '11:00',
        urgency: 'medium',
        location: '',
        fromLocation: '',
        toLocation: ''
      });
      fetchHelpData();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create help request');
    } finally {
      setCreating(false);
    }
  };

  const handleAccept = async (id, e) => {
    e.stopPropagation();
    try {
      setActionLoadingId(id);
      await acceptHelpRequest(id);
      fetchHelpData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStart = async (id, e) => {
    e.stopPropagation();
    try {
      setActionLoadingId(id);
      await startHelpRequest(id);
      fetchHelpData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (id, e) => {
    e.stopPropagation();
    try {
      setActionLoadingId(id);
      await completeHelpRequest(id);
      fetchHelpData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      setActionLoadingId(id);
      await cancelHelpRequest(id, 'Cancelled by user');
      fetchHelpData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered requests based on active tab and search/type/urgency
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Tab filter
      const isRequester = req.requester?._id === user?._id || req.requester === user?._id;
      const isHelper = req.acceptedBy?._id === user?._id || req.acceptedBy === user?._id;

      if (activeTab === 'active') {
        if (req.status === 'completed' || req.status === 'cancelled') return false;
      } else if (activeTab === 'my_requests') {
        if (!isRequester) return false;
      } else if (activeTab === 'providing') {
        if (!isHelper) return false;
      } else if (activeTab === 'history') {
        if (req.status !== 'completed' && req.status !== 'cancelled') return false;
      }

      // Type filter
      if (selectedType !== 'all' && req.type !== selectedType) return false;

      // Urgency filter
      if (selectedUrgency !== 'all' && req.urgency !== selectedUrgency) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = req.title.toLowerCase().includes(q);
        const matchDesc = (req.description || '').toLowerCase().includes(q);
        const matchRequester = (req.requester?.name || '').toLowerCase().includes(q);
        const matchLocation = (req.location || req.fromLocation || req.toLocation || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchRequester && !matchLocation) return false;
      }

      return true;
    });
  }, [requests, activeTab, selectedType, selectedUrgency, searchQuery, user]);

  const stats = useMemo(() => {
    const open = requests.filter(r => r.status === 'open').length;
    const inProg = requests.filter(r => r.status === 'accepted' || r.status === 'in_progress').length;
    const myReq = requests.filter(r => (r.requester?._id === user?._id || r.requester === user?._id) && (r.status === 'open' || r.status === 'accepted' || r.status === 'in_progress')).length;
    const iHelp = requests.filter(r => (r.acceptedBy?._id === user?._id || r.acceptedBy === user?._id) && (r.status === 'accepted' || r.status === 'in_progress')).length;
    return { open, inProg, myReq, iHelp };
  }, [requests, user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (!household) {
    return (
      <AppLayout>
        <Card className="text-center py-12">
          <div className="text-4xl mb-3">🏠</div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">No Household Found</h2>
          <p className="text-stone-600 mb-6">You need to join or create a household to request and offer help.</p>
          <Link to="/household">
            <Button variant="primary">Go to Household</Button>
          </Link>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>🤝</span> Roommate Assistance & Help
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Request a quick favor, ask for a ride or heavy lifting, and help out your roommates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 shadow-xs"
            >
              <span>+</span> Request Help
            </Button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
              🙋
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-900">{stats.open}</div>
              <div className="text-xs font-medium text-stone-500">Open Requests</div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
              ⏳
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-900">{stats.inProg}</div>
              <div className="text-xs font-medium text-stone-500">In Progress / Accepted</div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-xl font-bold">
              📋
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-900">{stats.myReq}</div>
              <div className="text-xs font-medium text-stone-500">My Active Requests</div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
              💪
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-900">{stats.iHelp}</div>
              <div className="text-xs font-medium text-stone-500">Help I'm Providing</div>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <Card className="p-6">
          {/* Tabs */}
          <div className="flex border-b border-stone-200 pb-3 mb-5 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'active'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Active Requests ({requests.filter(r => r.status === 'open' || r.status === 'accepted' || r.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setActiveTab('my_requests')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'my_requests'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              My Requests ({requests.filter(r => r.requester?._id === user?._id || r.requester === user?._id).length})
            </button>
            <button
              onClick={() => setActiveTab('providing')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'providing'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Help I'm Providing ({requests.filter(r => r.acceptedBy?._id === user?._id || r.acceptedBy === user?._id).length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Completed / Cancelled History
            </button>
          </div>

          {/* Filters and Search */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div>
              <input
                type="text"
                placeholder="Search help requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-stone-700"
              >
                {HELP_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-stone-700"
              >
                <option value="all">⚡ All Urgency Levels</option>
                <option value="low">🟢 Low Urgency</option>
                <option value="medium">🟡 Medium Urgency</option>
                <option value="high">🟠 High Urgency</option>
                <option value="urgent">🔴 Urgent (Immediate)</option>
              </select>
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-base font-semibold text-stone-800">No help requests found</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {activeTab === 'active'
                  ? 'All roommate favors are fulfilled or there are no open requests currently.'
                  : 'No requests match your current filters.'}
              </p>
              {activeTab === 'active' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4"
                >
                  Create a Request
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map(req => {
                const isRequester = req.requester?._id === user?._id || req.requester === user?._id;
                const isHelper = req.acceptedBy?._id === user?._id || req.acceptedBy === user?._id;

                let urgencyColor = 'bg-stone-100 text-stone-700 border-stone-200';
                if (req.urgency === 'urgent') urgencyColor = 'bg-rose-50 text-rose-700 border-rose-200';
                else if (req.urgency === 'high') urgencyColor = 'bg-amber-50 text-amber-700 border-amber-200';
                else if (req.urgency === 'medium') urgencyColor = 'bg-blue-50 text-blue-700 border-blue-200';
                else if (req.urgency === 'low') urgencyColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                let statusText = 'Open';
                if (req.status === 'accepted') {
                  statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
                  statusText = 'Accepted';
                } else if (req.status === 'in_progress') {
                  statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
                  statusText = 'In Progress';
                } else if (req.status === 'completed') {
                  statusColor = 'bg-teal-50 text-teal-700 border-teal-200';
                  statusText = 'Completed';
                } else if (req.status === 'cancelled') {
                  statusColor = 'bg-stone-100 text-stone-500 border-stone-200';
                  statusText = 'Cancelled';
                }

                return (
                  <div
                    key={req._id}
                    onClick={() => navigate(`/help/${req._id}`)}
                    className="p-4 bg-white border border-stone-200 rounded-xl hover:border-teal-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          <span>{getTypeIcon(req.type)}</span>
                          <span className="capitalize">{req.type}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${urgencyColor} capitalize`}>
                            {req.urgency}
                          </span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                            {statusText}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-base font-bold text-stone-900 line-clamp-1 mb-1">
                        {req.title}
                      </h4>
                      {req.description && (
                        <p className="text-xs text-stone-600 line-clamp-2 mb-3">
                          {req.description}
                        </p>
                      )}

                      {/* Time & Location metadata */}
                      <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50/70 p-2.5 rounded-lg mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-stone-400">📅</span>
                          <span className="font-medium text-stone-700">
                            {new Date(req.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          {req.startTime && (
                            <span className="text-stone-500">
                              • {formatTime12h(req.startTime)} {req.endTime ? `- ${formatTime12h(req.endTime)}` : ''}
                            </span>
                          )}
                        </div>

                        {(req.fromLocation || req.toLocation) ? (
                          <div className="flex items-center gap-2">
                            <span className="text-stone-400">📍</span>
                            <span className="truncate">
                              {req.fromLocation ? `${req.fromLocation} ➔ ` : ''}{req.toLocation}
                            </span>
                          </div>
                        ) : req.location ? (
                          <div className="flex items-center gap-2">
                            <span className="text-stone-400">📍</span>
                            <span className="truncate">{req.location}</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Requester & Helper info */}
                      <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-400">By:</span>
                          <span className="font-medium text-stone-800">
                            {isRequester ? 'You' : (req.requester?.name || 'Roommate')}
                          </span>
                        </div>

                        {req.acceptedBy && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-400">Helper:</span>
                            <span className="font-medium text-teal-700">
                              {isHelper ? 'You' : (req.acceptedBy?.name || 'Roommate')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
                      <Link
                        to={`/help/${req._id}`}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                      >
                        View Details →
                      </Link>

                      <div className="flex items-center gap-2">
                        {req.status === 'open' && !isRequester && (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={actionLoadingId === req._id}
                            onClick={(e) => handleAccept(req._id, e)}
                          >
                            🤝 I Can Help
                          </Button>
                        )}

                        {req.status === 'accepted' && isHelper && (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={actionLoadingId === req._id}
                            onClick={(e) => handleStart(req._id, e)}
                          >
                            🚀 Start
                          </Button>
                        )}

                        {req.status === 'in_progress' && isHelper && (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={actionLoadingId === req._id}
                            onClick={(e) => handleComplete(req._id, e)}
                          >
                            ✅ Mark Done
                          </Button>
                        )}

                        {req.status === 'open' && isRequester && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-stone-500 hover:text-rose-600"
                            loading={actionLoadingId === req._id}
                            onClick={(e) => handleCancel(req._id, e)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Create Help Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request Assistance from Roommates"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              {createError}
            </div>
          )}

          <Input
            label="What do you need help with? *"
            name="title"
            placeholder="e.g. Lift to train station, Heavy couch move..."
            value={formData.title}
            onChange={handleInputChange}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Category *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="lift">🚗 Ride / Lift</option>
                <option value="pickup">📦 Item Pickup</option>
                <option value="moving">🛋️ Moving Furniture</option>
                <option value="delivery">🛍️ Package Delivery</option>
                <option value="errand">🏃 Quick Errand</option>
                <option value="other">💡 Other Assistance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Urgency Level *
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="low">🟢 Low (Whenever free)</option>
                <option value="medium">🟡 Medium (Today/Tomorrow)</option>
                <option value="high">🟠 High (Time-sensitive)</option>
                <option value="urgent">🔴 Urgent (Immediate)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Conditional location fields based on type */}
          {(formData.type === 'lift' || formData.type === 'pickup' || formData.type === 'moving') ? (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="From Location"
                name="fromLocation"
                placeholder="e.g. Apartment / Target"
                value={formData.fromLocation}
                onChange={handleInputChange}
              />
              <Input
                label="To Destination"
                name="toLocation"
                placeholder="e.g. Airport / Home"
                value={formData.toLocation}
                onChange={handleInputChange}
              />
            </div>
          ) : (
            <Input
              label="Location / Room (Optional)"
              name="location"
              placeholder="e.g. Living Room, Garage, Local Grocery..."
              value={formData.location}
              onChange={handleInputChange}
            />
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Details & Notes (Optional)
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Provide any details, weight, package codes, or context to help your roommate..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={creating}
            >
              Post Help Request
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
