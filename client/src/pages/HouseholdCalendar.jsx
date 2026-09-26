import React, { useState, useEffect, useContext } from 'react';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';
import { getMyHousehold } from '../services/householdService';
import {
  getHouseholdAvailability,
  getCommonAvailability
} from '../services/availabilityService';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM to 10 PM (22:00)

// Helper: Format YYYY-MM-DD
const formatDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Helper: Format 24h time to 12h AM/PM
const formatTime12h = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
};

// Helper: Convert "HH:MM" to minutes from midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h * 60) + (m || 0);
};

export default function HouseholdCalendar() {
  const { user } = useContext(AuthContext);
  const [household, setHousehold] = useState(null);
  const [selectedDate, setSelectedDate] = useState(formatDateStr(new Date()));
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [availabilityList, setAvailabilityList] = useState([]);
  const [filterTypes, setFilterTypes] = useState({
    availability: true,
    chores: true,
    shopping: true,
    help: true
  });
  const [commonSlots, setCommonSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Initial Load: Fetch Household & Members
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await getMyHousehold();
        const hh = res.data.data.household;
        setHousehold(hh);
        if (hh && hh.members) {
          setSelectedMemberIds(hh.members.map((m) => m._id));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load household');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch Availability & Common Slots when Date or Selected Members change
  const fetchCalendarData = async () => {
    if (!household || selectedMemberIds.length === 0) {
      setAvailabilityList([]);
      setCommonSlots([]);
      return;
    }

    try {
      const [availRes, commonRes] = await Promise.all([
        getHouseholdAvailability({
          startDate: selectedDate,
          endDate: selectedDate,
          memberIds: selectedMemberIds.join(',')
        }),
        getCommonAvailability({
          startDate: selectedDate,
          endDate: selectedDate,
          minimumDuration: 30,
          memberIds: selectedMemberIds.join(',')
        })
      ]);

      setAvailabilityList(availRes.data.data.availability || []);
      setCommonSlots(commonRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch household calendar data:', err);
    }
  };

  useEffect(() => {
    if (household) {
      fetchCalendarData();
    }
  }, [household, selectedDate, selectedMemberIds]);

  // Date Navigation
  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const prev = new Date(y, m - 1, d - 1);
    setSelectedDate(formatDateStr(prev));
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    setSelectedDate(formatDateStr(next));
  };

  const handleToday = () => {
    setSelectedDate(formatDateStr(new Date()));
  };

  // Member Filter Toggles
  const toggleMember = (mId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(mId) ? prev.filter((id) => id !== mId) : [...prev, mId]
    );
  };

  const toggleSelectAll = () => {
    if (!household) return;
    if (selectedMemberIds.length === household.members.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(household.members.map((m) => m._id));
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (error || !household) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto mt-12">
          <Card title="No Household Found">
            <p className="text-stone-600 mb-4">
              You must be in a household to view the shared roommate calendar.
            </p>
            <Button onClick={() => (window.location.href = '/dashboard')}>
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const formattedDateTitle = dateObj.toLocaleDateString('default', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const selectedMembers = household.members.filter((m) =>
    selectedMemberIds.includes(m._id)
  );

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Household Calendar
          </h1>
          <p className="text-stone-600 mt-1">
            Coordinate schedules and find common free time with your roommates.
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-stone-200 shadow-xs">
          <Button variant="secondary" size="sm" onClick={handlePrevDay}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2 py-1 text-xs border border-stone-200 rounded-md font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <Button variant="secondary" size="sm" onClick={handleNextDay}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Summary Highlight: Best Common Free Time */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-teal-200 text-xs font-semibold uppercase tracking-wider block mb-1">
                Common Free Time • {formattedDateTitle}
              </span>
              {commonSlots.length > 0 ? (
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold">
                      {formatTime12h(commonSlots[0].startTime)} – {formatTime12h(commonSlots[0].endTime)}
                    </h2>
                    <span className="bg-teal-600/80 border border-teal-400/40 text-xs px-2.5 py-1 rounded-full font-medium">
                      {commonSlots[0].durationMinutes} mins free
                    </span>
                  </div>
                  <p className="text-teal-100 text-sm mt-1">
                    All {selectedMemberIds.length} selected roommates are available during this time.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold">No overlapping free time found</h2>
                  <p className="text-teal-100 text-sm mt-1">
                    Try adjusting the member filters or adding new availability blocks.
                  </p>
                </div>
              )}
            </div>

            {commonSlots.length > 1 && (
              <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-xs space-y-1">
                <span className="font-semibold text-teal-100 block">Other common slots today:</span>
                {commonSlots.slice(1).map((s, idx) => (
                  <div key={idx} className="flex justify-between gap-4 text-teal-50">
                    <span>{formatTime12h(s.startTime)} – {formatTime12h(s.endTime)}</span>
                    <span>({s.durationMinutes}m)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roommate Filter Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Filter Roommates:
            </span>
            <button
              onClick={toggleSelectAll}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold underline underline-offset-2"
            >
              {selectedMemberIds.length === household.members.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {household.members.map((m) => {
              const isSelected = selectedMemberIds.includes(m._id);
              return (
                <button
                  key={m._id}
                  onClick={() => toggleMember(m._id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border transition-all ${
                    isSelected
                      ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-teal-500' : 'bg-stone-300'
                    }`}
                  ></span>
                  <span>{m.name}</span>
                  {m._id === user._id && (
                    <span className="text-3xs text-stone-400 font-normal">(You)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Source Event Category Filters */}
        <div className="flex items-center gap-4 text-xs flex-wrap pt-3 mt-3 border-t border-stone-100">
          <span className="text-stone-400 font-semibold uppercase text-[10px] tracking-wider">Event Types:</span>
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
            <input
              type="checkbox"
              checked={filterTypes.availability}
              onChange={(e) => setFilterTypes(prev => ({ ...prev, availability: e.target.checked }))}
              className="w-3.5 h-3.5 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" /> Availability
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
            <input
              type="checkbox"
              checked={filterTypes.chores}
              onChange={(e) => setFilterTypes(prev => ({ ...prev, chores: e.target.checked }))}
              className="w-3.5 h-3.5 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Chores
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
            <input
              type="checkbox"
              checked={filterTypes.shopping}
              onChange={(e) => setFilterTypes(prev => ({ ...prev, shopping: e.target.checked }))}
              className="w-3.5 h-3.5 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Shopping
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
            <input
              type="checkbox"
              checked={filterTypes.help}
              onChange={(e) => setFilterTypes(prev => ({ ...prev, help: e.target.checked }))}
              className="w-3.5 h-3.5 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Help
          </label>
        </div>
      </div>

      {/* Combined Availability Grid */}
      {selectedMembers.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-stone-500">Please select at least one roommate to view the calendar.</p>
        </Card>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
          {/* Grid Header: Roommates */}
          <div className="grid border-b border-stone-200 bg-stone-50 text-stone-800"
               style={{ gridTemplateColumns: `80px repeat(${selectedMembers.length}, minmax(180px, 1fr))` }}>
            <div className="p-3 border-r border-stone-200 text-xs font-semibold text-stone-500 uppercase flex items-center justify-center">
              Time
            </div>
            {selectedMembers.map((m) => (
              <div
                key={m._id}
                className="p-3 border-r last:border-r-0 border-stone-200 text-center font-semibold text-sm flex items-center justify-center gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center justify-center font-bold">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{m.name}</span>
                {m._id === user._id && (
                  <span className="text-3xs bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-normal">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Hour-by-Hour Timeline Grid */}
          <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
            {HOURS.map((hour) => {
              const hourStartMins = hour * 60;
              const hourEndMins = (hour + 1) * 60;
              const hourLabel = formatTime12h(`${String(hour).padStart(2, '0')}:00`);

              return (
                <div
                  key={hour}
                  className="grid hover:bg-stone-50/40 transition-colors"
                  style={{ gridTemplateColumns: `80px repeat(${selectedMembers.length}, minmax(180px, 1fr))` }}
                >
                  {/* Time label */}
                  <div className="p-2 border-r border-stone-200 text-xs font-medium text-stone-500 flex items-start justify-center pt-3">
                    {hourLabel}
                  </div>

                  {/* Roommate slots */}
                  {selectedMembers.map((m) => {
                    const memberEvents = availabilityList
                      .filter((item) => {
                        const mId = item.userId?._id || item.userId;
                        if (mId.toString() !== m._id.toString()) return false;
                        const sMins = timeToMinutes(item.startTime);
                        const eMins = timeToMinutes(item.endTime);
                        // Overlaps with this hour slot
                        return sMins < hourEndMins && eMins > hourStartMins;
                      })
                      .filter((item) => {
                        const isChore = item.isChore || item.status === 'chore';
                        const isShopping = item.isShopping || item.status === 'shopping';
                        const isHelp = item.isHelp || item.status === 'help' || (item.title && item.title.startsWith('🤝 Help'));
                        const isAvailability = !isChore && !isShopping && !isHelp;

                        if (isChore && !filterTypes.chores) return false;
                        if (isShopping && !filterTypes.shopping) return false;
                        if (isHelp && !filterTypes.help) return false;
                        if (isAvailability && !filterTypes.availability) return false;
                        return true;
                      });

                    return (
                      <div
                        key={m._id + '-' + hour}
                        className="p-1.5 border-r last:border-r-0 border-stone-100 min-h-[54px] flex flex-col justify-center space-y-1"
                      >
                        {memberEvents.length === 0 ? (
                          <div className="h-full rounded border border-dashed border-stone-100 flex items-center justify-center">
                            <span className="text-3xs text-stone-300">—</span>
                          </div>
                        ) : (
                          memberEvents.map((ev) => {
                            const isChore = ev.isChore || ev.status === 'chore';
                            const isShopping = ev.isShopping || ev.status === 'shopping';
                            const isHelp = ev.isHelp || ev.status === 'help' || (ev.title && ev.title.startsWith('🤝 Help'));
                            const isAvailable = ev.status === 'available';
                            const isChoreCompleted = ev.isCompleted || ev.choreStatus === 'completed';

                            return (
                              <div
                                key={ev._id + (ev.effectiveDate || '')}
                                onClick={() => {
                                  if (isChore) window.location.href = `/chores/${ev._id}`;
                                  else if (isShopping) window.location.href = `/shopping`;
                                  else if (isHelp) window.location.href = ev.helpRequestId ? `/help/${ev.helpRequestId}` : `/help`;
                                }}
                                className={`px-2 py-1 rounded-md text-xs font-medium border leading-tight ${
                                  isChore
                                    ? isChoreCompleted
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 cursor-pointer hover:bg-emerald-100'
                                      : 'bg-amber-50 border-amber-300 text-amber-900 cursor-pointer hover:bg-amber-100'
                                    : isShopping
                                    ? 'bg-sky-50 border-sky-300 text-sky-900 cursor-pointer hover:bg-sky-100'
                                    : isHelp
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 cursor-pointer hover:bg-indigo-100'
                                    : isAvailable
                                    ? 'bg-teal-50 border-teal-200 text-teal-900'
                                    : 'bg-rose-50 border-rose-200 text-rose-900'
                                }`}
                              >
                                <div className="flex items-center justify-between text-3xs font-semibold">
                                  <span>{isChore ? (isChoreCompleted ? 'CHORE (DONE)' : 'CHORE') : isShopping ? 'SHOPPING' : isHelp ? 'HELP' : ev.status.toUpperCase()}</span>
                                  <span>
                                    {formatTime12h(ev.startTime)} – {formatTime12h(ev.endTime)}
                                  </span>
                                </div>
                                {ev.title && (
                                  <p className="text-3xs truncate mt-0.5 opacity-90">
                                    {ev.title}
                                  </p>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
