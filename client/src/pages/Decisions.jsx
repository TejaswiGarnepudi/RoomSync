import React, { useState, useEffect, useContext, useMemo } from 'react';
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
  getPolls,
  createPoll,
  votePoll,
  closePoll,
  deletePoll
} from '../services/pollService';
import { getSocket, joinHouseholdRoom, leaveHouseholdRoom } from '../services/socket';

export default function Decisions() {
  const { user } = useContext(AuthContext);

  const [household, setHousehold] = useState(null);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveConnected, setLiveConnected] = useState(false);

  // Tab State: 'active' | 'closed'
  const [activeTab, setActiveTab] = useState('active');

  // Voting Selection State: { [pollId]: [optionIds] }
  const [selectedVotes, setSelectedVotes] = useState({});
  const [votingLoadingId, setVotingLoadingId] = useState(null);

  // Create Poll Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: ['', ''],
    allowMultiple: false,
    anonymous: false,
    hasDeadline: false,
    deadlineDate: '',
    deadlineTime: '23:59'
  });

  // Action Loading
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchPollsData = async () => {
    try {
      setLoading(true);
      const [hhRes, pollsRes] = await Promise.all([
        getMyHousehold(),
        getPolls()
      ]);
      const hhData = hhRes.data.data.household;
      setHousehold(hhData);
      const pollList = pollsRes.data.data.polls || [];
      setPolls(pollList);

      // Prepopulate current user's votes in selection state
      const initialVotes = {};
      pollList.forEach(p => {
        if (p.userVoteOptionIds && p.userVoteOptionIds.length > 0) {
          initialVotes[p._id] = p.userVoteOptionIds;
        }
      });
      setSelectedVotes(initialVotes);
    } catch (err) {
      console.error('Failed to load decisions data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPollsData();
  }, []);

  // Socket.io Real-time setup
  useEffect(() => {
    if (!household?._id) return;

    const socket = getSocket();
    joinHouseholdRoom(household._id);
    setLiveConnected(true);

    const handlePollCreated = (data) => {
      setPolls(prev => {
        if (prev.some(p => p._id === data.poll._id)) return prev;
        return [data.poll, ...prev];
      });
    };

    const handlePollUpdated = (data) => {
      setPolls(prev => prev.map(p => (p._id === data.poll._id ? { ...p, ...data.poll } : p)));
    };

    const handlePollDeleted = (data) => {
      setPolls(prev => prev.filter(p => p._id !== data.pollId));
    };

    socket.on('poll:created', handlePollCreated);
    socket.on('poll:updated', handlePollUpdated);
    socket.on('poll:deleted', handlePollDeleted);

    return () => {
      socket.off('poll:created', handlePollCreated);
      socket.off('poll:updated', handlePollUpdated);
      socket.off('poll:deleted', handlePollDeleted);
      leaveHouseholdRoom(household._id);
    };
  }, [household?._id]);

  // Handle Option selection toggle
  const handleOptionToggle = (poll, optionId) => {
    if (poll.status !== 'active') return;

    setSelectedVotes(prev => {
      const current = prev[poll._id] || [];
      if (poll.allowMultiple) {
        if (current.includes(optionId)) {
          return { ...prev, [poll._id]: current.filter(id => id !== optionId) };
        } else {
          return { ...prev, [poll._id]: [...current, optionId] };
        }
      } else {
        return { ...prev, [poll._id]: [optionId] };
      }
    });
  };

  // Submit Vote
  const handleVoteSubmit = async (pollId) => {
    const optionIds = selectedVotes[pollId] || [];
    if (optionIds.length === 0) {
      alert('Please select at least one option to vote');
      return;
    }

    try {
      setVotingLoadingId(pollId);
      const res = await votePoll(pollId, optionIds);
      const updatedPoll = res.data.data.poll;
      setPolls(prev => prev.map(p => (p._id === pollId ? updatedPoll : p)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit vote');
    } finally {
      setVotingLoadingId(null);
    }
  };

  // Close poll early
  const handleClosePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to end this decision poll now?')) return;
    try {
      setActionLoadingId(pollId);
      const res = await closePoll(pollId);
      const updatedPoll = res.data.data.poll;
      setPolls(prev => prev.map(p => (p._id === pollId ? updatedPoll : p)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close poll');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete poll
  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll permanently?')) return;
    try {
      setActionLoadingId(pollId);
      await deletePoll(pollId);
      setPolls(prev => prev.filter(p => p._id !== pollId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete poll');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Create Form Helpers
  const handleAddOption = () => {
    setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length <= 2) return;
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index, value) => {
    setFormData(prev => {
      const next = [...prev.options];
      next[index] = value;
      return { ...prev, options: next };
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!formData.title.trim()) {
      setCreateError('Poll title is required');
      return;
    }

    const cleanOptions = formData.options.map(o => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      setCreateError('Please provide at least 2 non-empty options');
      return;
    }

    let deadline = null;
    if (formData.hasDeadline && formData.deadlineDate) {
      deadline = new Date(`${formData.deadlineDate}T${formData.deadlineTime || '23:59'}:00`);
      if (deadline <= new Date()) {
        setCreateError('Deadline must be in the future');
        return;
      }
    }

    try {
      setCreating(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        options: cleanOptions,
        allowMultiple: formData.allowMultiple,
        anonymous: formData.anonymous,
        deadline
      };

      const res = await createPoll(payload);
      const newPoll = res.data.data.poll;
      setPolls(prev => [newPoll, ...prev]);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        options: ['', ''],
        allowMultiple: false,
        anonymous: false,
        hasDeadline: false,
        deadlineDate: '',
        deadlineTime: '23:59'
      });
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create poll');
    } finally {
      setCreating(false);
    }
  };

  // Polls Filter
  const filteredPolls = useMemo(() => {
    if (activeTab === 'active') {
      return polls.filter(p => p.status === 'active');
    } else {
      return polls.filter(p => p.status === 'closed' || p.status === 'expired');
    }
  }, [polls, activeTab]);

  const stats = useMemo(() => {
    const active = polls.filter(p => p.status === 'active').length;
    const closed = polls.filter(p => p.status === 'closed' || p.status === 'expired').length;
    const totalVotes = polls.reduce((acc, p) => acc + (p.totalVotes || 0), 0);
    return { active, closed, totalVotes };
  }, [polls]);

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
          <p className="text-stone-600 mb-6">You need to join or create a household to create polls and make decisions.</p>
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <span>🗳️</span> Household Decisions & Polls
              </h1>
              {liveConnected && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              )}
            </div>
            <p className="text-sm text-stone-600 mt-1">
              Vote on shared apartment decisions, internet plans, grocery brands, dinner ideas, and house rules.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 shadow-xs"
          >
            <span>+</span> Create Decision Poll
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-xl font-bold">
              📊
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-900">{stats.active}</div>
              <div className="text-xs font-medium text-stone-500">Active Polls</div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
              🗳️
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-900">{stats.totalVotes}</div>
              <div className="text-xs font-medium text-stone-500">Total Votes Cast</div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center text-xl font-bold">
              📁
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-900">{stats.closed}</div>
              <div className="text-xs font-medium text-stone-500">Decided / Past Polls</div>
            </div>
          </div>
        </div>

        {/* Main Card with Tabs & Polls List */}
        <Card className="p-6">
          {/* Tabs */}
          <div className="flex border-b border-stone-200 pb-3 mb-6 gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'active'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Active Decisions ({stats.active})
            </button>
            <button
              onClick={() => setActiveTab('closed')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'closed'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Past Decisions & Results ({stats.closed})
            </button>
          </div>

          {filteredPolls.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
              <div className="text-4xl mb-3">🗳️</div>
              <h3 className="text-base font-semibold text-stone-800">
                {activeTab === 'active' ? 'No active polls right now' : 'No past decisions yet'}
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {activeTab === 'active'
                  ? 'Start a new poll to gather roommate opinions or vote on group choices.'
                  : 'Completed decisions will appear here once voting finishes.'}
              </p>
              {activeTab === 'active' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4"
                >
                  Create a Decision Poll
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPolls.map(poll => {
                const isCreator = poll.createdBy?._id === user?._id || poll.createdBy === user?._id;
                const isHouseholdOwner = household?.owner?._id === user?._id || household?.owner === user?._id;
                const canManage = isCreator || isHouseholdOwner;
                const userSelectedOptionIds = selectedVotes[poll._id] || [];
                const hasVoted = poll.userVoteOptionIds && poll.userVoteOptionIds.length > 0;
                const isExpired = poll.status === 'expired' || (poll.deadline && new Date(poll.deadline) <= new Date());
                const isClosed = poll.status === 'closed' || isExpired;

                return (
                  <div
                    key={poll._id}
                    className="p-5 md:p-6 bg-white border border-stone-200 rounded-xl hover:border-teal-200 transition-all shadow-xs"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-stone-900">{poll.title}</h3>
                          {poll.anonymous && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                              🔒 Anonymous
                            </span>
                          )}
                          {poll.allowMultiple && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              Multi-Choice
                            </span>
                          )}
                          {isClosed ? (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                              {poll.status === 'expired' ? '⏰ Expired' : '🔒 Closed'}
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              🟢 Active Voting
                            </span>
                          )}
                        </div>

                        {poll.description && (
                          <p className="text-xs text-stone-600 mt-1">{poll.description}</p>
                        )}
                      </div>

                      {/* Management actions */}
                      {canManage && !isClosed && (
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-stone-500 hover:text-stone-900"
                            loading={actionLoadingId === poll._id}
                            onClick={() => handleClosePoll(poll._id)}
                          >
                            End Decision
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-500 hover:text-rose-700"
                            loading={actionLoadingId === poll._id}
                            onClick={() => handleDeletePoll(poll._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Options / Voting Bars */}
                    <div className="py-4 space-y-3">
                      {poll.options.map(opt => {
                        const isSelected = userSelectedOptionIds.includes(opt.optionId);
                        const isUserVotedForThis = (poll.userVoteOptionIds || []).includes(opt.optionId);
                        const pct = opt.percentage || 0;

                        return (
                          <div
                            key={opt.optionId}
                            onClick={() => !isClosed && handleOptionToggle(poll, opt.optionId)}
                            className={`relative overflow-hidden border rounded-xl p-3.5 transition-all ${
                              !isClosed ? 'cursor-pointer' : ''
                            } ${
                              isSelected
                                ? 'border-teal-500 bg-teal-50/20'
                                : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
                            }`}
                          >
                            {/* Vote Percentage fill bar background */}
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-teal-100/60 transition-all duration-500 z-0"
                              style={{ width: `${pct}%` }}
                            />

                            {/* Option Content */}
                            <div className="relative z-10 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {!isClosed && (
                                  <input
                                    type={poll.allowMultiple ? 'checkbox' : 'radio'}
                                    name={`poll-${poll._id}`}
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="w-4 h-4 text-teal-600 focus:ring-teal-500 rounded border-stone-300 pointer-events-none"
                                  />
                                )}
                                <div>
                                  <span className="text-sm font-semibold text-stone-800">
                                    {opt.text}
                                  </span>
                                  {isUserVotedForThis && (
                                    <span className="ml-2 text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                                      Your Vote ✓
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-sm font-bold text-stone-900">{pct}%</span>
                                <span className="text-xs text-stone-500 ml-1.5">
                                  ({opt.voteCount} {opt.voteCount === 1 ? 'vote' : 'votes'})
                                </span>
                              </div>
                            </div>

                            {/* Voter avatars / names if NOT anonymous and votes exist */}
                            {!poll.anonymous && opt.voters && opt.voters.length > 0 && (
                              <div className="relative z-10 mt-2 pt-2 border-t border-stone-200/50 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] text-stone-500">Voters:</span>
                                {opt.voters.map(v => (
                                  <span
                                    key={v._id || v}
                                    className="text-[11px] font-medium bg-white/90 px-2 py-0.5 rounded-md border border-stone-200 text-stone-700"
                                  >
                                    {v.name || 'Roommate'}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Row */}
                    <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span>
                          Created by <strong className="text-stone-700">{isCreator ? 'You' : (poll.createdBy?.name || 'Roommate')}</strong>
                        </span>
                        <span>•</span>
                        <span>Total Votes: <strong className="text-stone-700">{poll.totalVotes || 0}</strong></span>
                        {poll.deadline && (
                          <>
                            <span>•</span>
                            <span className={isExpired ? 'text-rose-600 font-semibold' : 'text-stone-600'}>
                              Deadline: {new Date(poll.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        )}
                      </div>

                      {!isClosed && (
                        <Button
                          variant="primary"
                          size="sm"
                          loading={votingLoadingId === poll._id}
                          onClick={() => handleVoteSubmit(poll._id)}
                          className="shadow-xs"
                        >
                          {hasVoted ? 'Change My Vote' : 'Submit Vote'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Create Poll Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Household Decision Poll"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              {createError}
            </div>
          )}

          <Input
            label="Decision / Question *"
            placeholder="e.g. Which Wi-Fi provider should we switch to?"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Description / Context (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add details, price comparisons, links, or notes for roommates..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700">
              Poll Options (Min 2) *
            </label>
            {formData.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddOption}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 pt-1"
            >
              <span>+</span> Add Another Option
            </button>
          </div>

          {/* Checkbox settings */}
          <div className="p-3 bg-stone-50 rounded-xl space-y-2 border border-stone-200">
            <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowMultiple}
                onChange={(e) => setFormData(prev => ({ ...prev, allowMultiple: e.target.checked }))}
                className="w-4 h-4 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
              />
              <span>Allow multiple choices per roommate</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.anonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, anonymous: e.target.checked }))}
                className="w-4 h-4 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
              />
              <span>Keep votes anonymous (hide roommate names on options)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasDeadline}
                onChange={(e) => setFormData(prev => ({ ...prev, hasDeadline: e.target.checked }))}
                className="w-4 h-4 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
              />
              <span>Set voting deadline</span>
            </label>

            {formData.hasDeadline && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/60">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.deadlineDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadlineDate: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.deadlineTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadlineTime: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={creating}
            >
              Launch Decision Poll
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
