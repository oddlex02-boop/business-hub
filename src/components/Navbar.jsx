'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { subscribeToAuth } from "@/firebase/authListener";
import { auth } from "@/firebase/firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false); // 🔥 FIX: Prevent hydration mismatch

  // 🔥 FIX: Mount state for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to Firebase realtime user
  useEffect(() => {
    const unsub = subscribeToAuth(setUser);
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  // 🔥 FIX: Home link conditionally set
  const getHomeLink = () => {
    return user ? "/dashboard" : "/";
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu') && !event.target.closest('.user-menu-button')) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // 🔥 FIX: Prevent hydration by showing loading state initially
  if (!mounted) {
    return (
      <nav className="relative z-50 bg-slate-900/95 backdrop-blur-lg border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Loading state for logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-700 animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Loading state for auth buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="h-9 w-20 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-9 w-32 bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Mobile menu button skeleton */}
            <div className="lg:hidden w-10 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="relative z-50 bg-slate-900/95 backdrop-blur-lg border-b border-white/10 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href={getHomeLink()} className="flex items-center space-x-2 group">
              <img
                src="/logo-invoice.png"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-transform group-hover:scale-105"
                alt="Oddlex Business Hub"
              />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
                Oddlex Business Hub
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              href={getHomeLink()} 
              className="text-gray-300 hover:text-purple-400 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link 
              href="/tools" 
              className="text-gray-300 hover:text-purple-400 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              Tools
            </Link>
            <Link 
              href="/blog" 
              className="text-gray-300 hover:text-purple-400 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              Blog
            </Link>
            <Link 
              href="/about" 
              className="text-gray-300 hover:text-purple-400 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              About
            </Link>
          </div>

          {/* Desktop Auth UI */}
          <div className="hidden lg:flex items-center space-x-4">
            {!user ? (
              <>
                <Link href="/login">
                  <button className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-sm font-medium">
                    Login
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm font-medium">
                    Sign Up Free
                  </button>
                </Link>
              </>
            ) : (
              <div className="relative user-menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="user-menu-button flex items-center space-x-3 p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-white text-sm">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                  </div>

                  <div className="hidden xl:block text-left">
                    <div className="text-sm font-semibold text-white">
                      {user.displayName || "User"}
                    </div>
                    <div className="text-xs text-gray-400 truncate max-w-[120px]">
                      {user.email}
                    </div>
                  </div>

                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl border border-white/10 shadow-xl overflow-hidden z-50 user-menu">
                    <div className="p-4 border-b border-white/10">
                      <div className="font-semibold text-white text-sm">
                        {user.displayName || "User"}
                      </div>
                      <div className="text-xs text-gray-400 truncate">{user.email}</div>
                    </div>

                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-3 hover:bg-white/10 transition-colors text-sm text-gray-300"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/profile" 
                      className="block px-4 py-3 hover:bg-white/10 transition-colors text-sm text-gray-300"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/settings" 
                      className="block px-4 py-3 hover:bg-white/10 transition-colors text-sm text-gray-300"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Settings
                    </Link>
                    
                    <div className="border-t border-white/10">
                      <Link 
                        href="/privacy-policy" 
                        className="block px-4 py-3 hover:bg-white/10 transition-colors text-xs text-gray-400"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Privacy Policy
                      </Link>
                      <Link 
                        href="/terms-of-service" 
                        className="block px-4 py-3 hover:bg-white/10 transition-colors text-xs text-gray-400"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Terms of Service
                      </Link>
                    </div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/10 text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor">
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href={getHomeLink()} 
                className="block px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 text-base font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link 
                href="/tools" 
                className="block px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 text-base font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Tools
              </Link>
              <Link 
                href="/blog" 
                className="block px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 text-base font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Blog
              </Link>
              <Link 
                href="/about" 
                className="block px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 text-base font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                About
              </Link>

              {/* Mobile Auth Buttons */}
              {!user ? (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <Link href="/login" onClick={() => setShowMobileMenu(false)}>
                    <button className="w-full px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-base font-medium">
                      Login
                    </button>
                  </Link>
                  <Link href="/signup" onClick={() => setShowMobileMenu(false)}>
                    <button className="w-full px-3 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all duration-200 text-base font-medium">
                      Sign Up Free
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/10 space-y-1">
                  <div className="px-3 py-3 bg-white/5 rounded-lg mb-2">
                    <div className="font-semibold text-white text-base">{user.displayName || "User"}</div>
                    <div className="text-sm text-gray-400 truncate">{user.email}</div>
                  </div>

                  <Link 
                    href="/dashboard" 
                    className="block px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 text-base"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile" 
                    className="block px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 text-base"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 text-base"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Settings
                  </Link>
                  
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <Link 
                      href="/privacy-policy" 
                      className="block px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 text-sm"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Privacy Policy
                    </Link>
                    <Link 
                      href="/terms-of-service" 
                      className="block px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 text-sm"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Terms of Service
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-3 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200 text-base mt-2"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}