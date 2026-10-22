import { getSupabaseAccessToken } from "./supabase-client";
import { UserProfile } from "./auth-rbac";

export interface UserSyncResult {
  success?: boolean;
  exists?: boolean;
  profileComplete?: boolean;
  error?: string;
  message?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    status?: string;
    [key: string]: unknown;
  };
}

/**
 * Sync the signed-in user's profile to the server. The server derives identity
 * from the Supabase session token (Authorization header) — the payload only
 * carries profile fields, and its id/email are ignored server-side.
 *
 * Returns the parsed response, or null when the sync could not be completed.
 */
export async function syncUserWithServer(
  user: Partial<UserProfile> & { email?: string },
  isSignUp: boolean
): Promise<UserSyncResult | null> {
  try {
    const accessToken = await getSupabaseAccessToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch("/api/v1/user/sync", {
      method: "POST",
      headers,
      body: JSON.stringify({ user, isSignUp }),
    });

    const data = (await res.json().catch(() => ({}))) as UserSyncResult;
    if (!res.ok) {
      return { ...data, error: data?.error || data?.message || `Sync failed (${res.status})` };
    }
    return data;
  } catch (err) {
    console.warn("[UserSync] Warning syncing user to database:", err);
    return null;
  }
}
