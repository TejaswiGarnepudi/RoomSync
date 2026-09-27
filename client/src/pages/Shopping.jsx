import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';
import { getMyHousehold } from '../services/householdService';
import {
  getShoppingLists,
  getShoppingListById,
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
  addItemToList,
  updateShoppingItem,
  deleteShoppingItem,
  getRecurringItems,
  createRecurringItem,
  updateRecurringItem,
  deleteRecurringItem,
  getUpcomingShopping,
  generateExpenseFromList
} from '../services/shoppingService';

const CATEGORIES = [
  { id: 'groceries', name: 'Groceries', icon: '🛒' },
  { id: 'household', name: 'Household', icon: '🧼' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { id: 'bathroom', name: 'Bathroom', icon: '🧴' },
  { id: 'snacks', name: 'Snacks', icon: '🍿' },
  { id: 'beverages', name: 'Beverages', icon: '🧃' },
  { id: 'other', name: 'Other', icon: '📦' }
];

const getCategoryMeta = (catId) => {
  return CATEGORIES.find(c => c.id === catId) || { id: 'other', name: 'Other', icon: '📦' };
};

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

export default function Shopping() {
  const { user } = useContext(AuthContext);
  const [household, setHousehold] = useState(null);
  const [activeTab, setActiveTab] = useState('lists'); // 'lists' | 'recurring'

  // Data states
  const [shoppingLists, setShoppingLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedListItems, setSelectedListItems] = useState([]);
  const [recurringItems, setRecurringItems] = useState([]);
  const [dueRecurring, setDueRecurring] = useState({ dueItems: [], upcomingItems: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Quick Add Input for Items
  const [quickItemName, setQuickItemName] = useState('');
  const [quickItemCategory, setQuickItemCategory] = useState('groceries');
  const [quickItemQty, setQuickItemQty] = useState(1);
  const [quickItemUnit, setQuickItemUnit] = useState('pcs');

  // Modals
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [newListData, setNewListData] = useState({
    name: '',
    description: '',
    shoppingDate: formatDateStr(new Date()),
    shoppingTime: '17:00',
    assignedTo: ''
  });

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: '',
    quantity: 1,
    unit: 'pcs',
    category: 'groceries',
    priority: 'medium',
    estimatedPrice: ''
  });

  const [isAddRecurringOpen, setIsAddRecurringOpen] = useState(false);
  const [newRecurringData, setNewRecurringData] = useState({
    itemName: '',
    quantity: 1,
    unit: 'pcs',
    category: 'groceries',
    estimatedPrice: '',
    recurrenceType: 'monthly',
    interval: 1,
    nextDueDate: formatDateStr(new Date())
  });

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async (preferredListId = null) => {
    try {
      setLoading(true);
      setError('');
      const householdRes = await getMyHousehold();
      setHousehold(householdRes.data.data.household);

      const [listsRes, recurringRes, upcomingRes] = await Promise.all([
        getShoppingLists(),
        getRecurringItems(),
        getUpcomingShopping()
      ]);

      const lists = listsRes.data.data.shoppingLists || [];
      setShoppingLists(lists);
      setRecurringItems(recurringRes.data.data.recurringItems || []);
      setDueRecurring(upcomingRes.data.data || { dueItems: [], upcomingItems: [] });

      if (lists.length > 0) {
        const targetId = preferredListId || (selectedList?._id && lists.some(l => l._id === selectedList._id) ? selectedList._id : lists[0]._id);
        await loadListDetails(targetId);
      } else {
        setSelectedList(null);
        setSelectedListItems([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load grocery data');
    } finally {
      setLoading(false);
    }
  };

  const loadListDetails = async (listId) => {
    try {
      const res = await getShoppingListById(listId);
      setSelectedList(res.data.data.shoppingList);
      setSelectedListItems(res.data.data.items || []);
    } catch (err) {
      console.error('Failed to load list details:', err);
    }
  };

  const handleSelectList = (list) => {
    setSelectedList(list);
    loadListDetails(list._id);
  };

  // Quick Add Item inline
  const handleQuickAddItem = async (e) => {
    e.preventDefault();
    if (!quickItemName.trim() || !selectedList) return;

    try {
      await addItemToList(selectedList._id, {
        name: quickItemName.trim(),
        quantity: Number(quickItemQty) || 1,
        unit: quickItemUnit || 'pcs',
        category: quickItemCategory || 'groceries'
      });
      setQuickItemName('');
      loadListDetails(selectedList._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item');
    }
  };

  // Toggle item purchased status
  const handleToggleItem = async (item) => {
    try {
      const newStatus = item.status === 'purchased' ? 'pending' : 'purchased';
      await updateShoppingItem(item._id, { status: newStatus });
      setSelectedListItems(prev => prev.map(i => i._id === item._id ? { ...i, status: newStatus } : i));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update item');
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId) => {
    try {
      await deleteShoppingItem(itemId);
      setSelectedListItems(prev => prev.filter(i => i._id !== itemId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  // Create new list
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListData.name.trim()) return;

    try {
      const payload = {
        name: newListData.name.trim(),
        description: newListData.description?.trim() || '',
        shoppingDate: newListData.shoppingDate || formatDateStr(new Date()),
        shoppingTime: newListData.shoppingTime || '17:00'
      };
      if (newListData.assignedTo && newListData.assignedTo.trim() !== '') {
        payload.assignedTo = newListData.assignedTo;
      }

      const res = await createShoppingList(payload);
      setIsCreateListOpen(false);
      setNewListData({
        name: '',
        description: '',
        shoppingDate: formatDateStr(new Date()),
        shoppingTime: '17:00',
        assignedTo: ''
      });
      loadAllData(res.data.data.shoppingList._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create list');
    }
  };

  // Delete list
  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this shopping list and its items?')) return;
    try {
      await deleteShoppingList(listId);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete list');
    }
  };

  // Convert completed list to expense
  const handleGenerateExpense = async (e) => {
    e.preventDefault();
    if (!selectedList) return;
    try {
      setSubmittingExpense(true);
      await generateExpenseFromList(selectedList._id, {
        totalAmount: Number(expenseAmount),
        paidBy: expensePaidBy || user?._id
      });
      setExpenseModalOpen(false);
      alert('Expense successfully created and added to household splits!');
      loadListDetails(selectedList._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  // Add Recurring Item
  const handleCreateRecurring = async (e) => {
    e.preventDefault();
    if (!newRecurringData.itemName.trim()) return;

    try {
      await createRecurringItem(newRecurringData);
      setIsAddRecurringOpen(false);
      setNewRecurringData({
        itemName: '',
        quantity: 1,
        unit: 'pcs',
        category: 'groceries',
        estimatedPrice: '',
        recurrenceType: 'monthly',
        interval: 1,
        nextDueDate: formatDateStr(new Date())
      });
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add recurring item');
    }
  };

  // Delete Recurring Item
  const handleDeleteRecurring = async (id) => {
    if (!window.confirm('Remove this recurring restock rule?')) return;
    try {
      await deleteRecurringItem(id);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading && shoppingLists.length === 0) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const purchasedCount = selectedListItems.filter(i => i.status === 'purchased').length;
  const totalItemsCount = selectedListItems.length;

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="pb-6 border-b border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.04em] text-[#1A1A1A] dark:text-white">
              Groceries & Household Shopping
            </h1>
            <p className="text-xs sm:text-sm text-[#71716E] dark:text-[#8E8E88] mt-1 tracking-[-0.02em]">
              Collaborative shopping lists, automated recurring pantry restocks, and 1-click expense splitting.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setIsAddRecurringOpen(true)}>
              + Recurring Rule
            </Button>
            <Button size="sm" onClick={() => setIsCreateListOpen(true)}>
              + New List
            </Button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('lists')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeTab === 'lists'
                ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-xs'
                : 'text-[#71716E] dark:text-[#8E8E88] hover:bg-[#EAE8E1] dark:hover:bg-[#1E1E1C]'
            }`}
          >
            Shopping Lists ({shoppingLists.length})
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              activeTab === 'recurring'
                ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] shadow-xs'
                : 'text-[#71716E] dark:text-[#8E8E88] hover:bg-[#EAE8E1] dark:hover:bg-[#1E1E1C]'
            }`}
          >
            Recurring Pantry Restocks ({recurringItems.length})
          </button>
        </div>

        {activeTab === 'lists' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar: Lists Overview */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88]">
                    Household Lists
                  </span>
                  <button
                    onClick={() => setIsCreateListOpen(true)}
                    className="text-xs font-medium text-[#1A1A1A] dark:text-white hover:underline cursor-pointer"
                  >
                    + New
                  </button>
                </div>

                {shoppingLists.length === 0 ? (
                  <p className="text-xs text-[#71716E] dark:text-[#8E8E88] py-4 text-center">No shopping lists created yet.</p>
                ) : (
                  <div className="space-y-2">
                    {shoppingLists.map((list) => {
                      const isSelected = selectedList?._id === list._id;
                      return (
                        <div
                          key={list._id}
                          onClick={() => handleSelectList(list)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#FAF9F5] dark:bg-[#181816] border-[#1A1A1A] dark:border-white shadow-2xs'
                              : 'bg-white dark:bg-[#141413] border-[#E8E7E1] dark:border-[#2A2A28] hover:bg-[#FAF9F5] dark:hover:bg-[#181816]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-xs text-[#1A1A1A] dark:text-white truncate">
                              {list.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              list.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-[#EAE8E1] dark:bg-[#1E1E1C] text-[#71716E] dark:text-[#8E8E88]'
                            }`}>
                              {list.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#71716E] dark:text-[#8E8E88] mt-2">
                            <span>{list.shoppingDate ? formatDateStr(new Date(list.shoppingDate)) : 'Flexible'}</span>
                            <span>{list.assignedTo?.name ? `Assigned: ${list.assignedTo.name}` : 'Unassigned'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Active List Content & Checklist */}
            <div className="lg:col-span-8 space-y-6">
              {selectedList ? (
                <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  {/* List Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-medium tracking-tight text-[#1A1A1A] dark:text-white">
                          {selectedList.name}
                        </h2>
                        <span className="text-xs text-[#71716E] dark:text-[#8E8E88]">
                          ({purchasedCount}/{totalItemsCount} bought)
                        </span>
                      </div>
                      {selectedList.description && (
                        <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5">{selectedList.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setExpenseAmount('');
                          setExpensePaidBy(user?._id || '');
                          setExpenseModalOpen(true);
                        }}
                      >
                        Split Bill &rarr;
                      </Button>
                      <button
                        onClick={() => handleDeleteList(selectedList._id)}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline px-2 py-1 cursor-pointer"
                      >
                        Delete List
                      </button>
                    </div>
                  </div>

                  {/* Quick Add Item Inline Bar */}
                  <form onSubmit={handleQuickAddItem} className="flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28]">
                    <input
                      type="text"
                      placeholder="Add grocery item (e.g. Oat Milk, Eggs, Dishwasher pods)..."
                      value={quickItemName}
                      onChange={(e) => setQuickItemName(e.target.value)}
                      className="w-full sm:flex-1 px-4 py-2 text-xs bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white placeholder-[#71716E] focus:outline-none"
                    />
                    <select
                      value={quickItemCategory}
                      onChange={(e) => setQuickItemCategory(e.target.value)}
                      className="px-3 py-2 text-xs bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id} className="bg-white dark:bg-[#141413]">{c.icon} {c.name}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-xs font-medium cursor-pointer"
                    >
                      + Add Item
                    </button>
                  </form>

                  {/* Checklist Items */}
                  {selectedListItems.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[#E8E7E1] dark:border-[#2A2A28] rounded-2xl text-xs text-[#71716E] dark:text-[#8E8E88]">
                      No items in this list yet. Type above to add groceries.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E8E7E1]/60 dark:divide-[#2A2A28]">
                      {selectedListItems.map((item) => {
                        const isDone = item.status === 'purchased';
                        const cat = getCategoryMeta(item.category);
                        return (
                          <div
                            key={item._id}
                            className={`py-3 flex items-center justify-between gap-3 text-xs rounded-xl px-2 transition-colors ${
                              isDone ? 'opacity-60 bg-[#FAF9F5]/40 dark:bg-[#181816]/40' : 'hover:bg-[#FAF9F5] dark:hover:bg-[#181816]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={() => handleToggleItem(item)}
                                className={`size-5 rounded-md flex items-center justify-center text-xs transition-colors cursor-pointer ${
                                  isDone
                                    ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                                    : 'border border-[#71716E]/40 dark:border-white/30'
                                }`}
                              >
                                {isDone && '✓'}
                              </button>
                              <span className="text-sm">{cat.icon}</span>
                              <span className={`font-medium ${isDone ? 'line-through text-[#71716E] dark:text-[#888880]' : 'text-[#1A1A1A] dark:text-white'}`}>
                                {item.name}
                              </span>
                              <span className="text-[11px] text-[#71716E] dark:text-[#8E8E88]">
                                ({item.quantity} {item.unit || 'pcs'})
                              </span>
                            </div>

                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="text-xs text-[#71716E] hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-12 text-center text-xs text-[#71716E] dark:text-[#8E8E88]">
                  Select a shopping list on the left or create a new one.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Recurring Pantry Restocks View */
          <div className="bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E7E1] dark:border-[#2A2A28]">
              <div>
                <h2 className="text-lg font-medium text-[#1A1A1A] dark:text-white">Automated Recurring Restocks</h2>
                <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5">
                  Items that your household regularly runs out of and needs to replenish.
                </p>
              </div>
              <Button size="sm" onClick={() => setIsAddRecurringOpen(true)}>
                + Add Rule
              </Button>
            </div>

            {recurringItems.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#E8E7E1] dark:border-[#2A2A28] rounded-2xl text-xs text-[#71716E] dark:text-[#8E8E88]">
                No recurring rules setup yet (e.g. oat milk weekly, toilet rolls monthly).
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recurringItems.map((r) => (
                  <div
                    key={r._id}
                    className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-[#1A1A1A] dark:text-white">{r.itemName}</span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full capitalize">
                          {r.recurrenceType}
                        </span>
                      </div>
                      <span className="text-xs text-[#71716E] dark:text-[#8E8E88] block mt-1">
                        Qty: {r.quantity} {r.unit || 'pcs'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#E8E7E1] dark:border-[#2A2A28] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#71716E] dark:text-[#8E8E88]">
                        Next: {r.nextDueDate ? formatDateStr(new Date(r.nextDueDate)) : 'Upcoming'}
                      </span>
                      <button
                        onClick={() => handleDeleteRecurring(r._id)}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create List Modal */}
      <Modal isOpen={isCreateListOpen} onClose={() => setIsCreateListOpen(false)} title="Create New Shopping List">
        <form onSubmit={handleCreateList} className="space-y-4 text-xs">
          <Input
            label="List Name"
            value={newListData.name}
            onChange={(e) => setNewListData(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Weekly Trader Joe's Run, Hardware Supplies"
            required
          />

          <Input
            label="Note / Store (Optional)"
            value={newListData.description}
            onChange={(e) => setNewListData(p => ({ ...p, description: e.target.value }))}
            placeholder="e.g. Target downtown, organic only"
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsCreateListOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create List &rarr;
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Recurring Rule Modal */}
      <Modal isOpen={isAddRecurringOpen} onClose={() => setIsAddRecurringOpen(false)} title="Add Recurring Restock Rule">
        <form onSubmit={handleCreateRecurring} className="space-y-4 text-xs">
          <Input
            label="Item Name"
            value={newRecurringData.itemName}
            onChange={(e) => setNewRecurringData(p => ({ ...p, itemName: e.target.value }))}
            placeholder="e.g. Cold Brew, Oat Milk, Dish Soap"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Frequency</label>
              <select
                value={newRecurringData.recurrenceType}
                onChange={(e) => setNewRecurringData(p => ({ ...p, recurrenceType: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
              >
                <option value="weekly" className="bg-white dark:bg-[#141413]">Weekly</option>
                <option value="biweekly" className="bg-white dark:bg-[#141413]">Every 2 Weeks</option>
                <option value="monthly" className="bg-white dark:bg-[#141413]">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">Quantity</label>
              <input
                type="number"
                min="1"
                value={newRecurringData.quantity}
                onChange={(e) => setNewRecurringData(p => ({ ...p, quantity: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAddRecurringOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Rule &rarr;
            </Button>
          </div>
        </form>
      </Modal>

      {/* Convert List to Expense Split Modal */}
      <Modal isOpen={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Split Grocery Bill with Roommates">
        <form onSubmit={handleGenerateExpense} className="space-y-4 text-xs">
          <p className="text-xs text-[#71716E] dark:text-[#8E8E88]">
            Convert <strong>{selectedList?.name}</strong> into a shared expense. RoomSync will split it equally across flatmates.
          </p>

          <Input
            label="Total Bill Amount (₹)"
            type="number"
            step="0.01"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            placeholder="e.g. 1850.00"
            required
          />

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5">
              Who paid for this?
            </label>
            <select
              value={expensePaidBy}
              onChange={(e) => setExpensePaidBy(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF9F5] dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-xl text-[#1A1A1A] dark:text-white"
            >
              {household?.members?.map((m) => (
                <option key={m._id} value={m._id} className="bg-white dark:bg-[#141413]">{m.name} {m._id === user?._id && '(You)'}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submittingExpense}>
              Split Expense &rarr;
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
