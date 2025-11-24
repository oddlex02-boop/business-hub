'use client';
import { useState, useEffect } from 'react';
import { subscribeToAuth } from "@/firebase/authListener";
import { auth } from "@/firebase/firebase";
import { updateProfile } from "firebase/auth";
import { saveProfile, getProfile } from "@/firebase/userProfile";
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    company: ''
  });

  // Load user + saved Firestore data
  useEffect(() => {
    const unsub = subscribeToAuth(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const saved = await getProfile(firebaseUser.uid);

        setFormData({
          displayName: firebaseUser.displayName || saved?.displayName || "",
          email: firebaseUser.email,
          phone: saved?.phone || "",
          company: saved?.company || ""
        });
      }
    });

    return () => unsub();
  }, []);

  // Update Profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Save Firebase Auth name
      await updateProfile(auth.currentUser, {
        displayName: formData.displayName
      });

      // Save extra fields in Firestore
      await saveProfile(user.uid, {
        phone: formData.phone,
        company: formData.company,
        displayName: formData.displayName
      });

      alert("Profile saved successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    }
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-lg">Please log in to view profile</div>
          <Link href="/login" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Your Profile
            </h1>
            <p className="text-gray-400">
              Manage your personal information
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-white/10 p-6">

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl font-bold">
                {formData.displayName ? formData.displayName.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{formData.displayName || "User"}</h3>
                <p className="text-gray-400 text-sm">{formData.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-slate-600/50 border border-white/10 rounded-lg px-4 py-3 text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-4 py-3"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
              >
                {isLoading ? 'Saving...' : 'Save Profile'}
              </button>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
