import React, { useState, useEffect, useContext } from 'react';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';
import {
  getMyAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability
} from '../services/availabilityService';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

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

// Helper: Get start and end of week (Monday to Sunday or Sunday to Saturday)
const getWeekRange = (currentDate) => {
  const d = new Date(currentDate);
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day; // start on Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    days.push(nextDay);
  }

  return {
    days,
    startDate: formatDateStr(days[0]),
    endDate: formatDateStr(days[6])
  };
};

// Helper: Get month days grid
const getMonthRange = (currentDate) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Pad to start on Monday
  const startDayOfWeek = firstDay.getDay();
  const padLeft = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const days = [];
  for (let i = padLeft; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push({ date: d, isCurrentMonth: false });
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({ date: d, isCurrentMonth: true });
  }

  // Pad to end on Sunday
  const endDayOfWeek = lastDay.getDay();
  const padRight = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
  for (let i = 1; i <= padRight; i++) {
    const d = new Date(year, month + 1, i);
    days.push({ date: d, isCurrentMonth: false });
  }

  return {
    days,
    startDate: formatDateStr(days[0].date),
    endDate: formatDateStr(days[days.length - 1].date)
  };
};

export default function PersonalCalendar() {
  const { user } = useContext(AuthContext);
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilityList, setAvailabilityList] = useState([]);
  const [filterTypes, setFilterTypes] = useState({
    availability: true,
    chores: true,
    shopping: true,
    help: true
  });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    date: formatDateStr(new Date()),
    startTime: '09:00',
    endTime: '17:00',
    status: 'available',
    title: '',
    visibility: 'household',
    recurrenceType: 'none',
    dayOfWeek: 1
  });

  const currentRange = viewMode === 'week' ? getWeekRange(currentDate) : getMonthRange(currentDate);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await getMyAvailability({
        startDate: currentRange.startDate,
        endDate: currentRange.endDate
      });
      const rawList = res.data.data.availability || [];
      // Strict client-side filter ensuring only current logged-in user's events are stored
      const strictlyMyList = rawList.filter(item => {
        if (!user || !user._id) return true;
        const itemUserId = item.userId?._id ? item.userId._id.toString() : item.userId ? item.userId.toString() : user._id.toString();
        return itemUserId === user._id.toString();
      });
      setAvailabilityList(strictlyMyList);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [currentDate, viewMode]);

  // Date Navigation Handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setMonth(next.getMonth() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const isOwnItem = (item) => {
    if (!item || !user) return false;
    const itemUserId = item.userId?._id ? item.userId._id.toString() : item.userId ? item.userId.toString() : user._id;
    return itemUserId === user._id.toString();
  };

  const openAddModal = (targetDateStr = null) => {
    const dStr = targetDateStr || formatDateStr(currentDate);
    const d = new Date(dStr);
    setEditingItem(null);
    setFormData({
      date: dStr,
      startTime: '09:00',
      endTime: '17:00',
      status: 'available',
      title: '',
      visibility: 'household',
      recurrenceType: 'none',
      dayOfWeek: d.getDay()
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item, e) => {
    if (e) e.stopPropagation();
    if (!isOwnItem(item)) {
      return; // Cannot edit or delete events belonging to other people
    }
    setEditingItem(item);
    setFormData({
      date: item.effectiveDate || item.date || formatDateStr(new Date()),
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status,
      title: item.title || '',
      visibility: item.visibility || 'household',
      recurrenceType: item.recurrenceType || 'none',
      dayOfWeek: item.dayOfWeek !== undefined ? item.dayOfWeek : 1
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingItem && !isOwnItem(editingItem)) {
      setModalError('You can only edit your own availability blocks');
      return;
    }
    setModalError('');
    setSaving(true);

    try {
      if (editingItem) {
        await updateAvailability(editingItem._id, formData);
      } else {
        await createAvailability(formData);
      }
      setIsModalOpen(false);
      fetchAvailability();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId, e) => {
    if (e) e.stopPropagation();
    const targetItem = editingItem || availabilityList.find(i => i._id === itemId);
    if (targetItem && !isOwnItem(targetItem)) {
      alert('You can only delete your own availability blocks');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this availability block?')) return;
    try {
      await deleteAvailability(itemId);
      if (isModalOpen) setIsModalOpen(false);
      fetchAvailability();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete availability block');
    }
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Personal Calendar</h1>
          <p className="text-stone-600 mt-1">Manage your weekly schedule, free time, and busy periods.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="bg-stone-200 p-1 rounded-lg flex text-xs font-semibold">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'week' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'month' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Month
            </button>
          </div>

          <Button onClick={() => openAddModal()}>
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Availability
          </Button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" onClick={handlePrev}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <Button variant="secondary" size="sm" onClick={handleNext}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>

        <h2 className="text-lg font-semibold text-stone-800">
          {viewMode === 'week' ? (
            <>
              {currentRange.days[0].toLocaleDateString('default', { month: 'short', day: 'numeric' })} –{' '}
              {currentRange.days[6].toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
            </>
          ) : (
            currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })
          )}
        </h2>

        <div className="flex items-center gap-3 text-xs flex-wrap">
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

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : viewMode === 'week' ? (
        /* Week View Grid */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {currentRange.days.map((dayObj) => {
            const dateStr = formatDateStr(dayObj);
            const isToday = formatDateStr(new Date()) === dateStr;
            const items = availabilityList
              .filter((item) => item.effectiveDate === dateStr)
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
                key={dateStr}
                className={`bg-white border rounded-xl overflow-hidden flex flex-col min-h-[360px] transition-shadow hover:shadow-xs ${
                  isToday ? 'border-teal-400 ring-1 ring-teal-400' : 'border-stone-200'
                }`}
              >
                {/* Day Header */}
                <div
                  className={`px-3 py-2.5 border-b flex items-center justify-between ${
                    isToday ? 'bg-teal-50/70 border-teal-100' : 'bg-stone-50 border-stone-100'
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                      {DAYS_OF_WEEK[dayObj.getDay()].slice(0, 3)}
                    </span>
                    <span
                      className={`text-base font-bold ${
                        isToday ? 'text-teal-700' : 'text-stone-800'
                      }`}
                    >
                      {dayObj.getDate()}
                    </span>
                  </div>

                  <button
                    onClick={() => openAddModal(dateStr)}
                    title="Add to this day"
                    className="text-stone-400 hover:text-teal-600 p-1 rounded-md hover:bg-stone-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Day Content */}
                <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                  {items.length === 0 ? (
                    <div
                      onClick={() => openAddModal(dateStr)}
                      className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-stone-200 rounded-lg hover:border-teal-300 hover:bg-teal-50/20 cursor-pointer transition-colors group"
                    >
                      <span className="text-xs text-stone-400 group-hover:text-teal-600">
                        + Free all day
                      </span>
                    </div>
                  ) : (
                    items.map((item) => {
                      const isChore = item.isChore || item.status === 'chore';
                      const isShopping = item.isShopping || item.status === 'shopping';
                      const isHelp = item.isHelp || item.status === 'help' || (item.title && item.title.startsWith('🤝 Help'));
                      const isAvailable = item.status === 'available';
                      const isChoreCompleted = item.isCompleted || item.choreStatus === 'completed';

                      return (
                        <div
                          key={item._id + (item.effectiveDate || '')}
                          onClick={(e) => {
                            if (isChore) {
                              window.location.href = `/chores/${item._id}`;
                            } else if (isShopping) {
                              window.location.href = `/shopping`;
                            } else if (isHelp) {
                              window.location.href = item.helpRequestId ? `/help/${item.helpRequestId}` : `/help`;
                            } else {
                              openEditModal(item, e);
                            }
                          }}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-2xs relative group ${
                            isChore
                              ? isChoreCompleted
                                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                                : 'bg-amber-50/60 border-amber-300 text-amber-900'
                              : isShopping
                              ? 'bg-sky-50/60 border-sky-300 text-sky-900'
                              : isHelp
                              ? 'bg-indigo-50/60 border-indigo-300 text-indigo-900'
                              : isAvailable
                              ? 'bg-teal-50/60 border-teal-200 text-teal-900'
                              : 'bg-rose-50/60 border-rose-200 text-rose-900'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-semibold mb-1">
                            <span className="flex items-center gap-1">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isChore
                                    ? isChoreCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                                    : isShopping
                                    ? 'bg-sky-500'
                                    : isHelp
                                    ? 'bg-indigo-500'
                                    : isAvailable ? 'bg-teal-500' : 'bg-rose-500'
                                }`}
                              ></span>
                              {formatTime12h(item.startTime)} – {formatTime12h(item.endTime)}
                            </span>

                            <div className="flex items-center gap-1">
                              {isChore && (
                                <span className={`text-3xs px-1.5 py-0.2 rounded font-bold uppercase ${
                                  isChoreCompleted ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                                }`}>
                                  {isChoreCompleted ? 'Done' : 'Chore'}
                                </span>
                              )}
                              {isShopping && (
                                <span className="text-3xs px-1.5 py-0.2 rounded font-bold uppercase bg-sky-200 text-sky-800">
                                  Shopping
                                </span>
                              )}
                              {isHelp && (
                                <span className="text-3xs px-1.5 py-0.2 rounded font-bold uppercase bg-indigo-200 text-indigo-800">
                                  Help
                                </span>
                              )}
                              {item.isRecurringInstance && (
                                <span title="Weekly Recurring" className="text-stone-500">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </span>
                              )}
                              {item.visibility === 'private' && (
                                <span title="Private block (Hidden from roommates)" className="text-stone-500">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs font-medium truncate">
                            {item.title || (isAvailable ? 'Available' : 'Busy')}
                          </p>

                          {isOwnItem(item) && (
                            <div className="hidden group-hover:flex absolute right-1.5 bottom-1.5 space-x-1 bg-white/90 rounded px-1 py-0.5 border border-stone-200">
                              <button
                                onClick={(e) => openEditModal(item, e)}
                                className="text-stone-500 hover:text-teal-600 p-0.5"
                                title="Edit"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => handleDelete(item._id, e)}
                                className="text-stone-500 hover:text-rose-600 p-0.5"
                                title="Delete"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Month View Grid */
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-7 bg-stone-50 border-b border-stone-200 text-center py-2.5 text-xs font-semibold text-stone-600 uppercase tracking-wider">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d}>{d.slice(0, 3)}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-stone-100">
            {currentRange.days.map(({ date, isCurrentMonth }) => {
              const dateStr = formatDateStr(date);
              const isToday = formatDateStr(new Date()) === dateStr;
              const items = availabilityList.filter((item) => item.effectiveDate === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => openAddModal(dateStr)}
                  className={`min-h-[110px] p-2 flex flex-col cursor-pointer transition-colors hover:bg-stone-50/80 ${
                    !isCurrentMonth ? 'bg-stone-50/40 text-stone-400' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-teal-600 text-white' : 'text-stone-700'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {items.length > 0 && (
                      <span className="text-3xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full font-medium">
                        {items.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 flex-1 overflow-y-auto">
                    {items.slice(0, 3).map((item) => (
                      <div
                        key={item._id + (item.effectiveDate || '')}
                        onClick={(e) => isOwnItem(item) && openEditModal(item, e)}
                        className={`text-3xs px-1.5 py-1 rounded truncate border ${
                          isOwnItem(item) ? 'cursor-pointer' : 'cursor-default'
                        } ${
                          item.status === 'available'
                            ? 'bg-teal-50 border-teal-200 text-teal-800'
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                      >
                        {formatTime12h(item.startTime)} {item.title || item.status}
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-3xs text-stone-500 font-medium pl-1">
                        +{items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Availability Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Availability Block' : 'Add Availability'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {modalError}
            </div>
          )}

          {/* Recurrence Type Selector */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Schedule Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, recurrenceType: 'none' }))}
                className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  formData.recurrenceType === 'none'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                One-Time Date
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, recurrenceType: 'weekly' }))}
                className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  formData.recurrenceType === 'weekly'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Weekly Recurring
              </button>
            </div>
          </div>

          {/* Date or Day Of Week */}
          {formData.recurrenceType === 'none' ? (
            <Input
              label="Date"
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          ) : (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Day of Week
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData((prev) => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm"
              >
                {DAYS_OF_WEEK.map((dayName, idx) => (
                  <option key={dayName} value={idx}>
                    Every {dayName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
              required
            />
            <Input
              label="End Time"
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
              required
            />
          </div>

          {/* Status (Available vs Busy) */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status: 'available' }))}
                className={`py-2 px-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  formData.status === 'available'
                    ? 'bg-teal-50 border-teal-500 text-teal-800'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                Available
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status: 'busy' }))}
                className={`py-2 px-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  formData.status === 'busy'
                    ? 'bg-rose-50 border-rose-500 text-rose-800'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Busy
              </button>
            </div>
          </div>

          {/* Title */}
          <Input
            label="Title / Note (Optional)"
            id="title"
            type="text"
            placeholder="e.g. Work, College, Free Evening"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          />

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Privacy & Visibility
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, visibility: 'household' }))}
                className={`py-2 px-3 rounded-lg border text-xs font-medium text-left transition-colors ${
                  formData.visibility === 'household'
                    ? 'bg-teal-50 border-teal-500 text-teal-900'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span className="font-semibold block">Household</span>
                <span className="text-3xs text-stone-500">Roommates see full title</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, visibility: 'private' }))}
                className={`py-2 px-3 rounded-lg border text-xs font-medium text-left transition-colors ${
                  formData.visibility === 'private'
                    ? 'bg-teal-50 border-teal-500 text-teal-900'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span className="font-semibold block">Private</span>
                <span className="text-3xs text-stone-500">Roommates only see Busy/Free</span>
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            {editingItem && isOwnItem(editingItem) ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleDelete(editingItem._id)}
              >
                Delete
              </Button>
            ) : (
              <div></div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={saving}>
                {editingItem ? 'Save Changes' : 'Create Block'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
