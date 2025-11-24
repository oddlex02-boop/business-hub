// src/firebase/authListener.js - YEH CORRECT CODE HAI
'use client';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { initializeUserTools, getUserCompleteData } from './userData';

let userState = null;
let listeners = [];

export function subscribeToAuth(callback) {
  listeners.push(callback);
  callback(userState); // ✅ 'cb' ko 'callback' change karo

  return () => {
    listeners = listeners.filter(fn => fn !== callback); // ✅ Yahan bhi 'callback'
  };
}

// 🆕 IMPROVED: Auto-initialize user tools on first login
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // ✅ Check if user data exists, if not initialize tools
    const userData = await getUserCompleteData(user.uid);
    if (!userData || !userData.tools) {
      await initializeUserTools(user.uid);
      console.log('🆕 New user tools initialized');
    } else {
      console.log('✅ Existing user data loaded');
    }
    
    userState = user;
  } else {
    userState = null;
    console.log('👤 User logged out');
  }
  
  listeners.forEach(fn => fn(userState)); // ✅ Yahan 'fn' parameter hai
});