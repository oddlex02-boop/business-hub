'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { listenEntries } from "@/firebase/userData";
import { subscribeToAuth } from "@/firebase/authListener";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

const currencies = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
];

export default function ProfitLossDashboard() {
  const [currency, setCurrency] = useState('INR');
  const [darkMode, setDarkMode] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [compareMode, setCompareMode] = useState(false);
  const [compareMonths, setCompareMonths] = useState({ month1: '', month2: '' });
  const [user, setUser] = useState(null);
  
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);

  const currSymbol = currencies.find(c => c.code === currency)?.symbol || '₹';

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
      setIncomeData(data || []);
    });
    
    return () => unsubscribe();
  }, [user]);

  // 🆕 FIREBASE REAL-TIME EXPENSE DATA SYNC
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = listenEntries(user.uid, 'expenseTracker', (data) => {
      setExpenseData(data || []);
    });
    
    return () => unsubscribe();
  }, [user]);

  const filteredData = useMemo(() => {
    const filterByDate = (data) => {
      if (filterPeriod === 'all' || !data || !Array.isArray(data)) return data || [];

      const now = new Date();
      let startDate;

      if (filterPeriod === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (filterPeriod === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
      } else if (filterPeriod === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      } else if (filterPeriod === 'custom' && customDateRange.start && customDateRange.end) {
        startDate = new Date(customDateRange.start);
        const endDate = new Date(customDateRange.end);
        return data.filter(item => {
          if (!item || !item.date) return false;
          const itemDate = new Date(item.date);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }

      return data.filter(item => item && item.date && new Date(item.date) >= startDate);
    };

    return {
      income: Array.isArray(incomeData) ? filterByDate(incomeData) : [],
      expenses: Array.isArray(expenseData) ? filterByDate(expenseData) : []
    };
  }, [incomeData, expenseData, filterPeriod, customDateRange]);

  const metrics = useMemo(() => {
    // FIX: Add Array.isArray checks for all reduce operations
    const totalIncome = Array.isArray(filteredData.income) 
      ? filteredData.income.reduce((sum, item) => sum + Number(item?.amount || 0), 0)
      : 0;
    
    const totalExpense = Array.isArray(filteredData.expenses) 
      ? filteredData.expenses.reduce((sum, item) => sum + Number(item?.amount || 0), 0)
      : 0;
    
    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0;

    const monthlyData = {};
    
    // Process income data with safety checks
    if (Array.isArray(filteredData.income)) {
      filteredData.income.forEach(item => {
        if (!item || !item.date) return;
        const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
        monthlyData[month].income += Number(item.amount || 0);
      });
    }

    // Process expense data with safety checks
    if (Array.isArray(filteredData.expenses)) {
      filteredData.expenses.forEach(item => {
        if (!item || !item.date) return;
        const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
        monthlyData[month].expense += Number(item.amount || 0);
      });
    }

    Object.keys(monthlyData).forEach(month => {
      monthlyData[month].profit = monthlyData[month].income - monthlyData[month].expense;
    });

    const sortedMonths = Object.entries(monthlyData).sort((a, b) => {
      return new Date(a[0]) - new Date(b[0]);
    });

    const monthsArray = sortedMonths.map(([month, data]) => ({ month, ...data }));
    
    // FIX: Add checks for empty arrays
    const highestProfitMonth = monthsArray.length > 0 
      ? monthsArray.reduce((max, curr) => curr.profit > max.profit ? curr : max, monthsArray[0])
      : { month: 'N/A', profit: 0 };
    
    const highestExpenseMonth = monthsArray.length > 0
      ? monthsArray.reduce((max, curr) => curr.expense > max.expense ? curr : max, monthsArray[0])
      : { month: 'N/A', expense: 0 };

    const avgMonthlyProfit = monthsArray.length > 0 
      ? monthsArray.reduce((sum, m) => sum + m.profit, 0) / monthsArray.length 
      : 0;

    const monthlyGrowth = monthsArray.length >= 2
      ? (((monthsArray[monthsArray.length - 1].profit - monthsArray[monthsArray.length - 2].profit) / Math.abs(monthsArray[monthsArray.length - 2].profit || 1)) * 100).toFixed(2)
      : 0;

    const operatingExpenses = Array.isArray(filteredData.expenses)
      ? filteredData.expenses
          .filter(exp => exp && ['Office', 'Salary', 'Rent', 'Utility Bills', 'Software'].includes(exp.category))
          .reduce((sum, exp) => sum + Number(exp.amount || 0), 0)
      : 0;

    const operatingProfit = totalIncome - operatingExpenses;

    const expenseByCategory = {};
    if (Array.isArray(filteredData.expenses)) {
      filteredData.expenses.forEach(exp => {
        if (!exp || !exp.category) return;
        expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + Number(exp.amount || 0);
      });
    }

    return {
      totalIncome,
      totalExpense,
      netProfit,
      profitMargin,
      monthlyData: sortedMonths,
      highestProfitMonth,
      highestExpenseMonth,
      avgMonthlyProfit,
      monthlyGrowth,
      operatingExpenses,
      operatingProfit,
      expenseByCategory
    };
  }, [filteredData]);

  const comparisonData = useMemo(() => {
    if (!compareMode || !compareMonths.month1 || !compareMonths.month2) return null;

    const getMonthData = (monthKey) => {
      const income = Array.isArray(filteredData.income)
        ? filteredData.income
            .filter(item => item && new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === monthKey)
            .reduce((sum, item) => sum + Number(item.amount || 0), 0)
        : 0;
      
      const expense = Array.isArray(filteredData.expenses)
        ? filteredData.expenses
            .filter(item => item && new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === monthKey)
            .reduce((sum, item) => sum + Number(item.amount || 0), 0)
        : 0;

      return { income, expense, profit: income - expense };
    };

    const month1Data = getMonthData(compareMonths.month1);
    const month2Data = getMonthData(compareMonths.month2);

    return {
      month1: { name: compareMonths.month1, ...month1Data },
      month2: { name: compareMonths.month2, ...month2Data },
      difference: {
        income: month2Data.income - month1Data.income,
        expense: month2Data.expense - month1Data.expense,
        profit: month2Data.profit - month1Data.profit
      }
    };
  }, [compareMode, compareMonths, filteredData]);

  const incomeVsExpenseData = {
    labels: metrics.monthlyData.map(([month]) => month),
    datasets: [
      {
        label: 'Income',
        data: metrics.monthlyData.map(([, data]) => data.income),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
      },
      {
        label: 'Expense',
        data: metrics.monthlyData.map(([, data]) => data.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
      }
    ]
  };

  const profitLineData = {
    labels: metrics.monthlyData.map(([month]) => month),
    datasets: [{
      label: 'Net Profit',
      data: metrics.monthlyData.map(([, data]) => data.profit),
      borderColor: metrics.netProfit >= 0 ? '#10b981' : '#ef4444',
      backgroundColor: metrics.netProfit >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  const expenseCategoryData = {
    labels: Object.keys(metrics.expenseByCategory),
    datasets: [{
      data: Object.values(metrics.expenseByCategory),
      backgroundColor: [
        '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
        '#ef4444', '#14b8a6', '#f97316', '#a855f7', '#06b6d4'
      ],
    }]
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246);
    doc.text('Profit & Loss Report', 105, 20, { align: 'center' });
    
    // Date and Summary
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Currency: ${currency} (${currSymbol})`, 14, 36);
    doc.text(`Period: ${filterPeriod === 'all' ? 'All Time' : filterPeriod}`, 14, 42);
    
    // Key Metrics
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Key Financial Metrics:', 14, 52);
    
    doc.setFontSize(10);
    doc.text(`Total Income: ${currSymbol}${metrics.totalIncome.toLocaleString()}`, 20, 60);
    doc.text(`Total Expense: ${currSymbol}${metrics.totalExpense.toLocaleString()}`, 20, 66);
    doc.text(`Net Profit: ${currSymbol}${metrics.netProfit.toLocaleString()}`, 20, 72);
    doc.text(`Profit Margin: ${metrics.profitMargin}%`, 20, 78);
    doc.text(`Monthly Growth: ${metrics.monthlyGrowth}%`, 20, 84);
    doc.text(`Avg Monthly Profit: ${currSymbol}${metrics.avgMonthlyProfit.toFixed(0).toLocaleString()}`, 20, 90);
    
    // Monthly P&L Table
    const tableColumn = ["Month", "Income", "Expense", "Profit", "Margin %"];
    const tableRows = metrics.monthlyData.map(([month, data]) => {
      const margin = data.income > 0 ? ((data.profit / data.income) * 100).toFixed(1) : 0;
      return [
        month,
        `${currSymbol}${data.income.toLocaleString()}`,
        `${currSymbol}${data.expense.toLocaleString()}`,
        `${currSymbol}${data.profit.toLocaleString()}`,
        `${margin}%`
      ];
    });
    
    // Add main table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 100,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [139, 92, 246] },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Get final Y position safely
    let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 150;
    
    // Expense Categories (if we have space)
    if (finalY < 200 && Object.keys(metrics.expenseByCategory).length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(139, 92, 246);
      doc.text('Expense Breakdown by Category:', 14, finalY);
      
      const categoryColumns = ["Category", "Amount", "Percentage"];
      const categoryRows = Object.entries(metrics.expenseByCategory)
        .sort((a, b) => b[1] - a[1])
        .map(([category, amount]) => {
          const percentage = ((amount / metrics.totalExpense) * 100).toFixed(1);
          return [
            category,
            `${currSymbol}${amount.toLocaleString()}`,
            `${percentage}%`
          ];
        });
      
      doc.autoTable({
        head: [categoryColumns],
        body: categoryRows,
        startY: finalY + 5,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : finalY;
    }
    
    // Comparison Data (if available)
    if (comparisonData && finalY < 250) {
      doc.setFontSize(12);
      doc.setTextColor(139, 92, 246);
      doc.text('Monthly Comparison:', 14, finalY);
      
      const comparisonColumns = ["Metric", comparisonData.month1.name, comparisonData.month2.name, "Difference"];
      const comparisonRows = [
        ["Income", 
         `${currSymbol}${comparisonData.month1.income.toLocaleString()}`,
         `${currSymbol}${comparisonData.month2.income.toLocaleString()}`,
         `${comparisonData.difference.income >= 0 ? '+' : ''}${currSymbol}${comparisonData.difference.income.toLocaleString()}`
        ],
        ["Expense", 
         `${currSymbol}${comparisonData.month1.expense.toLocaleString()}`,
         `${currSymbol}${comparisonData.month2.expense.toLocaleString()}`,
         `${comparisonData.difference.expense >= 0 ? '+' : ''}${currSymbol}${comparisonData.difference.expense.toLocaleString()}`
        ],
        ["Profit", 
         `${currSymbol}${comparisonData.month1.profit.toLocaleString()}`,
         `${currSymbol}${comparisonData.month2.profit.toLocaleString()}`,
         `${comparisonData.difference.profit >= 0 ? '+' : ''}${currSymbol}${comparisonData.difference.profit.toLocaleString()}`
        ]
      ];
      
      doc.autoTable({
        head: [comparisonColumns],
        body: comparisonRows,
        startY: finalY + 5,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [16, 185, 129] }
      });
    }
    
    // Footer for all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} • Generated by Profit & Loss Dashboard`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`profit_loss_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportCSV = () => {
    const csvContent = [
      ['Month', 'Income', 'Expense', 'Profit'],
      ...metrics.monthlyData.map(([month, data]) => [
        month,
        data.income,
        data.expense,
        data.profit
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit_loss_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const addIncome = () => {
    window.location.href = '/tools/income-tracker';
  };

  const addExpense = () => {
    window.location.href = '/tools/expense-tracker';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' : 'bg-gray-100 text-black'} px-4 sm:px-6 lg:px-8 py-8 sm:py-12`}>
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">📊 Profit & Loss Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-400">Complete Financial Analysis & Business Intelligence</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex flex-wrap gap-2">
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>

            {filterPeriod === 'custom' && (
              <>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                  className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                  className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                />
              </>
            )}

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

            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-3 py-2 rounded-lg text-sm ${compareMode ? 'bg-purple-600' : 'bg-white/10'}`}
            >
              🔄 Compare
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={addIncome} className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-xs sm:text-sm">
              ➕ Add Income
            </button>
            <button onClick={addExpense} className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs sm:text-sm">
              ➕ Add Expense
            </button>
            <button onClick={exportPDF} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs sm:text-sm">
              📄 PDF
            </button>
            <button onClick={exportCSV} className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-xs sm:text-sm">
              📊 CSV
            </button>
          </div>
        </div>

        {compareMode && (
          <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <h3 className="font-bold mb-3">🔄 Compare Two Months</h3>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={compareMonths.month1}
                onChange={(e) => setCompareMonths({ ...compareMonths, month1: e.target.value })}
                className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
              >
                <option value="">Select Month 1</option>
                {metrics.monthlyData.map(([month]) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select
                value={compareMonths.month2}
                onChange={(e) => setCompareMonths({ ...compareMonths, month2: e.target.value })}
                className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
              >
                <option value="">Select Month 2</option>
                {metrics.monthlyData.map(([month]) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {comparisonData && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">{comparisonData.month1.name}</p>
                  <p className="text-sm">Income: {currSymbol}{comparisonData.month1.income.toLocaleString()}</p>
                  <p className="text-sm">Expense: {currSymbol}{comparisonData.month1.expense.toLocaleString()}</p>
                  <p className="text-sm font-bold">Profit: {currSymbol}{comparisonData.month1.profit.toLocaleString()}</p>
                </div>

                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Difference</p>
                  <p className={`text-sm ${comparisonData.difference.income >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    Income: {comparisonData.difference.income >= 0 ? '+' : ''}{currSymbol}{comparisonData.difference.income.toLocaleString()}
                  </p>
                  <p className={`text-sm ${comparisonData.difference.expense <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    Expense: {comparisonData.difference.expense >= 0 ? '+' : ''}{currSymbol}{comparisonData.difference.expense.toLocaleString()}
                  </p>
                  <p className={`text-sm font-bold ${comparisonData.difference.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    Profit: {comparisonData.difference.profit >= 0 ? '+' : ''}{currSymbol}{comparisonData.difference.profit.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-green-500/20 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">{comparisonData.month2.name}</p>
                  <p className="text-sm">Income: {currSymbol}{comparisonData.month2.income.toLocaleString()}</p>
                  <p className="text-sm">Expense: {currSymbol}{comparisonData.month2.expense.toLocaleString()}</p>
                  <p className="text-sm font-bold">Profit: {currSymbol}{comparisonData.month2.profit.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`p-6 backdrop-blur-sm rounded-2xl border ${metrics.netProfit >= 0 ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
            <p className="text-xs text-gray-400 mb-1">💚 Net Profit</p>
            <p className={`text-3xl font-bold ${metrics.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {currSymbol}{Math.abs(metrics.netProfit).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">{metrics.profitMargin}% margin</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl border border-blue-500/30">
            <p className="text-xs text-gray-400 mb-1">💰 Total Income</p>
            <p className="text-3xl font-bold text-blue-400">{currSymbol}{metrics.totalIncome.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{Array.isArray(filteredData.income) ? filteredData.income.length : 0} transactions</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-sm rounded-2xl border border-red-500/30">
            <p className="text-xs text-gray-400 mb-1">💸 Total Expense</p>
            <p className="text-3xl font-bold text-red-400">{currSymbol}{metrics.totalExpense.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{Array.isArray(filteredData.expenses) ? filteredData.expenses.length : 0} transactions</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl border border-purple-500/30">
            <p className="text-xs text-gray-400 mb-1">📈 Monthly Growth</p>
            <p className={`text-3xl font-bold ${Number(metrics.monthlyGrowth) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Number(metrics.monthlyGrowth) >= 0 ? '+' : ''}{metrics.monthlyGrowth}%
            </p>
            <p className="text-xs text-gray-400 mt-1">vs previous month</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <p className="text-xs text-gray-400 mb-1">📊 Operating Profit</p>
            <p className="text-xl font-bold">{currSymbol}{metrics.operatingProfit.toLocaleString()}</p>
          </div>

          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <p className="text-xs text-gray-400 mb-1">💼 Avg Monthly Profit</p>
            <p className="text-xl font-bold">{currSymbol}{metrics.avgMonthlyProfit.toFixed(0).toLocaleString()}</p>
          </div>

          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <p className="text-xs text-gray-400 mb-1">🏆 Highest Profit Month</p>
            <p className="text-sm font-bold">{metrics.highestProfitMonth.month}</p>
            <p className="text-xs text-green-400">{currSymbol}{metrics.highestProfitMonth.profit.toLocaleString()}</p>
          </div>

          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <p className="text-xs text-gray-400 mb-1">💸 Highest Expense Month</p>
            <p className="text-sm font-bold">{metrics.highestExpenseMonth.month}</p>
            <p className="text-xs text-red-400">{currSymbol}{metrics.highestExpenseMonth.expense.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">📊 Income vs Expense</h3>
            <div className="h-64">
              <Bar data={incomeVsExpenseData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">📈 Profit Trend</h3>
            <div className="h-64">
              <Line data={profitLineData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
          </div>

          <div className="lg:col-span-2 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">🎯 Expense Breakdown by Category</h3>
            <div className="h-64 flex justify-center">
              {Object.keys(metrics.expenseByCategory).length > 0 ? (
                <Doughnut data={expenseCategoryData} options={{ maintainAspectRatio: false, responsive: true }} />
              ) : (
                <p className="text-gray-400 flex items-center">No expense data available</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-x-auto">
          <h3 className="text-lg font-bold mb-4">📋 Monthly P&L Summary</h3>
          <table className="w-full text-sm">
            <thead className="border-b border-white/20">
              <tr>
                <th className="text-left p-2">Month</th>
                <th className="text-right p-2">Income</th>
                <th className="text-right p-2">Expense</th>
                <th className="text-right p-2">Net Profit</th>
                <th className="text-right p-2">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {metrics.monthlyData.length > 0 ? (
                metrics.monthlyData.map(([month, data]) => {
                  const margin = data.income > 0 ? ((data.profit / data.income) * 100).toFixed(1) : 0;
                  return (
                    <tr key={month} className="border-b border-white/10">
                      <td className="p-2 font-semibold">{month}</td>
                      <td className="text-right p-2 text-blue-400">{currSymbol}{data.income.toLocaleString()}</td>
                      <td className="text-right p-2 text-red-400">{currSymbol}{data.expense.toLocaleString()}</td>
                      <td className={`text-right p-2 font-bold ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {currSymbol}{data.profit.toLocaleString()}
                      </td>
                      <td className="text-right p-2">{margin}%</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-400">
                    No data available. Add income and expenses to see your P&L report.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>💡 Tip: Add income and expenses from your trackers to see real-time P&L analysis</p>
        </div>
      </div>
    </div>
  );
}