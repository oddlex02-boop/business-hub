'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ToolsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const categories = [
    { id: 'all', name: 'All Tools', count: 21 },
    { id: 'finance', name: 'Finance & Billing', count: 7 },
    { id: 'crm', name: 'Client & CRM', count: 3 },
    { id: 'analytics', name: 'Analytics', count: 3 },
    { id: 'project', name: 'Project Management', count: 3 },
    { id: 'productivity', name: 'Productivity', count: 2 },
    { id: 'marketing', name: 'Marketing & Branding', count: 3 },
  ];

  const allTools = [
    // Finance & Billing Tools
    {
      emoji: "📄",
      title: "Invoice Generator",
      description: "Create professional invoices with PDF export and custom branding",
      gradient: "from-purple-500 to-pink-500",
      link: "/tools/invoice-generator",
      category: "finance"
    },
    {
      emoji: "📋",
      title: "Estimate / Quotation Maker",
      description: "Generate estimates and quotations for clients quickly",
      gradient: "from-blue-500 to-cyan-500",
      link: "/tools/estimate",
      category: "finance"
    },
    {
      emoji: "💳",
      title: "Payment Tracker",
      description: "Track payments, pending dues, and payment history",
      gradient: "from-green-500 to-emerald-500",
      link: "/tools/payment-tracker",
      category: "finance"
    },
    {
      emoji: "📈",
      title: "Income Tracker",
      description: "Monitor all income sources and revenue streams",
      gradient: "from-orange-500 to-red-500",
      link: "/tools/income-tracker",
      category: "finance"
    },
    {
      emoji: "💰",
      title: "Expense Tracker",
      description: "Track business expenses with categories and reports",
      gradient: "from-violet-500 to-purple-500",
      link: "/tools/expense-tracker",
      category: "finance"
    },
    {
      emoji: "📊",
      title: "Profit & Loss Dashboard",
      description: "Complete P&L reports with visual dashboards",
      gradient: "from-pink-500 to-rose-500",
      link: "/tools/profit-loss",
      category: "finance"
    },
    {
      emoji: "🧮",
      title: "Tax Calculator",
      description: "GST, Income Tax, and business tax calculations",
      gradient: "from-indigo-500 to-blue-500",
      link: "/tools/tax-calculator",
      category: "finance"
    },

    // Project Management
    {
      emoji: "💼",
      title: "Budget Planner",
      description: "Plan and manage business budgets effectively",
      gradient: "from-teal-500 to-cyan-500",
      link: "/tools/budget-planner",
      category: "project"
    },
    {
      emoji: "🔔",
      title: "Subscription Tracker",
      description: "Track all subscriptions and recurring payments",
      gradient: "from-red-500 to-pink-500",
      link: "/tools/subscription-tracker",
      category: "project"
    },
    {
      emoji: "🎯",
      title: "Goal Tracker",
      description: "Set and track monthly income and savings goals",
      gradient: "from-yellow-500 to-orange-500",
      link: "/tools/goal-tracker",
      category: "project"
    },

    // Client & CRM
    {
      emoji: "👥",
      title: "Client CRM Manager",
      description: "Manage clients, contacts, and relationships",
      gradient: "from-purple-500 to-pink-500",
      link: "/tools/crm",
      category: "crm"
    },
    {
      emoji: "📝",
      title: "Client Notes & History",
      description: "Track client conversations, deals, and history",
      gradient: "from-green-500 to-emerald-500",
      link: "/tools/client-notes",
      category: "crm"
    },
    // Analytics & Dashboard
    {
      emoji: "🖥️",
      title: "Business Dashboard",
      description: "Main control panel for your business overview",
      gradient: "from-violet-500 to-purple-500",
      link: "/dashboardtools",
      category: "analytics",
      comingSoon: true  // 🔒 Coming Soon
    },
    {
      emoji: "📊",
      title: "Analytics Dashboard",
      description: "Revenue, expense, and profit analytics",
      gradient: "from-pink-500 to-rose-500",
      link: "/tools/analytics",
      category: "analytics",
      comingSoon: true  // 🔒 Coming Soon
    },
    {
      emoji: "📈",
      title: "Performance Insights",
      description: "Client-wise and month-wise performance reports",
      gradient: "from-indigo-500 to-blue-500",
      link: "/tools/insights",
      category: "analytics",
      comingSoon: true  // 🔒 Coming Soon
    },

    // Productivity
    {
      emoji: "✅",
      title: "Project & Task Manager",
      description: "Organize projects, tasks, and deadlines",
      gradient: "from-teal-500 to-cyan-500",
      link: "/tools/task-manager",
      category: "productivity",
      comingSoon: true  // 🔒 Coming Soon
    },
    {
      emoji: "⏱️",
      title: "Time Tracker",
      description: "Track time spent on projects and tasks",
      gradient: "from-red-500 to-pink-500",
      link: "/tools/time-tracker",
      category: "productivity",
      comingSoon: true  // 🔒 Coming Soon
    },

    // Marketing & Branding
    {
      emoji: "💳",
      title: "Business Card Creator",
      description: "Design professional digital business cards",
      gradient: "from-yellow-500 to-orange-500",
      link: "/tools/business-card",
      category: "marketing",
      comingSoon: true  // 🔒 Coming Soon
    },
    {
      emoji: "✉️",
      title: "Email Signature Generator",
      description: "Create professional email signatures",
      gradient: "from-blue-500 to-cyan-500",
      link: "/tools/email-signature",
      category: "marketing",
      comingSoon: true  // 🔒 Coming Soon
    },
    {
      emoji: "🔗",
      title: "Quotation Sharing Tool",
      description: "Share invoices and quotes via email or link",
      gradient: "from-green-500 to-emerald-500",
      link: "/tools/sharing",
      category: "marketing",
      comingSoon: true  // 🔒 Coming Soon
    },
  ];

  const filteredTools = allTools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 sm:py-10 sm:py-8 sm:py-10 lg:py-12 lg:py-16 lg:py-20">
        <div className="text-center mb-4 sm:mb-6 sm:mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-5xl md:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            All Tools
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Explore our complete collection of 23 professional business tools
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-4 sm:mb-6 sm:mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 sm:px-6 lg:px-4 py-2 sm:px-6 sm:py-3 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-purple-500 transition"
            />
            <svg className="absolute right-4 top-4 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-4 sm:mb-6 sm:mb-8 sm:mb-10 lg:mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 sm:px-6 lg:px-8 py-2 rounded-lg transition ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool, index) => {
    
            // Wrapper decide kar rahe
            const Wrapper = tool.comingSoon ? 'div' : Link;

            return (
              <Wrapper
              href={tool.comingSoon ? undefined : tool.link}
              key={index}
              className={tool.comingSoon ? "cursor-not-allowed" : ""}
            >
             <div className="group relative p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 
               hover:border-white/30 transition-all duration-300 cursor-pointer 
               transform hover:scale-105 hover:shadow-2xl">

               {/* 🔒 Coming Soon Overlay */}
               {tool.comingSoon && (
                 <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-20">
                   <span className="text-white text-lg font-bold">🔒 Coming Soon</span>
                 </div>
               )}

               {/* Hover Glow */}
               <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 
                 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

               {/* Icon */}
               <div className={`relative w-14 h-14 bg-gradient-to-br ${tool.gradient} rounded-xl flex items-center justify-center mb-4`}>
                 {tool.emoji}
               </div>

               {/* Title */}
               <h3 className="relative text-lg md:text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                 {tool.title}
               </h3>

               {/* Description */}
               <p className="relative text-gray-400 text-sm mb-3">
                  {tool.description}
               </p>

               {/* Try Now */}
               <div className={`relative flex items-center text-purple-400 text-sm transition-all duration-300 
                 ${tool.comingSoon ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`}>
                 <span className="mr-2">Try it now</span>
                 <span>→</span>
               </div>
             </div>
            </Wrapper>
            );
          })}
        </div>


        {/* No Results */}
        {filteredTools.length === 0 && (
          <div className="text-center py-8 sm:py-10 lg:py-12 sm:py-10 sm:py-8 sm:py-10 lg:py-12 lg:py-16 lg:py-20">
            <div className="text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-5xl lg:text-6xl mb-4">🔍</div>
            <h3 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold mb-2">No tools found</h3>
            <p className="text-gray-400">Try a different search term or category</p>
          </div>
        )}
      </div>
    </div>
  );
}