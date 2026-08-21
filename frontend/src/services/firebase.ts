import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const metaEnv = (typeof import.meta !== "undefined" && (import.meta as any).env) || {};
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyDbhmQaGmtnDakP68DNfdlQvbWVc5tnZ_I",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "airesume-9a8b5.firebaseapp.com",
  databaseURL: metaEnv.VITE_FIREBASE_DATABASE_URL || "https://airesume-9a8b5-default-rtdb.firebaseio.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "airesume-9a8b5",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "airesume-9a8b5.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "714277782015",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:714277782015:web:ea389cab76307cc0f6e7ca",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-4X68JQ3H79",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics safely (guards against non-browser environments)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Realtime Database
export const database = getDatabase(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
