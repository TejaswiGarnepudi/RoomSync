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
      await createHelpRequest(formData);
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

      if (selectedType !== 'all' && req.type !== selectedType) return false;
      if (selectedUrgency !== 'all' && req.urgency !== selectedUrgency) return false;

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
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (!household) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-medium text-[#1A1A1A] dark:text-white mb-2">No Household Found</h2>
          <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mb-6">Create or join a household first.</p>
          <Link to="/household">
            <Button>Go to Household &rarr;</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="pb-6 border-b border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
              Roommate Favors & Help
            </h1>
            <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88] mt-1 tracking-[-0.02em]">
              Request a favor, ask for a quick ride or heavy lifting, and help out your flatmates.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            + Ask for Help
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-5 shadow-2xs">
            <div className="text-2xl font-medium text-[#1A1A1A] dark:text-white tracking-tight">{stats.open}</div>
            <div className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5">Open Requests</div>
          </div>
          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-5 shadow-2xs">
            <div className="text-2xl font-medium text-[#1A1A1A] dark:text-white tracking-tight">{stats.inProg}</div>
            <div className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5">In Progress</div>
          </div>
          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-5 shadow-2xs">
            <div className="text-2xl font-medium text-[#1A1A1A] dark:text-white tracking-tight">{stats.myReq}</div>
            <div className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5">My Active Requests</div>
          </div>
          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-5 shadow-2xs">
            <div className="text-2xl font-medium text-[#1A1A1A] dark:text-white tracking-tight">{stats.iHelp}</div>
            <div className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5">Help I'm Providing</div>
          </div>
        </div>

        {/* Main Section */}
        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-[#E8E7E1] dark:border-[#2A2A28] pb-4 gap-2 overflow-x-auto">
            {[
              { id: 'active', label: `Active (${requests.filter(r => r.status === 'open' || r.status === 'accepted' || r.status === 'in_progress').length})` },
              { id: 'my_requests', label: `My Requests (${requests.filter(r => r.requester?._id === user?._id || r.requester === user?._id).length})` },
              { id: 'providing', label: `Providing (${requests.filter(r => r.acceptedBy?._id === user?._id || r.acceptedBy === user?._id).length})` },
              { id: 'history', label: 'Completed History' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-xs'
                    : 'text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#FAF9F5] dark:hover:bg-[#181816]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Search help requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 text-xs text-[#1A1A1A] dark:text-white placeholder-[#71716E] dark:placeholder-[#888880] bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors"
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 text-xs text-[#1A1A1A] dark:text-white bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors cursor-pointer"
            >
              {HELP_TYPES.map(t => (
                <option key={t.id} value={t.id} className="bg-white dark:bg-[#141413]">{t.icon} {t.name}</option>
              ))}
            </select>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-4 py-2.5 text-xs text-[#1A1A1A] dark:text-white bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#141413]">⚡ All Urgency Levels</option>
              <option value="low" className="bg-white dark:bg-[#141413]">🟢 Low Urgency</option>
              <option value="medium" className="bg-white dark:bg-[#141413]">🟡 Medium Urgency</option>
              <option value="high" className="bg-white dark:bg-[#141413]">🟠 High Urgency</option>
              <option value="urgent" className="bg-white dark:bg-[#141413]">🔴 Urgent</option>
            </select>
          </div>

          {/* Requests Grid */}
          {filteredRequests.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#E8E7E1] dark:border-[#2A2A28] rounded-2xl bg-[#FAF9F5] dark:bg-[#181816]">
              <div className="text-3xl mb-2 opacity-75">🤝</div>
              <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-white">No help requests found</h3>
              <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-1 max-w-sm mx-auto">
                {activeTab === 'active'
                  ? 'All flatmate favors are fulfilled or there are no open requests currently.'
                  : 'No requests match your current filters.'}
              </p>
              {activeTab === 'active' && (
                <Button
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4"
                >
                  Create a Request &rarr;
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map(req => {
                const isRequester = req.requester?._id === user?._id || req.requester === user?._id;
                const isHelper = req.acceptedBy?._id === user?._id || req.acceptedBy === user?._id;

                return (
                  <div
                    key={req._id}
                    onClick={() => navigate(`/help/${req._id}`)}
                    className="p-5 rounded-3xl border border-[#E8E7E1] dark:border-[#2A2A28] bg-[#FAF9F5] dark:bg-[#181816] hover:border-[#1A1A1A]/30 dark:hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-2xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{getTypeIcon(req.type)}</span>
                          <span className="text-[10px] font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88]">
                            {req.type}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                          req.urgency === 'urgent'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : req.urgency === 'high'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#71716E] dark:text-[#8E8E88]'
                        }`}>
                          {req.urgency}
                        </span>
                      </div>

                      <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
                        {req.title}
                      </h3>

                      {req.description && (
                        <p className="text-xs text-[#71716E] dark:text-[#A8A7A0] line-clamp-2 leading-relaxed">
                          {req.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E8E7E1] dark:border-[#2A2A28] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="size-5 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[10px] font-semibold flex items-center justify-center text-[#1A1A1A] dark:text-white">
                          {req.requester?.name ? req.requester.name.charAt(0).toUpperCase() : 'R'}
                        </div>
                        <span className="text-[11px] text-[#71716E] dark:text-[#8E8E88]">
                          {isRequester ? 'You' : req.requester?.name || 'Roommate'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {req.status === 'open' && !isRequester && (
                          <Button
                            size="sm"
                            onClick={(e) => handleAccept(req._id, e)}
                            isLoading={actionLoadingId === req._id}
                          >
                            Accept Favor
                          </Button>
                        )}
                        {req.status === 'accepted' && isHelper && (
                          <Button
                            size="sm"
                            onClick={(e) => handleStart(req._id, e)}
                            isLoading={actionLoadingId === req._id}
                          >
                            Start
                          </Button>
                        )}
                        {req.status === 'in_progress' && (isHelper || isRequester) && (
                          <Button
                            size="sm"
                            onClick={(e) => handleComplete(req._id, e)}
                            isLoading={actionLoadingId === req._id}
                          >
                            Mark Complete
                          </Button>
                        )}
                        <span className="text-xs font-medium text-[#1A1A1A] dark:text-white group-hover:translate-x-1 transition-transform">
                          &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ask Roommates for Help">
        {createError && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900/50">
            {createError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <Input
            label="What do you need help with?"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g. Can someone help carry groceries from the lobby?"
            required
          />

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">
              Type of favor
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 text-xs text-[#1A1A1A] dark:text-white bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white"
            >
              {HELP_TYPES.filter(t => t.id !== 'all').map(t => (
                <option key={t.id} value={t.id} className="bg-white dark:bg-[#141413]">{t.icon} {t.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Urgency</label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
              >
                <option value="low" className="bg-white dark:bg-[#141413]">Low</option>
                <option value="medium" className="bg-white dark:bg-[#141413]">Medium</option>
                <option value="high" className="bg-white dark:bg-[#141413]">High</option>
                <option value="urgent" className="bg-white dark:bg-[#141413]">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Any details or timings..."
              className="w-full px-4 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white placeholder-[#71716E] dark:placeholder-[#888880] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={creating}>
              Post Favor Request &rarr;
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
