// src/firebase/toolStorage.js
import { db } from "./firebase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

// SAVE TOOL DATA
export const saveToolData = async (uid, toolName, data) => {
  await setDoc(doc(db, "users", uid, "tools", toolName), data, { merge: true });
};

// LOAD ONCE
export const loadToolData = async (uid, toolName) => {
  const snap = await getDoc(doc(db, "users", uid, "tools", toolName));
  return snap.exists() ? snap.data() : null;
};

// REALTIME SYNC
export const listenToolData = (uid, toolName, callback) => {
  return onSnapshot(doc(db, "users", uid, "tools", toolName), (snap) => {
    callback(snap.data());
  });
};
