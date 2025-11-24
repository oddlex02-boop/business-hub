'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Bell, TrendingUp, Download, Plus, Edit2, Trash2, Copy, X } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addEntry, listenEntries, deleteEntry, updateEntry } from "@/firebase/userData";
import { subscribeToAuth } from "@/firebase/authListener";

export default function SubscriptionTrackerPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);

  const [filters, setFilters] = useState({
    category: 'all',
    cycle: 'all',
    paymentMethod: 'all',
    status: 'all',
    search: ''
  });

  // ✅ ADD THESE ARRAYS - YAHAN RAKHO
  const categories = ['SaaS/Software', 'Entertainment', 'Banking', 'Bills', 'Business Tools', 'Other'];
  const cycles = ['Monthly', 'Yearly', 'Quarterly', 'Weekly'];
  const paymentMethods = ['UPI', 'Debit Card', 'Credit Card', 'Bank Transfer'];

  // Auth Listener
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Data Sync
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = listenEntries(user.uid, 'subscriptionTracker', (data) => {
      setSubscriptions(data || []);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Firebase Data Save Function
  const saveSubscriptionToFirebase = async (subscriptionData, action = 'add') => {
    if (!user) return;
    
    try {
      if (action === 'add') {
        await addEntry(user.uid, 'subscriptionTracker', subscriptionData);
      } else if (action === 'update') {
        await updateEntry(user.uid, 'subscriptionTracker', subscriptionData);
      }
      console.log('✅ Subscription saved to Firebase');
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  // Firebase Delete Function
  const deleteSubscriptionFromFirebase = async (subscription) => {
    if (!user) return;
    
    try {
      await deleteEntry(user.uid, 'subscriptionTracker', subscription);
      console.log('✅ Subscription deleted from Firebase');
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  // Filtered & Sorted Subscriptions
  const filteredSubs = useMemo(() => {
    return subscriptions.filter(sub => {
      if (filters.category !== 'all' && sub.category !== filters.category) return false;
      if (filters.cycle !== 'all' && sub.cycle !== filters.cycle) return false;
      if (filters.paymentMethod !== 'all' && sub.paymentMethod !== filters.paymentMethod) return false;
      if (filters.status !== 'all' && sub.status !== filters.status) return false;
      if (filters.search && !sub.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => new Date(a.nextBilling) - new Date(b.nextBilling));
  }, [subscriptions, filters]);

  // ✅ COMPLETE ANALYTICS FUNCTION - YAHAN RAKHO
  const analytics = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active');
    
    const monthlyTotal = active.reduce((sum, sub) => {
      const amount = Number(sub.amount) || 0;
      if (sub.cycle === 'Monthly') return sum + amount;
      if (sub.cycle === 'Yearly') return sum + (amount / 12);
      if (sub.cycle === 'Quarterly') return sum + (amount / 3);
      if (sub.cycle === 'Weekly') return sum + (amount * 4);
      return sum;
    }, 0);

    const yearlyTotal = monthlyTotal * 12;
    
    const highest = active.reduce((max, sub) => {
      const amount = Number(sub.amount) || 0;
      return amount > max.amount ? { ...sub, amount } : max;
    }, { amount: 0, name: 'None' });
    
    const expiringThisMonth = active.filter(sub => {
      if (!sub.nextBilling) return false;
      const nextDate = new Date(sub.nextBilling);
      const now = new Date();
      return nextDate.getMonth() === now.getMonth() && nextDate.getFullYear() === now.getFullYear();
    }).length;

    const categorySpending = {};
    active.forEach(sub => {
      const amount = Number(sub.amount) || 0;
      const monthly = sub.cycle === 'Monthly' ? amount : 
                      sub.cycle === 'Yearly' ? amount / 12 :
                      sub.cycle === 'Quarterly' ? amount / 3 : amount * 4;
      categorySpending[sub.category] = (categorySpending[sub.category] || 0) + monthly;
    });

    return {
      totalActive: active.length,
      monthlyTotal,
      yearlyTotal,
      highest,
      expiringThisMonth,
      categorySpending
    };
  }, [subscriptions]);

  // Add/Edit Subscription Form Data
  const [formData, setFormData] = useState({
    name: '',
    category: 'SaaS/Software',
    cycle: 'Monthly',
    amount: '',
    nextBilling: '',
    paymentMethod: 'UPI',
    autoRenew: true,
    vendor: '',
    notes: '',
    status: 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const subscriptionData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      autoRenew: Boolean(formData.autoRenew),
      id: editingSub ? editingSub.id : Date.now().toString(),
      createdAt: editingSub ? editingSub.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingSub) {
      // Update existing subscription
      setSubscriptions(subscriptions.map(sub => 
        sub.id === editingSub.id ? subscriptionData : sub
      ));
      await saveSubscriptionToFirebase(subscriptionData, 'update');
      setEditingSub(null);
    } else {
      // Add new subscription
      setSubscriptions([...subscriptions, subscriptionData]);
      await saveSubscriptionToFirebase(subscriptionData, 'add');
    }
    
    // Reset form
    setFormData({
      name: '', category: 'SaaS/Software', cycle: 'Monthly', amount: '',
      nextBilling: '', paymentMethod: 'UPI', autoRenew: true, vendor: '', notes: '', status: 'active'
    });
    setShowAddForm(false);
  };

  const handleEdit = (sub) => {
    setFormData({
      ...sub,
      amount: sub.amount.toString()
    });
    setEditingSub(sub);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this subscription?')) {
      const subscriptionToDelete = subscriptions.find(s => s.id === id);
      setSubscriptions(subscriptions.filter(s => s.id !== id));
      if (subscriptionToDelete) {
        await deleteSubscriptionFromFirebase(subscriptionToDelete);
      }
    }
  };

  const handleDuplicate = async (sub) => {
    const duplicatedSub = { 
      ...sub, 
      id: Date.now().toString(), 
      name: sub.name + ' (Copy)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSubscriptions([...subscriptions, duplicatedSub]);
    await saveSubscriptionToFirebase(duplicatedSub, 'add');
  };

  const handleStatusChange = async (id, status) => {
    const updatedSubscriptions = subscriptions.map(s => 
      s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s
    );
    setSubscriptions(updatedSubscriptions);
    const subscriptionToUpdate = updatedSubscriptions.find(s => s.id === id);
    if (subscriptionToUpdate) {
      await saveSubscriptionToFirebase(subscriptionToUpdate, 'update');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Category', 'Cycle', 'Amount', 'Next Billing', 'Payment Method', 'Status'];
    const rows = subscriptions.map(s => [
      s.name, s.category, s.cycle, s.amount, s.nextBilling, s.paymentMethod, s.status
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscriptions.csv';
    a.click();
  };

  const getDaysUntil = (date) => {
    if (!date) return 0;
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // ✅ REST OF YOUR JSX CODE SAME RAHEGA
  // ... (Your existing JSX return statement - sab kuch same rakho)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">🔔 Subscription Tracker</h1>
            <p className="text-sm sm:text-base text-gray-400">Track all your recurring payments in one place</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg transition flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" /> Add Subscription
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-2 text-sm sm:text-base"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'list', label: 'List View', icon: '📋' },
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'calendar', label: 'Calendar', icon: '📅' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editingSub ? 'Edit' : 'Add'} Subscription</h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingSub(null);
                    setFormData({
                      name: '', category: 'SaaS/Software', cycle: 'Monthly', amount: '',
                      nextBilling: '', paymentMethod: 'UPI', autoRenew: true, vendor: '', notes: '', status: 'active'
                    });
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subscription Name *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Netflix, Canva, Zoom"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Billing Cycle *</label>
                    <select
                      value={formData.cycle}
                      onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                    >
                      {cycles.map(cycle => (
                        <option key={cycle} value={cycle}>{cycle}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount (₹) *</label>
                    <input
                      required
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="199"
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Next Billing Date *</label>
                    <input
                      required
                      type="date"
                      value={formData.nextBilling}
                      onChange={(e) => setFormData({ ...formData, nextBilling: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Vendor / Provider (optional)</label>
                  <input
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="e.g., Netflix Inc."
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes / Credentials (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    placeholder="Any additional info..."
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoRenew"
                    checked={formData.autoRenew}
                    onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="autoRenew" className="text-sm">Auto-renew enabled</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg transition"
                  >
                    {editingSub ? 'Update' : 'Add'} Subscription
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingSub(null);
                    }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 bg-gradient-to-br from-purple-600/20 to-purple-600/10 border border-purple-500/30 rounded-2xl">
                <p className="text-sm text-gray-400 mb-1">Total Active</p>
                <p className="text-3xl font-bold">{analytics.totalActive}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-600/20 to-blue-600/10 border border-blue-500/30 rounded-2xl">
                <p className="text-sm text-gray-400 mb-1">Monthly Cost</p>
                <p className="text-3xl font-bold">₹{analytics.monthlyTotal.toFixed(0)}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-600/20 to-green-600/10 border border-green-500/30 rounded-2xl">
                <p className="text-sm text-gray-400 mb-1">Yearly Cost</p>
                <p className="text-3xl font-bold">₹{analytics.yearlyTotal.toFixed(0)}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-600/20 to-orange-600/10 border border-orange-500/30 rounded-2xl">
                <p className="text-sm text-gray-400 mb-1">Expiring This Month</p>
                <p className="text-3xl font-bold">{analytics.expiringThisMonth}</p>
              </div>
            </div>

            {/* Category Spending */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4">📊 Spending by Category</h3>
              <div className="space-y-3">
                {Object.entries(analytics.categorySpending).map(([category, amount]) => {
                  const percentage = (amount / analytics.monthlyTotal) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category}</span>
                        <span className="font-semibold">₹{amount.toFixed(0)}/mo ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Renewals */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4">🔔 Upcoming Renewals</h3>
              <div className="space-y-2">
                {filteredSubs.slice(0, 5).map(sub => {
                  const days = getDaysUntil(sub.nextBilling);
                  const urgency = days <= 7 ? 'text-red-400' : days <= 30 ? 'text-yellow-400' : 'text-green-400';
                  return (
                    <div key={sub.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-semibold">{sub.name}</p>
                        <p className="text-xs text-gray-400">{sub.cycle} - ₹{sub.amount}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${urgency}`}>
                          {days > 0 ? `${days} days` : 'Today'}
                        </p>
                        <p className="text-xs text-gray-400">{sub.nextBilling}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg font-bold mb-4">🔍 Filters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-sm"
                />
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select
                  value={filters.cycle}
                  onChange={(e) => setFilters({ ...filters, cycle: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-sm"
                >
                  <option value="all">All Cycles</option>
                  {cycles.map(cycle => <option key={cycle} value={cycle}>{cycle}</option>)}
                </select>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-sm"
                >
                  <option value="all">All Methods</option>
                  {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Cycle</th>
                    <th className="text-right p-3">Amount</th>
                    <th className="text-left p-3">Next Billing</th>
                    <th className="text-left p-3">Method</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-center p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.map(sub => {
                    const days = getDaysUntil(sub.nextBilling);
                    const urgency = days <= 7 ? 'bg-red-500/20 border-red-500/30' : 
                                    days <= 30 ? 'bg-yellow-500/20 border-yellow-500/30' : 
                                    'bg-white/5 border-white/10';
                    return (
                      <tr key={sub.id} className={`border-t ${urgency}`}>
                        <td className="p-3">
                          <div>
                            <p className="font-semibold">{sub.name}</p>
                            {sub.vendor && <p className="text-xs text-gray-400">{sub.vendor}</p>}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-purple-500/20 rounded text-xs">{sub.category}</span>
                        </td>
                        <td className="p-3">{sub.cycle}</td>
                        <td className="p-3 text-right font-semibold">₹{sub.amount}</td>
                        <td className="p-3">
                          <div>
                            <p>{sub.nextBilling}</p>
                            <p className="text-xs text-gray-400">
                              {days > 0 ? `in ${days} days` : 'Today'}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">{sub.paymentMethod}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            sub.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(sub)}
                              className="p-1 hover:bg-white/10 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(sub)}
                              className="p-1 hover:bg-white/10 rounded"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="p-1 hover:bg-red-500/20 rounded text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredSubs.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p>No subscriptions found</p>
              </div>
            )}
          </div>
        )}

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-4">📅 Calendar View (Coming Soon)</h3>
            <p className="text-gray-400">Calendar view with all renewal dates will be available in the next update.</p>
          </div>
        )}

      </div>
    </div>
  );
}