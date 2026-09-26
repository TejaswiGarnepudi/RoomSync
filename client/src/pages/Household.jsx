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
    alert('Invite link copied to clipboard!');
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
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      </AppLayout>
    );
  }

  if (!household) return null;

  const isOwner = household.owner?._id === user._id || household.owner === user._id;

  return (
    <AppLayout>
      <div className="mb-8 pb-4 border-b border-[#E8DEC8]">
        <h1 className="text-3xl font-bold text-[#234653] font-serif-editorial">{household.name}</h1>
        <p className="text-[#3E737C] text-sm mt-1">Manage your household members and journal settings.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card title={`Roommates & Members (${household.members?.length || 0})`}>
            <ul className="divide-y divide-[#E8DEC8]/60">
              {household.members?.map((member) => {
                const memberIsOwner = member._id === (household.owner?._id || household.owner);
                return (
                  <li key={member._id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-xl bg-[#234653] text-[#FFF9F1] flex items-center justify-center font-serif font-bold text-base mr-4 shadow-2xs">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[#234653] text-sm flex items-center gap-2">
                          {member.name}
                          {memberIsOwner && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F2D4C8] text-[#234653]">
                              Household Lead
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[#3E737C]">{member.email}</p>
                      </div>
                    </div>
                    
                    {isOwner && member._id !== user._id && (
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member._id)}>
                        Remove
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Invite Roommates">
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#3E737C] mb-1.5">
                8-Digit Invite Code
              </label>
              <div className="flex items-center gap-2 bg-[#FAF5ED] px-4 py-3 rounded-xl border border-[#E8DEC8]">
                <span className="font-mono text-lg font-bold text-[#234653] tracking-widest flex-1 text-center">
                  {household.inviteCode}
                </span>
              </div>
            </div>
            
            <div className="space-y-2.5">
              <Button onClick={handleCopyLink} fullWidth>
                Copy Invite Link
              </Button>
              {isOwner && (
                <Button onClick={handleRegenerateCode} variant="secondary" fullWidth>
                  Regenerate Code
                </Button>
              )}
            </div>
          </Card>

          <Card title="Household Settings">
            <p className="text-xs text-[#3E737C] mb-4 leading-relaxed">
              {isOwner 
                ? "As the owner, leaving the household will transfer administration or archive the space." 
                : "Once you leave, you will need a new invite code from a roommate to rejoin."}
            </p>
            <Button variant="danger" fullWidth onClick={handleLeave}>
              Leave Household
            </Button>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
