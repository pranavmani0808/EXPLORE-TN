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

  // 3. Browser: always use same-origin relative URLs.
  // The Vite / Vercel layer proxies /api, /healthz, /readyz to FastAPI.
  // Never point the user's browser at localhost — that is the sandbox, not their machine.
  if (typeof window !== "undefined") {
    return "";
  }

  // 4. SSR / Node local fallback
  return "http://127.0.0.1:8000";
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
