import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function saveProfile(uid, data) {
  return await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}
