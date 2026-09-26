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
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (error || !expense) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Link to="/expenses" className="text-teal-600 hover:text-teal-700 font-semibold text-sm">
            ← Back to Expenses
          </Link>
          <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm border border-rose-200">
            {error || 'Expense not found'}
          </div>
        </div>
      </AppLayout>
    );
  }

  const isPayer = expense.paidBy?._id === user?._id;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/expenses" className="text-stone-500 hover:text-stone-800 text-sm font-medium flex items-center gap-1">
          ← Back to Expenses
        </Link>
        {isPayer && (
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete Expense
          </Button>
        )}
      </div>

      {/* Main Expense Info Card */}
      <Card className="p-6 border-stone-200">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold bg-stone-100 text-stone-700 rounded-md capitalize">
                {expense.category}
              </span>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                expense.status === 'settled'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {expense.status === 'settled' ? 'Fully Settled' : 'Payment Pending'}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-stone-900 mt-3">{expense.title}</h1>
            {expense.description && (
              <p className="text-sm text-stone-600 mt-2">{expense.description}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone-500">
              <div>
                Paid by: <span className="font-semibold text-stone-800">{expense.paidBy?.name}</span>
              </div>
              <div>
                Date: <span className="font-semibold text-stone-800">{expense.expenseDate}</span>
              </div>
              <div>
                Split Model: <span className="font-semibold text-stone-800 uppercase">{expense.splitType}</span>
              </div>
            </div>
          </div>

          <div className="sm:text-right bg-stone-50 p-4 rounded-xl border border-stone-200 sm:min-w-[160px]">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Bill</p>
            <p className="text-3xl font-extrabold text-stone-900 mt-1">
              ₹{expense.amount.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {/* Breakdown per participant */}
      <Card className="p-6 border-stone-200">
        <h2 className="text-base font-bold text-stone-900 mb-4">Participant Breakdown</h2>

        <div className="divide-y divide-stone-100">
          {expense.participants?.map((p) => {
            const pUser = p.user;
            const isMe = pUser?._id === user?._id;
            const isPaid = p.paidStatus === 'paid';
            const isPayerOfExpense = pUser?._id === expense.paidBy?._id;

            return (
              <div key={pUser?._id || pUser} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center">
                    {pUser?.name ? pUser.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">
                      {pUser?.name} {isMe && <span className="text-xs text-teal-600 font-normal">(You)</span>}
                      {isPayerOfExpense && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded-sm">
                          Payer
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {p.percentage ? `${p.percentage}% share • ` : ''}
                      Share: <span className="font-semibold text-stone-800">₹{p.shareAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    isPaid
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {isPaid ? 'Paid' : 'Pending'}
                  </span>

                  {!isPaid && (isMe || isPayer) && (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={settling}
                      onClick={() => handleMarkAsPaid(pUser?._id || pUser)}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
    </AppLayout>
  );
}
