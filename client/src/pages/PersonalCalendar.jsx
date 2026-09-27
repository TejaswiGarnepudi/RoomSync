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

export default function PersonalCalendar() {
  const { user } = useContext(AuthContext);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'week'
  const [availabilityList, setAvailabilityList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    startDate: formatDateStr(new Date()),
    endDate: formatDateStr(new Date()),
    startTime: '09:00',
    endTime: '17:00',
    status: 'available',
    isRecurring: false,
    recurrenceDays: []
  });

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await getMyAvailability();
      setAvailabilityList(res.data.data.availability || []);
    } catch (err) {
      console.error('Failed to load availability:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await createAvailability(formData);
      setIsModalOpen(false);
      setFormData({
        title: '',
        startDate: formatDateStr(new Date()),
        endDate: formatDateStr(new Date()),
        startTime: '09:00',
        endTime: '17:00',
        status: 'available',
        isRecurring: false,
        recurrenceDays: []
      });
      fetchAvailability();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save availability');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this schedule block?')) return;
    try {
      await deleteAvailability(id);
      fetchAvailability();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
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
        {/* Header */}
        <div className="pb-6 border-b border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
              My Schedule & Availability
            </h1>
            <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88] mt-1 tracking-[-0.02em]">
              Set when you are free or busy so RoomSync can smartly assign chores and coordinate house favors.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            + Add Availability Block
          </Button>
        </div>

        {/* Availability List Card */}
        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
            <h2 className="text-base font-medium tracking-[-0.03em] text-[#1A1A1A] dark:text-white">
              Scheduled Blocks ({availabilityList.length})
            </h2>
          </div>

          {availabilityList.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#E8E7E1] dark:border-[#2A2A28] rounded-2xl bg-[#FAF9F5] dark:bg-[#181816]">
              <div className="text-3xl mb-2 opacity-75">🗓️</div>
              <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-white">No availability blocks yet</h3>
              <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-1">
                Add when you work, have classes, or are free for household tasks.
              </p>
              <Button size="sm" onClick={() => setIsModalOpen(true)} className="mt-4">
                Add Block &rarr;
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[#E8E7E1]/60 dark:divide-[#2A2A28]">
              {availabilityList.map((block) => (
                <div key={block._id} className="py-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                      block.status === 'available'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {block.status === 'available' ? 'Free' : 'Busy'}
                    </span>
                    <div>
                      <span className="font-medium text-sm text-[#1A1A1A] dark:text-white block">
                        {block.title || (block.status === 'available' ? 'Available' : 'Busy')}
                      </span>
                      <span className="text-[11px] text-[#71716E] dark:text-[#8E8E88]">
                        {block.startDate} • {formatTime12h(block.startTime)} – {formatTime12h(block.endTime)}
                        {block.isRecurring && ' (Recurring weekly)'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(block._id)}
                    className="text-xs text-[#71716E] dark:text-[#8E8E88] hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Availability Block">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <Input
            label="Block Title"
            value={formData.title}
            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Free for evening chores, College lectures, Office hours"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
              >
                <option value="available" className="bg-white dark:bg-[#141413]">Free / Available</option>
                <option value="busy" className="bg-white dark:bg-[#141413]">Busy / Unavailable</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value, endDate: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Save Block &rarr;
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
