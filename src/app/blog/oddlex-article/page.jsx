import React from 'react';
import Link from 'next/link';

export default function OddlexArticlePage() {
  return (
    <article className="min-h-screen text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <div className="inline-block px-4 py-1 bg-purple-500/20 rounded-full text-sm mb-4 border border-purple-500/30">
              📅 Published: January 2025 | ⏱️ 10 min read
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Oddlex: The Complete All-In-One Business Hub
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
              Stop juggling 15 different apps. Manage your entire business from one powerful platform.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              
              <Link href="/tools" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition border border-white/20">
                Explore Tools
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Table of Contents */}
        <div className="mb-12 p-6 bg-white/5 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4">📋 Table of Contents</h2>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#what-is-oddlex" className="hover:text-purple-400 transition">→ What is Oddlex?</a></li>
            <li><a href="#key-features" className="hover:text-purple-400 transition">→ Key Features</a></li>
            <li><a href="#tools" className="hover:text-purple-400 transition">→ 23+ Professional Tools</a></li>
            <li><a href="#who-needs" className="hover:text-purple-400 transition">→ Who Needs Oddlex?</a></li>
            <li><a href="#pricing" className="hover:text-purple-400 transition">→ Pricing & Plans</a></li>
            <li><a href="#getting-started" className="hover:text-purple-400 transition">→ Getting Started</a></li>
          </ul>
        </div>

        {/* Content Sections */}
        <div className="prose prose-invert prose-lg max-w-none space-y-12">
          
          {/* Section 1 */}
          <section id="what-is-oddlex">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-400">🎯 What is Oddlex?</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Oddlex is a revolutionary all-in-one business management platform designed for freelancers, small businesses, and entrepreneurs who are tired of juggling multiple apps and subscriptions.
              </p>
              <p>
                Instead of paying for separate tools for invoicing, CRM, project management, expense tracking, and analytics, Oddlex combines everything into one seamless platform — and it's <strong className="text-white">100% free</strong>.
              </p>
              <div className="p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 my-6">
                <p className="text-lg font-semibold text-white mb-2">💡 The Problem Oddlex Solves:</p>
                <ul className="space-y-2 text-sm">
                  <li>✓ Too many expensive subscriptions ($50-200/month)</li>
                  <li>✓ Data scattered across different platforms</li>
                  <li>✓ Time wasted switching between apps</li>
                  <li>✓ Complicated interfaces that slow you down</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="key-features">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-400">✨ Key Features</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { icon: '📄', title: 'Professional Invoicing', desc: 'Create branded invoices in seconds' },
                { icon: '👥', title: 'Client CRM', desc: 'Manage all client relationships' },
                { icon: '📊', title: 'Business Analytics', desc: 'Real-time insights & reports' },
                { icon: '💰', title: 'Expense Tracking', desc: 'Track every rupee automatically' },
                { icon: '🎯', title: 'Project Management', desc: 'Tasks, timelines, & deadlines' },
                { icon: '🔔', title: 'Payment Reminders', desc: 'Never miss a payment again' }
              ].map((feature, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3 */}
          <section id="tools">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-400">🛠️ Top Professional Tools</h2>
            <div className="space-y-6">
              {[
                {
                  category: '💼 Finance & Billing (7 Tools)',
                  tools: [
                    'Invoice Generator - Create professional invoices with PDF export',
                    'Estimate/Quotation Maker - Send quotes to clients instantly',
                    'Payment Tracker - Track all incoming payments',
                    'Income Tracker - Monitor revenue streams',
                    'Expense Tracker - Categorize and analyze expenses',
                    'Profit & Loss Dashboard - Complete P&L reports',
                    'Tax Calculator - GST, Income Tax calculations'
                  ]
                },
                {
                  category: '👥 Client Management (4 Tools)',
                  tools: [
                    'Client CRM - Complete contact management',
                    'Payment Reminders - Automated email/SMS alerts',
                    'Client Notes & History - Track all interactions',
                    'Feedback Collector - Gather client reviews'
                  ]
                },
                {
                  category: '📊 Analytics & Reporting (3 Tools)',
                  tools: [
                    'Business Dashboard - Complete overview',
                    'Analytics Dashboard - Revenue, expense, profit charts',
                    'Performance Insights - Client-wise & month-wise reports'
                  ]
                },
                {
                  category: '📋 Project Management (3 Tools)',
                  tools: [
                    'Budget Planner - Plan business budgets',
                    'Subscription Tracker - Track all recurring payments',
                    'Goal Tracker - Set monthly income goals'
                  ]
                },
                {
                  category: '⚡ Productivity (2 Tools)',
                  tools: [
                    'Project & Task Manager - Organize projects',
                    'Time Tracker - Track billable hours'
                  ]
                },
                {
                  category: '🎨 Marketing & Branding (4 Tools)',
                  tools: [
                    'Business Card Creator - Design digital cards',
                    'Invoice Branding - Customize with logo & colors',
                    'Email Signature Generator - Professional signatures',
                    'Sharing Tools - Share invoices via email/link'
                  ]
                }
              ].map((section, i) => (
                <div key={i} className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="font-bold text-xl mb-4">{section.category}</h3>
                  <ul className="space-y-2">
                    {section.tools.map((tool, j) => (
                      <li key={j} className="flex items-start gap-2 text-gray-300">
                        <span className="text-purple-400 mt-1">▸</span>
                        <span>{tool}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4 */}
          <section id="who-needs">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-400">🎯 Who Needs Oddlex?</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: '💼 Freelancers', desc: 'Manage clients, invoices, and projects effortlessly' },
                { title: '🏢 Small Businesses', desc: 'Complete business management without high costs' },
                { title: '🚀 Startups', desc: 'All essential tools to get started quickly' },
                { title: '👨‍💼 Consultants', desc: 'Track time, clients, and payments professionally' },
                { title: '🎨 Creative Agencies', desc: 'Project management + client billing in one place' },
                { title: '📊 Service Providers', desc: 'Invoice, track, and grow your service business' }
              ].map((persona, i) => (
                <div key={i} className="p-6 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl border border-purple-500/30 text-center">
                  <div className="text-4xl mb-3">{persona.title.split(' ')[0]}</div>
                  <h3 className="font-bold mb-2">{persona.title.split(' ').slice(1).join(' ')}</h3>
                  <p className="text-sm text-gray-400">{persona.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5 */}
          <section id="pricing">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-400">💎 Pricing & Plans</h2>
            <div className="p-8 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl border border-green-500/30 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold mb-4">100% FREE Forever</h3>
              <p className="text-lg text-gray-300 mb-6">
                All 23 tools. No credit card required. No hidden fees. No premium tiers.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 rounded-lg border border-green-500/30">
                <span className="text-sm">✓ Free invoicing</span>
                <span className="text-sm">✓ Free CRM</span>
                <span className="text-sm">✓ Free analytics</span>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="getting-started">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-400">🚀 Getting Started</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Sign Up Free', desc: 'Create your account in 30 seconds - no credit card needed' },
                { step: '2', title: 'Add Your Business Info', desc: 'Set up your company profile and branding' },
                { step: '3', title: 'Start Using Tools', desc: 'Create your first invoice, add clients, track expenses' },
                { step: '4', title: 'Grow Your Business', desc: 'Use analytics to make data-driven decisions' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-xl">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="my-12">
            <div className="p-8 sm:p-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
              <p className="text-lg text-gray-300 mb-6">
                Join thousands of businesses already using Oddlex
              </p>
              <Link href="/login" className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-lg font-semibold hover:shadow-2xl transition transform hover:scale-105">
                Start Free Today →
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-400">❓ Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is Oddlex really free?', a: 'Yes! All 23 tools are completely free with no hidden charges.' },
                { q: 'Do I need technical knowledge?', a: 'No! Oddlex is designed to be simple and intuitive for everyone.' },
                { q: 'Can I export my data?', a: 'Yes, you can export invoices, client lists, and reports anytime.' },
                { q: 'Is my data secure?', a: 'Absolutely. We use bank-level encryption and secure servers.' }
              ].map((faq, i) => (
                <details key={i} className="p-6 bg-white/5 rounded-xl border border-white/10 cursor-pointer group">
                  <summary className="font-bold text-lg mb-2 group-open:text-purple-400">
                    {faq.q}
                  </summary>
                  <p className="text-gray-400 mt-2">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-t border-white/10 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Start Managing Your Business Better Today</h2>
          <Link href="/dashboard" className="inline-block px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold hover:shadow-xl transition transform hover:scale-105">
            Visit Oddlex Homepage
          </Link>
        </div>
      </div>
    </article>
  );
}