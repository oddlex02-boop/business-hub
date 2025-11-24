'use client';
import React from 'react';
import Link from "next/link";

export default function BlogPage() {
  const blogPosts = [
    {
      title: "Top 7 Finance Tools Every Modern Business Needs in 2025",
      excerpt: "Explore the essential financial tools trusted by freelancers, agencies, and small businesses worldwide.",
      shortDesc: "From invoicing to tax calculations—optimize your financial operations.",
      date: "Nov 24, 2025",
      category: "Finance & Billing",
      gradient: "from-purple-500 to-pink-500",
      readTime: "9 min read",
      image: "📊"
    },
    {
      title: "Strengthen Client Relationships with the Oddlex CRM Suite",
      excerpt: "Discover how CRM automation helps you build trust, improve retention, and understand client needs better.",
      shortDesc: "Manage clients, conversations, reminders, and feedback—seamlessly.",
      date: "Nov 26, 2025",
      category: "Client & CRM",
      gradient: "from-blue-500 to-cyan-500",
      readTime: "6 min read",
      image: "👥"
    },
    {
      title: "A Complete Guide to Oddlex Analytics Tools",
      excerpt: "Learn how business analytics unlock performance patterns and financial clarity.",
      shortDesc: "Make smarter decisions with accurate insights.",
      date: "Nov 29, 2025",
      category: "Analytics & Reporting",
      gradient: "from-green-500 to-emerald-500",
      readTime: "7 min read",
      image: "📈"
    },
    {
      title: "Manage Projects Efficiently with Oddlex Productivity Tools",
      excerpt: "Boost productivity and streamline your workflow with smart project management tools.",
      shortDesc: "Handle tasks, deadlines, quotes, and time tracking—all in one place.",
      date: "Nov 5, 2024",
      category: "Project Management",
      gradient: "from-orange-500 to-red-500",
      readTime: "6 min read",
      image: "📅"
    },
    {
      title: "Elevate Your Brand Identity with Oddlex Marketing Tools",
      excerpt: "Manage clients, relationships, and follow-ups from a single dashboard.",
      shortDesc: "Create professional designs and manage subscriptions effortlessly.",
      date: "Dec 5, 2025",
      category: "Marketing & Branding",
      gradient: "from-violet-500 to-purple-500",
      readTime: "5 min read",
      image: "🎨"
    },
    {
      title: "Boost Productivity with Smart Planning Tools",
      excerpt: "Build a stronger brand presence with tools designed for modern businesses.",
      shortDesc: "Track your goals and manage budgets effectively.",
      date: "Dec 8, 2025",
      category: "Productivity",
      gradient: "from-yellow-500 to-orange-500",
      readTime: "4 min read",
      image: "🎯"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 sm:py-10 sm:py-8 sm:py-10 lg:py-12 lg:py-16 lg:py-20">
        <div className="text-center mb-16">
          <h1 className="text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-5xl md:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Oddlex Business Hub Blog
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            The Complete Guide to All Oddlex Business Hub Tools — The Ultimate Business Tool hub to help you grow your business.
          </p>
        </div>

        <div className="mb-16">
          <div className="relative p-8 md:p-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
            <div className="relative">
              <div className="inline-block px-4 py-1 bg-purple-500 rounded-full text-sm mb-4">
                ⭐ Featured
              </div>
              <h2 className="text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl font-bold mb-4">
                A step-by-step roadmap to launch, manage, and scale a successful online business using modern Oddlex Business Hub tools.
              </h2>
              <p className="text-gray-300 text-lg mb-4 sm:mb-6">
                This guide covers everything from choosing your niche, building your brand, setting up business tools like invoicing, CRM, budgeting, and tracking performance — making it ideal for freelancers, small businesses, and startups.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4 sm:mb-6">
                <span>Dec 10, 2025</span>
                <span>•</span>
                <span>10 min read</span>
                <span>•</span>
                <span>Oddlex Business Hub Hub For Business & Freelancers</span>
              </div>
              <button> 
               <Link
                 href="/blog/oddlex-article"
                 className="inline-block px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-lg transition"
                >
                 Read Article →
               </Link>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 sm:gap-3 sm:gap-2 sm:gap-3 lg:gap-4 lg:gap-6 lg:gap-8">
          {blogPosts.map((post, index) => (
            <div key={index} className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-white/30 transition-all duration-300 cursor-pointer transform hover:scale-105">
              <div className={`h-48 bg-gradient-to-br ${post.gradient} flex items-center justify-center text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl md:text-5xl lg:text-6xl`}>
                {post.image}
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readTime}</span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{post.date}</span>
                  <span className="text-purple-400 text-sm group-hover:translate-x-2 transition-transform">
                    Read more →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <div className="relative p-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl border border-white/10 text-center">
            <h3 className="text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h3>
            <p className="text-gray-300 mb-4 sm:mb-6">Get the latest tips and insights delivered to your inbox</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 sm:px-6 lg:px-8 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-purple-500"
              />
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-lg transition whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}