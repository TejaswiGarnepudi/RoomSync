import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMyHousehold, removeMember, leaveHousehold, regenerateInviteCode } from '../services/householdService';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Household() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchHousehold = async () => {
    try {
      const res = await getMyHousehold();
      setHousehold(res.data.data.household);
    } catch (err) {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHousehold();
  }, [navigate]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join/${household.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRegenerateCode = async () => {
    try {
      await regenerateInviteCode();
      fetchHousehold();
    } catch (err) {
      setError('Failed to regenerate code');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeMember(memberId);
      fetchHousehold();
    } catch (err) {
      setError('Failed to remove member');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this household?')) return;
    try {
      await leaveHousehold();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to leave household');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24"><LoadingSpinner /></div>
      </AppLayout>
    );
  }

  if (!household) return null;

  const isOwner = household.owner?._id === user._id || household.owner === user._id;

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="pb-6 border-b border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
                {household.name}
              </h1>
              <span className="px-3 py-1 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] text-xs font-medium text-[#1A1A1A] dark:text-[#FAF9F5]">
                {household.members?.length || 1} {household.members?.length === 1 ? 'roommate' : 'roommates'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88] mt-1 tracking-[-0.02em]">
              Manage your roommates, invitations, and household preferences.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-2xl border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Roommates List Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="pb-4 border-b border-[#E8E7E1] dark:border-[#2A2A28] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium tracking-[-0.03em] text-[#1A1A1A] dark:text-white">
                    Roommate Directory
                  </h2>
                  <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5">
                    Everyone currently connected to this household space.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-[#E8E7E1]/60 dark:divide-[#2A2A28] pt-2">
                {household.members?.map((member) => {
                  const memberIsOwner = member._id === (household.owner?._id || household.owner);
                  const isCurrentUser = member._id === user._id;

                  return (
                    <div key={member._id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="size-11 rounded-2xl bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white font-semibold flex items-center justify-center text-sm shrink-0 border border-transparent dark:border-[#2E2E2A]">
                          {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-[#1A1A1A] dark:text-white truncate">
                              {member.name} {isCurrentUser && <span className="text-[#71716E] dark:text-[#8E8E88] font-normal">(You)</span>}
                            </span>
                            {memberIsOwner && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-[#FAF9F5] border border-transparent dark:border-[#2E2E2A]">
                                Space Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#71716E] dark:text-[#8E8E88] truncate mt-0.5">{member.email}</p>
                        </div>
                      </div>
                      
                      {isOwner && member._id !== user._id && (
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline px-2 py-1 cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar / Actions Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Invite Card */}
            <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-medium tracking-[-0.03em] text-[#1A1A1A] dark:text-white">
                  Invite Code
                </h3>
                <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5 leading-relaxed">
                  Share this 8-character code with your roommates so they can join your space.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] text-center">
                <span className="font-mono text-2xl font-medium tracking-widest text-[#1A1A1A] dark:text-white block">
                  {household.inviteCode}
                </span>
              </div>
              
              <div className="space-y-2 pt-1">
                <Button onClick={handleCopyLink} fullWidth>
                  {copiedLink ? '✓ Link Copied!' : 'Copy Invite Link'}
                </Button>
                {isOwner && (
                  <Button onClick={handleRegenerateCode} variant="outline" fullWidth>
                    Regenerate Code
                  </Button>
                )}
              </div>
            </div>

            {/* Leave Household Card */}
            <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-white">Household Settings</h3>
              <p className="text-xs text-[#71716E] dark:text-[#8E8E88] leading-relaxed">
                {isOwner 
                  ? "Leaving the household transfers ownership or archives the journal space." 
                  : "If you leave, you will need a new invite code from a flatmate to rejoin."}
              </p>
              <div className="pt-2">
                <Button variant="danger" size="sm" fullWidth onClick={handleLeave}>
                  Leave Household
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
