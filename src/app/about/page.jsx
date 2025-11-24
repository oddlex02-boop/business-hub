"use client";

import React from "react";
import {
  Award,
  Users,
  Zap,
  Heart,
  Shield,
  TrendingUp,
  CheckCircle,
  Target,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const stats = [
    { number: "40+", label: "Free Tools + Coming Soon", icon: Zap },
    { number: "15K+", label: "Happy Users, Growing Daily", icon: Users },
    { number: "100%", label: "Free Forever No Premium Tiers", icon: Award },
    { number: "24/7", label: "Available", icon: CheckCircle }
  ];

  const values = [
    {
      icon: Zap,
      title: "Innovation First",
      description:
        "Continuously evolving with cutting-edge technology to deliver powerful, modern solutions that meet real business needs."
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description:
        "Your data security is paramount. Built with enterprise-grade security standards to protect your business information."
    },
    {
      icon: Heart,
      title: "User-Centric Design",
      description:
        "Every feature is crafted with users in mind, ensuring intuitive interfaces and seamless workflows."
    },
    {
      icon: Target,
      title: "Accessibility",
      description:
        "Breaking barriers by providing professional-grade tools completely free, empowering businesses of all sizes."
    },
    {
      icon: TrendingUp,
      title: "Continuous Growth",
      description:
        "Constantly listening to feedback and expanding our toolkit to serve your evolving business requirements."
    },
    {
      icon: CheckCircle,
      title: "Quality Excellence",
      description:
        "Maintaining the highest standards in every tool we build, from design to functionality to performance."
    }
  ];

  const milestones = [
    {
      year: "2025",
      event: "Oddlex Founded",
      description: "Started with a vision to democratize business tools"
    },
    {
      year: "2025",
      event: "15K+ Users",
      description: "Reached our first major milestone of happy users"
    },
    {
      year: "2025",
      event: "20+ Tools",
      description:
        "Expanded to comprehensive suite of business solutions, And few tools coming soon"
    },
    {
      year: "2026",
      event: "Growing Strong",
      description: "Continuing innovation with new features monthly"
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Oddlex",
    url: "https://oddlex.com",
    logo: "https://oddlex.com/logo.png",
    description: "Free professional business tools for entrepreneurs and small businesses",
    foundingDate: "2023",
    founders: [
      {
        "@type": "Person",
        name: "Founder"
      }
    ],
    sameAs: ["https://twitter.com/oddlex"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@oddlex.com"
    }
  };

  // Back to desktop function
  const handleBackToDesktop = () => {
    // Direct home page par redirect karega
    window.location.href = "/dashboard";
  };

  return (
    <>
      {/* JSON-LD FIXED SAFE VERSION */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">

        {/* Back Button - Top Left */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <button
            onClick={handleBackToDesktop}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 text-sm font-medium mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Desktop
          </button>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <div className="text-center mb-16 lg:mb-24">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              About Oddlex Business Hub
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-4">
              Empowering entrepreneurs and small businesses with professional-grade tools, completely free.
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              No hidden costs. No premium tiers. Just powerful solutions for your business success.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-24">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="p-6 lg:p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center hover:bg-white/10 transition-all duration-300"
                >
                  <Icon className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm lg:text-base">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Mission */}
          <div className="max-w-5xl mx-auto mb-24">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 lg:p-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-center">
                Our Mission
              </h2>
              <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
                <p>
                  Oddlex Business Hub was founded on a fundamental belief: professional business tools shouldn't be a luxury reserved for large corporations with big budgets.
                </p>
                <p>What started as a single invoice generator has evolved into 40+ business tools...</p>
                <p>Our commitment goes beyond just being free.</p>
                <p className="text-xl font-semibold text-white pt-4">100% free, Forever, No exceptions.</p>
              </div>
            </div>
          </div>

          {/* Journey */}
          <div className="max-w-5xl mx-auto mb-24">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">Our Journey</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="relative p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="text-3xl font-bold text-purple-400 mb-2">{milestone.year}</div>
                  <h3 className="text-xl font-bold mb-2">{milestone.event}</h3>
                  <p className="text-gray-400 text-sm">{milestone.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mb-24">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div
                    key={index}
                    className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <Icon className="w-12 h-12 text-purple-400 mb-4" />
                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Why Choose */}
          <div className="max-w-5xl mx-auto mb-24">
            <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-3xl border border-white/10 p-8 lg:p-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center">
                Why Choose Oddlex Business Hub?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {["Completely Free", "Professional Quality", "Easy to Use", "Always Improving"].map(
                  (title, i) => (
                    <div key={i} className="flex gap-4">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-2">{title}</h3>
                        <p className="text-gray-400">
                          {i === 0
                            ? "All features & tools forever free. Only a few ads support our costs."
                            : i === 1
                            ? "Enterprise-grade tools with premium UX."
                            : i === 2
                            ? "No training required, plug-and-play tools."
                            : "New features added regularly."}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="inline-block p-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl border border-white/10">
              <h3 className="text-3xl font-bold mb-4">Join Thousands of Happy Users</h3>
              <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
                Start growing your business today with professional tools that won't cost you a penny.
              </p>

              <Link href="/tools">
                <button
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl 
                  font-semibold text-lg text-white 
                  hover:shadow-2xl hover:shadow-purple-500/50 
                  transition-all duration-300 transform hover:scale-105"
                >
                  Explore All Tools
                </button>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}