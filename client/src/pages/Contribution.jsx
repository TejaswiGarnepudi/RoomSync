import React, { useState, useEffect, useContext } from 'react';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';
import { getContribution } from '../services/contributionService';

const formatDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function Contribution() {
  const { user } = useContext(AuthContext);

  const [period, setPeriod] = useState('month'); // 'week' | 'month' | 'custom'
  const [startDate, setStartDate] = useState(formatDateStr(new Date(new Date().setDate(1))));
  const [endDate, setEndDate] = useState(formatDateStr(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContributionData = async () => {
    try {
      setLoading(true);
      const params = { period };
      if (period === 'custom') {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const res = await getContribution(params);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load contribution data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributionData();
  }, [period]);

  const handleCustomApply = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      fetchContributionData();
    }
  };

  if (loading && !data) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const { totalHouseholdMinutes = 0, memberContributions = [], userContribution = {} } = data || {};
  const totalMins = totalHouseholdMinutes || 1; // avoid / 0

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="pb-6 border-b border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
              Workload & Contribution Insights
            </h1>
            <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88] mt-1 tracking-[-0.02em]">
              Factual, transparent visibility into shared chores, completed favors, and grocery responsibilities.
            </p>
          </div>

          {/* Period Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[#EAE8E1] dark:bg-[#1E1E1C] rounded-full self-start sm:self-auto">
            {['week', 'month', 'custom'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer capitalize ${
                  period === p
                    ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-xs'
                    : 'text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white'
                }`}
              >
                {p === 'custom' ? 'Custom Range' : `This ${p}`}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range Picker */}
        {period === 'custom' && (
          <form onSubmit={handleCustomApply} className="p-4 bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-2xl flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#71716E] dark:text-[#8E8E88]">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#71716E] dark:text-[#8E8E88]">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
              />
            </div>
            <Button size="sm" type="submit">
              Apply
            </Button>
          </form>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 shadow-sm">
            <span className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88]">Household Total Time</span>
            <div className="text-3xl font-normal text-[#1A1A1A] dark:text-white mt-2 tracking-tight">
              {totalHouseholdMinutes} <span className="text-base text-[#71716E]">mins</span>
            </div>
            <p className="text-[11px] text-[#71716E] dark:text-[#8E8E88] mt-1">
              ~{(totalHouseholdMinutes / 60).toFixed(1)} hours of household effort
            </p>
          </div>

          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 shadow-sm">
            <span className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88]">Your Effort Time</span>
            <div className="text-3xl font-normal text-[#1A1A1A] dark:text-white mt-2 tracking-tight">
              {userContribution?.totalMinutes || 0} <span className="text-base text-[#71716E]">mins</span>
            </div>
            <p className="text-[11px] text-[#71716E] dark:text-[#8E8E88] mt-1">
              {userContribution?.completedChores || 0} chores • {userContribution?.completedFavors || 0} favors
            </p>
          </div>

          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 shadow-sm">
            <span className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88]">Your Workload Share</span>
            <div className="text-3xl font-normal text-[#1A1A1A] dark:text-white mt-2 tracking-tight">
              {totalHouseholdMinutes > 0 ? Math.round(((userContribution?.totalMinutes || 0) / totalHouseholdMinutes) * 100) : 0}%
            </div>
            <p className="text-[11px] text-[#71716E] dark:text-[#8E8E88] mt-1">
              Fair share baseline: ~{Math.round(100 / (memberContributions.length || 1))}% per roommate
            </p>
          </div>
        </div>

        {/* Roommate Contributions Breakdown */}
        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-medium tracking-tight text-[#1A1A1A] dark:text-white">
            Roommate Breakdown
          </h2>

          <div className="space-y-4">
            {memberContributions.map((member) => {
              const userMins = member.totalMinutes || 0;
              const pct = Math.round((userMins / totalMins) * 100);
              const isCurrent = member.user?._id === user?._id;

              return (
                <div key={member.user?._id} className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white font-semibold flex items-center justify-center text-xs">
                        {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="font-medium text-sm text-[#1A1A1A] dark:text-white">
                        {member.user?.name} {isCurrent && '(You)'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-medium text-sm text-[#1A1A1A] dark:text-white">{userMins} mins</span>
                      <span className="text-[11px] text-[#71716E] dark:text-[#8E8E88] block">({pct}%)</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#EAE8E1] dark:bg-[#1E1E1C] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1A1A1A] dark:bg-white h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#71716E] dark:text-[#8E8E88]">
                    <span>{member.completedChores || 0} chores finished</span>
                    <span>{member.completedFavors || 0} favors provided</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
