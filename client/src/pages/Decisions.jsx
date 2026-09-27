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
import { getSocket, joinHouseholdRoom } from '../services/socket';

export default function Decisions() {
  const { user } = useContext(AuthContext);

  const [household, setHousehold] = useState(null);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (socket) {
      joinHouseholdRoom(household._id);

      const handlePollCreated = (data) => {
        setPolls(prev => {
          if (prev.some(p => p._id === data.poll._id)) return prev;
          return [data.poll, ...prev];
        });
      };

      const handlePollUpdated = (data) => {
        setPolls(prev => prev.map(p => (p._id === data.poll._id ? { ...p, ...data.poll } : p)));
      };

      socket.on('poll:created', handlePollCreated);
      socket.on('poll:updated', handlePollUpdated);

      return () => {
        socket.off('poll:created', handlePollCreated);
        socket.off('poll:updated', handlePollUpdated);
      };
    }
  }, [household]);

  const handleVoteToggle = (poll, optionId) => {
    if (poll.status !== 'active') return;
    const currentSelected = selectedVotes[poll._id] || [];

    if (poll.allowMultiple) {
      if (currentSelected.includes(optionId)) {
        setSelectedVotes(prev => ({
          ...prev,
          [poll._id]: prev[poll._id].filter(id => id !== optionId)
        }));
      } else {
        setSelectedVotes(prev => ({
          ...prev,
          [poll._id]: [...(prev[poll._id] || []), optionId]
        }));
      }
    } else {
      setSelectedVotes(prev => ({
        ...prev,
        [poll._id]: [optionId]
      }));
    }
  };

  const handleVoteSubmit = async (pollId) => {
    const optionIds = selectedVotes[pollId] || [];
    if (optionIds.length === 0) {
      alert('Please select at least one option to vote');
      return;
    }

    try {
      setVotingLoadingId(pollId);
      const res = await votePoll(pollId, optionIds);
      setPolls(prev => prev.map(p => (p._id === pollId ? res.data.data.poll : p)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit vote');
    } finally {
      setVotingLoadingId(null);
    }
  };

  const handleClose = async (pollId) => {
    if (!window.confirm('Are you sure you want to close this poll to further voting?')) return;
    try {
      const res = await closePoll(pollId);
      setPolls(prev => prev.map(p => (p._id === pollId ? res.data.data.poll : p)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close poll');
    }
  };

  const handleDelete = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this decision poll?')) return;
    try {
      await deletePoll(pollId);
      setPolls(prev => prev.filter(p => p._id !== pollId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete poll');
    }
  };

  const handleAddOptionField = () => {
    setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const handleOptionChange = (idx, val) => {
    setFormData(prev => {
      const updated = [...prev.options];
      updated[idx] = val;
      return { ...prev, options: updated };
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    const cleanOptions = formData.options.map(o => o.trim()).filter(Boolean);
    if (!formData.title.trim()) {
      setCreateError('Title is required');
      return;
    }
    if (cleanOptions.length < 2) {
      setCreateError('Please provide at least 2 distinct voting options');
      return;
    }

    try {
      setCreating(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        options: cleanOptions,
        allowMultiple: formData.allowMultiple,
        anonymous: formData.anonymous,
        hasDeadline: formData.hasDeadline,
        deadlineDate: formData.hasDeadline ? formData.deadlineDate : null,
        deadlineTime: formData.hasDeadline ? formData.deadlineTime : null
      };

      const res = await createPoll(payload);
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
      setPolls(prev => [res.data.data.poll, ...prev]);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create decision poll');
    } finally {
      setCreating(false);
    }
  };

  const filteredPolls = useMemo(() => {
    return polls.filter(p => (activeTab === 'active' ? p.status === 'active' : p.status === 'closed'));
  }, [polls, activeTab]);

  if (loading && polls.length === 0) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner />
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
              Household Decisions & Polls
            </h1>
            <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88] mt-1 tracking-[-0.02em]">
              Propose ideas, vote on house purchases and guest rules, and resolve topics without messy chats.
            </p>
          </div>

          <Button onClick={() => setIsCreateModalOpen(true)}>
            + Propose Decision
          </Button>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-xs'
                : 'text-[#71716E] dark:text-[#8E8E88] hover:bg-[#EAE8E1] dark:hover:bg-[#1E1E1C]'
            }`}
          >
            Active Votes ({polls.filter(p => p.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeTab === 'closed'
                ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-xs'
                : 'text-[#71716E] dark:text-[#8E8E88] hover:bg-[#EAE8E1] dark:hover:bg-[#1E1E1C]'
            }`}
          >
            Closed / Decided ({polls.filter(p => p.status === 'closed').length})
          </button>
        </div>

        {/* Polls Cards Grid */}
        {filteredPolls.length === 0 ? (
          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-16 text-center text-xs text-[#71716E] dark:text-[#8E8E88]">
            <div className="text-3xl mb-2 opacity-75">🗳️</div>
            <p className="font-medium text-sm text-[#1A1A1A] dark:text-white">No {activeTab} decisions at the moment</p>
            <p className="mt-0.5">Click "+ Propose Decision" to start a new household poll.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPolls.map((poll) => {
              const isCreator = poll.creator?._id === user?._id || poll.creator === user?._id;
              const userVoted = (poll.userVoteOptionIds || []).length > 0;
              const totalVotes = poll.totalVotes || 0;
              const selectedOpts = selectedVotes[poll._id] || [];

              return (
                <div
                  key={poll._id}
                  className="p-6 sm:p-7 rounded-3xl border border-[#E8E7E1] dark:border-[#2A2A28] bg-white dark:bg-[#141413] flex flex-col justify-between space-y-5 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-medium tracking-wider text-[#71716E] dark:text-[#8E8E88]">
                        By {poll.creator?.name || 'Roommate'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        poll.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#71716E] dark:text-[#8E8E88]'
                      }`}>
                        {poll.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-[#1A1A1A] dark:text-white tracking-tight">
                      {poll.title}
                    </h3>

                    {poll.description && (
                      <p className="text-xs text-[#71716E] dark:text-[#A8A7A0] leading-relaxed">
                        {poll.description}
                      </p>
                    )}

                    {/* Voting Options */}
                    <div className="space-y-2.5 pt-2">
                      {poll.options?.map((opt) => {
                        const isSelected = selectedOpts.includes(opt._id);
                        const voteCount = opt.votesCount || (opt.votes?.length) || 0;
                        const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                        return (
                          <div
                            key={opt._id}
                            onClick={() => handleVoteToggle(poll, opt._id)}
                            className={`p-3.5 rounded-2xl border text-xs relative overflow-hidden transition-all select-none cursor-pointer ${
                              isSelected
                                ? 'border-[#1A1A1A] dark:border-white bg-[#FAF9F5] dark:bg-[#181816]'
                                : 'border-[#E8E7E1] dark:border-[#2A2A28] bg-[#FAF9F5]/50 dark:bg-[#181816]/50 hover:bg-[#FAF9F5] dark:hover:bg-[#181816]'
                            }`}
                          >
                            {/* Vote Percentage fill bar */}
                            {totalVotes > 0 && (
                              <div
                                className="absolute inset-y-0 left-0 bg-[#EAE8E1]/80 dark:bg-[#252522]/80 transition-all duration-500 pointer-events-none"
                                style={{ width: `${pct}%` }}
                              />
                            )}

                            <div className="relative z-10 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className={`size-4 rounded-full flex items-center justify-center text-[10px] ${
                                  isSelected
                                    ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                                    : 'border border-[#71716E]/40 dark:border-white/30'
                                }`}>
                                  {isSelected && '✓'}
                                </span>
                                <span className="font-medium text-[#1A1A1A] dark:text-white">{opt.text}</span>
                              </div>

                              <span className="text-[11px] font-medium text-[#71716E] dark:text-[#8E8E88]">
                                {pct}% ({voteCount})
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions & Footer */}
                  <div className="pt-4 border-t border-[#E8E7E1] dark:border-[#2A2A28] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#71716E] dark:text-[#8E8E88]">
                      {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} total
                    </span>

                    <div className="flex items-center gap-2">
                      {poll.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => handleVoteSubmit(poll._id)}
                          isLoading={votingLoadingId === poll._id}
                        >
                          {userVoted ? 'Update Vote' : 'Submit Vote'}
                        </Button>
                      )}

                      {isCreator && poll.status === 'active' && (
                        <button
                          onClick={() => handleClose(poll._id)}
                          className="text-xs text-[#71716E] hover:text-[#1A1A1A] dark:hover:text-white px-2 py-1 cursor-pointer"
                        >
                          Close Poll
                        </button>
                      )}

                      {isCreator && (
                        <button
                          onClick={() => handleDelete(poll._id)}
                          className="text-xs text-rose-600 dark:text-rose-400 hover:underline px-2 py-1 cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Propose Decision Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Propose Household Decision">
        {createError && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900/50">
            {createError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <Input
            label="Decision Topic / Question"
            value={formData.title}
            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Should we get an air fryer for the kitchen?"
            required
          />

          <Input
            label="Context / Notes (Optional)"
            value={formData.description}
            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
            placeholder="e.g. Split 3 ways (~₹900 each) or everyone chips in."
          />

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88]">
              Options
            </label>
            {formData.options.map((opt, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                className="w-full px-4 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
                required
              />
            ))}
            <button
              type="button"
              onClick={handleAddOptionField}
              className="text-xs font-medium text-[#1A1A1A] dark:text-white hover:underline cursor-pointer"
            >
              + Add another option
            </button>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={creating}>
              Post Decision Poll &rarr;
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
