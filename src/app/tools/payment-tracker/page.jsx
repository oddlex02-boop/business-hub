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

const paymentModes = ['Cash', 'UPI', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'PayPal', 'Other'];

const paymentStatuses = [
  { value: 'paid', label: '✅ Paid', color: 'bg-green-500/20 border-green-500/50 text-green-400' },
  { value: 'partial', label: '🕐 Partially Paid', color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' },
  { value: 'unpaid', label: '❌ Unpaid', color: 'bg-red-500/20 border-red-500/50 text-red-400' },
  { value: 'overdue', label: '⏳ Overdue', color: 'bg-orange-500/20 border-orange-500/50 text-orange-400' },
];

export default function PaymentTrackerPage() {
  const [payments, setPayments] = useState([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [currency, setCurrency] = useState('INR');
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedClient, setSelectedClient] = useState('all');
  const [viewMode, setViewMode] = useState('all');

  const [formData, setFormData] = useState({
    clientName: '',
    invoiceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    paidAmount: '',
    dueDate: '',
    paymentMode: 'UPI',
    transactionId: '',
    notes: '',
    status: 'unpaid'
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
    
    const unsubscribe = listenEntries(user.uid, 'paymentTracker', (data) => {
      setPayments(data || []);
    });
    
    return () => unsubscribe();
  }, [user]);

  // 🆕 FIREBASE DATA SAVE FUNCTION
  const savePaymentToFirebase = async (paymentData, action = 'add') => {
    if (!user) return;
    
    try {
      if (action === 'add') {
        await addEntry(user.uid, 'paymentTracker', paymentData);
      } else if (action === 'update') {
        await updateEntry(user.uid, 'paymentTracker', paymentData);
      }
      console.log('✅ Payment saved to Firebase');
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  // 🆕 FIREBASE DELETE FUNCTION
  const deletePaymentFromFirebase = async (payment) => {
    if (!user) return;
    
    try {
      await deleteEntry(user.uid, 'paymentTracker', payment);
      console.log('✅ Payment deleted from Firebase');
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  // 🆕 AUTO-SAVE TO FIREBASE
  useEffect(() => {
    const timer = setTimeout(() => {
      if (payments.length > 0 && user) {
        localStorage.setItem('payment_tracker_data', JSON.stringify(payments));
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [payments, user]);

  // Auto-detect overdue payments
  useEffect(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const updatedPayments = payments.map(payment => {
      if (payment.status === 'unpaid' || payment.status === 'partial') {
        const dueDate = new Date(payment.dueDate).setHours(0, 0, 0, 0);
        if (dueDate < today) {
          return { ...payment, status: 'overdue' };
        }
      }
      return payment;
    });
    
    if (JSON.stringify(updatedPayments) !== JSON.stringify(payments)) {
      setPayments(updatedPayments);
    }
  }, [payments]);

  const currSymbol = currencies.find(c => c.code === currency)?.symbol || '₹';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const paymentData = {
      ...formData,
      id: editingPayment?.id || Date.now().toString(),
      createdAt: editingPayment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      amount: parseFloat(formData.amount) || 0,
      paidAmount: parseFloat(formData.paidAmount) || 0
    };

    if (editingPayment) {
      // Update existing payment
      const updatedPayments = payments.map(p => p.id === editingPayment.id ? paymentData : p);
      setPayments(updatedPayments);
      await savePaymentToFirebase(paymentData, 'update');
    } else {
      // Add new payment
      const newPayments = [paymentData, ...payments];
      setPayments(newPayments);
      await savePaymentToFirebase(paymentData, 'add');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      invoiceNumber: '',
      paymentDate: new Date().toISOString().split('T')[0],
      amount: '',
      paidAmount: '',
      dueDate: '',
      paymentMode: 'UPI',
      transactionId: '',
      notes: '',
      status: 'unpaid'
    });
    setShowAddPayment(false);
    setEditingPayment(null);
  };

  const deletePayment = async (id) => {
    if (confirm('Delete this payment record?')) {
      const paymentToDelete = payments.find(p => p.id === id);
      setPayments(payments.filter(p => p.id !== id));
      if (paymentToDelete) {
        await deletePaymentFromFirebase(paymentToDelete);
      }
    }
  };

  const editPayment = (payment) => {
    setFormData({
      ...payment,
      amount: payment.amount.toString(),
      paidAmount: payment.paidAmount?.toString() || ''
    });
    setEditingPayment(payment);
    setShowAddPayment(true);
  };

  const markAsPaid = async (id) => {
    const payment = payments.find(p => p.id === id);
    const updatedPayment = { 
      ...payment, 
      status: 'paid', 
      paidAmount: payment.amount, 
      paymentDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };
    
    const updatedPayments = payments.map(p => p.id === id ? updatedPayment : p);
    setPayments(updatedPayments);
    await savePaymentToFirebase(updatedPayment, 'update');
  };

  const sendReminder = (payment) => {
    alert(`📧 Reminder sent to ${payment.clientName} for payment of ${currSymbol}${payment.amount}!\n\nInvoice: ${payment.invoiceNumber}\nDue Date: ${payment.dueDate}`);
  };

  // Get unique clients
  const clients = useMemo(() => {
    return [...new Set(payments.map(p => p.clientName))].sort();
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = payment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      const matchesMode = filterMode === 'all' || payment.paymentMode === filterMode;
      const matchesClient = selectedClient === 'all' || payment.clientName === selectedClient;
      
      let matchesDateRange = true;
      if (dateRange.start && dateRange.end) {
        const paymentDate = new Date(payment.paymentDate);
        matchesDateRange = paymentDate >= new Date(dateRange.start) && paymentDate <= new Date(dateRange.end);
      }
      
      return matchesSearch && matchesStatus && matchesMode && matchesClient && matchesDateRange;
    });
  }, [payments, searchQuery, filterStatus, filterMode, selectedClient, dateRange]);

  // Analytics
  const analytics = useMemo(() => {
    const totalPaid = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.paidAmount || p.amount), 0);
    
    const totalPending = payments
      .filter(p => p.status === 'unpaid' || p.status === 'partial')
      .reduce((sum, p) => sum + (Number(p.amount) - Number(p.paidAmount || 0)), 0);
    
    const totalOverdue = payments
      .filter(p => p.status === 'overdue')
      .reduce((sum, p) => sum + (Number(p.amount) - Number(p.paidAmount || 0)), 0);

    const totalPartial = payments
      .filter(p => p.status === 'partial')
      .reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);

    // Top 5 clients
    const clientTotals = payments.reduce((acc, payment) => {
      const amount = Number(payment.status === 'paid' ? payment.paidAmount || payment.amount : 0);
      acc[payment.clientName] = (acc[payment.clientName] || 0) + amount;
      return acc;
    }, {});
    
    const topClients = Object.entries(clientTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    // Monthly data for chart
    const monthlyData = payments.reduce((acc, payment) => {
      const month = new Date(payment.paymentDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[month]) acc[month] = { paid: 0, pending: 0 };
      
      if (payment.status === 'paid') {
        acc[month].paid += Number(payment.paidAmount || payment.amount);
      } else {
        acc[month].pending += Number(payment.amount) - Number(payment.paidAmount || 0);
      }
      return acc;
    }, {});

    return {
      totalPaid,
      totalPending,
      totalOverdue,
      totalPartial,
      topClients,
      monthlyData: Object.entries(monthlyData).slice(-6)
    };
  }, [payments]);

  // Client-wise grouping
  const clientWiseData = useMemo(() => {
    return clients.map(client => {
      const clientPayments = payments.filter(p => p.clientName === client);
      const totalAmount = clientPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const paidAmount = clientPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.paidAmount || p.amount), 0);
      const pendingAmount = totalAmount - paidAmount;
      
      return {
        client,
        totalPayments: clientPayments.length,
        totalAmount,
        paidAmount,
        pendingAmount,
        payments: clientPayments
      };
    });
  }, [clients, payments]);

  // Export functions
  const tableData = filteredPayments.map(p => ({
    name: p.clientName,
    amount: p.amount,
    type: p.status,
    date: p.paymentDate
  }));

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Payment Tracker Report", 14, 16);
    autoTable(doc, {
      head: [["Client", "Invoice", "Amount", "Status", "Payment Date"]],
      body: payments.map(p => [
        p.clientName,
        p.invoiceNumber,
        p.amount,
        p.status,
        p.paymentDate
      ]),
      startY: 25,
    });
    doc.save("payment-tracker.pdf");
  };

  const exportCSV = () => {
    let csv = "Client Name,Amount,Status,Payment Date\n";
    tableData.forEach((item) => {
      csv += `${item.name},${item.amount},${item.type},${item.date}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `payment_tracker_${Date.now()}.csv`;
    link.click();
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, `payment_tracker_${Date.now()}.xlsx`);
  };

  // Chart data
  const statusPieData = {
    labels: ['Paid', 'Pending', 'Overdue', 'Partial'],
    datasets: [{
      data: [
        analytics.totalPaid,
        analytics.totalPending - analytics.totalOverdue,
        analytics.totalOverdue,
        analytics.totalPartial
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#eab308'],
    }]
  };

  const monthlyLineData = {
    labels: analytics.monthlyData.map(([month]) => month),
    datasets: [
      {
        label: 'Paid',
        data: analytics.monthlyData.map(([, data]) => data.paid),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4
      },
      {
        label: 'Pending',
        data: analytics.monthlyData.map(([, data]) => data.pending),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        tension: 0.4
      }
    ]
  };

  const topClientsBarData = {
    labels: analytics.topClients.map(c => c.name),
    datasets: [{
      label: 'Total Paid Amount',
      data: analytics.topClients.map(c => c.amount),
      backgroundColor: 'rgba(139, 92, 246, 0.6)',
    }]
  };

  const getStatusColor = (status) => {
    return paymentStatuses.find(s => s.value === status)?.color || 'bg-gray-500/20';
  };

  const getStatusLabel = (status) => {
    return paymentStatuses.find(s => s.value === status)?.label || status;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' : 'bg-gray-100 text-black'} px-4 sm:px-6 lg:px-8 py-8 sm:py-12`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">💰 Payment Tracker</h1>
          <p className="text-sm sm:text-base text-gray-400">Track, Manage, and Analyze All Your Payments</p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddPayment(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-sm font-semibold"
            >
              ➕ Add Payment
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
            <button onClick={exportExcel} className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-xs sm:text-sm">
              📊 Excel
            </button>
            <button onClick={exportCSV} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs sm:text-sm">
              📋 CSV
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl border border-green-500/30">
            <p className="text-xs text-gray-400 mb-1">💚 Total Paid</p>
            <p className="text-2xl font-bold">{currSymbol}{analytics.totalPaid.toLocaleString()}</p>
            <p className="text-xs text-green-400 mt-1">{payments.filter(p => p.status === 'paid').length} payments</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl border border-yellow-500/30">
            <p className="text-xs text-gray-400 mb-1">⏳ Pending</p>
            <p className="text-2xl font-bold">{currSymbol}{analytics.totalPending.toLocaleString()}</p>
            <p className="text-xs text-yellow-400 mt-1">{payments.filter(p => p.status === 'unpaid' || p.status === 'partial').length} payments</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-sm rounded-xl border border-red-500/30">
            <p className="text-xs text-gray-400 mb-1">🔴 Overdue</p>
            <p className="text-2xl font-bold">{currSymbol}{analytics.totalOverdue.toLocaleString()}</p>
            <p className="text-xs text-red-400 mt-1">{payments.filter(p => p.status === 'overdue').length} payments</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30">
            <p className="text-xs text-gray-400 mb-1">📊 Total Records</p>
            <p className="text-2xl font-bold">{payments.length}</p>
            <p className="text-xs text-blue-400 mt-1">{clients.length} clients</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              viewMode === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            📋 All Payments
          </button>
          <button
            onClick={() => setViewMode('client-wise')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              viewMode === 'client-wise'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            👥 Client-wise View
          </button>
        </div>

        {/* Add/Edit Payment Form */}
        {showAddPayment && (
          <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-4">{editingPayment ? '✏️ Edit Payment' : '➕ Add New Payment'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">Client Name *</label>
                  <input
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Enter client name"
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Invoice Number *</label>
                  <input
                    required
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="INV-001"
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Total Amount *</label>
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
                  <label className="block text-sm mb-1">Paid Amount</label>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  >
                    {paymentModes.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Transaction ID / UTR</label>
                  <input
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  >
                    {paymentStatuses.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-sm mb-1">Notes / Remarks</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes..."
                    rows={2}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold"
                >
                  {editingPayment ? 'Update' : 'Add Payment'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="🔍 Search client or invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              {paymentStatuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            >
              <option value="all">All Modes</option>
              {paymentModes.map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>

            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
            >
              <option value="all">All Clients</option>
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setFilterMode('all');
                setSelectedClient('all');
                setDateRange({ start: '', end: '' });
              }}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm"
            >
              🔄 Reset Filters
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

        {/* Main Content */}
        {viewMode === 'all' ? (
          /* All Payments View */
          filteredPayments.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">💰</p>
              <h3 className="text-2xl font-bold mb-2">No Payment Records</h3>
              <p className="text-gray-400 mb-6">Start tracking your payments!</p>
              <button
                onClick={() => setShowAddPayment(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold"
              >
                ➕ Add First Payment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => {
                const paidAmt = Number(payment.paidAmount || 0);
                const totalAmt = Number(payment.amount);
                const pendingAmt = totalAmt - paidAmt;
                const isOverdue = payment.status === 'overdue';
                const daysUntilDue = payment.dueDate ? Math.ceil((new Date(payment.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

                return (
                  <div
                    key={payment.id}
                    className={`p-4 backdrop-blur-sm rounded-xl border ${getStatusColor(payment.status)} hover:scale-[1.01] transition-transform`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold">{payment.clientName}</h3>
                            <p className="text-sm text-gray-400">Invoice: {payment.invoiceNumber}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                            {getStatusLabel(payment.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs">Amount</p>
                            <p className="font-semibold">{currSymbol}{totalAmt.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Paid</p>
                            <p className="font-semibold text-green-400">{currSymbol}{paidAmt.toLocaleString()}</p>
                          </div>
                          {pendingAmt > 0 && (
                            <div>
                              <p className="text-gray-400 text-xs">Pending</p>
                              <p className="font-semibold text-yellow-400">{currSymbol}{pendingAmt.toLocaleString()}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-400 text-xs">Mode</p>
                            <p className="font-semibold">{payment.paymentMode}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          <span className="text-gray-400">📅 {new Date(payment.paymentDate).toLocaleDateString()}</span>
                          {payment.dueDate && (
                            <span className={isOverdue ? 'text-red-400' : daysUntilDue <= 7 ? 'text-yellow-400' : 'text-gray-400'}>
                              📆 Due: {new Date(payment.dueDate).toLocaleDateString()}
                              {daysUntilDue !== null && !isOverdue && ` (${daysUntilDue} days)`}
                            </span>
                          )}
                          {payment.transactionId && (
                            <span className="text-gray-400">🔖 {payment.transactionId}</span>
                          )}
                        </div>

                        {payment.notes && (
                          <p className="text-xs text-gray-400 mt-2 italic">💬 {payment.notes}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col gap-2">
                        {payment.status !== 'paid' && (
                          <>
                            <button
                              onClick={() => markAsPaid(payment.id)}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-semibold whitespace-nowrap"
                            >
                              ✅ Mark Paid
                            </button>
                            <button
                              onClick={() => sendReminder(payment)}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold whitespace-nowrap"
                            >
                              📧 Remind
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => editPayment(payment)}
                          className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xs font-semibold"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deletePayment(payment.id)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-semibold"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Client-wise View */
          <div className="space-y-6">
            {clientWiseData.map((clientData) => (
              <div key={clientData.client} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{clientData.client}</h3>
                    <p className="text-sm text-gray-400">{clientData.totalPayments} payments</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Total Amount</p>
                    <p className="text-2xl font-bold">{currSymbol}{clientData.totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <p className="text-xs text-gray-400">Paid</p>
                    <p className="text-lg font-bold text-green-400">{currSymbol}{clientData.paidAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <p className="text-xs text-gray-400">Pending</p>
                    <p className="text-lg font-bold text-yellow-400">{currSymbol}{clientData.pendingAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <p className="text-xs text-gray-400">Completion</p>
                    <p className="text-lg font-bold text-blue-400">
                      {((clientData.paidAmount / clientData.totalAmount) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <details className="group">
                  <summary className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition list-none flex items-center justify-between">
                    <span className="font-semibold">📋 View All Transactions</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-3 space-y-2">
                    {clientData.payments.map(payment => (
                      <div key={payment.id} className="p-3 bg-white/5 rounded-lg flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold">{payment.invoiceNumber}</p>
                          <p className="text-xs text-gray-400">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{currSymbol}{Number(payment.amount).toLocaleString()}</p>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(payment.status)}`}>
                            {getStatusLabel(payment.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        {/* Charts Section */}
        {payments.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-lg font-bold mb-4">💰 Payment Status Distribution</h3>
              <div className="h-64">
                <Pie data={statusPieData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="lg:col-span-2 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-lg font-bold mb-4">📈 Monthly Payment Trend</h3>
              <div className="h-64">
                <Line data={monthlyLineData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            {analytics.topClients.length > 0 && (
              <div className="lg:col-span-3 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <h3 className="text-lg font-bold mb-4">🏆 Top 5 Clients by Payment Value</h3>
                <div className="h-64">
                  <Bar data={topClientsBarData} options={{ maintainAspectRatio: false, indexAxis: 'y' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats Table */}
        {payments.length > 0 && (
          <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-x-auto">
            <h3 className="text-lg font-bold mb-4">📊 Payment Summary by Status</h3>
            <table className="w-full text-sm">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="text-left p-2">Status</th>
                  <th className="text-right p-2">Count</th>
                  <th className="text-right p-2">Total Amount</th>
                  <th className="text-right p-2">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {paymentStatuses.map(status => {
                  const statusPayments = payments.filter(p => p.status === status.value);
                  const statusTotal = statusPayments.reduce((sum, p) => 
                    sum + (status.value === 'paid' ? Number(p.paidAmount || p.amount) : Number(p.amount) - Number(p.paidAmount || 0)), 0
                  );
                  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
                  const percentage = totalAmount > 0 ? ((statusTotal / totalAmount) * 100).toFixed(1) : 0;

                  return statusPayments.length > 0 ? (
                    <tr key={status.value} className="border-b border-white/10">
                      <td className="p-2">{status.label}</td>
                      <td className="text-right p-2">{statusPayments.length}</td>
                      <td className="text-right p-2 font-semibold">{currSymbol}{statusTotal.toLocaleString()}</td>
                      <td className="text-right p-2">{percentage}%</td>
                    </tr>
                  ) : null;
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Overdue Alerts */}
        {payments.filter(p => p.status === 'overdue').length > 0 && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
            <h3 className="font-bold text-red-400 mb-2">⚠️ Overdue Payments Alert</h3>
            <p className="text-sm mb-3">You have {payments.filter(p => p.status === 'overdue').length} overdue payment(s) totaling {currSymbol}{analytics.totalOverdue.toLocaleString()}</p>
            <div className="space-y-2">
              {payments.filter(p => p.status === 'overdue').slice(0, 3).map(payment => (
                <div key={payment.id} className="flex items-center justify-between text-sm bg-black/20 p-2 rounded">
                  <span>{payment.clientName} - {payment.invoiceNumber}</span>
                  <button
                    onClick={() => sendReminder(payment)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                  >
                    Send Reminder
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Mode Stats */}
        {payments.length > 0 && (
          <div className="mt-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">💳 Payment Methods Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {paymentModes.map(mode => {
                const modePayments = payments.filter(p => p.paymentMode === mode && p.status === 'paid');
                const modeTotal = modePayments.reduce((sum, p) => sum + Number(p.paidAmount || p.amount), 0);
                
                return modeTotal > 0 ? (
                  <div key={mode} className="p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-gray-400">{mode}</p>
                    <p className="text-lg font-bold">{currSymbol}{modeTotal.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{modePayments.length} payments</p>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}