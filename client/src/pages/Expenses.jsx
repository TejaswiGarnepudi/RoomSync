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
  { value: 'household', label: '🧼 Household Supplies' },
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
  const [customShares, setCustomShares] = useState({});
  const [percentageShares, setPercentageShares] = useState({});
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

      setExpenses(expensesRes.data.data.expenses);
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
    
    // Equal percentage distribution default
    const count = initialParticipants.length;
    const equalPct = count > 0 ? (100 / count).toFixed(1) : 0;
    const initialPct = {};
    initialParticipants.forEach(id => {
      initialPct[id] = equalPct;
    });

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
    setCustomShares({});
    setPercentageShares(initialPct);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const toggleParticipant = (memberId) => {
    if (selectedParticipants.includes(memberId)) {
      if (selectedParticipants.length === 1) return; // Must have at least 1
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

    let payloadParticipants = [];

    if (formData.splitType === 'equal') {
      payloadParticipants = selectedParticipants.map(id => ({ user: id }));
    } else if (formData.splitType === 'custom') {
      let sum = 0;
      for (const id of selectedParticipants) {
        const share = Number(customShares[id] || 0);
        sum += share;
        payloadParticipants.push({ user: id, shareAmount: share });
      }
      if (Math.abs(sum - totalAmount) > 0.05) {
        setFormError(`Custom shares total ₹${sum.toFixed(2)}, which must equal total ₹${totalAmount.toFixed(2)}`);
        return;
      }
    } else if (formData.splitType === 'percentage') {
      let pctSum = 0;
      for (const id of selectedParticipants) {
        const pct = Number(percentageShares[id] || 0);
        pctSum += pct;
        payloadParticipants.push({ user: id, percentage: pct });
      }
      if (Math.abs(pctSum - 100) > 0.1) {
        setFormError(`Percentages total ${pctSum.toFixed(1)}%, which must equal 100%`);
        return;
      }
    }

    try {
      setSubmitting(true);
      await createExpense({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        amount: totalAmount,
        paidBy: formData.paidBy,
        expenseDate: formData.expenseDate,
        splitType: formData.splitType,
        participants: payloadParticipants
      });
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleSettleDebt = async (debt) => {
    // Find expenses where debtor owes creditor to mark shares as paid
    try {
      // Find an expense where debtor has pending status
      for (const exp of expenses) {
        if (exp.paidBy?._id === debt.toUserId && exp.status !== 'settled') {
          const part = exp.participants.find(p => (p.user?._id || p.user) === debt.fromUserId && p.paidStatus === 'pending');
          if (part) {
            await recordPayment(exp._id, { userId: debt.fromUserId });
          }
        }
      }
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settlement');
    }
  };

  if (loading && !household) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const myBalance = balances?.userBalance;

  return (
    <AppLayout>
      <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Shared Expenses</h1>
          <p className="text-stone-500 text-sm mt-1">Track shared costs, split bills fairly, and settle balances seamlessly.</p>
        </div>
        <Button variant="primary" onClick={openAddModal}>
          + Add Expense
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm border border-rose-200">
          {error}
        </div>
      )}

      {/* Household Money Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white p-5 border-stone-200">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Household Total Spend</p>
          <p className="text-2xl font-bold text-stone-900 mt-2">
            ₹{(balances?.householdTotalSpend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-stone-400 mt-1">All shared expenses recorded</p>
        </Card>

        <Card className="bg-white p-5 border-stone-200">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">You Are Owed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            +₹{(myBalance?.pendingReceivable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-stone-400 mt-1">Pending payments from roommates</p>
        </Card>

        <Card className="bg-white p-5 border-stone-200">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">You Owe</p>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            -₹{(myBalance?.pendingOwed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-stone-400 mt-1">Your pending share of expenses</p>
        </Card>

        <Card className={`p-5 border ${
          (myBalance?.netBalance || 0) > 0
            ? 'bg-emerald-50/50 border-emerald-200'
            : (myBalance?.netBalance || 0) < 0
            ? 'bg-amber-50/50 border-amber-200'
            : 'bg-white border-stone-200'
        }`}>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Your Net Balance</p>
          <p className={`text-2xl font-bold mt-2 ${
            (myBalance?.netBalance || 0) > 0
              ? 'text-emerald-700'
              : (myBalance?.netBalance || 0) < 0
              ? 'text-amber-700'
              : 'text-stone-700'
          }`}>
            {(myBalance?.netBalance || 0) >= 0 ? '+' : ''}
            ₹{(myBalance?.netBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {(myBalance?.netBalance || 0) > 0
              ? 'You will receive money'
              : (myBalance?.netBalance || 0) < 0
              ? 'You need to settle up'
              : 'You are all settled!'}
          </p>
        </Card>
      </div>

      {/* Simplified Settlements & Balances Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simplified Debt Settlements */}
        <Card className="lg:col-span-1 p-5 border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-stone-900">Suggested Settlements</h2>
              <p className="text-xs text-stone-500">Smart minimum transactions</p>
            </div>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
              Algorithm
            </span>
          </div>

          {settlements.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-sm">
              <span className="text-2xl block mb-2">🎉</span>
              All household debts are settled!
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((debt, idx) => {
                const isMeDebtor = debt.fromUserId === user?._id;
                const isMeCreditor = debt.toUserId === user?._id;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      isMeDebtor
                        ? 'bg-amber-50/60 border-amber-200'
                        : isMeCreditor
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-stone-800">
                        <span className={isMeDebtor ? 'font-bold text-amber-900' : ''}>
                          {isMeDebtor ? 'You' : debt.fromUserName}
                        </span>
                        <span className="text-stone-400 mx-1.5">pays</span>
                        <span className={isMeCreditor ? 'font-bold text-emerald-900' : ''}>
                          {isMeCreditor ? 'You' : debt.toUserName}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500">
                        Amount: <span className="font-semibold text-stone-900">₹{debt.amount.toFixed(2)}</span>
                      </div>
                    </div>

                    {(isMeDebtor || isMeCreditor) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSettleDebt(debt)}
                      >
                        Settle
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Member Balances Table */}
        <Card className="lg:col-span-2 p-5 border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-stone-900">Roommate Balances</h2>
              <p className="text-xs text-stone-500">Breakdown per household member</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="pb-3">Roommate</th>
                  <th className="pb-3">Total Paid</th>
                  <th className="pb-3">Total Share</th>
                  <th className="pb-3 text-right">Net Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {balances?.memberBalances?.map((m) => {
                  const isCurrent = m.userId === user?._id;
                  return (
                    <tr key={m.userId} className={isCurrent ? 'bg-teal-50/30' : ''}>
                      <td className="py-3 font-medium text-stone-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold flex items-center justify-center">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        {m.name} {isCurrent && <span className="text-xs text-teal-600 font-normal">(You)</span>}
                      </td>
                      <td className="py-3 text-stone-600">₹{m.totalPaid.toFixed(2)}</td>
                      <td className="py-3 text-stone-600">₹{m.totalShare.toFixed(2)}</td>
                      <td className={`py-3 text-right font-semibold ${
                        m.netBalance > 0
                          ? 'text-emerald-600'
                          : m.netBalance < 0
                          ? 'text-amber-600'
                          : 'text-stone-500'
                      }`}>
                        {m.netBalance >= 0 ? '+' : ''}₹{m.netBalance.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Filter & Expenses List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg font-bold text-stone-900">Expense History</h2>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-stone-300 rounded-lg text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-stone-300 rounded-lg text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="settled">Settled</option>
            </select>
          </div>
        </div>

        {expenses.length === 0 ? (
          <Card className="p-12 text-center border-stone-200">
            <span className="text-4xl block mb-3">🧾</span>
            <h3 className="text-base font-semibold text-stone-800">No expenses recorded yet</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Add shared rent, grocery runs, utilities, or household items to split them with your roommates.
            </p>
            <Button variant="primary" size="sm" className="mt-4" onClick={openAddModal}>
              Add First Expense
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expenses.map(expense => {
              const myParticipant = expense.participants?.find(
                p => (p.user?._id || p.user) === user?._id
              );
              const isPayer = expense.paidBy?._id === user?._id;

              return (
                <Card key={expense._id} className="p-5 border-stone-200 hover:border-stone-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-medium bg-stone-100 text-stone-700 rounded-md capitalize">
                          {expense.category}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                          expense.status === 'settled'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {expense.status === 'settled' ? 'Settled' : 'Pending'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-stone-900 mt-2">
                        {expense.title}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Paid by <span className="font-semibold text-stone-700">{expense.paidBy?.name || 'Unknown'}</span> on {expense.expenseDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-stone-900">
                        ₹{expense.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-stone-400 uppercase tracking-wider font-medium mt-0.5">
                        {expense.splitType} split
                      </div>
                    </div>
                  </div>

                  {/* My Share indicator */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      {isPayer ? (
                        <span className="text-emerald-700 font-medium">
                          You paid full bill
                        </span>
                      ) : myParticipant ? (
                        <span className={myParticipant.paidStatus === 'paid' ? 'text-emerald-600 font-medium' : 'text-amber-700 font-medium'}>
                          Your share: ₹{myParticipant.shareAmount.toFixed(2)} ({myParticipant.paidStatus})
                        </span>
                      ) : (
                        <span className="text-stone-400">Not involved</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/expenses/${expense._id}`}
                        className="text-teal-600 hover:text-teal-700 font-semibold"
                      >
                        View Details →
                      </Link>
                      {isPayer && (
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="text-rose-500 hover:text-rose-700 ml-2"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Shared Expense"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs border border-rose-200">
              {formError}
            </div>
          )}

          <Input
            label="Expense Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Monthly Wifi, Grocery run, Paper towels"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="groceries">🛒 Groceries</option>
                <option value="rent">🏠 Rent</option>
                <option value="utilities">💡 Utilities</option>
                <option value="household">🧼 Household</option>
                <option value="food">🍕 Food & Dining</option>
                <option value="other">📦 Other</option>
              </select>
            </div>

            <Input
              label="Total Amount (₹)"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Paid By</label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                {household?.members?.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} {m._id === user?._id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Expense Date"
              type="date"
              value={formData.expenseDate}
              onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Split Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['equal', 'custom', 'percentage'].map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setFormData({ ...formData, splitType: st })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg capitalize border transition-all ${
                    formData.splitType === st
                      ? 'bg-teal-50 border-teal-600 text-teal-700 font-semibold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {st} Split
                </button>
              ))}
            </div>
          </div>

          {/* Participant selection & live split preview */}
          <div className="space-y-2 pt-2 border-t border-stone-200">
            <label className="block text-xs font-semibold text-stone-700">Split Among Roommates</label>
            <div className="space-y-2">
              {household?.members?.map((m) => {
                const isSelected = selectedParticipants.includes(m._id);
                const count = selectedParticipants.length;
                const total = Number(formData.amount) || 0;
                const equalShare = count > 0 ? (total / count).toFixed(2) : 0;

                return (
                  <div
                    key={m._id}
                    className="flex items-center justify-between p-2.5 bg-stone-50 rounded-lg border border-stone-200"
                  >
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-stone-800">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleParticipant(m._id)}
                        className="rounded-sm text-teal-600 focus:ring-teal-500"
                      />
                      <span>{m.name} {m._id === user?._id ? '(You)' : ''}</span>
                    </label>

                    {isSelected && (
                      <div className="text-right">
                        {formData.splitType === 'equal' && (
                          <span className="text-xs font-semibold text-teal-700">
                            ₹{equalShare}
                          </span>
                        )}

                        {formData.splitType === 'custom' && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-stone-500">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={customShares[m._id] || ''}
                              onChange={(e) => setCustomShares({ ...customShares, [m._id]: e.target.value })}
                              className="w-20 px-2 py-1 text-xs border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-right font-medium"
                            />
                          </div>
                        )}

                        {formData.splitType === 'percentage' && (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={percentageShares[m._id] || ''}
                              onChange={(e) => setPercentageShares({ ...percentageShares, [m._id]: e.target.value })}
                              className="w-16 px-2 py-1 text-xs border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-right font-medium"
                            />
                            <span className="text-xs text-stone-500">%</span>
                            <span className="text-xs text-stone-400 ml-1">
                              (₹{((total * (Number(percentageShares[m._id]) || 0)) / 100).toFixed(2)})
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
            >
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
    </AppLayout>
  );
}
