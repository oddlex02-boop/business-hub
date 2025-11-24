'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, Trash2, Phone, Video, FileText, DollarSign, Calendar, CheckCircle, Clock, Upload, X, Filter, Users } from 'lucide-react';
import { addEntry, listenEntries, deleteEntry, updateEntry } from "@/firebase/userData";
import { subscribeToAuth } from "@/firebase/authListener";

export default function ClientNotesPage() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState(null);

  // 🆕 FIREBASE DATA STATES
  const [clients, setClients] = useState([]);
  const [activities, setActivities] = useState([]);
  
  const [clientForm, setClientForm] = useState({
    name: '',
    company: '',
    email: ''
  });

  const [formData, setFormData] = useState({
    type: 'note',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    status: 'completed',
    followUp: false,
    attachments: []
  });

  // 🆕 FIREBASE AUTH LISTENER
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 🆕 FIREBASE CLIENTS DATA SYNC
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = listenEntries(user.uid, 'clientCRM', (data) => {
      setClients(data || []);
    });
    
    return () => unsubscribe();
  }, [user]);

  // 🆕 FIREBASE ACTIVITIES DATA SYNC
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = listenEntries(user.uid, 'clientNotes', (data) => {
      setActivities(data || []);
    });
    
    return () => unsubscribe();
  }, [user]);

  // 🆕 FIREBASE CLIENT SAVE FUNCTION
  const saveClientToFirebase = async (clientData, action = 'add') => {
    if (!user) return;
    
    try {
      if (action === 'add') {
        await addEntry(user.uid, 'clientCRM', {
          ...clientData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else if (action === 'update') {
        await updateEntry(user.uid, 'clientCRM', clientData);
      }
      console.log('✅ Client saved to Firebase');
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  // 🆕 FIREBASE ACTIVITY SAVE FUNCTION
  const saveActivityToFirebase = async (activityData, action = 'add') => {
    if (!user) return;
    
    try {
      if (action === 'add') {
        await addEntry(user.uid, 'clientNotes', {
          ...activityData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else if (action === 'update') {
        await updateEntry(user.uid, 'clientNotes', activityData);
      }
      console.log('✅ Activity saved to Firebase');
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  // 🆕 FIREBASE DELETE FUNCTIONS
  const deleteClientFromFirebase = async (client) => {
    if (!user) return;
    
    try {
      await deleteEntry(user.uid, 'clientCRM', client);
      console.log('✅ Client deleted from Firebase');
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const deleteActivityFromFirebase = async (activity) => {
    if (!user) return;
    
    try {
      await deleteEntry(user.uid, 'clientNotes', activity);
      console.log('✅ Activity deleted from Firebase');
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const activityTypes = [
    { id: 'note', label: 'Note', icon: <FileText className="w-4 h-4" />, color: 'purple' },
    { id: 'call', label: 'Call', icon: <Phone className="w-4 h-4" />, color: 'blue' },
    { id: 'meeting', label: 'Meeting', icon: <Video className="w-4 h-4" />, color: 'green' },
    { id: 'payment', label: 'Payment', icon: <DollarSign className="w-4 h-4" />, color: 'emerald' }
  ];

  const filteredActivities = useMemo(() => {
    if (!selectedClient) return [];
    
    let filtered = activities.filter(a => a.clientId === selectedClient.id);
    
    if (filter !== 'all') {
      filtered = filtered.filter(a => a.type === filter);
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [activities, selectedClient, filter]);

  // 🆕 UPDATED: Add Client with Firebase
  const handleAddClient = async (e) => {
    e.preventDefault();
    const newClient = {
      id: Date.now().toString(),
      ...clientForm,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Local state update
    setClients([...clients, newClient]);
    
    // Firebase save
    await saveClientToFirebase(newClient, 'add');
    
    setClientForm({ name: '', company: '', email: '' });
    setShowAddClient(false);
    setSelectedClient(newClient);
  };

  // 🆕 UPDATED: Submit Activity with Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClient) {
      alert('Please select a client first');
      return;
    }

    const activityData = {
      ...formData,
      clientId: selectedClient.id,
      id: editingNote ? editingNote.id : Date.now().toString(),
      createdAt: editingNote ? editingNote.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingNote) {
      // Update existing activity
      setActivities(activities.map(a =>
        a.id === editingNote.id ? activityData : a
      ));
      await saveActivityToFirebase(activityData, 'update');
      setEditingNote(null);
    } else {
      // Add new activity
      setActivities([...activities, activityData]);
      await saveActivityToFirebase(activityData, 'add');
    }

    resetForm();
    setShowAddNote(false);
  };

  const resetForm = () => {
    setFormData({
      type: 'note',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      followUp: false,
      attachments: []
    });
  };

  // 🆕 UPDATED: Edit Activity
  const handleEdit = (activity) => {
    setFormData(activity);
    setEditingNote(activity);
    setShowAddNote(true);
  };

  // 🆕 UPDATED: Delete Activity with Firebase
  const handleDelete = async (id) => {
    if (confirm('Delete this activity?')) {
      const activityToDelete = activities.find(a => a.id === id);
      
      // Local state update
      setActivities(activities.filter(a => a.id !== id));
      
      // Firebase delete
      if (activityToDelete) {
        await deleteActivityFromFirebase(activityToDelete);
      }
    }
  };

  // 🆕 UPDATED: Toggle Follow-up with Firebase
  const toggleFollowUp = async (id) => {
    const updatedActivities = activities.map(a =>
      a.id === id ? { ...a, followUp: !a.followUp, updatedAt: new Date().toISOString() } : a
    );
    
    // Local state update
    setActivities(updatedActivities);
    
    // Firebase update
    const activityToUpdate = updatedActivities.find(a => a.id === id);
    if (activityToUpdate) {
      await saveActivityToFirebase(activityToUpdate, 'update');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      note: 'from-purple-500 to-purple-600',
      call: 'from-blue-500 to-blue-600',
      meeting: 'from-green-500 to-green-600',
      payment: 'from-emerald-500 to-emerald-600'
    };
    return colors[type] || colors.note;
  };

  const getTypeIcon = (type) => {
    const activity = activityTypes.find(t => t.id === type);
    return activity?.icon || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">📋 Client Notes & History</h1>
          <p className="text-sm sm:text-base text-gray-400">Track all client interactions and activities</p>
        </div>

        {/* Integration Info */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <h3 className="font-bold text-blue-400 mb-2">🔗 Firebase Integrated</h3>
          <p className="text-sm text-gray-300 mb-2">Your client data is now securely stored in Firebase:</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-green-500/20 rounded-full text-xs">✓ Real-time Sync</span>
            <span className="px-3 py-1 bg-green-500/20 rounded-full text-xs">✓ Multi-device Access</span>
            <span className="px-3 py-1 bg-green-500/20 rounded-full text-xs">✓ Auto Backup</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Client Selector */}
          <div className="lg:col-span-1">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Clients</h3>
                <button
                  onClick={() => setShowAddClient(true)}
                  className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-gray-400 mb-4">No clients yet</p>
                  <button
                    onClick={() => setShowAddClient(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
                  >
                    Add First Client
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {clients.map(client => {
                    const clientActivities = activities.filter(a => a.clientId === client.id).length;
                    return (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`w-full text-left p-4 rounded-xl transition ${
                          selectedClient?.id === client.id
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{client.name}</p>
                            <p className="text-xs text-gray-400">{client.company}</p>
                          </div>
                          <span className="px-2 py-1 bg-white/20 rounded text-xs">
                            {clientActivities}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2">
            {!selectedClient ? (
              <div className="p-12 bg-white/5 rounded-2xl border border-white/10 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 mb-4">
                  {clients.length === 0 
                    ? 'Add a client first to start tracking activities'
                    : 'Select a client to view their activity timeline'
                  }
                </p>
                {clients.length === 0 && (
                  <button
                    onClick={() => setShowAddClient(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg transition"
                  >
                    Add Client
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <h2 className="text-xl font-bold">{selectedClient.name}</h2>
                    <p className="text-sm text-gray-400">{filteredActivities.length} activities</p>
                  </div>
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg transition flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Activity
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm transition ${
                      filter === 'all'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    All Activity
                  </button>
                  {activityTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setFilter(type.id)}
                      className={`px-4 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                        filter === type.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {type.icon}
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  {filteredActivities.length === 0 ? (
                    <div className="p-12 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-400 mb-4">No activities yet for {selectedClient.name}</p>
                      <button
                        onClick={() => setShowAddNote(true)}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                      >
                        Add First Activity
                      </button>
                    </div>
                  ) : (
                    filteredActivities.map((activity, index) => (
                      <div key={activity.id} className="relative">
                        {index < filteredActivities.length - 1 && (
                          <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-white/10" />
                        )}
                        
                        <div className="flex gap-4">
                          <div className={`relative z-10 w-12 h-12 bg-gradient-to-br ${getTypeColor(activity.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                            {getTypeIcon(activity.type)}
                          </div>

                          <div className="flex-1 p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-bold text-lg">{activity.title}</h3>
                                <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  {activity.date} at {activity.time}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {activity.followUp && (
                                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs border border-yellow-500/30">
                                    Follow-up
                                  </span>
                                )}
                                <span className={`px-2 py-1 rounded text-xs capitalize ${
                                  activity.status === 'completed'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                }`}>
                                  {activity.status}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-300 mb-4">{activity.description}</p>

                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => toggleFollowUp(activity.id)}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs flex items-center gap-1"
                              >
                                {activity.followUp ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {activity.followUp ? 'Remove Follow-up' : 'Mark Follow-up'}
                              </button>
                              <button
                                onClick={() => handleEdit(activity)}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(activity.id)}
                                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Client Modal */}
        {showAddClient && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add Client</h2>
                <button
                  onClick={() => setShowAddClient(false)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client Name *</label>
                  <input
                    required
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    value={clientForm.company}
                    onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                    placeholder="ABC Corp"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg transition"
                  >
                    Add Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddClient(false)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Activity Modal */}
        {showAddNote && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 max-w-2xl w-full my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editingNote ? 'Edit' : 'Add'} Activity</h2>
                <button
                  onClick={() => {
                    setShowAddNote(false);
                    setEditingNote(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Activity Type *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {activityTypes.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.id })}
                        className={`p-3 rounded-lg transition flex flex-col items-center gap-2 ${
                          formData.type === type.id
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {type.icon}
                        <span className="text-xs">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Follow-up call about project"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Add details about this activity..."
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date *</label>
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time *</label>
                    <input
                      required
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.followUp}
                        onChange={(e) => setFormData({ ...formData, followUp: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Requires Follow-up</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg transition"
                  >
                    {editingNote ? 'Update' : 'Add'} Activity
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddNote(false);
                      setEditingNote(null);
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

      </div>
    </div>
  );
}