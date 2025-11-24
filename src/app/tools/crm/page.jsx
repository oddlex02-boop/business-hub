'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Download, Upload, Search, Filter, TrendingUp, DollarSign, UserCheck, UserPlus, Eye, Mail, Phone, MapPin, Calendar, Tag, X } from 'lucide-react';
import { addEntry, listenEntries, deleteEntry, updateEntry } from "@/firebase/userData";
import { subscribeToAuth } from "@/firebase/authListener";

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState('clients');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [user, setUser] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    tag: 'all',
    businessType: 'all',
    sortBy: 'name'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    businessType: 'E-commerce',
    tags: [],
    status: 'lead',
    dealAmount: '',
    totalRevenue: '',
    notes: '',
    avatar: null
  });

  const businessTypes = ['E-commerce', 'IT Services', 'Manufacturing', 'Retail', 'Healthcare', 'Education', 'Finance', 'Real Estate', 'Other'];
  const statusOptions = ['lead', 'active', 'inactive', 'lost'];
  const tagOptions = ['VIP', 'High Value', 'Regular', 'New', 'Potential', 'Frequent'];

  // 🆕 FIREBASE AUTH LISTENER
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 🆕 FIREBASE REAL-TIME CLIENTS DATA SYNC
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = listenEntries(user.uid, 'clientCRM', (data) => {
      setClients(data || []);
    });
    
    return () => unsubscribe();
  }, [user]);

  // 🆕 FIREBASE DATA SAVE FUNCTION
  const saveClientToFirebase = async (clientData, action = 'add') => {
    if (!user) return;
    
    try {
      if (action === 'add') {
        await addEntry(user.uid, 'clientCRM', clientData);
      } else if (action === 'update') {
        await updateEntry(user.uid, 'clientCRM', clientData);
      }
      console.log('✅ Client saved to Firebase');
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  // 🆕 FIREBASE DELETE FUNCTION
  const deleteClientFromFirebase = async (client) => {
    if (!user) return;
    
    try {
      await deleteEntry(user.uid, 'clientCRM', client);
      console.log('✅ Client deleted from Firebase');
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  // Analytics
  const analytics = useMemo(() => {
    const active = clients.filter(c => c.status === 'active').length;
    const leads = clients.filter(c => c.status === 'lead').length;
    const highValue = clients.filter(c => c.tags.includes('High Value') || c.totalRevenue >= 100000).length;
    const totalRevenue = clients.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
    const avgDealSize = clients.length ? (clients.reduce((sum, c) => sum + (c.dealAmount || 0), 0) / clients.length) : 0;
    
    return {
      total: clients.length,
      active,
      leads,
      highValue,
      totalRevenue,
      avgDealSize,
      inactive: clients.filter(c => c.status === 'inactive').length
    };
  }, [clients]);

  // Filtered Clients
  const filteredClients = useMemo(() => {
    let filtered = [...clients];

    if (filters.search) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.company.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.tag !== 'all') {
      filtered = filtered.filter(c => c.tags.includes(filters.tag));
    }

    if (filters.businessType !== 'all') {
      filtered = filtered.filter(c => c.businessType === filters.businessType);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'revenue': return (b.totalRevenue || 0) - (a.totalRevenue || 0);
        case 'date': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'lastContact': return new Date(b.lastContact) - new Date(a.lastContact);
        default: return 0;
      }
    });

    return filtered;
  }, [clients, filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const clientData = {
      ...formData,
      id: editingClient ? editingClient.id : Date.now().toString(),
      createdAt: editingClient ? editingClient.createdAt : new Date().toISOString(),
      lastContact: new Date().toISOString(),
      invoiceCount: editingClient ? editingClient.invoiceCount : 0,
      dealAmount: parseFloat(formData.dealAmount) || 0,
      totalRevenue: parseFloat(formData.totalRevenue) || 0
    };

    if (editingClient) {
      // Update existing client
      const updatedClients = clients.map(c =>
        c.id === editingClient.id ? clientData : c
      );
      setClients(updatedClients);
      await saveClientToFirebase(clientData, 'update');
      setEditingClient(null);
    } else {
      // Add new client
      const newClients = [...clients, clientData];
      setClients(newClients);
      await saveClientToFirebase(clientData, 'add');
    }

    resetForm();
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', company: '', address: '',
      businessType: 'E-commerce', tags: [], status: 'lead',
      dealAmount: '', totalRevenue: '', notes: '', avatar: null
    });
  };

  const handleEdit = (client) => {
    setFormData({
      ...client,
      dealAmount: client.dealAmount?.toString() || '',
      totalRevenue: client.totalRevenue?.toString() || ''
    });
    setEditingClient(client);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this client?')) {
      const clientToDelete = clients.find(c => c.id === id);
      setClients(clients.filter(c => c.id !== id));
      if (clientToDelete) {
        await deleteClientFromFirebase(clientToDelete);
      }
    }
  };

  const handleTagToggle = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tag)
        ? formData.tags.filter(t => t !== tag)
        : [...formData.tags, tag]
    });
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Business Type', 'Status', 'Tags', 'Deal Amount', 'Total Revenue', 'Created At'];
    const rows = clients.map(c => [
      c.name, c.email, c.phone, c.company, c.businessType, c.status,
      c.tags.join(';'), c.dealAmount, c.totalRevenue, c.createdAt
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients.csv';
    a.click();
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target.result;
        const rows = text.split('\n').slice(1); // Skip header
        const imported = rows.map((row, idx) => {
          const [name, email, phone, company, businessType, status, tags, dealAmount, totalRevenue] = row.split(',');
          return {
            id: Date.now() + idx,
            name: name || 'Unknown',
            email: email || '',
            phone: phone || '',
            company: company || '',
            address: '',
            businessType: businessType || 'Other',
            tags: tags ? tags.split(';') : [],
            status: status || 'lead',
            dealAmount: parseFloat(dealAmount) || 0,
            totalRevenue: parseFloat(totalRevenue) || 0,
            createdAt: new Date().toISOString(),
            lastContact: new Date().toISOString(),
            notes: '',
            invoiceCount: 0,
            avatar: null
          };
        }).filter(c => c.name !== 'Unknown');
        
        // Save imported clients to Firebase
        for (const client of imported) {
          await saveClientToFirebase(client, 'add');
        }
        
        alert(`✅ Imported ${imported.length} clients successfully!`);
      };
      reader.readAsText(file);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      lead: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      lost: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || colors.lead;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">👥 Client CRM Manager</h1>
            <p className="text-sm sm:text-base text-gray-400">Manage all your clients in one powerful platform</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg transition flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Add Client
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <label className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-2 text-sm cursor-pointer">
              <Upload className="w-4 h-4" /> Import
              <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'clients', label: 'All Clients', icon: '👥' },
            { id: 'dashboard', label: 'Dashboard', icon: '📊' }
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

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-600/20 to-purple-600/10 border border-purple-500/30 rounded-xl">
                <Users className="w-6 h-6 text-purple-400 mb-2" />
                <p className="text-2xl font-bold">{analytics.total}</p>
                <p className="text-xs text-gray-400">Total Clients</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-600/20 to-green-600/10 border border-green-500/30 rounded-xl">
                <UserCheck className="w-6 h-6 text-green-400 mb-2" />
                <p className="text-2xl font-bold">{analytics.active}</p>
                <p className="text-xs text-gray-400">Active</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-600/20 to-blue-600/10 border border-blue-500/30 rounded-xl">
                <UserPlus className="w-6 h-6 text-blue-400 mb-2" />
                <p className="text-2xl font-bold">{analytics.leads}</p>
                <p className="text-xs text-gray-400">Leads</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-600/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl">
                <TrendingUp className="w-6 h-6 text-yellow-400 mb-2" />
                <p className="text-2xl font-bold">{analytics.highValue}</p>
                <p className="text-xs text-gray-400">High Value</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-pink-600/20 to-pink-600/10 border border-pink-500/30 rounded-xl col-span-2">
                <DollarSign className="w-6 h-6 text-pink-400 mb-2" />
                <p className="text-2xl font-bold">₹{(analytics.totalRevenue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-400">Total Revenue</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold mb-4">📊 Client Status Distribution</h3>
                <div className="space-y-3">
                  {statusOptions.map(status => {
                    const count = clients.filter(c => c.status === status).length;
                    const percentage = (count / clients.length) * 100;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{status}</span>
                          <span>{count} ({percentage.toFixed(0)}%)</span>
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

              {/* Top Clients */}
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold mb-4">⭐ Top Clients by Revenue</h3>
                <div className="space-y-3">
                  {clients
                    .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
                    .slice(0, 5)
                    .map(client => (
                      <div key={client.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-sm">
                            {getInitials(client.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{client.name}</p>
                            <p className="text-xs text-gray-400">{client.company}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-400">₹{(client.totalRevenue / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-gray-400">{client.invoiceCount} invoices</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Business Type Distribution */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4">🏢 Business Type Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {businessTypes.map(type => {
                  const count = clients.filter(c => c.businessType === type).length;
                  return count > 0 ? (
                    <div key={type} className="p-4 bg-white/5 rounded-lg text-center">
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-gray-400 mt-1">{type}</p>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Clients List View */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            
            {/* Filters */}
            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters & Search
                </h3>
                <button
                  onClick={() => setFilters({ search: '', status: 'all', tag: 'all', businessType: 'all', sortBy: 'name' })}
                  className="text-sm px-3 py-1 bg-white/10 hover:bg-white/20 rounded"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-sm"
                  />
                </div>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-sm"
                >
                  <option value="all">All Status</option>
                  {statusOptions.map(s => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>

                <select
                  value={filters.tag}
                  onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-sm"
                >
                  <option value="all">All Tags</option>
                  {tagOptions.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select
                  value={filters.businessType}
                  onChange={(e) => setFilters({ ...filters, businessType: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-sm"
                >
                  <option value="all">All Business Types</option>
                  {businessTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="revenue">Sort by Revenue</option>
                  <option value="date">Sort by Date Added</option>
                  <option value="lastContact">Sort by Last Contact</option>
                </select>
              </div>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map(client => (
                <div key={client.id} className="group p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold">
                        {getInitials(client.name)}
                      </div>
                      <div>
                        <h3 className="font-bold">{client.name}</h3>
                        <p className="text-xs text-gray-400">{client.company}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs border capitalize ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {client.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-purple-500/20 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-xs text-gray-400">Revenue</p>
                      <p className="font-bold text-green-400">₹{(client.totalRevenue / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-xs text-gray-400">Invoices</p>
                      <p className="font-bold">{client.invoiceCount}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDetails(client)}
                      className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                    <button
                      onClick={() => handleEdit(client)}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No clients found</p>
                <p className="text-sm">Try adjusting your filters or add a new client</p>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 max-w-2xl w-full my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editingClient ? 'Edit' : 'Add New'} Client</h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingClient(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Client Name *</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Company</label>
                    <input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="ABC Corp"
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    placeholder="Full address..."
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Business Type *</label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                    >
                      {businessTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status} className="capitalize">{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 rounded-lg text-sm transition ${
                          formData.tags.includes(tag)
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Deal Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.dealAmount}
                      onChange={(e) => setFormData({ ...formData, dealAmount: e.target.value })}
                      placeholder="50000"
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Total Revenue (₹)</label>
                    <input
                      type="number"
                      value={formData.totalRevenue}
                      onChange={(e) => setFormData({ ...formData, totalRevenue: e.target.value })}
                      placeholder="250000"
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Any additional information about this client..."
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg transition"
                  >
                    {editingClient ? 'Update' : 'Add'} Client
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingClient(null);
                      resetForm();
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

        {/* Client Details Modal */}
        {showDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 max-w-2xl w-full my-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-xl">
                    {getInitials(showDetails.name)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{showDetails.name}</h2>
                    <p className="text-gray-400">{showDetails.company}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(null)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5" /> Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{showDetails.email}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{showDetails.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{showDetails.address}</span>
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div>
                  <h3 className="font-bold text-lg mb-3">🏢 Business Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Business Type</p>
                      <p className="font-semibold">{showDetails.businessType}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Status</p>
                      <span className={`px-2 py-1 rounded text-xs border capitalize ${getStatusColor(showDetails.status)}`}>
                        {showDetails.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {showDetails.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Financial Info */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" /> Financial Information
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="p-4 bg-gradient-to-br from-green-600/20 to-green-600/10 border border-green-500/30 rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-1">Total Revenue</p>
                      <p className="text-xl font-bold text-green-400">₹{(showDetails.totalRevenue / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-600/20 to-blue-600/10 border border-blue-500/30 rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-1">Deal Amount</p>
                      <p className="text-xl font-bold text-blue-400">₹{(showDetails.dealAmount / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-600/20 to-purple-600/10 border border-purple-500/30 rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-1">Invoices</p>
                      <p className="text-xl font-bold text-purple-400">{showDetails.invoiceCount}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Timeline
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-400">Client Since</span>
                      <span className="font-semibold">{showDetails.createdAt}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-400">Last Contact</span>
                      <span className="font-semibold">{showDetails.lastContact}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {showDetails.notes && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">📝 Notes</h3>
                    <div className="p-4 bg-white/5 rounded-lg text-sm text-gray-300">
                      {showDetails.notes}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      handleEdit(showDetails);
                      setShowDetails(null);
                    }}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Client
                  </button>
                  <button
                    onClick={() => window.open(`mailto:${showDetails.email}`)}
                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}