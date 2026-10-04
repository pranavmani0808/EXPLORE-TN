import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Environment variables supporting Vite (VITE_*), Next.js (NEXT_PUBLIC_*), and standard process.env
const getEnvVar = (key: string): string => {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key] as string;
  }
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key] as string;
  }
  return "";
};

const firebaseConfig = {
  apiKey:
    getEnvVar("VITE_FIREBASE_API_KEY") ||
    getEnvVar("NEXT_PUBLIC_FIREBASE_API_KEY") ||
    "AIzaSyABZBHuQHygaO8k8qjZ0fiuWOsovxOplT4",
  authDomain:
    getEnvVar("VITE_FIREBASE_AUTH_DOMAIN") ||
    getEnvVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") ||
    "explore-tn-693dc.firebaseapp.com",
  projectId:
    getEnvVar("VITE_FIREBASE_PROJECT_ID") ||
    getEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID") ||
    "explore-tn-693dc",
  storageBucket:
    getEnvVar("VITE_FIREBASE_STORAGE_BUCKET") ||
    getEnvVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET") ||
    "explore-tn-693dc.firebasestorage.app",
  messagingSenderId:
    getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID") ||
    getEnvVar("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID") ||
    "361410633322",
  appId:
    getEnvVar("VITE_FIREBASE_APP_ID") ||
    getEnvVar("NEXT_PUBLIC_FIREBASE_APP_ID") ||
    "1:361410633322:web:45e3b05cdd4f5713e33413",
  measurementId:
    getEnvVar("VITE_FIREBASE_MEASUREMENT_ID") ||
    "G-SFRZ759VS5",
};

// Initialize Firebase safely only when a valid apiKey is present.
// Prevents `Firebase: Error (auth/invalid-api-key)` when keys are not yet configured in production or dev.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.trim().length > 0 &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId.trim().length > 0
);

export const app = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;
