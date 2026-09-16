// Firebase Configuration (ES Module)
// This is the official Firebase Web App configuration for Kayla's Kritters Pet Care
// API key is intentionally public - security is enforced via Firestore rules and domain whitelist

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA-7cUdeJgyn42amV9hsSsff2fXp6Aejvg",
  authDomain: "kaylas-kritters-pet-care.firebaseapp.com",
  projectId: "kaylas-kritters-pet-care",
  storageBucket: "kaylas-kritters-pet-care.firebasestorage.app",
  messagingSenderId: "852387321313",
  appId: "1:852387321313:web:eb20c16c89f535b7182ea0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
