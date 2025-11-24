// src/firebase/userData.js - EXISTING FILE MEIN YEH ADD KARO
import { db } from "./firebase";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

// ⚡ Common path maker
function toolRef(uid, toolName) {
  return doc(db, "users", uid, "tools", toolName);
}

// 🆕 NEW: Initialize user tools data (first time setup)
export async function initializeUserTools(uid) {
  const userRef = doc(db, "users", uid);
  
  const initialToolsData = {
    paymentTracker: { items: [] },
    incomeTracker: { items: [] },
    expenseTracker: { items: [] },
    profitLoss: { items: [] },
    budgetPlanner: { items: [] },
    subscriptionTracker: { items: [] },
    goalTracker: { items: [] },
    clientCRM: { items: [] },
    paymentReminder: { items: [] },
    clientNotes: { items: [] }
  };

  await setDoc(userRef, { 
    tools: initialToolsData,
    createdAt: new Date(),
    lastLogin: new Date()
  }, { merge: true });
}

// 🆕 NEW: Get complete user data
export async function getUserCompleteData(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

/* =====================================================
      1) SAVE NEW ENTRY (Add Data)
===================================================== */
export async function addEntry(uid, tool, entry) {
  const ref = toolRef(uid, tool);
  await setDoc(
    ref,
    {
      items: arrayUnion({
        ...entry,
        id: entry.id || Date.now().toString(), // ✅ Auto ID if not provided
        createdAt: entry.createdAt || new Date().toISOString() // ✅ Auto timestamp
      })
    },
    { merge: true }
  );
}

/* =====================================================
      2) DELETE ENTRY
===================================================== */
export async function deleteEntry(uid, tool, entry) {
  const ref = toolRef(uid, tool);
  await updateDoc(ref, {
    items: arrayRemove(entry)
  });
}

/* =====================================================
      3) UPDATE ENTRY (smart update)
===================================================== */
export async function updateEntry(uid, tool, updatedEntry) {
  const ref = toolRef(uid, tool);

  const snap = await getDoc(ref);
  const data = snap.data();

  if (!data || !data.items) return;

  const newArr = data.items.map((item) =>
    item.id === updatedEntry.id ? updatedEntry : item
  );

  await setDoc(ref, { items: newArr }, { merge: true });
}

/* =====================================================
      4) GET ALL ENTRIES (once)
===================================================== */
export async function getEntries(uid, tool) {
  const ref = toolRef(uid, tool);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().items || [] : [];
}

/* =====================================================
      5) REALTIME LISTENER (auto-sync)
===================================================== */
export function listenEntries(uid, tool, callback) {
  const ref = toolRef(uid, tool);
  return onSnapshot(ref, (snap) => {
    const data = snap.exists() ? snap.data().items : [];
    callback(data || []);
  });
}