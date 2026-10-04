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
    "",
  authDomain:
    getEnvVar("VITE_FIREBASE_AUTH_DOMAIN") ||
    getEnvVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") ||
    "",
  projectId:
    getEnvVar("VITE_FIREBASE_PROJECT_ID") ||
    getEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID") ||
    "",
  storageBucket:
    getEnvVar("VITE_FIREBASE_STORAGE_BUCKET") ||
    getEnvVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET") ||
    "",
  messagingSenderId:
    getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID") ||
    getEnvVar("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID") ||
    "",
  appId:
    getEnvVar("VITE_FIREBASE_APP_ID") ||
    getEnvVar("NEXT_PUBLIC_FIREBASE_APP_ID") ||
    "",
};

// Initialize Firebase safely without duplicate app initialization on SSR / Fast Refresh
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
