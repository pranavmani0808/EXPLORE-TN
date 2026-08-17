export function getApiBaseUrl(): string {
  const isProd =
    (typeof import.meta !== "undefined" && import.meta.env?.MODE === "production") ||
    (typeof process !== "undefined" && process.env?.NODE_ENV === "production");

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

  if (apiUrl) {
    return apiUrl.replace(/\/+$/, "");
  }

  // 3. Strict Production Guard — Never silently fall back to localhost in production builds!
  if (isProd) {
    console.error("[ExplorerTN Config Error] Production API URL is not configured. Set VITE_API_URL to the deployed FastAPI backend.");
    throw new Error("Production API URL is not configured. Set VITE_API_URL to the deployed FastAPI backend.");
  }

  // 4. Local Development Fallback
  return "http://localhost:8000";
}
