'use client';
import React from 'react';

export default function CTASection() {
  return (
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
          <button className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-base sm:text-lg md:text-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105">
            Start Using Oddlex Free
          </button>
        </div>
      </div>
    </section>
  );
}