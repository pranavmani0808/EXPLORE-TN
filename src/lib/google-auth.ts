import { supabase } from "./supabase-client";
import { setAuthSession, UserProfile } from "./auth-rbac";
import { toast } from "sonner";

/**
 * Maps a Google authenticated user into ExploreTN UserProfile and syncs to Supabase database.
 */
export async function syncGoogleUserToProfile(
  authUser: { id: string; email?: string | null; user_metadata?: Record<string, any> },
  customRole: "explorer" | "super_admin" = "explorer"
): Promise<UserProfile> {
  const email = (authUser.email || "").toLowerCase().trim();
  const isAdmin = email === "admin@explorertn.com" || email.endsWith("@explorertn.com");
  const displayName = authUser.user_metadata?.["full_name"] || authUser.user_metadata?.["name"] || email.split("@")[0] || "Explorer User";
  const avatar = displayName.slice(0, 2).toUpperCase();

  const userProfile: UserProfile = {
    id: authUser.id || `usr-g-${Date.now()}`,
    name: displayName,
    email: email,
    avatar: avatar,
    role: isAdmin ? "super_admin" : customRole,
    status: "active",
    rank: isAdmin ? "Super Admin" : "Verified Explorer",
    districtCount: isAdmin ? 38 : 1,
    xp: isAdmin ? 1000 : 100,
    authProvider: "google",
  };

  // Sync with Supabase public.users and user_profiles table
  try {
    await fetch("/api/v1/user/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: userProfile,
        isSignUp: true,
      }),
    });
  } catch (err) {
    console.warn("[Google Auth] Warning syncing user to database:", err);
  }

  // Update local session & notify all components
  setAuthSession(userProfile);
  return userProfile;
}

/**
 * Primary Google Sign-In Handler
 * Triggers standard Supabase OAuth with Google provider.
 */
export async function triggerGoogleSignIn(): Promise<UserProfile | null> {
  try {
    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      toast.error(error.message || "Failed to initiate Google sign-in.");
      throw error;
    }

    return null;
  } catch (err: any) {
    console.warn("[Google Auth] Supabase OAuth error:", err?.message);
    toast.error(err?.message || "Google sign in failed.");
    throw err;
  }
}
