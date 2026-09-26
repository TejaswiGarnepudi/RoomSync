import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
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
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const completedActions = historyList.filter(h => h.action === 'completed');

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/chores" className="text-xs font-medium text-stone-500 hover:text-teal-600 transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Chores Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Chore History Log</h1>
          <p className="text-stone-600 text-sm mt-1">
            Audit trail of all household chore completions and assignments for fair rotation.
          </p>
        </div>
      </div>

      <Card>
        {historyList.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-sm">
            No chore events recorded in the history log yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Chore</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Roommate</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {historyList.map((item) => (
                  <tr key={item._id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-stone-500">
                      {new Date(item.timestamp).toLocaleDateString()}{' '}
                      <span className="text-stone-400 font-normal">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {item.choreId?.title || 'Chore'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-3xs font-bold uppercase ${
                          item.action === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.action === 'claimed'
                            ? 'bg-teal-100 text-teal-800'
                            : item.action === 'assigned' || item.action === 'reassigned'
                            ? 'bg-blue-100 text-blue-800'
                            : item.action === 'marked_overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {item.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-3xs">
                        {item.userId?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="font-medium text-stone-800">{item.userId?.name || 'User'}</span>
                    </td>
                    <td className="py-3 px-4 text-stone-500 truncate max-w-xs">
                      {item.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
