'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Typewriter } from 'react-simple-typewriter';
import HeroSection from '@/components/HeroSection';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    { emoji: "💼", title: "Top Professional Tools", desc: "Complete business & Freelance tools Hub" },
    { emoji: "✨", title: "100% Free Forever", desc: "No hidden charges" },
    { emoji: "🚀", title: "Easy to Use", desc: "No learning curve" }
  ];

  const topTools = [
    {
      emoji: "🧾",
      title: "Finance & Billing Tools",
      description: "Manage invoices, expenses, and financial tracking",
      gradient: "from-purple-500 to-pink-500",
      toolCount: 7,
      link: "/tools?category=finance",
      featured: ["Invoice Generator", "Tax Calculator", "Expense Tracker"]
    },
    {
      emoji: "👥",
      title: "Client & CRM Management",
      description: "Manage clients, track communications, and feedback",
      gradient: "from-blue-500 to-cyan-500",
      toolCount: 4,
      featured: ["Client CRM Manager", "Payment Reminders", "Client Notes"],
      link: "/tools?category=crm"
    },
    {
      emoji: "📊",
      title: "Analytics & Dashboard",
      description: "Track performance, revenue, and business insights",
      gradient: "from-green-500 to-emerald-500",
      toolCount: 3,
      link: "/tools?category=analytics",
      featured: ["Business Dashboard", "Performance Insights", "Analytics"]
    },
    {
      emoji: "📋",
      title: "Project & Work Management",
      description: "Plan budgets, track goals, and manage subscriptions",
      gradient: "from-orange-500 to-red-500",
      toolCount: 3,
      link: "/tools?category=project",
      featured: ["Budget Planner", "Goal Tracker", "Subscription Tracker"]
    },
    {
      emoji: "🎨",
      title: "Marketing & Brand Identity",
      description: "Create business cards, signatures, and brand identity",
      toolCount: 3,
      gradient: "from-yellow-500 to-orange-500",
      link: "/tools?category=marketing",
      featured: ["Business Card", "Email Signature", "Branding Tools"]
    },
    {
      emoji: "⚡",
      title: "Project & Productivity",
      description: "Manage projects, tasks, and track time efficiently",
      gradient: "from-pink-500 to-rose-500",
      toolCount: 2,
      link: "/tools?category=productivity",
      featured: ["Task Manager", "Time Tracker"]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Hero Section */}
      <HeroSection features={features} />

      {/* Tools Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 sm:py-10 sm:py-8 sm:py-10 lg:py-12 lg:py-16 lg:py-20">
        <div className="text-center mb-4 sm:mb-6 sm:mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-5xl font-bold mb-4">
            Explore Our Core <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Business Tool Categories</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400">Every tool your business needs, organized by category.
          Finance, CRM, Analytics, Marketing, Productivity — all in one place, 100% free.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-2 sm:gap-3 lg:gap-4 lg:gap-6">
          {topTools.map((tool, index) => (
            <Link href={tool.link} key={index}>
              <div
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
                className={`group relative p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                
                <div className={`relative w-14 h-14 bg-gradient-to-br ${tool.gradient} rounded-xl flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform duration-300 text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl`}>
                  {tool.emoji}
                </div>
                
                <h3 className="relative text-base sm:text-lg md:text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="relative text-gray-400 text-sm mb-3">
                  {tool.description}
                </p>
                
                <div className="relative flex items-center text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2 text-sm">
                  <span className="mr-2">Try it now</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-block mb-4 sm:mb-6">
            <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-sm border border-purple-500/30 backdrop-blur-sm">
              ✨ Enjoy! But More Tools Coming Soon
            </span>
          </div>
          <br />
          <Link href="/tools">
            <button className="px-4 py-2 sm:px-6 sm:py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl text-lg font-semibold hover:from-purple-600/30 hover:to-pink-600/30 transition border border-purple-500/30 flex items-center gap-2 mx-auto">
              View All Tools
              <span>→</span>
            </button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 sm:py-10 sm:py-8 sm:py-10 lg:py-12 lg:py-16 lg:py-20">
        <div className="relative p-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-pulse"></div>
          
          <div className="relative text-center max-w-3xl mx-auto">
            <h2 className="text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Ready to boost your productivity?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-4 sm:mb-6 sm:mb-8">
              Join thousands of users who trust Oddlex for their daily tasks
            </p>
            <Link href="/login">
             <button className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-base sm:text-lg md:text-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105">
               Start Using Oddlex Business Hub Free
             </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}