export function getApiBaseUrl(): string {
  let apiUrl: string | undefined;

  // 1. Check Vite / TanStack Start environment variables
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env.VITE_API_URL) {
      apiUrl = import.meta.env.VITE_API_URL as string;
    } else if (import.meta.env.VITE_API_BASE_URL) {
      apiUrl = import.meta.env.VITE_API_BASE_URL as string;
    }
  }

  // 2. Check Node / Process environment variables
  if (!apiUrl && typeof process !== "undefined" && process.env) {
    if (process.env.VITE_API_URL) {
      apiUrl = process.env.VITE_API_URL;
    } else if (process.env.VITE_API_BASE_URL) {
      apiUrl = process.env.VITE_API_BASE_URL;
    } else if (process.env.NEXT_PUBLIC_API_URL) {
      apiUrl = process.env.NEXT_PUBLIC_API_URL;
    } else if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    } else if (process.env.API_URL) {
      apiUrl = process.env.API_URL;
    } else if (process.env.BACKEND_URL) {
      apiUrl = process.env.BACKEND_URL;
    }
  }

  if (apiUrl && apiUrl.trim() !== "") {
    return apiUrl.replace(/\/+$/, "");
  }

  // 3. Runtime Browser Environment Guard for Production Deployment
  // When running in a production browser environment (e.g. Vercel deployment),
  // window.location.hostname is NOT localhost/127.0.0.1.
  // Use window.location.origin instead of falling back to localhost:8000!
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return window.location.origin;
    }
  }

  // 4. Default Base URL for local development only
  return "http://localhost:8000";
}

