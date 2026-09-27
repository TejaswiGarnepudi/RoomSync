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

const formatDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

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
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header & Date Controls */}
        <div className="pb-6 border-b border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
              Household Calendar
            </h1>
            <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88] mt-1 tracking-[-0.02em]">
              Synchronized schedules, chore duties, and common free times across your home.
            </p>
          </div>

          {/* Date Picker Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button variant="outline" size="sm" onClick={handlePrevDay}>
              &larr;
            </Button>
            <Button variant="secondary" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextDay}>
              &rarr;
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-full text-[#1A1A1A] dark:text-white"
            />
          </div>
        </div>

        {/* Roommates Filter Bar */}
        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-5 shadow-2xs flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88] mr-1">Filter flatmates:</span>
          <button
            onClick={toggleSelectAll}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              selectedMemberIds.length === (household?.members?.length || 0)
                ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                : 'bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#71716E] dark:text-[#8E8E88]'
            }`}
          >
            All Flatmates
          </button>
          {household?.members?.map((m) => {
            const isSelected = selectedMemberIds.includes(m._id);
            return (
              <button
                key={m._id}
                onClick={() => toggleMember(m._id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                    : 'bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#71716E] dark:text-[#8E8E88]'
                }`}
              >
                <span>{m.name}</span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Common Free Slots Banner */}
        {commonSlots && commonSlots.length > 0 && (
          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-medium uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Common Free Times Today ({commonSlots.length} available)
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {commonSlots.map((slot, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-white dark:bg-[#141413] border border-emerald-500/30 text-xs font-medium text-emerald-700 dark:text-emerald-300 shadow-2xs"
                >
                  {formatTime12h(slot.startTime)} – {formatTime12h(slot.endTime)} ({slot.durationMinutes || slot.duration} min)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Multi-Roommate Timeline Grid */}
        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-7 shadow-sm overflow-x-auto">
          <div className="min-w-[700px] space-y-4">
            {/* Header Timeline Legend */}
            <div className="grid grid-cols-16 gap-1 border-b border-[#E8E7E1] dark:border-[#2A2A28] pb-3 text-center text-[10px] font-mono text-[#71716E] dark:text-[#8E8E88]">
              <div className="col-span-2 text-left font-sans text-xs font-medium text-[#1A1A1A] dark:text-white">
                Roommate
              </div>
              {HOURS.map((h) => (
                <div key={h} className="col-span-1">
                  {h > 12 ? `${h - 12}p` : `${h}a`}
                </div>
              ))}
            </div>

            {/* Member Rows */}
            {household?.members
              ?.filter((m) => selectedMemberIds.includes(m._id))
              .map((member) => {
                const memberAvails = availabilityList.filter(
                  (a) => a.user?._id === member._id || a.user === member._id
                );

                return (
                  <div key={member._id} className="grid grid-cols-16 gap-1 items-center py-2.5 border-b border-[#E8E7E1]/40 dark:border-[#2A2A28]/60">
                    <div className="col-span-2 flex items-center gap-2 pr-2">
                      <div className="size-6 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white font-semibold flex items-center justify-center text-[10px]">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-[#1A1A1A] dark:text-white truncate">
                        {member.name}
                      </span>
                    </div>

                    {/* Hourly Blocks */}
                    <div className="col-span-14 relative h-8 bg-[#FAF9F5] dark:bg-[#181816] rounded-xl border border-[#E8E7E1]/80 dark:border-[#2A2A28] overflow-hidden">
                      {memberAvails.map((avail, idx) => {
                        const startMin = timeToMinutes(avail.startTime);
                        const endMin = timeToMinutes(avail.endTime);
                        const gridStart = 7 * 60; // 7 AM
                        const gridTotal = 14 * 60; // 14 hours

                        const leftPct = Math.max(0, ((startMin - gridStart) / gridTotal) * 100);
                        const widthPct = Math.min(100 - leftPct, ((endMin - startMin) / gridTotal) * 100);

                        return (
                          <div
                            key={idx}
                            title={`${avail.title || 'Available'}: ${avail.startTime} - ${avail.endTime}`}
                            className={`absolute top-1 bottom-1 rounded-lg px-2 text-[10px] font-medium flex items-center truncate ${
                              avail.status === 'busy'
                                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            }`}
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`
                            }}
                          >
                            <span className="truncate">{avail.title || (avail.status === 'busy' ? 'Busy' : 'Free')}</span>
                          </div>
                        );
                      })}
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
