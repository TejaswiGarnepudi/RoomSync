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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>📊</span> Household Workload & Contribution
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Factual, transparent visibility into shared chores, completed favors, and grocery responsibilities.
            </p>
          </div>

          {/* Period Filter Buttons */}
          <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-xl self-start md:self-auto border border-stone-200">
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                period === 'week' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                period === 'month' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('custom')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                period === 'custom' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>

        {/* Custom Range Picker */}
        {period === 'custom' && (
          <form onSubmit={handleCustomApply} className="p-4 bg-white border border-stone-200 rounded-xl flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-stone-700">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-stone-700">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary">
              Apply Filter
            </Button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : !data ? (
          <Card className="text-center py-12">
            <p className="text-stone-500">No contribution data available.</p>
          </Card>
        ) : (
          <>
            {/* Top Summary Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xl font-bold">
                  🏠
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-900">{data.totalHouseholdMinutes}m</div>
                  <div className="text-xs font-medium text-stone-500">Household Total Work</div>
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold">
                  👤
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-900">{data.userContribution?.totalMinutes || 0}m</div>
                  <div className="text-xs font-medium text-stone-500">Your Contribution ({data.userContribution?.percentOfHousehold || 0}%)</div>
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold">
                  🤝
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-900">{data.userContribution?.helpMinutes || 0}m</div>
                  <div className="text-xs font-medium text-stone-500">Help Provided by You</div>
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-bold">
                  🛍️
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-900">{data.userContribution?.shoppingMinutes || 0}m</div>
                  <div className="text-xs font-medium text-stone-500">Shopping Runs by You</div>
                </div>
              </div>
            </div>

            {/* Roommate Breakdown Table & Visual Bars */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Roommate Workload Distribution</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Factual recorded time across completed tasks for {data.startDate} to {data.endDate}.
                  </p>
                </div>
              </div>

              {/* Workload Progress Bars */}
              <div className="space-y-4 pt-2 pb-6 border-b border-stone-100">
                {data.members.map((member) => {
                  const isCurrentUser = member.userId === user?._id || member.userId?._id === user?._id;
                  const pct = member.percentOfHousehold || 0;

                  return (
                    <div key={member.userId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[11px]">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-stone-800">
                            {member.name} {isCurrentUser ? '(You)' : ''}
                          </span>
                        </div>
                        <span className="font-bold text-stone-700">
                          {member.totalMinutes} min ({pct}%)
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden flex">
                        {member.choreMinutes > 0 && (
                          <div
                            style={{ width: `${(member.choreMinutes / Math.max(1, data.totalHouseholdMinutes)) * 100}%` }}
                            className="bg-teal-600 transition-all duration-500"
                            title={`Chores: ${member.choreMinutes}m`}
                          />
                        )}
                        {member.helpMinutes > 0 && (
                          <div
                            style={{ width: `${(member.helpMinutes / Math.max(1, data.totalHouseholdMinutes)) * 100}%` }}
                            className="bg-blue-500 transition-all duration-500"
                            title={`Help: ${member.helpMinutes}m`}
                          />
                        )}
                        {member.shoppingMinutes > 0 && (
                          <div
                            style={{ width: `${(member.shoppingMinutes / Math.max(1, data.totalHouseholdMinutes)) * 100}%` }}
                            className="bg-amber-500 transition-all duration-500"
                            title={`Shopping: ${member.shoppingMinutes}m`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Legend */}
                <div className="flex items-center gap-4 text-[11px] text-stone-500 pt-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-teal-600 inline-block" /> Chores
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Roommate Help
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> Shopping Runs
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto pt-4">
                <table className="w-full text-left text-xs text-stone-600">
                  <thead className="bg-stone-50 text-stone-700 uppercase font-semibold text-[11px] border-b border-stone-200">
                    <tr>
                      <th className="p-3">Roommate</th>
                      <th className="p-3">Chores Completed</th>
                      <th className="p-3">Help Requests Fulfilled</th>
                      <th className="p-3">Shopping Runs</th>
                      <th className="p-3 text-right">Total Recorded Work</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {data.members.map((m) => {
                      const isCurrentUser = m.userId === user?._id || m.userId?._id === user?._id;
                      return (
                        <tr key={m.userId} className={isCurrentUser ? 'bg-teal-50/20 font-medium' : 'hover:bg-stone-50'}>
                          <td className="p-3 flex items-center gap-2 text-stone-900 font-semibold">
                            <span>{m.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded">
                                You
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {m.choresCount} ({m.choreMinutes} min)
                          </td>
                          <td className="p-3">
                            {m.helpCount} ({m.helpMinutes} min)
                          </td>
                          <td className="p-3">
                            {m.shoppingCount} ({m.shoppingMinutes} min)
                          </td>
                          <td className="p-3 text-right font-bold text-stone-900">
                            {m.totalMinutes} min
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Explanatory Factual Insights */}
            <Card className="p-6 bg-stone-50 border-stone-200">
              <h4 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2">
                <span>💡</span> Coordination Notes & Insights
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-600">
                {data.insights.map((msg, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-stone-400 mt-3 italic">
                * RoomSync measures contribution strictly by recorded task workload duration. This data is designed for mutual transparency and balanced household coordination.
              </p>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
