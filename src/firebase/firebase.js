// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber 
} from "firebase/auth";

import { 
  getFirestore 
} from "firebase/firestore";

// ⬇️ apna firebase config yahan paste karo
const firebaseConfig = {
  apiKey: "AIzaSyClLDnYZNuzA9lja5WMqY3h67GT-ZTuxhM",
  authDomain: "oddlex-hub.firebaseapp.com",
  projectId: "oddlex-hub",
  storageBucket: "oddlex-hub.firebasestorage.app",
  messagingSenderId: "1054015388262",
  appId: "1:1054015388262:web:f99629341828c790e2cba7",
  measurementId: "G-DVP02B161H"
};

// Initialize
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// OTP Extras
export const setupRecaptcha = () => {
  window.recaptchaVerifier = new RecaptchaVerifier(
    "recaptcha-container",
    { size: "invisible" },
    auth
  );
};

export const sendOTP = async (phone) => {
  setupRecaptcha();
  const appVerifier = window.recaptchaVerifier;
  return await signInWithPhoneNumber(auth, phone, appVerifier);
};
