'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addEntry, listenEntries, deleteEntry, updateEntry } from "@/firebase/userData";
import { subscribeToAuth } from "@/firebase/authListener";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

const currencies = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
];

const expenseCategories = [
  { name: 'Office', icon: '🏢', color: '#8b5cf6' },
  { name: 'Travel', icon: '✈️', color: '#ec4899' },
  { name: 'Salary', icon: '💰', color: '#10b981' },
  { name: 'Utility Bills', icon: '💡', color: '#f59e0b' },
  { name: 'Marketing', icon: '📢', color: '#3b82f6' },
  { name: 'Software', icon: '💻', color: '#14b8a6' },
  { name: 'Rent', icon: '🏠', color: '#ef4444' },
  { name: 'Food & Dining', icon: '🍔', color: '#f97316' },
  { name: 'Entertainment', icon: '🎬', color: '#a855f7' },
  { name: 'Healthcare', icon: '🏥', color: '#06b6d4' },
  { name: 'Other', icon: '📦', color: '#6b7280' },
];

const paymentMethods = ['Cash', 'UPI', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Other'];

export default function ExpenseTrackerPage() {
  const [expenses, setExpenses] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [currency, setCurrency] = useState('INR');
  const [darkMode, setDarkMode] = useState(true);
  const [receiptFile, setReceiptFile] = useState(null);
  const [user, setUser] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('date-desc');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Office',
    amount: '',
    description: '',
    vendor: '',
    paymentMethod: 'UPI',
    status: 'paid',
    receiptUrl: null
  });

  // 🆕 FIREBASE AUTH LISTENER
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 🆕 FIREBASE REAL-TIME DATA SYNC
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = listenEntries(user.uid, 'expenseTracker', (data) => {
      setExpenses(data || []);
    });
    
    return () => unsubscribe();
  }, [user]);

  // 🆕 FIREBASE DATA SAVE FUNCTION
  const saveExpenseToFirebase = async (expenseData, action = 'add') => {
    if (!user) return;
    
    try {
      if (action === 'add') {
        await addEntry(user.uid, 'expenseTracker', expenseData);
      } else if (action === 'update') {
        await updateEntry(user.uid, 'expenseTracker', expenseData);
      }
      console.log('✅ Expense saved to Firebase');
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  // 🆕 FIREBASE DELETE FUNCTION
  const deleteExpenseFromFirebase = async (expense) => {
    if (!user) return;
    
    try {
      await deleteEntry(user.uid, 'expenseTracker', expense);
      console.log('✅ Expense deleted from Firebase');
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // 🆕 AUTO-SAVE TO FIREBASE
  useEffect(() => {
    const timer = setTimeout(() => {
      if (expenses.length > 0 && user) {
        localStorage.setItem('expense_tracker_data', JSON.stringify(expenses));
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [expenses, user]);

  const currSymbol = currencies.find(c => c.code === currency)?.symbol || '₹';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const expenseData = {
      ...formData,
      id: editingExpense?.id || Date.now().toString(),
      createdAt: editingExpense?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      amount: parseFloat(formData.amount) || 0
    };

    if (editingExpense) {
      // Update existing expense
      const updatedExpenses = expenses.map(exp => exp.id === editingExpense.id ? expenseData : exp);
      setExpenses(updatedExpenses);
      await saveExpenseToFirebase(expenseData, 'update');
    } else {
      // Add new expense
      const newExpenses = [expenseData, ...expenses];
      setExpenses(newExpenses);
      await saveExpenseToFirebase(expenseData, 'add');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'Office',
      amount: '',
      description: '',
      vendor: '',
      paymentMethod: 'UPI',
      status: 'paid',
      receiptUrl: null
    });
    setReceiptFile(null);
    setShowAddExpense(false);
    setEditingExpense(null);
  };

  const deleteExpense = async (id) => {
    if (confirm('Delete this expense?')) {
      const expenseToDelete = expenses.find(exp => exp.id === id);
      setExpenses(expenses.filter(exp => exp.id !== id));
      if (expenseToDelete) {
        await deleteExpenseFromFirebase(expenseToDelete);
      }
    }
  };

  const editExpense = (expense) => {
    setFormData({
      ...expense,
      amount: expense.amount.toString()
    });
    setEditingExpense(expense);
    setShowAddExpense(true);
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, receiptUrl: reader.result });
        setReceiptFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter and Sort
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           expense.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || expense.status === filterStatus;
      const matchesMethod = filterMethod === 'all' || expense.paymentMethod === filterMethod;
      
      let matchesDateRange = true;
      if (dateRange.start && dateRange.end) {
        const expDate = new Date(expense.date);
        matchesDateRange = expDate >= new Date(dateRange.start) && expDate <= new Date(dateRange.end);
      }
      
      return matchesSearch && matchesCategory && matchesStatus && matchesMethod && matchesDateRange;
    });

    // Sort
    if (sortBy === 'amount-high') filtered.sort((a, b) => Number(b.amount) - Number(a.amount));
    else if (sortBy === 'amount-low') filtered.sort((a, b) => Number(a.amount) - Number(b.amount));
    else if (sortBy === 'date-desc') filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sortBy === 'date-asc') filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

    return filtered;
  }, [expenses, searchQuery, filterCategory, filterStatus, filterMethod, dateRange, sortBy]);

  // Analytics
  const analytics = useMemo(() => {
    const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpense = expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Category-wise
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
      return acc;
    }, {});
    
    const biggestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    // Payment method usage
    const methodTotals = expenses.reduce((acc, exp) => {
      acc[exp.paymentMethod] = (acc[exp.paymentMethod] || 0) + Number(exp.amount);
      return acc;
    }, {});

    // Monthly trend (last 6 months)
    const monthlyTrend = {};
    expenses.forEach(exp => {
      const monthKey = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + Number(exp.amount);
    });

    // Weekly data (last 7 days)
    const weeklyData = Array(7).fill(0);
    const today = new Date();
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const daysDiff = Math.floor((today - expDate) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 7) {
        weeklyData[6 - daysDiff] += Number(exp.amount);
      }
    });

    // Unpaid expenses alert
    const unpaidTotal = expenses
      .filter(exp => exp.status === 'unpaid')
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    return {
      totalExpense,
      monthlyExpense,
      categoryTotals,
      biggestCategory,
      methodTotals,
      monthlyTrend: Object.entries(monthlyTrend).slice(-6),
      weeklyData,
      unpaidTotal
    };
  }, [expenses]);

  // Export functions
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Expense Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Expenses: ${currSymbol}${analytics.totalExpense.toLocaleString()}`, 14, 38);
    doc.text(`This Month: ${currSymbol}${analytics.monthlyExpense.toLocaleString()}`, 14, 46);
    doc.text(`Unpaid: ${currSymbol}${analytics.unpaidTotal.toLocaleString()}`, 14, 54);

    // Expense Table
    autoTable(doc, {
      startY: 65,
      head: [['Date', 'Category', 'Amount', 'Vendor', 'Payment', 'Status']],
      body: filteredExpenses.map(exp => [
        exp.date,
        exp.category,
        `${currSymbol}${exp.amount}`,
        exp.vendor || '-',
        exp.paymentMethod,
        exp.status,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [123, 31, 162] },
      styles: { fontSize: 10 }
    });

    doc.save(`expense_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportCSV = () => {
    const csvContent = [
      ['Date', 'Category', 'Amount', 'Vendor', 'Description', 'Payment Method', 'Status'],
      ...filteredExpenses.map(exp => [
        exp.date,
        exp.category,
        exp.amount,
        exp.vendor || '',
        exp.description || '',
        exp.paymentMethod,
        exp.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Chart data
  const categoryPieData = {
    labels: Object.keys(analytics.categoryTotals),
    datasets: [{
      data: Object.values(analytics.categoryTotals),
      backgroundColor: expenseCategories.map(cat => cat.color),
    }]
  };

  const monthlyLineData = {
    labels: analytics.monthlyTrend.map(([month]) => month),
    datasets: [{
      label: 'Monthly Spending',
      data: analytics.monthlyTrend.map(([, amount]) => amount),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      tension: 0.4
    }]
  };

  const weeklyBarData = {
    labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'],
    datasets: [{
      label: 'Daily Spending',
      data: analytics.weeklyData,
      backgroundColor: 'rgba(236, 72, 153, 0.6)',
    }]
  };

  // Overspending Alert
  const monthlyBudget = 50000; // You can make this configurable
  const overspendingPercent = ((analytics.monthlyExpense / monthlyBudget) * 100).toFixed(0);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' : 'bg-gray-100 text-black'} px-4 sm:px-6 lg:px-8 py-8 sm:py-12`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">💸 Expense Tracker</h1>
          <p className="text-sm sm:text-base text-gray-400">Track Every Rupee, Control Every Spend</p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddExpense(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-sm font-semibold"
            >
              ➕ Add Expense
            </button>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
              ))}
            </select>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={exportPDF} className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs sm:text-sm">
              📄 PDF
            </button>
            <button onClick={exportCSV} className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-xs sm:text-sm">
              📊 CSV
            </button>
          </div>
        </div>

        {/* Overspending Alert */}
        {overspendingPercent > 80 && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl">
            <h3 className="font-bold text-yellow-400 mb-1">⚠️ Overspending Alert!</h3>
            <p className="text-sm">
              You've spent {overspendingPercent}% of your monthly budget ({currSymbol}{analytics.monthlyExpense.toLocaleString()} / {currSymbol}{monthlyBudget.toLocaleString()})
            </p>
          </div>
        )}

        {/* Unpaid Expenses Alert */}
        {analytics.unpaidTotal > 0 && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
            <h3 className="font-bold text-red-400 mb-1">💳 Unpaid Expenses</h3>
            <p className="text-sm">
              You have {currSymbol}{analytics.unpaidTotal.toLocaleString()} in unpaid expenses
            </p>
          </div>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl border border-purple-500/30">
            <p className="text-xs text-gray-400 mb-1">💰 Total Expenses</p>
            <p className="text-2xl font-bold">{currSymbol}{analytics.totalExpense.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{expenses.length} transactions</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30">
            <p className="text-xs text-gray-400 mb-1">📅 This Month</p>
            <p className="text-2xl font-bold">{currSymbol}{analytics.monthlyExpense.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{overspendingPercent}% of budget</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-xl border border-orange-500/30">
            <p className="text-xs text-gray-400 mb-1">📊 Top Category</p>
            <p className="text-2xl font-bold">{analytics.biggestCategory?.[0] || 'N/A'}</p>
            <p className="text-xs text-gray-400 mt-1">{currSymbol}{(analytics.biggestCategory?.[1] || 0).toLocaleString()}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl border border-green-500/30">
            <p className="text-xs text-gray-400 mb-1">💳 Most Used</p>
            <p className="text-2xl font-bold">{Object.keys(analytics.methodTotals).sort((a, b) => analytics.methodTotals[b] - analytics.methodTotals[a])[0] || 'N/A'}</p>
            <p className="text-xs text-gray-400 mt-1">Payment method</p>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddExpense && (
          <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-4">{editingExpense ? '✏️ Edit Expense' : '➕ Add New Expense'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  >
                    {expenseCategories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Amount *</label>
                  <input
                    required
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="5000"
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Vendor / Paid To</label>
                  <input
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="Amazon, Uber, etc."
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  >
                    <option value="paid">✅ Paid</option>
                    <option value="unpaid">❌ Unpaid</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1">Description</label>
                  <input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Upload Receipt</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleReceiptUpload}
                    className="w-full text-xs"
                  />
                  {formData.receiptUrl && (
                    <p className="text-xs text-green-400 mt-1">✅ Receipt attached</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold"
                >
                  {editingExpense ? 'Update' : 'Add Expense'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <input
              type="text"
              placeholder="🔍 Search vendor or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            >
              <option value="all">All Categories</option>
              {expenseCategories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="paid">✅ Paid</option>
              <option value="unpaid">❌ Unpaid</option>
            </select>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            >
              <option value="all">All Methods</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-high">Highest Amount</option>
              <option value="amount-low">Lowest Amount</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
                setFilterStatus('all');
                setFilterMethod('all');
                setDateRange({ start: '', end: '' });
                setSortBy('date-desc');
              }}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm"
            >
              🔄 Reset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              placeholder="Start Date"
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              placeholder="End Date"
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">💸</p>
            <h3 className="text-2xl font-bold mb-2">No Expenses Found</h3>
            <p className="text-gray-400 mb-6">Start tracking your expenses!</p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold"
            >
              ➕ Add First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {filteredExpenses.map((expense) => {
              const category = expenseCategories.find(cat => cat.name === expense.category);
              
              return (
                <div
                  key={expense.id}
                  className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:scale-[1.01] transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${category?.color}30` }}
                      >
                        {category?.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{expense.category}</h3>
                          {expense.status === 'unpaid' && (
                            <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-400">
                              Unpaid
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-400 space-y-1">
                          {expense.vendor && <p>📍 {expense.vendor}</p>}
                          {expense.description && <p>💬 {expense.description}</p>}
                          <p>📅 {new Date(expense.date).toLocaleDateString()} • 💳 {expense.paymentMethod}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{currSymbol}{Number(expense.amount).toLocaleString()}</p>
                        {expense.receiptUrl && (
                          <p className="text-xs text-blue-400 cursor-pointer" onClick={() => window.open(expense.receiptUrl)}>
                            📎 View Receipt
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => editExpense(expense)}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Charts Section */}
        {expenses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-lg font-bold mb-4">📊 Category-wise Breakdown</h3>
              <div className="h-64">
                <Pie data={categoryPieData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="lg:col-span-2 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-lg font-bold mb-4">📈 Monthly Spending Trend</h3>
              <div className="h-64">
                <Line data={monthlyLineData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="lg:col-span-3 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-lg font-bold mb-4">📊 Weekly Spending Pattern (Last 7 Days)</h3>
              <div className="h-64">
                <Bar data={weeklyBarData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Distribution */}
        {expenses.length > 0 && (
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">💳 Payment Method Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(analytics.methodTotals).map(([method, amount]) => (
                <div key={method} className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-gray-400">{method}</p>
                  <p className="text-lg font-bold">{currSymbol}{amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">
                    {((amount / analytics.totalExpense) * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}