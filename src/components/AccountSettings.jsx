// src/components/AccountSettings.jsx
'use client';
import React, { useState } from 'react';
import { auth } from '@/firebase/firebase'; // your client sdk init
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  sendPasswordResetEmail,
  deleteUser,
  signOut
} from 'firebase/auth';

export default function AccountSettings({ user }) {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);

  // Reauthenticate helper
  async function reauthWithPassword(currentPassword) {
    if (!auth.currentUser || !auth.currentUser.email) throw new Error('No logged-in user');
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    return reauthenticateWithCredential(auth.currentUser, credential);
  }

  // Change password (reauth then update)
  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPwd !== confirmPwd) return alert('New password and confirm password do not match.');
    setLoading(true);
    try {
      // reauth required
      await reauthWithPassword(currentPwd);
      await updatePassword(auth.currentUser, newPwd);
      alert('Password changed successfully. You will be signed out from other devices (if you revoked tokens).');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      // Optionally sign out this device to force fresh login
      await signOut(auth);
      window.location.href = '/login';
    } catch (err) {
      // If user didn't provide current password (or used social login) fallback
      console.error(err);
      const code = err?.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/requires-recent-login') {
        alert('Re-authentication required. Please enter your current password OR use password reset.');
      } else {
        alert('Error changing password: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  // Send reset email fallback
  async function handleSendResetEmail() {
    if (!user?.email) return alert('No email found.');
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert('Password reset email sent to ' + user.email);
    } catch (err) {
      alert('Error sending reset email: ' + err.message);
    }
  }

  // Delete account (client reauth then call server to wipe or use client delete)
  async function handleDeleteAccount() {
    if (!confirm('Permanently delete your account and all data? This cannot be undone.')) return;
    setLoading(true);
    try {
      // Reauth
      const pwd = prompt('To delete your account, please enter your current password (for re-auth).');
      if (!pwd) throw new Error('Reauth cancelled');
      await reauthWithPassword(pwd);

      // Option A: call your server Cloud Function to delete user (recommended)
      // await fetch('/api/admin/deleteUser', { method: 'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ uid: auth.currentUser.uid }) });

      // Option B: use client deleteUser (works only if you want to delete Firebase Auth account — doesn't remove other DB data)
      await deleteUser(auth.currentUser);
      alert('Account deleted.');
      window.location.href = '/';
    } catch (err) {
      alert('Error deleting account: ' + (err.message || err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Sign out other devices -> call server to revoke refresh tokens
  async function handleSignOutOtherDevices() {
    try {
      // We will call a cloud function / server endpoint that calls admin.auth().revokeRefreshTokens(uid)
      const res = await fetch('/api/revokeTokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: auth.currentUser.uid })
      });
      if (!res.ok) throw new Error(await res.text());
      alert('All other device sessions revoked. They will be signed out shortly.');
    } catch (err) {
      alert('Error revoking other sessions: ' + err.message || err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-800/50 rounded-xl">
        <h3 className="font-semibold mb-3">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <input value={currentPwd} onChange={(e)=>setCurrentPwd(e.target.value)} placeholder="Current password" type="password" className="w-full p-3 rounded-lg bg-slate-700/40" required />
          <input value={newPwd} onChange={(e)=>setNewPwd(e.target.value)} placeholder="New password" type="password" className="w-full p-3 rounded-lg bg-slate-700/40" required />
          <input value={confirmPwd} onChange={(e)=>setConfirmPwd(e.target.value)} placeholder="Confirm new password" type="password" className="w-full p-3 rounded-lg bg-slate-700/40" required />
          <div className="flex gap-3">
            <button disabled={loading} className="px-4 py-2 bg-purple-600 rounded-lg">
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
            <button type="button" onClick={handleSendResetEmail} className="px-4 py-2 bg-gray-700 rounded-lg">Send Reset Email</button>
          </div>
        </form>
      </div>

      <div className="p-6 bg-slate-800/50 rounded-xl">
        <h3 className="font-semibold mb-3">Active Sessions</h3>
        <p className="text-sm text-gray-400 mb-3">To sign out other devices, revoke refresh tokens:</p>
        <div className="flex gap-3">
          <button onClick={handleSignOutOtherDevices} className="px-4 py-2 bg-orange-600 rounded-lg">Sign out other devices</button>
        </div>
      </div>

      <div className="p-6 bg-slate-800/50 rounded-xl">
        <h3 className="text-red-400 font-semibold mb-3">Danger</h3>
        <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 rounded-lg">Delete Account Permanently</button>
      </div>
    </div>
  );
}
