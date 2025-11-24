'use client';
import React, { useState, useEffect } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addEntry, listenEntries, deleteEntry, updateEntry } from "@/firebase/userData";
import { subscribeToAuth } from "@/firebase/authListener";

const priorityColors = {
  high: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' },
  medium: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' },
  low: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400' },
};

export default function GoalTrackerPage() {
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [showCelebration, setShowCelebration] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'financial',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    priority: 'medium',
    notes: '',
    category: 'Personal'
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
    
    const unsubscribe = listenEntries(user.uid, 'goalTracker', (data) => {
      setGoals(data || []);
    });
    
    return () => unsubscribe();
  }, [user]);

  // 🆕 FIREBASE DATA SAVE FUNCTION
  const saveGoalToFirebase = async (goalData, action = 'add') => {
    if (!user) return;
    
    try {
      if (action === 'add') {
        await addEntry(user.uid, 'goalTracker', goalData);
      } else if (action === 'update') {
        await updateEntry(user.uid, 'goalTracker', goalData);
      }
      console.log('✅ Goal saved to Firebase');
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  // 🆕 FIREBASE DELETE FUNCTION
  const deleteGoalFromFirebase = async (goal) => {
    if (!user) return;
    
    try {
      await deleteEntry(user.uid, 'goalTracker', goal);
      console.log('✅ Goal deleted from Firebase');
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const currencies = [
    { code: 'INR', symbol: '₹' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
  ];

  const currSymbol = currencies.find(c => c.code === currency)?.symbol || '₹';

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'completed' && goal.type === 'financial' && (Number(goal.currentAmount)/Number(goal.targetAmount))*100 >= 100) ||
      (filter === 'active' && goal.type === 'financial' && (Number(goal.currentAmount)/Number(goal.targetAmount))*100 < 100) ||
      (filter === goal.priority);
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const goalData = {
      ...formData,
      id: editingGoal ? editingGoal.id : Date.now().toString(),
      createdAt: editingGoal ? editingGoal.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      targetAmount: parseFloat(formData.targetAmount) || 0,
      currentAmount: parseFloat(formData.currentAmount) || 0
    };

    if (editingGoal) {
      // Update existing goal
      setGoals(goals.map(g => g.id === editingGoal.id ? goalData : g));
      await saveGoalToFirebase(goalData, 'update');
      setEditingGoal(null);
    } else {
      // Add new goal
      setGoals([...goals, goalData]);
      await saveGoalToFirebase(goalData, 'add');
      
      // Check for celebration
      const progress = (Number(formData.currentAmount) / Number(formData.targetAmount)) * 100;
      if (progress >= 100) triggerCelebration();
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '', type: 'financial', targetAmount: '', currentAmount: '',
      targetDate: '', priority: 'medium', notes: '', category: 'Personal'
    });
    setShowAddGoal(false);
  };

  const deleteGoal = async (id) => {
    if (confirm('Delete this goal?')) {
      const goalToDelete = goals.find(g => g.id === id);
      setGoals(goals.filter(g => g.id !== id));
      if (goalToDelete) {
        await deleteGoalFromFirebase(goalToDelete);
      }
    }
  };

  const editGoal = (goal) => {
    setFormData({
      ...goal,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount?.toString() || ''
    });
    setEditingGoal(goal);
    setShowAddGoal(true);
  };

  const updateProgress = async (id, newAmount) => {
    const goal = goals.find(g => g.id === id);
    const updatedGoal = { 
      ...goal, 
      currentAmount: newAmount,
      updatedAt: new Date().toISOString()
    };
    
    // Local state update
    const updatedGoals = goals.map(g => g.id === id ? updatedGoal : g);
    setGoals(updatedGoals);
    
    // Firebase update
    await saveGoalToFirebase(updatedGoal, 'update');
    
    // Check for celebration
    if (goal.type === 'financial') {
      const progress = (Number(newAmount) / Number(goal.targetAmount)) * 100;
      if (progress >= 100 && Number(goal.currentAmount) < Number(goal.targetAmount)) {
        triggerCelebration();
      }
    }
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const getStatus = (goal) => {
    if (goal.type === 'financial') {
      const progress = (Number(goal.currentAmount)/Number(goal.targetAmount))*100;
      const today = new Date();
      const target = new Date(goal.targetDate);
      const daysLeft = Math.ceil((target - today)/(1000*60*60*24));
      if (progress >= 100) return { status: 'Completed', color: 'text-green-400', icon: '✅' };
      if (progress >= 75) return { status: 'On Track', color: 'text-green-400', icon: '🟢' };
      if (progress >= 50 || daysLeft > 30) return { status: 'In Progress', color: 'text-yellow-400', icon: '🟠' };
      return { status: 'Off Track', color: 'text-red-400', icon: '🔴' };
    }
    return { status: 'Active', color: 'text-blue-400', icon: '🔵' };
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const headers = [["Goal Name","Type","Target Amount","Current Amount","Target Date","Priority","Status"]];
    const rows = goals.map(goal => {
      const progress = goal.type === 'financial' ? ((Number(goal.currentAmount||0)/Number(goal.targetAmount||1))*100).toFixed(1) : 0;
      const status = progress >= 100 ? 'Completed' : progress >= 75 ? 'On Track' : progress >= 50 ? 'In Progress' : 'Off Track';
      return [goal.name, goal.type, goal.type==='financial'?goal.targetAmount:'-', goal.type==='financial'?goal.currentAmount:'-', new Date(goal.targetDate).toLocaleDateString(), goal.priority, status];
    });
    autoTable(doc, { head: headers, body: rows, startY: 25 });
    doc.save("goal-tracker.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Celebration Animation */}
        {showCelebration && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl text-center animate-bounce">
              <p className="text-6xl mb-4">🎉</p>
              <h2 className="text-3xl font-bold mb-2">Goal Achieved!</h2>
              <p className="text-xl">Congratulations! Keep up the great work! 💪</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">🎯 Goal Tracker</h1>
          <p className="text-sm sm:text-base text-gray-400">Plan, Track, and Achieve Your Dreams</p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddGoal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-sm font-semibold"
            >
              ➕ Add New Goal
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
          </div>
          <button onClick={exportPDF} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm">
            📄 Export PDF
          </button>
        </div>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-purple-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none"
          >
            <option value="all">All Goals</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Add/Edit Goal Form */}
        {showAddGoal && (
          <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-4">{editingGoal ? '✏️ Edit Goal' : '➕ Add New Goal'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm mb-1">Goal Name *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Buy a New Bike"
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Goal Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  >
                    <option value="financial">💰 Financial</option>
                    <option value="personal">🎓 Personal</option>
                  </select>
                </div>

                {formData.type === 'financial' && (
                  <>
                    <div>
                      <label className="block text-sm mb-1">Target Amount *</label>
                      <input
                        required
                        type="number"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                        placeholder="50000"
                        className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Current Saved Amount</label>
                      <input
                        type="number"
                        value={formData.currentAmount}
                        onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                        placeholder="10000"
                        className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm mb-1">Target Date *</label>
                  <input
                    required
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟠 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Travel">Travel</option>
                    <option value="Home">Home</option>
                    <option value="Education">Education</option>
                    <option value="Business">Business</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1">Notes / Description</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes or description..."
                    rows={3}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold"
                >
                  {editingGoal ? 'Update Goal' : 'Add Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setEditingGoal(null);
                  }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals Dashboard */}
        {filteredGoals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🎯</p>
            <h3 className="text-2xl font-bold mb-2">No Goals Yet</h3>
            <p className="text-gray-400 mb-6">Start by adding your first goal!</p>
            <button
              onClick={() => setShowAddGoal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold"
            >
              ➕ Add Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => {
              const progress = goal.type === 'financial' 
                ? ((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100).toFixed(1)
                : 0;
              const status = getStatus(goal);
              const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
              const priorityStyle = priorityColors[goal.priority];

              return (
                <div
                  key={goal.id}
                  className={`p-6 backdrop-blur-sm rounded-2xl border ${priorityStyle.border} ${priorityStyle.bg} hover:scale-105 transition-transform`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{goal.name}</h3>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full ${priorityStyle.bg} ${priorityStyle.text}`}>
                          {goal.priority.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-white/10 rounded-full">
                          {goal.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => editGoal(goal)}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition text-red-400"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  {goal.type === 'financial' && (
                    <>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Saved</span>
                          <span className="font-bold">
                            {currSymbol}{Number(goal.currentAmount || 0).toLocaleString()} / {currSymbol}{Number(goal.targetAmount).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 mb-1">
                          <div
                            className={`h-3 rounded-full ${progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 text-right">{progress}% Complete</p>
                      </div>

                      {/* Quick Update */}
                      <div className="flex gap-2 mb-4">
                        <input
                          type="number"
                          placeholder="Add amount"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value) {
                              const newAmount = Number(goal.currentAmount || 0) + Number(e.target.value);
                              updateProgress(goal.id, newAmount);
                              e.target.value = '';
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm"
                        />
                        <button
                          onClick={(e) => {
                            const input = e.target.parentElement.querySelector('input');
                            if (input.value) {
                              const newAmount = Number(goal.currentAmount || 0) + Number(input.value);
                              updateProgress(goal.id, newAmount);
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                        >
                          ➕
                        </button>
                      </div>
                    </>
                  )}

                  {/* Status & Date */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`font-semibold ${status.color}`}>
                        {status.icon} {status.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Target Date:</span>
                      <span className="font-semibold">{new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Days Left:</span>
                      <span className={`font-semibold ${daysLeft < 10 ? 'text-red-400' : daysLeft < 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {daysLeft > 0 ? daysLeft : 'Overdue'}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {goal.notes && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-400">{goal.notes}</p>
                    </div>
                  )}

                  {/* Motivation */}
                  {goal.type === 'financial' && progress >= 75 && progress < 100 && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                      <p className="text-xs">
                        🎉 Almost there! Just {currSymbol}{(Number(goal.targetAmount) - Number(goal.currentAmount)).toLocaleString()} more to go!
                      </p>
                    </div>
                  )}

                  {progress >= 100 && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg text-center">
                      <p className="text-sm font-bold">🎉 Goal Achieved! 🎉</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {goals.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-500/30 text-center">
              <p className="text-2xl font-bold">{goals.length}</p>
              <p className="text-xs text-gray-400">Total Goals</p>
            </div>
            <div className="p-4 bg-green-500/20 rounded-xl border border-green-500/30 text-center">
              <p className="text-2xl font-bold">
                {goals.filter(g => g.type === 'financial' && (Number(g.currentAmount) / Number(g.targetAmount)) * 100 >= 100).length}
              </p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
            <div className="p-4 bg-yellow-500/20 rounded-xl border border-yellow-500/30 text-center">
              <p className="text-2xl font-bold">
                {goals.filter(g => g.type === 'financial' && (Number(g.currentAmount) / Number(g.targetAmount)) * 100 < 100).length}
              </p>
              <p className="text-xs text-gray-400">In Progress</p>
            </div>
            <div className="p-4 bg-purple-500/20 rounded-xl border border-purple-500/30 text-center">
              <p className="text-2xl font-bold">
                {currSymbol}{goals.filter(g => g.type === 'financial').reduce((sum, g) => sum + Number(g.currentAmount || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">Total Saved</p>
            </div>
          </div>
        )}

        {/* Motivational Quote */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl text-center">
          <p className="text-lg italic mb-2">"A goal without a plan is just a wish."</p>
          <p className="text-sm text-gray-400">Keep tracking, keep achieving! 💪</p>
        </div>
      </div>
    </div>
  );
}