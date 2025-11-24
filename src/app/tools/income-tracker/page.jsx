'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
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

const categories = ['Business', 'Freelance', 'Investment', 'Salary', 'Rental', 'Commission', 'Other'];
const paymentMethods = ['Cash', 'UPI', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'PayPal', 'Other'];

export default function IncomeTrackerPage() {
  const [incomes, setIncomes] = useState([]);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [currency, setCurrency] = useState('INR');
  const [darkMode, setDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [user, setUser] = useState(null);
  
  // Monthly Goal
  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [showGoalSetter, setShowGoalSetter] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('date-desc');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    category: 'Business',
    description: '',
    amount: '',
    paymentMethod: 'UPI',
    referenceId: '',
    status: 'received',
    proof: null
  });

  // 🆕 FIREBASE AUTH LISTENER
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 🆕 FIREBASE REAL-TIME INCOME DATA SYNC
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = listenEntries(user.uid, 'incomeTracker', (data) => {
      setIncomes(data || []);
    });
    
    return () => unsubscribe();
  }, [user]);

  // 🆕 FIREBASE SAVE INCOME FUNCTION
  const saveIncomeToFirebase = async (incomeData, action = 'add') => {
    if (!user) return;
    
    try {
      if (action === 'add') {
        await addEntry(user.uid, 'incomeTracker', incomeData);
      } else if (action === 'update') {
        await updateEntry(user.uid, 'incomeTracker', incomeData);
      }
      console.log('✅ Income saved to Firebase');
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  // 🆕 FIREBASE DELETE INCOME FUNCTION
  const deleteIncomeFromFirebase = async (income) => {
    if (!user) return;
    
    try {
      await deleteEntry(user.uid, 'incomeTracker', income);
      console.log('✅ Income deleted from Firebase');
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  // 🆕 AUTO-SAVE TO FIREBASE
  useEffect(() => {
    const timer = setTimeout(() => {
      if (incomes.length > 0 && user) {
        localStorage.setItem('income_tracker_data', JSON.stringify({ incomes, monthlyGoal }));
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [incomes, monthlyGoal, user]);

  const currSymbol = currencies.find(c => c.code === currency)?.symbol || '₹';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const incomeData = {
      ...formData,
      id: editingIncome?.id || Date.now().toString(),
      createdAt: editingIncome?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      amount: parseFloat(formData.amount) || 0
    };

    if (editingIncome) {
      // Update existing income
      const updatedIncomes = incomes.map(i => i.id === editingIncome.id ? incomeData : i);
      setIncomes(updatedIncomes);
      await saveIncomeToFirebase(incomeData, 'update');
    } else {
      // Add new income
      const newIncomes = [incomeData, ...incomes];
      setIncomes(newIncomes);
      await saveIncomeToFirebase(incomeData, 'add');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      source: '',
      category: 'Business',
      description: '',
      amount: '',
      paymentMethod: 'UPI',
      referenceId: '',
      status: 'received',
      proof: null
    });
    setShowAddIncome(false);
    setEditingIncome(null);
  };

  const deleteIncome = async (id) => {
    if (confirm('Delete this income entry?')) {
      const incomeToDelete = incomes.find(i => i.id === id);
      setIncomes(incomes.filter(i => i.id !== id));
      if (incomeToDelete) {
        await deleteIncomeFromFirebase(incomeToDelete);
      }
    }
  };

  const editIncome = (income) => {
    setFormData({
      ...income,
      amount: income.amount.toString()
    });
    setEditingIncome(income);
    setShowAddIncome(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, proof: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Analytics
  const analytics = useMemo(() => {
    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const receivedIncome = incomes
      .filter(i => i.status === 'received')
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const pendingIncome = incomes
      .filter(i => i.status === 'pending')
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    // Category-wise
    const categoryTotals = incomes.reduce((acc, income) => {
      if (income.status === 'received') {
        acc[income.category] = (acc[income.category] || 0) + Number(income.amount || 0);
      }
      return acc;
    }, {});

    // Monthly data
    const monthlyData = incomes.reduce((acc, income) => {
      if (income.status === 'received') {
        const month = new Date(income.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + Number(income.amount || 0);
      }
      return acc;
    }, {});

    const monthlyEntries = Object.entries(monthlyData)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-12);

    const averageMonthly = monthlyEntries.length > 0
      ? monthlyEntries.reduce((sum, [, val]) => sum + val, 0) / monthlyEntries.length
      : 0;

    // Current month income
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const currentMonthIncome = monthlyData[currentMonth] || 0;

    // Goal progress
    const goalProgress = monthlyGoal > 0 ? ((currentMonthIncome / monthlyGoal) * 100).toFixed(1) : 0;

    return {
      totalIncome,
      receivedIncome,
      pendingIncome,
      categoryTotals,
      monthlyData: monthlyEntries,
      averageMonthly,
      currentMonthIncome,
      goalProgress
    };
  }, [incomes, monthlyGoal]);

  // Filtered & Sorted incomes
  const processedIncomes = useMemo(() => {
    let filtered = incomes.filter(income => {
      const matchesSearch = income.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           income.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || income.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || income.status === filterStatus;
      const matchesMethod = filterMethod === 'all' || income.paymentMethod === filterMethod;
      
      let matchesDateRange = true;
      if (dateRange.start && dateRange.end) {
        const incomeDate = new Date(income.date);
        matchesDateRange = incomeDate >= new Date(dateRange.start) && incomeDate <= new Date(dateRange.end);
      }
      
      return matchesSearch && matchesCategory && matchesStatus && matchesMethod && matchesDateRange;
    });

    // Sort
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'date-desc': return new Date(b.date) - new Date(a.date);
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'amount-desc': return Number(b.amount || 0) - Number(a.amount || 0);
        case 'amount-asc': return Number(a.amount || 0) - Number(b.amount || 0);
        default: return 0;
      }
    });

    return filtered;
  }, [incomes, searchQuery, filterCategory, filterStatus, filterMethod, dateRange, sortBy]);

  // Pagination
  const paginatedIncomes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedIncomes.slice(startIndex, startIndex + itemsPerPage);
  }, [processedIncomes, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedIncomes.length / itemsPerPage);

  // Export functions
  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246);
    doc.text('Income Tracker Report', 105, 20, { align: 'center' });
    
    // Date and Summary
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Currency: ${currency} (${currSymbol})`, 14, 36);
    doc.text(`Total Records: ${processedIncomes.length} entries`, 14, 42);
    
    // Summary Stats
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Summary Statistics:', 14, 52);
    
    doc.setFontSize(10);
    doc.text(`Total Income: ${currSymbol}${analytics.totalIncome.toLocaleString()}`, 20, 60);
    doc.text(`Received: ${currSymbol}${analytics.receivedIncome.toLocaleString()}`, 20, 66);
    doc.text(`Pending: ${currSymbol}${analytics.pendingIncome.toLocaleString()}`, 20, 72);
    doc.text(`Average Monthly: ${currSymbol}${analytics.averageMonthly.toLocaleString()}`, 20, 78);
    
    if (monthlyGoal > 0) {
      doc.text(`Monthly Goal Progress: ${analytics.goalProgress}%`, 20, 84);
    }
    
    // Income Data Table
    const tableColumn = ["Date", "Source", "Category", "Amount", "Status", "Payment Method"];
    const tableRows = processedIncomes.map(income => [
      new Date(income.date).toLocaleDateString(),
      income.source,
      income.category,
      `${currSymbol}${Number(income.amount || 0).toLocaleString()}`,
      income.status === 'received' ? 'Received' : 'Pending',
      income.paymentMethod
    ]);
    
    // Add table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [139, 92, 246] },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Get final Y position safely
    let finalY = 100;
    if (doc.lastAutoTable && typeof doc.lastAutoTable.finalY === 'number') {
      finalY = doc.lastAutoTable.finalY + 10;
    }
    
    // Category Summary (only if we have space)
    if (finalY < 250) {
      doc.setFontSize(12);
      doc.setTextColor(139, 92, 246);
      doc.text('Category-wise Summary:', 14, finalY);
      
      const categoryColumns = ["Category", "Amount", "Entries", "Percentage"];
      const categoryRows = Object.entries(analytics.categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([category, amount]) => {
          const count = incomes.filter(i => i.category === category && i.status === 'received').length;
          const percentage = ((amount / analytics.receivedIncome) * 100).toFixed(1);
          return [
            category,
            `${currSymbol}${amount.toLocaleString()}`,
            count.toString(),
            `${percentage}%`
          ];
        });
      
      if (categoryRows.length > 0) {
        autoTable(doc, {
          head: [categoryColumns],
          body: categoryRows,
          startY: finalY + 5,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] }
        });
      }
    }
    
    // Footer for all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} • Generated by Income Tracker`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`income_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportCSV = () => {
    const csvContent = [
      ['Date', 'Source', 'Category', 'Amount', 'Status', 'Payment Method', 'Reference ID', 'Description'],
      ...processedIncomes.map(i => [
        i.date,
        i.source,
        i.category,
        i.amount,
        i.status,
        i.paymentMethod,
        i.referenceId || '',
        i.description || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `income_tracker_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Chart data
  const categoryPieData = {
    labels: Object.keys(analytics.categoryTotals),
    datasets: [{
      data: Object.values(analytics.categoryTotals),
      backgroundColor: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#a855f7'],
    }]
  };

  const monthlyBarData = {
    labels: analytics.monthlyData.map(([month]) => month),
    datasets: [{
      label: 'Monthly Income',
      data: analytics.monthlyData.map(([, amount]) => amount),
      backgroundColor: 'rgba(139, 92, 246, 0.6)',
      borderColor: '#8b5cf6',
      borderWidth: 2
    }]
  };

  const trendLineData = {
    labels: analytics.monthlyData.map(([month]) => month),
    datasets: [{
      label: 'Income Trend',
      data: analytics.monthlyData.map(([, amount]) => amount),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' : 'bg-gray-100 text-black'} px-4 sm:px-6 lg:px-8 py-8 sm:py-12`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">💰 Income Tracker</h1>
          <p className="text-sm sm:text-base text-gray-400">Track All Your Income Sources & Analyze Earnings</p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddIncome(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-sm font-semibold"
            >
              ➕ Add Income
            </button>
            <button
              onClick={() => setShowGoalSetter(!showGoalSetter)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold"
            >
              🎯 Set Goal
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

        {/* Goal Setter */}
        {showGoalSetter && (
          <div className="mb-6 p-4 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30">
            <h3 className="text-lg font-bold mb-3">🎯 Set Monthly Income Goal</h3>
            <div className="flex gap-3">
              <input
                type="number"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                placeholder="Enter monthly target"
                className="flex-1 px-4 py-2 bg-black/30 border border-white/20 rounded-lg"
              />
              <button
                onClick={() => setShowGoalSetter(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
              >
                Save Goal
              </button>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl border border-purple-500/30">
            <p className="text-xs text-gray-400 mb-1">💵 Total Income</p>
            <p className="text-2xl font-bold">{currSymbol}{analytics.totalIncome.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{incomes.length} entries</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl border border-green-500/30">
            <p className="text-xs text-gray-400 mb-1">✅ Received</p>
            <p className="text-2xl font-bold text-green-400">{currSymbol}{analytics.receivedIncome.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{incomes.filter(i => i.status === 'received').length} entries</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl border border-yellow-500/30">
            <p className="text-xs text-gray-400 mb-1">⏳ Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{currSymbol}{analytics.pendingIncome.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{incomes.filter(i => i.status === 'pending').length} entries</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30">
            <p className="text-xs text-gray-400 mb-1">📊 Avg Monthly</p>
            <p className="text-2xl font-bold text-blue-400">{currSymbol}{analytics.averageMonthly.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Last 12 months</p>
          </div>
        </div>

        {/* Goal Progress */}
        {monthlyGoal > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">🎯 Monthly Goal Progress</h3>
              <span className="text-2xl font-bold">{analytics.goalProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <div
                className={`h-4 rounded-full ${analytics.goalProgress >= 100 ? 'bg-green-500' : analytics.goalProgress >= 75 ? 'bg-blue-500' : analytics.goalProgress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                style={{ width: `${Math.min(analytics.goalProgress, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span>{currSymbol}{analytics.currentMonthIncome.toLocaleString()} / {currSymbol}{monthlyGoal.toLocaleString()}</span>
              <span className={analytics.goalProgress >= 100 ? 'text-green-400' : 'text-gray-400'}>
                {analytics.goalProgress >= 100 ? '🎉 Goal Achieved!' : `${currSymbol}${(monthlyGoal - analytics.currentMonthIncome).toLocaleString()} to go`}
              </span>
            </div>
          </div>
        )}

        {/* Add/Edit Income Form */}
        {showAddIncome && (
          <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-4">{editingIncome ? '✏️ Edit Income' : '➕ Add New Income'}</h3>
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
                  <label className="block text-sm mb-1">Source / Client Name *</label>
                  <input
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g., ABC Company"
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
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
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
                    placeholder="10000"
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
                    <option value="received">✅ Received</option>
                    <option value="pending">⏳ Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Reference / Transaction ID</label>
                  <input
                    value={formData.referenceId}
                    onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1">Description</label>
                  <input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional details"
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Attach Proof (Invoice/Receipt)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="w-full text-xs"
                  />
                  {formData.proof && (
                    <p className="text-xs text-green-400 mt-1">✅ File attached</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold"
                >
                  {editingIncome ? 'Update Income' : 'Add Income'}
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

        {/* Filters & Search */}
        <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
            <input
              type="text"
              placeholder="🔍 Search source or description..."
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
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="received">✅ Received</option>
              <option value="pending">⏳ Pending</option>
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
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <button
            onClick={() => {
              setSearchQuery('');
              setFilterCategory('all');
              setFilterStatus('all');
              setFilterMethod('all');
              setDateRange({ start: '', end: '' });
              setSortBy('date-desc');
            }}
            className="mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm w-full sm:w-auto"
          >
            🔄 Reset All Filters
          </button>
        </div>

        {/* Income Table */}
        {processedIncomes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">💰</p>
            <h3 className="text-2xl font-bold mb-2">No Income Records</h3>
            <p className="text-gray-400 mb-6">Start tracking your income!</p>
            <button
              onClick={() => setShowAddIncome(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold"
            >
              ➕ Add First Income
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing {paginatedIncomes.length} of {processedIncomes.length} entries
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {paginatedIncomes.map((income) => (
                <div
                  key={income.id}
                  className={`p-4 backdrop-blur-sm rounded-xl border ${
                    income.status === 'received'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-yellow-500/10 border-yellow-500/30'
                  } hover:scale-[1.01] transition-transform`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold">{income.source}</h3>
                          <p className="text-sm text-gray-400">{income.category} • {new Date(income.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          income.status === 'received' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {income.status === 'received' ? '✅ Received' : '⏳ Pending'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-2">
                        <div>
                          <p className="text-gray-400 text-xs">Amount</p>
                          <p className="font-bold text-lg">{currSymbol}{Number(income.amount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Payment Method</p>
                          <p className="font-semibold">{income.paymentMethod}</p>
                        </div>
                        {income.referenceId && (
                          <div>
                            <p className="text-gray-400 text-xs">Reference ID</p>
                            <p className="font-semibold text-xs">{income.referenceId}</p>
                          </div>
                        )}
                        {income.description && (
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-gray-400 text-xs">Description</p>
                            <p className="text-xs">{income.description}</p>
                          </div>
                        )}
                      </div>

                      {income.proof && (
                        <div className="flex items-center gap-2 text-xs text-blue-400">
                          <span>📎 Proof attached</span>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col gap-2">
                      <button
                        onClick={() => editIncome(income)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xs font-semibold"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteIncome(income.id)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-semibold"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 bg-white/5 rounded-lg text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Charts Section */}
        {incomes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-lg font-bold mb-4">📊 Category-wise Distribution</h3>
              <div className="h-64">
                {Object.keys(analytics.categoryTotals).length > 0 ? (
                  <Pie data={categoryPieData} options={{ maintainAspectRatio: false }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No received income yet
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-lg font-bold mb-4">📈 Monthly Income Trend</h3>
              <div className="h-64">
                {analytics.monthlyData.length > 0 ? (
                  <Bar data={monthlyBarData} options={{ maintainAspectRatio: false }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No data to display
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-lg font-bold mb-4">📉 Income Trend Line (Last 12 Months)</h3>
              <div className="h-64">
                {analytics.monthlyData.length > 0 ? (
                  <Line data={trendLineData} options={{ maintainAspectRatio: false }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No data to display
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Category Summary Table */}
        {Object.keys(analytics.categoryTotals).length > 0 && (
          <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-x-auto">
            <h3 className="text-lg font-bold mb-4">📋 Category-wise Summary</h3>
            <table className="w-full text-sm">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Total Amount</th>
                  <th className="text-right p-2">Entries</th>
                  <th className="text-right p-2">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.categoryTotals)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const count = incomes.filter(i => i.category === category && i.status === 'received').length;
                    const percentage = ((amount / analytics.receivedIncome) * 100).toFixed(1);
                    
                    return (
                      <tr key={category} className="border-b border-white/10">
                        <td className="p-2 font-semibold">{category}</td>
                        <td className="text-right p-2 font-bold">{currSymbol}{amount.toLocaleString()}</td>
                        <td className="text-right p-2">{count}</td>
                        <td className="text-right p-2 text-purple-400">{percentage}%</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment Method Stats */}
        {incomes.length > 0 && (
          <div className="mt-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">💳 Payment Methods Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {paymentMethods.map(method => {
                const methodIncomes = incomes.filter(i => i.paymentMethod === method && i.status === 'received');
                const methodTotal = methodIncomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
                
                return methodTotal > 0 ? (
                  <div key={method} className="p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-gray-400">{method}</p>
                    <p className="text-lg font-bold">{currSymbol}{methodTotal.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{methodIncomes.length} entries</p>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {incomes.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 text-center">
              <p className="text-xs text-gray-400 mb-1">Highest Income</p>
              <p className="text-xl font-bold">
                {currSymbol}{Math.max(...incomes.map(i => Number(i.amount || 0))).toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30 text-center">
              <p className="text-xs text-gray-400 mb-1">Lowest Income</p>
              <p className="text-xl font-bold">
                {currSymbol}{Math.min(...incomes.map(i => Number(i.amount || 0))).toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 text-center">
              <p className="text-xs text-gray-400 mb-1">This Month</p>
              <p className="text-xl font-bold text-green-400">
                {currSymbol}{analytics.currentMonthIncome.toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30 text-center">
              <p className="text-xs text-gray-400 mb-1">Total Sources</p>
              <p className="text-xl font-bold">
                {[...new Set(incomes.map(i => i.source))].length}
              </p>
            </div>
          </div>
        )}

        {/* Goal Achievement Alert */}
        {monthlyGoal > 0 && analytics.goalProgress >= 100 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl text-center">
            <p className="text-6xl mb-3">🎉</p>
            <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
            <p className="text-lg">
              You've achieved {analytics.goalProgress}% of your monthly income goal!
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {currSymbol}{analytics.currentMonthIncome.toLocaleString()} / {currSymbol}{monthlyGoal.toLocaleString()}
            </p>
          </div>
        )}

        {/* Pending Income Alert */}
        {analytics.pendingIncome > 0 && (
          <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl">
            <h3 className="font-bold text-yellow-400 mb-2">⏳ Pending Income Alert</h3>
            <p className="text-sm">
              You have {currSymbol}{analytics.pendingIncome.toLocaleString()} in pending income from {incomes.filter(i => i.status === 'pending').length} entries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}