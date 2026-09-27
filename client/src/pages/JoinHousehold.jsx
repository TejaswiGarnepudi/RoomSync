import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { joinHousehold } from '../services/householdService';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function JoinHousehold() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    setLoading(true);
    setError('');
    try {
      await joinHousehold({ inviteCode });
      navigate('/household');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join household. Please check the code.');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto mt-12 animate-fade-in-up">
        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-8 sm:p-10 text-center shadow-sm space-y-6">
          <div className="size-16 rounded-3xl bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white flex items-center justify-center mx-auto text-2xl">
            🏠
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-normal tracking-tight text-[#1A1A1A] dark:text-white">
              You're Invited!
            </h2>
            <p className="text-xs text-[#71716E] dark:text-[#8E8E88] leading-relaxed">
              You are about to join this shared household space with code:
            </p>
            <div className="p-3 bg-[#FAF9F5] dark:bg-[#181816] rounded-xl border border-[#E8E7E1] dark:border-[#2A2A28]">
              <span className="font-mono text-xl font-medium tracking-widest text-[#1A1A1A] dark:text-white">
                {inviteCode}
              </span>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900/50 text-left">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleJoin} isLoading={loading}>
              Join Space &rarr;
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
