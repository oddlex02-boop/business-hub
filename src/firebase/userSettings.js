// ./src/firebase/userSettings.js
import { auth, db } from "./firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  deleteUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// -----------------------------
// 🔹 Update Basic Profile (Name)
// -----------------------------
export async function updateUserProfile(displayName) {
  try {
    await updateProfile(auth.currentUser, { displayName });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// --------------------------------------------
// 🔹 Save Extra Fields (phone, company) Firestore
// --------------------------------------------
export async function saveExtraProfileData(data) {
  try {
    await setDoc(doc(db, "users", auth.currentUser.uid), data, { merge: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// -----------------------------
// 🔹 Change Password
// -----------------------------
export async function changeUserPassword(currentPassword, newPassword) {
  const user = auth.currentUser;

  try {
    const cred = EmailAuthProvider.credential(user.email, currentPassword);

    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPassword);

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// -----------------------------
// 🔹 Delete Account
// -----------------------------
export async function deleteUserAccount() {
  try {
    await deleteUser(auth.currentUser);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// -----------------------------
// 🔹 Log Out From All Other Devices
// -----------------------------
export async function logoutAllDevices() {
  try {
    await auth.signOut();
    await auth.currentUser?.getIdToken(true); // force refresh token
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
