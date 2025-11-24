import { db } from "@/firebase/firebase";
import { 
  doc, setDoc, getDoc, updateDoc, collection, addDoc 
} from "firebase/firestore";

// Save user profile
export const saveUserProfile = async (uid, data) => {
  await setDoc(doc(db, "users", uid), data, { merge: true });
};

// Load user profile
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

// Save tool data
export const saveToolData = async (uid, toolName, data) => {
  await setDoc(doc(db, "users", uid, "tools", toolName), data, { merge: true });
};

// Load tool data
export const getToolData = async (uid, toolName) => {
  const snap = await getDoc(doc(db, "users", uid, "tools", toolName));
  return snap.exists() ? snap.data() : {};
};
