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
      setError(err.response?.data?.message || 'Failed to join household. Invalid code?');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto mt-12">
        <Card title="Join Household">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            
            <h2 className="text-xl font-medium text-stone-900 mb-2">
              You've been invited!
            </h2>
            <p className="text-stone-600 mb-6">
              You are about to join a household with invite code: <strong className="font-mono">{inviteCode}</strong>
            </p>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 text-left">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleJoin} isLoading={loading}>
                Join Now
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
