'use client';
import { useState, useEffect } from 'react';
import { subscribeToAuth } from "@/firebase/authListener";
import { auth } from "@/firebase/firebase";
import { signOut, deleteUser, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import Link from 'next/link';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setUser(user);
      // Active sessions data
      if (user) {
        setActiveSessions([
          { id: 1, device: 'Chrome on Windows', location: 'New Delhi, India', lastActive: 'Current', current: true },
          { id: 2, device: 'Safari on iPhone', location: 'Mumbai, India', lastActive: '2 hours ago', current: false }
        ]);
      }
    });
    return () => unsub();
  }, []);

  // Change Password Function
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    try {
      setIsLoading(true);
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email, 
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, passwordData.newPassword);
      
      alert('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password change error:', error);
      if (error.code === 'auth/wrong-password') {
        alert('Current password is incorrect!');
      } else {
        alert('Error changing password: ' + error.message);
      }
    }
    setIsLoading(false);
  };

  // Remove Session Function
  const handleRemoveSession = async (sessionId) => {
    try {
      setIsLoading(true);
      // API call to remove session from backend
      await fetch('/api/auth/remove-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      
      // Update local state
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
      alert('Session removed successfully!');
    } catch (error) {
      alert('Error removing session: ' + error.message);
    }
    setIsLoading(false);
  };

  // Logout All Sessions
  const handleLogoutAll = async () => {
    if (!window.confirm('Log out from all devices except this one?')) return;
    
    try {
      setIsLoading(true);
      // API call to logout all sessions
      await fetch('/api/auth/logout-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Keep only current session
      setActiveSessions(prev => prev.filter(session => session.current));
      alert('Logged out from all other devices!');
    } catch (error) {
      alert('Error logging out from all devices: ' + error.message);
    }
    setIsLoading(false);
  };

  // Delete Account Function
  const handleDeleteAccount = async () => {
    if (!window.confirm('ARE YOU ABSOLUTELY SURE?\n\nThis will permanently delete your account, all your data, and cannot be undone!')) {
      return;
    }

    const password = prompt('Please enter your password to confirm account deletion:');
    if (!password) return;

    try {
      setIsLoading(true);
      
      // Re-authenticate before deletion
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Delete from Firebase Auth
      await deleteUser(auth.currentUser);
      
      // Delete user data from your database
      await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      
      alert('Account deleted successfully!');
      window.location.href = '/';
    } catch (error) {
      console.error('Delete account error:', error);
      if (error.code === 'auth/wrong-password') {
        alert('Incorrect password! Account deletion failed.');
      } else if (error.code === 'auth/requires-recent-login') {
        alert('Please log in again and try deleting your account.');
        await signOut(auth);
        window.location.href = '/login';
      } else {
        alert('Error deleting account: ' + error.message);
      }
    }
    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-lg">Please log in to view settings</div>
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
          
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Settings
            </h1>
            <p className="text-gray-400">
              Manage your account security
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Change Password */}
            <div className="bg-slate-800/50 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                    className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                    className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                    className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 font-semibold"
                >
                  {isLoading ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            </div>

            {/* Active Sessions */}
            <div className="bg-slate-800/50 rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold mb-4">Active Sessions</h2>
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{session.device}</div>
                      <div className="text-sm text-gray-400">{session.location} • {session.lastActive}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.current && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Current</span>
                      )}
                      {!session.current && (
                        <button
                          onClick={() => handleRemoveSession(session.id)}
                          disabled={isLoading}
                          className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-sm hover:bg-red-500/30 transition disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {activeSessions.filter(s => !s.current).length > 0 && (
                <button
                  onClick={handleLogoutAll}
                  disabled={isLoading}
                  className="w-full mt-4 px-4 py-2 border border-orange-500/30 text-orange-400 rounded-lg hover:bg-orange-500/10 transition disabled:opacity-50"
                >
                  Log Out From All Other Devices
                </button>
              )}
            </div>

            {/* Delete Account */}
            <div className="bg-slate-800/50 rounded-xl border border-red-500/20 p-6">
              <h2 className="text-xl font-bold mb-4 text-red-400">Delete Account</h2>
              <p className="text-gray-400 mb-4">
                Permanently delete your account and all data. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="px-6 py-3 bg-red-600 border border-red-500 rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-semibold"
              >
                Delete Account Permanently
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}