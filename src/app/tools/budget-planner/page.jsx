'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { addEntry, listenEntries, getEntries } from "@/firebase/userData";  // ✅ CORRECT IMPORT
import { subscribeToAuth } from "@/firebase/authListener";  // ✅ CORRECT IMPORT

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const currencies = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
];

const defaultCategories = [
  { id: 1, name: 'Rent / Housing', icon: '🏠', budgeted: 0, actual: 0, color: '#8b5cf6' },
  { id: 2, name: 'Food & Groceries', icon: '🍔', budgeted: 0, actual: 0, color: '#ec4899' },
  { id: 3, name: 'Utilities', icon: '💡', budgeted: 0, actual: 0, color: '#f59e0b' },
  { id: 4, name: 'Transport / Fuel', icon: '🚗', budgeted: 0, actual: 0, color: '#10b981' },
  { id: 5, name: 'Entertainment', icon: '🎬', budgeted: 0, actual: 0, color: '#3b82f6' },
  { id: 6, name: 'Shopping', icon: '🛍️', budgeted: 0, actual: 0, color: '#ef4444' },
  { id: 7, name: 'Insurance / EMIs', icon: '📋', budgeted: 0, actual: 0, color: '#6366f1' },
  { id: 8, name: 'Savings / Investment', icon: '💰', budgeted: 0, actual: 0, color: '#14b8a6' },
  { id: 9, name: 'Miscellaneous', icon: '📦', budgeted: 0, actual: 0, color: '#a855f7' },
];

export default function BudgetPlannerPage() {
   const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [income, setIncome] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [categories, setCategories] = useState(defaultCategories);
  const [darkMode, setDarkMode] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '📌' });
  const [user, setUser] = useState(null);  // 🆕 USER STATE ADD KARO

  // Load from localStorage
   // 🆕 AUTH LISTENER ADD KARO
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setUser(user);
      if (user) {
        loadBudgetData(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // 🆕 FIREBASE DATA LOAD KARO
  const loadBudgetData = async (uid) => {
    try {
      const budgetData = await getEntries(uid, 'budgetPlanner');
      if (budgetData && budgetData.length > 0) {
        const latestData = budgetData[budgetData.length - 1]; // Latest entry
        setMonth(latestData.month || month);
        setIncome(latestData.income || '');
        setCurrency(latestData.currency || 'INR');
        setCategories(latestData.categories || defaultCategories);
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  // 🆕 FIREBASE DATA SAVE KARO
  const saveBudgetToFirebase = async () => {
    if (!user) return;
    
    const budgetEntry = {
      id: Date.now().toString(),
      month,
      income,
      currency,
      categories,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await addEntry(user.uid, 'budgetPlanner', budgetEntry);
      console.log('✅ Budget saved to Firebase');
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  // 🆕 AUTO SAVE TO FIREBASE (LocalStorage ke saath)
  useEffect(() => {
    const timer = setTimeout(() => {
      // LocalStorage save (existing)
      localStorage.setItem('budget_planner_data', JSON.stringify({
        month, income, currency, categories
      }));
      
      // Firebase save (new)
      saveBudgetToFirebase();
    }, 2000); // 2 second delay
    return () => clearTimeout(timer);
  }, [month, income, currency, categories, user]);


  const summary = useMemo(() => {
    const totalBudgeted = categories.reduce((sum, cat) => sum + (Number(cat.budgeted) || 0), 0);
    const totalActual = categories.reduce((sum, cat) => sum + (Number(cat.actual) || 0), 0);
    const incomeNum = Number(income) || 0;
    const remaining = incomeNum - totalActual;
    const budgetUsedPercent = totalBudgeted > 0 ? ((totalActual / totalBudgeted) * 100).toFixed(1) : 0;
    const savingsTarget = incomeNum - totalBudgeted;
    
    return {
      totalBudgeted,
      totalActual,
      remaining,
      budgetUsedPercent,
      savingsTarget,
      overspent: totalActual > totalBudgeted
    };
  }, [categories, income]);

  const updateCategory = (id, field, value) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const addCategory = () => {
    if (newCategory.name.trim()) {
      setCategories([...categories, {
        id: Date.now(),
        name: newCategory.name,
        icon: newCategory.icon,
        budgeted: 0,
        actual: 0,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      }]);
      setNewCategory({ name: '', icon: '📌' });
      setShowAddCategory(false);
    }
  };

  const deleteCategory = (id) => {
    if (confirm('Delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const exportPDF = () => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Smart Budget Planner Report", 14, 20);

  // Month & Currency
  doc.setFontSize(12);
  doc.text(`Month: ${month}`, 14, 30);
  doc.text(`Currency: ${currency}`, 14, 37);

  // Table
  const tableData = categories.map(cat => [
    `${cat.icon} ${cat.name}`,
    Number(cat.budgeted) || 0,
    Number(cat.actual) || 0,
    Number(cat.budgeted) - Number(cat.actual)
  ]);

  autoTable(doc, {
    startY: 45,
    head: [["Category", "Budgeted", "Actual", "Difference"]],
    body: tableData
  });

  // Summary box
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(14);
  doc.text("Summary", 14, finalY);

  autoTable(doc, {
    startY: finalY + 5,
    head: [["Total Income", "Total Budgeted", "Total Spent", "Remaining"]],
    body: [[
      Number(income || 0),
      summary.totalBudgeted,
      summary.totalActual,
      summary.remaining
    ]]
  });

  doc.save(`budget_${month}.pdf`);
};

  const exportCSV = () => {
    const csvContent = [
      ['Category', 'Budgeted', 'Actual', 'Difference'],
      ...categories.map(cat => [
        cat.name,
        cat.budgeted,
        cat.actual,
        (Number(cat.budgeted) - Number(cat.actual)).toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_${month}.csv`;
    a.click();
  };

  const resetBudget = () => {
    if (confirm('Reset budget for next month? This will clear all actual spending data.')) {
      setCategories(categories.map(cat => ({ ...cat, actual: 0 })));
    }
  };

  const currSymbol = currencies.find(c => c.code === currency)?.symbol || '₹';

  // Chart Data
  const pieData = {
    labels: categories.map(cat => cat.name),
    datasets: [{
      data: categories.map(cat => Number(cat.actual) || 0),
      backgroundColor: categories.map(cat => cat.color),
    }]
  };

  const barData = {
    labels: categories.map(cat => cat.name),
    datasets: [
      {
        label: 'Budgeted',
        data: categories.map(cat => Number(cat.budgeted) || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
      },
      {
        label: 'Actual',
        data: categories.map(cat => Number(cat.actual) || 0),
        backgroundColor: 'rgba(236, 72, 153, 0.6)',
      }
    ]
  };

  // Alert Messages
  const alerts = categories
    .filter(cat => {
      const percent = (Number(cat.actual) / Number(cat.budgeted)) * 100;
      return percent >= 80 && Number(cat.budgeted) > 0;
    })
    .map(cat => ({
      category: cat.name,
      icon: cat.icon,
      percent: ((Number(cat.actual) / Number(cat.budgeted)) * 100).toFixed(0)
    }));

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' : 'bg-gray-100 text-black'} px-4 sm:px-6 lg:px-8 py-8 sm:py-12`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">💰 Smart Budget Planner</h1>
          <p className="text-sm sm:text-base text-gray-400">Plan, Track, and Control Your Monthly Finances</p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex flex-wrap gap-3">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            />
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
            <button onClick={resetBudget} className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-xs sm:text-sm">
              🔁 Reset
            </button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl">
            <h3 className="font-bold mb-2">⚠️ Budget Alerts:</h3>
            {alerts.map((alert, i) => (
              <p key={i} className="text-sm">
                {alert.icon} You've spent {alert.percent}% of your {alert.category} budget!
              </p>
            ))}
          </div>
        )}

        {/* Income Section */}
        <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl border border-purple-500/30">
          <label className="block text-sm sm:text-base font-semibold mb-2">💵 Total Monthly Income</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Enter your monthly income"
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-lg font-bold"
          />
        </div>

        {/* Categories Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">📊 Expense Categories</h2>
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
            >
              ➕ Add Category
            </button>
          </div>

          {showAddCategory && (
            <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex gap-2">
                <input
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="flex-1 px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                />
                <input
                  placeholder="Icon"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-16 px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm text-center"
                />
                <button onClick={addCategory} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {categories.map((cat) => {
              const budgeted = Number(cat.budgeted) || 0;
              const actual = Number(cat.actual) || 0;
              const percent = budgeted > 0 ? ((actual / budgeted) * 100).toFixed(0) : 0;
              const isOverBudget = actual > budgeted;

              return (
                <div key={cat.id} className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-semibold text-sm sm:text-base">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="text-red-400 hover:text-red-500 text-sm"
                    >
                      ✖
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-xs text-gray-400">Budgeted</label>
                      <input
                        type="number"
                        value={cat.budgeted}
                        onChange={(e) => updateCategory(cat.id, 'budgeted', e.target.value)}
                        className="w-full px-2 py-1 bg-black/30 border border-white/20 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Actual</label>
                      <input
                        type="number"
                        value={cat.actual}
                        onChange={(e) => updateCategory(cat.id, 'actual', e.target.value)}
                        className="w-full px-2 py-1 bg-black/30 border border-white/20 rounded text-sm"
                      />
                    </div>
                  </div>

                  {budgeted > 0 && (
                    <>
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                        <div
                          className={`h-2 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={isOverBudget ? 'text-red-400' : 'text-gray-400'}>
                          {percent}% used
                        </span>
                        <span className={isOverBudget ? 'text-red-400' : 'text-green-400'}>
                          {isOverBudget ? 'Over' : 'Under'} by {currSymbol}{Math.abs(budgeted - actual).toFixed(0)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30">
            <p className="text-xs text-gray-400 mb-1">Total Income</p>
            <p className="text-2xl font-bold">{currSymbol}{Number(income || 0).toFixed(0)}</p>
          </div>

          <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-xl border border-purple-500/30">
            <p className="text-xs text-gray-400 mb-1">Total Budgeted</p>
            <p className="text-2xl font-bold">{currSymbol}{summary.totalBudgeted.toFixed(0)}</p>
          </div>

          <div className="p-4 bg-pink-500/20 backdrop-blur-sm rounded-xl border border-pink-500/30">
            <p className="text-xs text-gray-400 mb-1">Total Spent</p>
            <p className="text-2xl font-bold">{currSymbol}{summary.totalActual.toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">{summary.budgetUsedPercent}% of budget</p>
          </div>

          <div className={`p-4 backdrop-blur-sm rounded-xl border ${summary.remaining >= 0 ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'}`}>
            <p className="text-xs text-gray-400 mb-1">{summary.remaining >= 0 ? 'Remaining' : 'Overspent'}</p>
            <p className="text-2xl font-bold">{currSymbol}{Math.abs(summary.remaining).toFixed(0)}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">📊 Spending Distribution</h3>
            <div className="h-64">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">📈 Planned vs Actual</h3>
            <div className="h-64">
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* AI Suggestion */}
        {summary.savingsTarget < 0 && (
          <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl">
            <p className="text-sm">
              💡 <strong>AI Suggestion:</strong> Your budget exceeds your income by {currSymbol}{Math.abs(summary.savingsTarget).toFixed(0)}. 
              Consider reducing spending in high-cost categories like {categories.sort((a, b) => b.budgeted - a.budgeted)[0]?.name}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}