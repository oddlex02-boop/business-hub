'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Typewriter } from 'react-simple-typewriter';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (onboardingCompleted === 'true') {
      setHasCompletedOnboarding(true);
    }
  }, []);

  const features = [
    { 
      emoji: "💼", 
      title: "Top Professional Tools", 
      desc: "Complete business & Freelance tools Hub",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      emoji: "✨", 
      title: "100% Free Forever", 
      desc: "No hidden charges",
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      emoji: "🚀", 
      title: "Easy to Use", 
      desc: "No learning curve",
      gradient: "from-purple-500 to-pink-500"
    }
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

  const handleGetStartedClick = () => {
    if (hasCompletedOnboarding) {
      window.location.href = '/tools';
    } else {
      setShowOnboardingPopup(true);
      setCurrentStep(1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboardingCompleted', 'true');
      setHasCompletedOnboarding(true);
      setShowOnboardingPopup(false);
      window.location.href = '/tools';
    }
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setHasCompletedOnboarding(true);
    setShowOnboardingPopup(false);
    window.location.href = '/tools';
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onboardingSteps = [
    {
      title: "Welcome to Oddlex! 🎉",
      description: "Let's get you started with our powerful business tools suite",
      buttonText: "Let's Start Using Tools",
      blogText: "Want to learn more? Read our blog for detailed guides and tutorials",
      showBlogButton: true
    },
    {
      title: "Complete Your Profile 📝",
      description: "Setup your business profile to get personalized recommendations",
      buttonText: "Complete Profile",
      blogText: "",
      showBlogButton: true
    },
    {
      title: "Ready to Start! 🚀",
      description: "You're all set! Start using Oddlex Business Hub Business Hub",
      buttonText: "Start Using Oddlex Business Hub Business Hub",
      blogText: "",
      showBlogButton: false
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        {/* Hero Section - Modified */}
        <section className="relative z-10 container mx-auto px-4 py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-8">
              <span className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl text-lg border border-purple-500/30 backdrop-blur-sm font-medium">
                🚀 Professional Business Suite
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Enterprise
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Business Tools
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Comprehensive suite of professional tools for modern businesses. 
              <span className="text-purple-400 font-semibold"> Finance, CRM, Analytics, Marketing </span>
              — all integrated, scalable, and completely free.
            </p>

            {/* Modified Get Started Button */}
            <button 
              onClick={handleGetStartedClick}
              className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105 mb-8"
            >
              {hasCompletedOnboarding ? "Launch Tools Dashboard" : "Get Started Free"}
            </button>

            {/* Features Grid - Smaller Size */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 text-xl`}>
                    {feature.emoji}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Section - Without Explore Tools Button */}
        <section className="relative z-10 container mx-auto px-4 py-12 lg:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Core <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Tool Categories</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Every tool your business needs, organized by category
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topTools.map((tool, index) => (
              <Link href={tool.link} key={index}>
                <div
                  onMouseEnter={() => setActiveCard(index)}
                  onMouseLeave={() => setActiveCard(null)}
                  className="group relative p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer transform hover:scale-105"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${tool.gradient} rounded-xl flex items-center justify-center mb-4 text-lg`}>
                    {tool.emoji}
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 group-hover:text-purple-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2 text-sm">
                    <span className="mr-2">Access tool</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section - Text Only (No Buttons) */}
        <section className="relative z-10 container mx-auto px-4 py-12 lg:py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Scale Your Business <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Like an Enterprise</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Join <span className="text-purple-400 font-semibold">10,000+ professionals</span> who trust our platform for their critical business operations. Enterprise features, startup flexibility.
            </p>
            <p className="text-lg text-gray-500">
              Trusted by startups, agencies, freelancers, and enterprises worldwide
            </p>
          </div>
        </section>

        {/* Onboarding Popup */}
        {showOnboardingPopup && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-purple-500/30 relative">
              {/* Close Button */}
              <button 
                onClick={handleSkipOnboarding}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>

              {/* Step Content */}
              <div className="text-center">
                {/* Step Indicator */}
                <div className="flex justify-center mb-6">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        step === currentStep 
                          ? 'bg-purple-600 text-white' 
                          : step < currentStep 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {step < currentStep ? '✓' : step}
                      </div>
                      {step < 3 && (
                        <div className={`w-12 h-1 mx-2 ${
                          step < currentStep ? 'bg-green-500' : 'bg-gray-600'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                <h3 className="text-2xl font-bold mb-4 text-white">
                  {onboardingSteps[currentStep - 1].title}
                </h3>
                
                <p className="text-gray-300 mb-6">
                  {onboardingSteps[currentStep - 1].description}
                </p>

                {/* Blog Section for Step 1 */}
                {onboardingSteps[currentStep - 1].showBlogButton && (
                <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-3">
                    {onboardingSteps[currentStep - 1].blogText}
                  </p>
                  <Link href="/blog">
                    <button className="w-full bg-slate-600 text-white py-2 rounded-lg font-semibold hover:bg-slate-500 transition text-sm">
                     Read Blog & Tutorials
                    </button>
                  </Link>
                </div>
                )}

                {/* Complete Profile Section for Step 2 */}
                {currentStep === 2 && (
                <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-3">
                    Complete your business profile to get personalized tool recommendations
                  </p>
                  <Link href="/profile">
                    <button className="w-full bg-slate-600 text-white py-2 rounded-lg font-semibold hover:bg-slate-500 transition text-sm">
                      Go to Profile Settings
                    </button>
                  </Link>
                </div>
                )}

                {/* Main Action Button */}
                <button 
                  onClick={handleNextStep}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition mb-4"
                >
                  {currentStep === 3 ? 'Start Using Oddlex Business Hub Business Hub' : onboardingSteps[currentStep - 1].buttonText}
                </button>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  {currentStep > 1 && (
                    <button 
                      onClick={handlePrevStep}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition"
                    >
                      Previous
                    </button>
                  )}
                  
                  <button 
                    onClick={handleSkipOnboarding}
                    className={`flex-1 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition ${
                      currentStep === 1 ? 'flex-1' : 'flex-1'
                    }`}
                  >
                    {currentStep === 3 ? 'Skip & Start' : 'Skip Tutorial'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}