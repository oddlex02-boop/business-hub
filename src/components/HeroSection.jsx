'use client';
import React, { useState, useEffect } from 'react';
import { Typewriter } from 'react-simple-typewriter';
import Link from "next/link";

export default function HeroSection({ features }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative w-full max-w-full overflow-hidden min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-r from-[#2b0a47] via-[#4b0e7a] to-[#1f0141]">

      <div
        className={`transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {/* 🚀 Tagline */}
        <div className="inline-block mb-4">
          <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-xs sm:text-sm border border-purple-500/30 backdrop-blur-sm">
            🚀 All-in-One Business Suite | 100% Free Forever
          </span>
        </div>

        {/* 🌟 Heading */}
        <h1
         className="
           text-3xl /* Mobile */
           sm:text-4xl /* Small screens */
           md:text-5xl /* Tablets */
           lg:text-6xl /* Desktop */
           font-bold mb-4 sm:mb-6 text-center leading-tight
           bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400
           bg-clip-text text-transparent break-words
         "
        >
          Welcome to Oddlex Business Hub — <br />


         <span
         className="
           block mt-2 text-white
           text-lg sm:text-xl md:text-2xl lg:text-4xl
          "
        >
         <Typewriter
           words={[
             'your all-in-one hub for business & freelancing.',
             '40+ free tools for businesses & freelancers.',
             'manage clients, projects & invoices easily.',
             'grow smarter, faster, and professionally.',
             'simplify your business, amplify your success.'
           ]}
           loop={true}
           cursor
           cursorStyle="|"
           typeSpeed={70}
           deleteSpeed={40}
           delaySpeed={2000}
          />
        </span>
       </h1>

        {/* 💬 Description */}
        <p className="text-base sm:text-lg md:text-base sm:text-lg md:text-xl text-gray-200 mb-4 sm:mb-6 sm:mb-8 max-w-2xl sm:max-w-3xl mx-auto animate-fade-in px-2 sm:px-0">
          Your complete business platform with top free tools to manage work,
          clients, invoices, payments, CRM, inventory, and more — built for
          businesses and freelancers to grow smarter and faster.
        </p>

        {/* 🔘 Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-center items-center">

          <Link href="/login">
            <button className="px-4 sm:px-6 lg:px-8 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-base sm:text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105 flex items-center gap-2">
              Get Started Free
              <span>→</span>
            </button>
          </Link>
          
          <Link href="/tools">
            <button className="px-4 sm:px-6 lg:px-8 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm rounded-xl text-base sm:text-lg font-semibold hover:bg-white/20 transition border border-white/20">
              Explore Tools
            </button>
          </Link>
        </div>
      </div>

      {/* 🧩 Feature Boxes */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-2 sm:gap-3 lg:gap-4 lg:gap-6 sm:gap-2 sm:gap-3 lg:gap-4 sm:gap-3 sm:gap-2 sm:gap-3 lg:gap-4 lg:gap-6 lg:gap-8 max-w-5xl mx-auto px-4">
        {features?.map((feature, index) => (
          <div
            key={index}
            className={`p-5 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition transform hover:scale-105 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl sm:text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl md:text-3xl md:text-4xl mb-2">{feature.emoji}</div>
            <h3 className="text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold mb-1">{feature.title}</h3>
            <p className="text-gray-400 text-sm sm:text-base">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* 🎨 Animations */}
      <style jsx global>{`
        .Typewriter__cursor {
          color: white;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8),
            0 0 20px rgba(255, 255, 255, 0.6);
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50%, 100% {
            opacity: 1;
          }
          25%, 75% {
            opacity: 0;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1.2s ease-in-out;
        }
      `}</style>
    </section>
  );
}