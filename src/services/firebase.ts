import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "way-to-words.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "way-to-words",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "way-to-words.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "959199263078",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:959199263078:web:85771e685e3630e1fbf0a7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GVKHDSVWL9"
};

// Initialize Firebase
console.log('Initializing Firebase...');

let app;
let auth;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized');
  
  // Initialize Auth
  auth = getAuth(app);
  console.log('Firebase Auth initialized');
  
  // Initialize Analytics (only in browser, optional)
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized');
    } catch (error) {
      console.warn('Analytics initialization failed (this is OK):', error);
    }
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Don't throw - allow app to continue without Firebase
  // Create dummy auth object to prevent crashes
  auth = null as any;
}

export { auth, app, analytics };

