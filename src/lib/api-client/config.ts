export function getApiBaseUrl(): string {
  // 1. Check Vite / TanStack Start environment variables
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env.VITE_API_URL) {
      return (import.meta.env.VITE_API_URL as string).replace(/\/+$/, "");
    }
  }

  // 2. Check Node / Process environment variables
  if (typeof process !== "undefined" && process.env) {
    if (process.env.VITE_API_URL) {
      return process.env.VITE_API_URL.replace(/\/+$/, "");
    }
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
    }
  }

  // 3. Explicit Local Development Fallback
  return "http://localhost:8000";
}
