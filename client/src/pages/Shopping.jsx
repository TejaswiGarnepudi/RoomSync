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
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'household', name: 'Household', icon: '🧼', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'bathroom', name: 'Bathroom', icon: '🧴', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'snacks', name: 'Snacks', icon: '🍿', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'beverages', name: 'Beverages', icon: '🧃', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'other', name: 'Other', icon: '📦', color: 'bg-stone-50 text-stone-700 border-stone-200' }
];

const getCategoryMeta = (catId) => {
  return CATEGORIES.find(c => c.id === catId) || { id: 'other', name: 'Other', icon: '📦', color: 'bg-stone-50 text-stone-700 border-stone-200' };
};

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
      setError(err.response?.data?.message || 'Failed to load shopping data');
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
      console.error('Failed to load list items:', err);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListData.name.trim()) return;

    try {
      const res = await createShoppingList(newListData);
      setIsCreateListOpen(false);
      setNewListData({
        name: '',
        description: '',
        shoppingDate: formatDateStr(new Date()),
        shoppingTime: '17:00',
        assignedTo: ''
      });
      const created = res.data.data.shoppingList;
      await loadAllData(created._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create shopping list');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedList) return;
    try {
      const res = await updateShoppingList(selectedList._id, { status: newStatus });
      setSelectedList(res.data.data.shoppingList);
      setShoppingLists(prev => prev.map(l => l._id === selectedList._id ? res.data.data.shoppingList : l));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this shopping list and all items?')) return;
    try {
      await deleteShoppingList(listId);
      setSelectedList(null);
      setSelectedListItems([]);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete shopping list');
    }
  };

  const handleQuickAddItem = async (e) => {
    e.preventDefault();
    if (!selectedList || !quickItemName.trim()) return;

    try {
      await addItemToList(selectedList._id, {
        name: quickItemName.trim(),
        quantity: Number(quickItemQty) || 1,
        unit: quickItemUnit || 'pcs',
        category: quickItemCategory || 'groceries',
        priority: 'medium',
        estimatedPrice: 0
      });
      setQuickItemName('');
      loadListDetails(selectedList._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleAddItemModal = async (e) => {
    e.preventDefault();
    if (!selectedList || !newItemData.name.trim()) return;

    try {
      await addItemToList(selectedList._id, {
        name: newItemData.name.trim(),
        quantity: Number(newItemData.quantity) || 1,
        unit: newItemData.unit || 'pcs',
        category: newItemData.category || 'groceries',
        priority: newItemData.priority || 'medium',
        estimatedPrice: Number(newItemData.estimatedPrice) || 0
      });
      setIsAddItemOpen(false);
      setNewItemData({
        name: '',
        quantity: 1,
        unit: 'pcs',
        category: 'groceries',
        priority: 'medium',
        estimatedPrice: ''
      });
      loadListDetails(selectedList._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleToggleItemStatus = async (item) => {
    const isNowPurchased = item.status !== 'purchased';
    let actualPrice = item.actualPrice;

    if (isNowPurchased && (!actualPrice || actualPrice === 0)) {
      const inputVal = window.prompt(`Actual price for "${item.name}" (₹):`, item.estimatedPrice > 0 ? String(item.estimatedPrice) : '');
      if (inputVal !== null && inputVal.trim() !== '') {
        actualPrice = Number(inputVal) || 0;
      }
    }

    try {
      await updateShoppingItem(item._id, {
        status: isNowPurchased ? 'purchased' : 'needed',
        actualPrice
      });
      loadListDetails(selectedList._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteShoppingItem(itemId);
      loadListDetails(selectedList._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleCreateRecurring = async (e) => {
    e.preventDefault();
    if (!newRecurringData.itemName.trim()) return;

    try {
      await createRecurringItem({
        itemName: newRecurringData.itemName.trim(),
        quantity: Number(newRecurringData.quantity) || 1,
        unit: newRecurringData.unit || 'pcs',
        category: newRecurringData.category || 'groceries',
        estimatedPrice: Number(newRecurringData.estimatedPrice) || 0,
        recurrenceType: newRecurringData.recurrenceType,
        interval: Number(newRecurringData.interval) || 1,
        nextDueDate: newRecurringData.nextDueDate
      });
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
      const [recRes, upRes] = await Promise.all([getRecurringItems(), getUpcomingShopping()]);
      setRecurringItems(recRes.data.data.recurringItems || []);
      setDueRecurring(upRes.data.data || { dueItems: [], upcomingItems: [] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create recurring staple');
    }
  };

  const handleToggleRecurringActive = async (item) => {
    try {
      await updateRecurringItem(item._id, { active: !item.active });
      const [recRes, upRes] = await Promise.all([getRecurringItems(), getUpcomingShopping()]);
      setRecurringItems(recRes.data.data.recurringItems || []);
      setDueRecurring(upRes.data.data || { dueItems: [], upcomingItems: [] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (!window.confirm('Delete this recurring staple?')) return;
    try {
      await deleteRecurringItem(id);
      const [recRes, upRes] = await Promise.all([getRecurringItems(), getUpcomingShopping()]);
      setRecurringItems(recRes.data.data.recurringItems || []);
      setDueRecurring(upRes.data.data || { dueItems: [], upcomingItems: [] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete staple');
    }
  };

  const addDueItemToList = async (dueItem) => {
    if (!selectedList) {
      setIsCreateListOpen(true);
      return;
    }
    try {
      await addItemToList(selectedList._id, {
        name: dueItem.itemName,
        quantity: dueItem.quantity || 1,
        unit: dueItem.unit || 'pcs',
        category: dueItem.category || 'groceries',
        estimatedPrice: dueItem.estimatedPrice || 0
      });
      loadListDetails(selectedList._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to list');
    }
  };

  const openGenerateExpenseModal = () => {
    if (!selectedList) return;
    const total = selectedListItems.reduce((acc, it) => {
      const price = it.actualPrice > 0 ? it.actualPrice : (it.estimatedPrice > 0 ? it.estimatedPrice : 0);
      return acc + (price * (it.quantity || 1));
    }, 0);

    setExpenseAmount(total > 0 ? total.toFixed(2) : '');
    setExpensePaidBy(user?._id || '');
    setExpenseModalOpen(true);
  };

  const handleGenerateExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedList || !expenseAmount) return;

    try {
      setSubmittingExpense(true);
      await generateExpenseFromList(selectedList._id, {
        amount: Number(expenseAmount),
        paidBy: expensePaidBy
      });
      setExpenseModalOpen(false);
      await loadAllData(selectedList._id);
      alert('Shared household expense generated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  if (loading && !household) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  // Calculations for active list
  const totalItems = selectedListItems.length;
  const purchasedItems = selectedListItems.filter(i => i.status === 'purchased').length;
  const neededItems = totalItems - purchasedItems;
  const progressPercent = totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;

  const totalEstCost = selectedListItems.reduce((acc, i) => acc + ((i.estimatedPrice || 0) * (i.quantity || 1)), 0);
  const totalActCost = selectedListItems.reduce((acc, i) => acc + ((i.actualPrice || 0) * (i.quantity || 1)), 0);

  // Filtered lists for sidebar
  const filteredLists = shoppingLists.filter(l => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return l.name.toLowerCase().includes(q) || l.assignedTo?.name?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Household Shopping</h1>
          <p className="text-stone-600 mt-1 text-sm">
            Collaborate on grocery runs, automate household staples, and split receipts instantly.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'lists' ? (
            <Button variant="primary" onClick={() => setIsCreateListOpen(true)}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Shopping List
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setIsAddRecurringOpen(true)}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Recurring Staple
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm border border-rose-200 mb-6">
          {error}
        </div>
      )}

      {/* Overview Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-white border-stone-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg">
              🛒
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Active Lists</p>
              <p className="text-xl font-bold text-stone-900 mt-0.5">
                {shoppingLists.filter(l => l.status !== 'completed').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-stone-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg">
              📝
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Items Needed</p>
              <p className="text-xl font-bold text-amber-800 mt-0.5">{neededItems}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-stone-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
              ✅
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Purchased</p>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">{purchasedItems}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-stone-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg">
              🔄
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Recurring Staples</p>
              <p className="text-xl font-bold text-indigo-800 mt-0.5">{recurringItems.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Due Recurring Items Banner */}
      {dueRecurring.dueItems?.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                🔔
              </span>
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  {dueRecurring.dueItems.length} Recurring Essential(s) Due for Refill!
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Items have reached their scheduled restock date. Click to add them to your active shopping list.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {dueRecurring.dueItems.map(item => (
                <button
                  key={item._id}
                  onClick={() => addDueItemToList(item)}
                  className="px-3 py-1.5 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-lg text-xs font-semibold text-amber-900 shadow-2xs flex items-center gap-1.5 transition-all"
                  title="Add to current list"
                >
                  <span>+</span>
                  <span>{item.itemName}</span>
                  <span className="text-amber-600 text-3xs">({item.quantity} {item.unit})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Switcher & Filter Controls */}
      <div className="bg-white border border-stone-200 rounded-xl p-3 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('lists')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'lists'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🛒 Shopping Lists ({shoppingLists.length})
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'recurring'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🔄 Recurring Staples ({recurringItems.length})
          </button>
        </div>

        {activeTab === 'lists' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-44">
              <Input
                placeholder="Search lists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-0 text-xs py-1.5"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-medium text-stone-700 bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SHOPPING LISTS CANVAS */}
      {/* ========================================================================= */}
      {activeTab === 'lists' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Lists Drawer (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Household Lists
              </span>
              <button
                onClick={() => setIsCreateListOpen(true)}
                className="text-xs text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1"
              >
                + New List
              </button>
            </div>

            {filteredLists.length === 0 ? (
              <Card className="p-8 text-center border-stone-200">
                <span className="text-3xl block mb-2">📋</span>
                <p className="text-sm font-semibold text-stone-800">No lists found</p>
                <p className="text-xs text-stone-500 mt-1">Create a new shopping list to get started.</p>
                <Button size="sm" className="mt-3" onClick={() => setIsCreateListOpen(true)}>
                  Create List
                </Button>
              </Card>
            ) : (
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {filteredLists.map((list) => {
                  const isSelected = selectedList?._id === list._id;

                  return (
                    <div
                      key={list._id}
                      onClick={() => loadListDetails(list._id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-sm font-bold tracking-tight ${isSelected ? 'text-teal-950' : 'text-stone-900'}`}>
                          {list.name}
                        </h3>

                        <span className={`px-2 py-0.5 text-3xs font-bold uppercase rounded-full border ${
                          list.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : list.status === 'in_progress'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}>
                          {list.status.replace('_', ' ')}
                        </span>
                      </div>

                      {list.description && (
                        <p className="text-xs text-stone-500 line-clamp-1 mt-1">{list.description}</p>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                        <div className="flex items-center gap-1.5">
                          <span>📅</span>
                          <span>{list.shoppingDate}</span>
                          {list.shoppingTime && <span className="text-stone-400 font-mono">({formatTime12h(list.shoppingTime)})</span>}
                        </div>

                        {list.assignedTo ? (
                          <div className="flex items-center gap-1 font-medium text-stone-700">
                            <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-3xs font-bold flex items-center justify-center">
                              {list.assignedTo.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[80px]">{list.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-3xs text-stone-400">Open claim</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Selected List Work Area (8 Cols) */}
          <div className="lg:col-span-8">
            {!selectedList ? (
              <Card className="p-16 text-center border-stone-200">
                <span className="text-4xl block mb-3">🛒</span>
                <h3 className="text-base font-bold text-stone-800">Select a shopping list</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Pick a shopping trip from the left or create a brand new list for your household.
                </p>
                <Button size="sm" className="mt-4" onClick={() => setIsCreateListOpen(true)}>
                  + Create New List
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* List Header Hero Card */}
                <Card className="p-5 border-stone-200 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                          {selectedList.name}
                        </h2>

                        {/* Status dropdown */}
                        <select
                          value={selectedList.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-stone-300 bg-white focus:ring-1 focus:ring-teal-500 text-stone-700 cursor-pointer"
                        >
                          <option value="planned">📅 Planned</option>
                          <option value="in_progress">🛒 In Progress</option>
                          <option value="completed">✅ Completed</option>
                        </select>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-stone-500">
                        <span>
                          📅 <strong>Date:</strong> {selectedList.shoppingDate}{' '}
                          {selectedList.shoppingTime && `(${formatTime12h(selectedList.shoppingTime)})`}
                        </span>
                        <span>
                          👤 <strong>Assigned:</strong>{' '}
                          {selectedList.assignedTo ? selectedList.assignedTo.name : 'Open to anyone'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={openGenerateExpenseModal}
                        disabled={selectedListItems.length === 0}
                      >
                        🧾 Split as Expense
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteList(selectedList._id)}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Progress & Financial Bar */}
                  <div className="mt-5 pt-4 border-t border-stone-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-800">Checklist Progress:</span>
                        <span className="font-semibold text-teal-700">
                          {purchasedItems} of {totalItems} items ({progressPercent}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-stone-600">
                        {totalEstCost > 0 && (
                          <span>Est: <strong>₹{totalEstCost.toFixed(2)}</strong></span>
                        )}
                        {totalActCost > 0 && (
                          <span className="text-emerald-700 font-bold">
                            Actual: ₹{totalActCost.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Quick Add Bar */}
                <form
                  onSubmit={handleQuickAddItem}
                  className="p-3 bg-stone-50/80 border border-stone-200 rounded-2xl flex flex-wrap items-center gap-2 shadow-2xs"
                >
                  <div className="flex-1 min-w-[180px]">
                    <input
                      type="text"
                      placeholder="Add item (e.g., Almond Milk, Brown Bread)..."
                      value={quickItemName}
                      onChange={(e) => setQuickItemName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      placeholder="Qty"
                      value={quickItemQty}
                      onChange={(e) => setQuickItemQty(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-center"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="text"
                      placeholder="Unit"
                      value={quickItemUnit}
                      onChange={(e) => setQuickItemUnit(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-center"
                    />
                  </div>

                  <select
                    value={quickItemCategory}
                    onChange={(e) => setQuickItemCategory(e.target.value)}
                    className="px-2.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>

                  <Button type="submit" size="sm" variant="primary">
                    + Add
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsAddItemOpen(true)}
                    title="Open full item details modal"
                  >
                    More Options...
                  </Button>
                </form>

                {/* Items Checklist Card */}
                <Card className="p-5 border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Shopping Checklist ({selectedListItems.length})
                    </span>

                    <span className="text-3xs text-stone-400">
                      Click checkbox to mark as purchased
                    </span>
                  </div>

                  {selectedListItems.length === 0 ? (
                    <div className="py-12 text-center text-stone-400">
                      <span className="text-3xl block mb-2">🛒</span>
                      <p className="text-sm font-semibold text-stone-600">This list is empty</p>
                      <p className="text-xs text-stone-400 mt-1">Use the quick add bar above to populate items.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 space-y-1">
                      {selectedListItems.map((item) => {
                        const isPurchased = item.status === 'purchased';
                        const catMeta = getCategoryMeta(item.category);

                        return (
                          <div
                            key={item._id}
                            className={`py-3 px-3 rounded-xl flex items-center justify-between gap-3 transition-all ${
                              isPurchased
                                ? 'bg-emerald-50/40 opacity-75'
                                : 'hover:bg-stone-50/70'
                            }`}
                          >
                            <label className="flex items-center gap-3 cursor-pointer flex-1 select-none">
                              <input
                                type="checkbox"
                                checked={isPurchased}
                                onChange={() => handleToggleItemStatus(item)}
                                className="w-4 h-4 rounded-md text-teal-600 focus:ring-teal-500 cursor-pointer"
                              />

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-bold ${isPurchased ? 'line-through text-stone-400 font-medium' : 'text-stone-900'}`}>
                                    {item.name}
                                  </span>

                                  <span className={`px-2 py-0.5 text-3xs font-semibold rounded-md border ${catMeta.color}`}>
                                    {catMeta.icon} {catMeta.name}
                                  </span>

                                  {item.priority === 'high' && !isPurchased && (
                                    <span className="px-1.5 py-0.2 text-3xs font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200 rounded-sm">
                                      High
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs text-stone-500 flex items-center gap-2">
                                  <span>
                                    Qty: <strong className="text-stone-700">{item.quantity} {item.unit}</strong>
                                  </span>
                                  {item.estimatedPrice > 0 && (
                                    <span>• Est: ₹{item.estimatedPrice}</span>
                                  )}
                                  {item.actualPrice > 0 && (
                                    <span className="text-emerald-700 font-semibold">
                                      • Paid: ₹{item.actualPrice}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDeleteItem(item._id)}
                                className="p-1.5 text-stone-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Remove item"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RECURRING STAPLES */}
      {/* ========================================================================= */}
      {activeTab === 'recurring' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-stone-900 tracking-tight">Recurring Household Staples</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Automatically triggers restock alerts for essentials like milk, cooking oil, detergent, or toiletries.
              </p>
            </div>

            <Button variant="primary" size="sm" onClick={() => setIsAddRecurringOpen(true)}>
              + Add Recurring Staple
            </Button>
          </div>

          {recurringItems.length === 0 ? (
            <Card className="p-16 text-center border-stone-200">
              <span className="text-4xl block mb-2">🔄</span>
              <h3 className="text-base font-bold text-stone-800">No recurring essentials set up</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Keep the apartment stocked with automatic schedule reminders for household goods.
              </p>
              <Button size="sm" className="mt-4" onClick={() => setIsAddRecurringOpen(true)}>
                Add First Staple
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recurringItems.map((item) => {
                const catMeta = getCategoryMeta(item.category);
                const isDue = item.nextDueDate <= formatDateStr(new Date());

                return (
                  <Card
                    key={item._id}
                    className={`p-5 border flex flex-col justify-between transition-all hover:shadow-xs ${
                      isDue
                        ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/60'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-3xs font-bold rounded-md border ${catMeta.color}`}>
                          {catMeta.icon} {catMeta.name}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isDue && (
                            <span className="px-2 py-0.5 text-3xs font-bold uppercase bg-amber-500 text-white rounded-full">
                              Due Today
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleRecurringActive(item)}
                            className={`px-2 py-0.5 text-3xs font-bold uppercase rounded-full border transition-colors ${
                              item.active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-stone-100 text-stone-500 border-stone-200'
                            }`}
                          >
                            {item.active ? 'Active' : 'Paused'}
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-stone-900 mt-1">
                        {item.itemName}
                      </h3>

                      <p className="text-xs text-stone-500 mt-0.5">
                        Amount: <strong className="text-stone-800">{item.quantity} {item.unit}</strong>
                        {item.estimatedPrice > 0 && ` • Approx ₹${item.estimatedPrice}`}
                      </p>

                      <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1">
                        <div className="text-stone-600">
                          Frequency: <strong className="capitalize font-semibold text-stone-800">Every {item.interval > 1 ? item.interval : ''} {item.recurrenceType.replace('_', ' ')}</strong>
                        </div>
                        <div className="text-stone-600">
                          Next Due Date: <strong className="font-semibold text-stone-900">{item.nextDueDate}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => addDueItemToList(item)}
                      >
                        + Add to List
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRecurring(item._id)}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Modal: Create Shopping List */}
      <Modal
        isOpen={isCreateListOpen}
        onClose={() => setIsCreateListOpen(false)}
        title="Create Shopping List"
      >
        <form onSubmit={handleCreateList} className="space-y-4">
          <Input
            label="List Name"
            value={newListData.name}
            onChange={(e) => setNewListData({ ...newListData, name: e.target.value })}
            placeholder="e.g. Weekend Groceries, Costco Haul, Party Drinks"
            required
          />

          <Input
            label="Description (Optional)"
            value={newListData.description}
            onChange={(e) => setNewListData({ ...newListData, description: e.target.value })}
            placeholder="e.g. Vegetarian only, buy organic vegetables"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Planned Date"
              type="date"
              value={newListData.shoppingDate}
              onChange={(e) => setNewListData({ ...newListData, shoppingDate: e.target.value })}
              required
            />
            <Input
              label="Planned Time"
              type="time"
              value={newListData.shoppingTime}
              onChange={(e) => setNewListData({ ...newListData, shoppingTime: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Assigned Roommate
            </label>
            <select
              value={newListData.assignedTo}
              onChange={(e) => setNewListData({ ...newListData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 text-stone-800"
            >
              <option value="">Open to anyone (Unassigned)</option>
              {household?.members?.map(m => (
                <option key={m._id} value={m._id}>{m.name} {m._id === user?._id ? '(You)' : ''}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button type="button" variant="ghost" onClick={() => setIsCreateListOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create List
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Full Add Item */}
      <Modal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        title={`Add Item to ${selectedList?.name || 'List'}`}
      >
        <form onSubmit={handleAddItemModal} className="space-y-4">
          <Input
            label="Item Name"
            value={newItemData.name}
            onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
            placeholder="e.g. Extra Virgin Olive Oil, Dish Soap, Coffee Beans"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity"
              type="number"
              min="0.1"
              step="any"
              value={newItemData.quantity}
              onChange={(e) => setNewItemData({ ...newItemData, quantity: e.target.value })}
              required
            />
            <Input
              label="Unit"
              value={newItemData.unit}
              onChange={(e) => setNewItemData({ ...newItemData, unit: e.target.value })}
              placeholder="e.g. pcs, kg, liters, box"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
              <select
                value={newItemData.category}
                onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 text-stone-800"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Priority</label>
              <select
                value={newItemData.priority}
                onChange={(e) => setNewItemData({ ...newItemData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 text-stone-800"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>
          </div>

          <Input
            label="Estimated Price (₹, optional)"
            type="number"
            step="0.01"
            value={newItemData.estimatedPrice}
            onChange={(e) => setNewItemData({ ...newItemData, estimatedPrice: e.target.value })}
            placeholder="0.00"
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddItemOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Recurring Staple */}
      <Modal
        isOpen={isAddRecurringOpen}
        onClose={() => setIsAddRecurringOpen(false)}
        title="Add Recurring Essential Staple"
      >
        <form onSubmit={handleCreateRecurring} className="space-y-4">
          <Input
            label="Item Name"
            value={newRecurringData.itemName}
            onChange={(e) => setNewRecurringData({ ...newRecurringData, itemName: e.target.value })}
            placeholder="e.g. Cooking Oil, Toilet Paper, Dish Soap"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity"
              type="number"
              min="0.1"
              step="any"
              value={newRecurringData.quantity}
              onChange={(e) => setNewRecurringData({ ...newRecurringData, quantity: e.target.value })}
              required
            />
            <Input
              label="Unit"
              value={newRecurringData.unit}
              onChange={(e) => setNewRecurringData({ ...newRecurringData, unit: e.target.value })}
              placeholder="e.g. bottles, pack, kg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Recurrence Type</label>
              <select
                value={newRecurringData.recurrenceType}
                onChange={(e) => setNewRecurringData({ ...newRecurringData, recurrenceType: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 text-stone-800"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom_days">Custom Days</option>
              </select>
            </div>

            <Input
              label="Interval"
              type="number"
              min="1"
              value={newRecurringData.interval}
              onChange={(e) => setNewRecurringData({ ...newRecurringData, interval: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
              <select
                value={newRecurringData.category}
                onChange={(e) => setNewRecurringData({ ...newRecurringData, category: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 text-stone-800"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="First Due Date"
              type="date"
              value={newRecurringData.nextDueDate}
              onChange={(e) => setNewRecurringData({ ...newRecurringData, nextDueDate: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button type="button" variant="ghost" onClick={() => setIsAddRecurringOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Staple
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Split Receipt as Shared Expense */}
      <Modal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="Split Shopping Receipt as Expense"
      >
        <form onSubmit={handleGenerateExpenseSubmit} className="space-y-4">
          <p className="text-xs text-stone-500">
            Automatically converts this shopping trip into an equal shared expense split across all household members.
          </p>

          <Input
            label="Total Receipt Amount (₹)"
            type="number"
            step="0.01"
            min="0.01"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            placeholder="0.00"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Paid By</label>
            <select
              value={expensePaidBy}
              onChange={(e) => setExpensePaidBy(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 text-stone-800"
            >
              {household?.members?.map(m => (
                <option key={m._id} value={m._id}>{m.name} {m._id === user?._id ? '(You)' : ''}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button type="button" variant="ghost" onClick={() => setExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submittingExpense}>
              Generate Shared Expense
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
