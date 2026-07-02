import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Firebase Configuration ---
// Relocated from App.jsx so shared components (StreakBanner, etc.) can import
// `db`/`auth`/`appId` directly instead of having them threaded through as props.
// Values are unchanged — this is a structural move only, not a config change.
const firebaseConfig = {
  apiKey: "AIzaSyDjVRyOlc5PFfxbafBjQzlP123vql1vSXQ",
  authDomain: "gym-logger-by-cd.firebaseapp.com",
  projectId: "gym-logger-by-cd",
  storageBucket: "gym-logger-by-cd.firebasestorage.app",
  messagingSenderId: "520191512916",
  appId: "1:520191512916:web:819d1fb4913a9c278c78c1",
  measurementId: "G-2XZ0BKT8MF"
};

export const appId = 'default-gym-log'; // identifier for our app's data collections

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
