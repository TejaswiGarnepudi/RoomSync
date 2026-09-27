import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getExpenseById, recordPayment, deleteExpense } from '../services/expenseService';
import AppLayout from '../layouts/AppLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ExpenseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    fetchExpense();
  }, [id]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getExpenseById(id);
      setExpense(res.data.data.expense);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (userId) => {
    try {
      setSettling(true);
      const res = await recordPayment(id, { userId });
      setExpense(res.data.data.expense);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSettling(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
      navigate('/expenses');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense');
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

  if (error || !expense) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Link to="/expenses" className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white">
            &larr; Back to Expenses
          </Link>
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-2xl border border-rose-200 dark:border-rose-900/50">
            {error || 'Expense not found'}
          </div>
        </div>
      </AppLayout>
    );
  }

  const isPayer = expense.paidBy?._id === user?._id;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/expenses" className="text-xs font-medium text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white transition-colors flex items-center gap-1.5">
            &larr; Back to Expenses
          </Link>
          {isPayer && (
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Delete Expense
            </Button>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-7 sm:p-9 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88]">
                {expense.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#1A1A1A] dark:text-white">
                {expense.title}
              </h1>
              <p className="text-xs text-[#71716E] dark:text-[#8E8E88]">
                Paid by <strong className="text-[#1A1A1A] dark:text-white">{expense.paidBy?.name}</strong> on {expense.expenseDate || expense.date}
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A] dark:text-white">
                ₹{expense.amount?.toFixed(2) || expense.amount}
              </span>
              <span className="text-xs text-[#71716E] dark:text-[#8E8E88] block mt-0.5">
                Total amount
              </span>
            </div>
          </div>

          {/* Breakdown / Splits List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[#1A1A1A] dark:text-white">Roommate Share Breakdown</h3>
            <div className="divide-y divide-[#E8E7E1]/60 dark:divide-[#2A2A28]">
              {expense.participants?.map((p, idx) => {
                const participantUser = p.user;
                const isPaid = p.paid;
                const isCurrentUser = participantUser?._id === user?._id;

                return (
                  <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#1A1A1A] dark:text-white font-semibold flex items-center justify-center text-xs">
                        {participantUser?.name ? participantUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <span className="font-medium text-[#1A1A1A] dark:text-white block">
                          {participantUser?.name} {isCurrentUser && '(You)'}
                        </span>
                        <span className="text-[11px] text-[#71716E] dark:text-[#8E8E88]">
                          Share: ₹{p.share?.toFixed(2) || p.share}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        isPaid
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {isPaid ? 'Settled' : 'Unpaid'}
                      </span>

                      {!isPaid && isPayer && participantUser?._id !== user?._id && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleMarkAsPaid(participantUser._id)}
                          isLoading={settling}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
