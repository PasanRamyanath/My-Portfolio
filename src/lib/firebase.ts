"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBlp5kL85iwox27LjCYRBiPVdvrwWCZT9U",
  authDomain: "pasan-portfolio-5d478.firebaseapp.com",
  projectId: "pasan-portfolio-5d478",
  storageBucket: "pasan-portfolio-5d478.firebasestorage.app",
  messagingSenderId: "18126615169",
  appId: "1:18126615169:web:1c630b846d3ad13a90d380",
  measurementId: "G-SCT4XMJ5JJ",
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics (only in browser)
let analytics: any;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Firestore
const db = getFirestore(app);

// Storage
const storage = getStorage(app);

// Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, db, storage, auth, googleProvider };
