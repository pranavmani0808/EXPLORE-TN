import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase-client";
import { supabase } from "./supabase-client";
import { setAuthSession, UserProfile } from "./auth-rbac";
import { toast } from "sonner";

/**
 * Maps a Google authenticated user into ExploreTN UserProfile and syncs to Supabase database.
 */
export async function syncGoogleUserToProfile(
  firebaseUser: User,
  customRole: "explorer" | "super_admin" = "explorer"
): Promise<UserProfile> {
  const email = (firebaseUser.email || "").toLowerCase().trim();
  const isAdmin = email === "admin@explorertn.com" || email.endsWith("@explorertn.com");
  const displayName = firebaseUser.displayName || email.split("@")[0] || "Explorer User";
  const avatar = displayName.slice(0, 2).toUpperCase();

  const userProfile: UserProfile = {
    id: firebaseUser.uid || `usr-g-${Date.now()}`,
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
 * Uses Firebase signInWithPopup as primary, with seamless fallback to Supabase OAuth if Firebase is not yet configured.
 */
export async function triggerGoogleSignIn(): Promise<UserProfile | null> {
  // If Firebase is configured with an active apiKey, use popup flow
  if (isFirebaseConfigured && auth) {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        const profile = await syncGoogleUserToProfile(result.user);
        toast.success(`Welcome to ExploreTN, ${profile.name}! Signed in with Google ✓`);
        return profile;
      }
    } catch (fbErr: any) {
      console.warn("[Google Auth] Firebase popup error:", fbErr?.code, fbErr?.message);
      if (fbErr?.code === "auth/popup-closed-by-user") {
        return null;
      }
      if (fbErr?.code === "auth/unauthorized-domain") {
        toast.error("Authorized domain missing. Please add explore-tn-ochre.vercel.app to Firebase Console > Authentication > Settings > Authorized domains.");
        throw new Error("Domain not authorized in Firebase. Add your Vercel URL to Authorized Domains.");
      }
      toast.error(fbErr?.message || "Google sign in failed.");
      throw fbErr;
    }
  }

  // Fallback only if Firebase is completely unconfigured
  toast.error("Firebase authentication is not configured yet.");
  return null;
}
