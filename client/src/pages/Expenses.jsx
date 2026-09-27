import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMyHousehold } from '../services/householdService';
import {
  getExpenses,
  createExpense,
  deleteExpense,
  getHouseholdBalances,
  getSimplifiedSettlements,
  recordPayment
} from '../services/expenseService';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'groceries', label: '🛒 Groceries' },
  { value: 'rent', label: '🏠 Rent' },
  { value: 'utilities', label: '💡 Utilities' },
  { value: 'household', label: '🧼 Supplies' },
  { value: 'food', label: '🍕 Food & Dining' },
  { value: 'other', label: '📦 Other' }
];

export default function Expenses() {
  const { user } = useContext(AuthContext);
  const [household, setHousehold] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'groceries',
    amount: '',
    paidBy: '',
    expenseDate: new Date().toISOString().split('T')[0],
    splitType: 'equal'
  });
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterCategory, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const householdRes = await getMyHousehold();
      setHousehold(householdRes.data.data.household);

      const params = {};
      if (filterCategory !== 'all') params.category = filterCategory;
      if (filterStatus !== 'all') params.status = filterStatus;

      const [expensesRes, balancesRes, settlementsRes] = await Promise.all([
        getExpenses(params),
        getHouseholdBalances(),
        getSimplifiedSettlements()
      ]);

      setExpenses(expensesRes.data.data.expenses || []);
      setBalances(balancesRes.data.data);
      setSettlements(settlementsRes.data.data.settlements || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expense data');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    if (!household) return;
    const defaultPaidBy = user?._id || '';
    const initialParticipants = household.members.map(m => m._id);

    setFormData({
      title: '',
      description: '',
      category: 'groceries',
      amount: '',
      paidBy: defaultPaidBy,
      expenseDate: new Date().toISOString().split('T')[0],
      splitType: 'equal'
    });
    setSelectedParticipants(initialParticipants);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const toggleParticipant = (memberId) => {
    if (selectedParticipants.includes(memberId)) {
      if (selectedParticipants.length === 1) return;
      setSelectedParticipants(selectedParticipants.filter(id => id !== memberId));
    } else {
      setSelectedParticipants([...selectedParticipants, memberId]);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setFormError('');

    const totalAmount = Number(formData.amount);
    if (!formData.title.trim()) {
      setFormError('Please enter a title');
      return;
    }
    if (!totalAmount || totalAmount <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }
    if (selectedParticipants.length === 0) {
      setFormError('Select at least one participant');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        amount: totalAmount,
        paidBy: formData.paidBy || user?._id,
        expenseDate: formData.expenseDate,
        splitType: 'equal',
        participants: selectedParticipants.map(id => ({ user: id }))
      };

      await createExpense(payload);
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && expenses.length === 0) {
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
              Expenses & Shared Bills
            </h1>
            <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88] mt-1 tracking-[-0.02em]">
              Transparent cost splitting and automated debt minimization so everyone settles up easily.
            </p>
          </div>

          <Button onClick={openAddModal}>
            + Log Shared Expense
          </Button>
        </div>

        {/* Debt Minimization / Simplified Settlements Banner */}
        {settlements.length > 0 && (
          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-medium uppercase tracking-wider text-[#1A1A1A] dark:text-white">
                  Debt Minimization Settle-Up Suggestions
                </h3>
              </div>
              <span className="text-xs text-[#71716E] dark:text-[#8E8E88]">
                {settlements.length} transfers needed to zero out all balances
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              {settlements.map((s, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] flex items-center justify-between"
                >
                  <div className="text-xs">
                    <span className="font-medium text-[#1A1A1A] dark:text-white">
                      {s.from?.name || 'Roommate'}
                    </span>{' '}
                    <span className="text-[#71716E] dark:text-[#8E8E88]">pays</span>{' '}
                    <span className="font-medium text-[#1A1A1A] dark:text-white">
                      {s.to?.name || 'Roommate'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{s.amount?.toFixed(2) || s.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
            <h2 className="text-base font-medium tracking-tight text-[#1A1A1A] dark:text-white">
              Logged Expenses ({expenses.length})
            </h2>

            <div className="flex items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-full text-[#1A1A1A] dark:text-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value} className="bg-white dark:bg-[#141413]">{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#E8E7E1] dark:border-[#2A2A28] rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] text-xs text-[#71716E] dark:text-[#8E8E88]">
              No expenses logged yet.
            </div>
          ) : (
            <div className="divide-y divide-[#E8E7E1]/60 dark:divide-[#2A2A28]">
              {expenses.map((exp) => (
                <Link
                  key={exp._id}
                  to={`/expenses/${exp._id}`}
                  className="py-4 flex items-center justify-between gap-4 text-xs hover:bg-[#FAF9F5] dark:hover:bg-[#181816] px-3 rounded-2xl transition-colors block group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-10 rounded-2xl bg-[#EAE8E1] dark:bg-[#1E1E1C] flex items-center justify-center text-base shrink-0">
                      💰
                    </div>
                    <div className="truncate">
                      <span className="font-medium text-sm text-[#1A1A1A] dark:text-white block truncate">
                        {exp.title}
                      </span>
                      <span className="text-[11px] text-[#71716E] dark:text-[#8E8E88]">
                        Paid by {exp.paidBy?.name || 'Roommate'} • {exp.expenseDate || exp.date || 'Recent'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="font-semibold text-sm text-[#1A1A1A] dark:text-white block">
                        ₹{exp.amount?.toFixed(2) || exp.amount}
                      </span>
                      <span className="text-[10px] text-[#71716E] dark:text-[#8E8E88]">
                        {exp.participants?.length || 0} participants
                      </span>
                    </div>
                    <span className="text-xs text-[#71716E] dark:text-[#8E8E88] group-hover:translate-x-0.5 transition-transform">
                      &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log Household Expense">
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900/50">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
          <Input
            label="Expense Title"
            value={formData.title}
            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. WiFi Bill, Groceries, Kitchen Paper Towels"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
              >
                {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                  <option key={c.value} value={c.value} className="bg-white dark:bg-[#141413]">{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">
              Who paid?
            </label>
            <select
              value={formData.paidBy}
              onChange={(e) => setFormData(p => ({ ...p, paidBy: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
            >
              {household?.members?.map((m) => (
                <option key={m._id} value={m._id} className="bg-white dark:bg-[#141413]">{m.name} {m._id === user?._id && '(You)'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">
              Split between roommates
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {household?.members?.map((m) => {
                const isSelected = selectedParticipants.includes(m._id);
                return (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => toggleParticipant(m._id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
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
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Split Expense &rarr;
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
