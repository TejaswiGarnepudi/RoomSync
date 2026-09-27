import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getChoreHistory } from '../services/choreService';

export default function ChoreHistory() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getChoreHistory({ limit: 100 });
        setHistoryList(res.data.data.history || []);
      } catch (err) {
        console.error('Failed to load chore history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="pb-6 border-b border-[#E8E7E1] dark:border-[#2A2A28] flex items-center justify-between">
          <div>
            <Link to="/chores" className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white transition-colors flex items-center gap-1.5 mb-2">
              &larr; Back to Chores Board
            </Link>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
              Chore Rotation History Log
            </h1>
            <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88] mt-1 tracking-[-0.02em]">
              Transparent audit trail of all household chore completions, claims, and rotations.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-7 shadow-sm">
          {historyList.length === 0 ? (
            <div className="text-center py-12 text-[#71716E] dark:text-[#8E8E88] text-xs">
              No chore events recorded in the history log yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E8E7E1] dark:border-[#2A2A28] text-[10px] uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] font-medium">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Chore</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Roommate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E7E1]/60 dark:divide-[#2A2A28] text-[#1A1A1A] dark:text-[#FAF9F5]">
                  {historyList.map((item) => (
                    <tr key={item._id} className="hover:bg-[#FAF9F5] dark:hover:bg-[#181816] transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-[#71716E] dark:text-[#8E8E88]">
                        {new Date(item.timestamp || item.createdAt).toLocaleDateString()}{' '}
                        {new Date(item.timestamp || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {item.chore?.title || item.choreId?.title || 'Chore Task'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                          item.action === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : item.action === 'claimed'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#71716E] dark:text-[#8E8E88]'
                        }`}>
                          {item.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.user?.name || 'Roommate'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
