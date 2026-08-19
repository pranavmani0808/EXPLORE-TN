export function getApiBaseUrl(): string {
  let apiUrl: string | undefined;

  // 1. Check Vite / TanStack Start environment variables
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env.VITE_API_URL) {
      apiUrl = import.meta.env.VITE_API_URL as string;
    }
  }

  // 2. Check Node / Process environment variables
  if (!apiUrl && typeof process !== "undefined" && process.env) {
    if (process.env.VITE_API_URL) {
      apiUrl = process.env.VITE_API_URL;
    } else if (process.env.NEXT_PUBLIC_API_URL) {
      apiUrl = process.env.NEXT_PUBLIC_API_URL;
    }
  }

  if (apiUrl && apiUrl.trim() !== "") {
    return apiUrl.replace(/\/+$/, "");
  }

  // 3. Fallback Base URL for local development & graceful SSR rendering
  return "http://localhost:8000";
}
