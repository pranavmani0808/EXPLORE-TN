import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://ajxnljrhueiiuwavbrra.supabase.co";

const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";

// Server-side privileged client with bypass RLS to sync user relational tables
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const APIRoute = createAPIFileRoute("/api/v1/user/sync")({
  POST: async ({ request }) => {
    try {
      const body = await request.json().catch(() => ({}));
      const { user, isSignUp } = body;

      if (!user || !user.email) {
        return new Response(
          JSON.stringify({ error: "Missing required user payload" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const email = user.email.trim().toLowerCase();
      const userId = user.id;
      const name = user.name || email.split("@")[0] || "Explorer User";

      // Check if user already exists in public.users table
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from("users")
        .select("id, email, name, role, status")
        .eq("email", email)
        .maybeSingle();

      // STRICT RBAC POLICY: Only super_admin can assign roles (Admin, Moderator, Content Editor, etc.)
      // When a user verifies email and registers, they strictly start as "explorer" (Registered User).
      // Platform owner admin@explorertn.com is the sole Super Admin.
      let role = "explorer";
      if (email === "admin@explorertn.com") {
        role = "super_admin";
      } else if (existingUser?.role) {
        // Retain role assigned by Super Admin in users table
        role = existingUser.role;
      }

      if (checkError) {
        console.warn("[User Sync API] Check existing user warning:", checkError.message);
      }

      // If normal sign-in and user was not found in database records
      if (!isSignUp && !existingUser) {
        return new Response(
          JSON.stringify({
            exists: false,
            message: "user not found",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // Check if user profile already has profile_complete set
      let isProfileComplete = false;
      if (existingUser) {
        const { data: prof } = await supabaseAdmin
          .from("user_profiles")
          .select("profile_complete")
          .eq("user_id", existingUser.id)
          .maybeSingle();
        if (prof?.profile_complete) {
          isProfileComplete = true;
        }
      }

      // User exists or is signing up -> upsert in public.users
      const targetId = existingUser?.id || userId;
      const { data: savedUser, error: userError } = await supabaseAdmin
        .from("users")
        .upsert(
          {
            id: targetId,
            email: email,
            name: name,
            avatar_url: user.avatar || "",
            role: role,
            status: "active",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "email" }
        )
        .select()
        .single();

      if (userError) {
        console.error("[User Sync API] Error saving user:", userError.message);
        return new Response(
          JSON.stringify({ error: userError.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Upsert linked user_profiles table (Foreign key: user_id -> users.id)
      const profilePayload: any = {
        user_id: targetId,
        city: user.city || user.location || "Tamil Nadu",
        state: "Tamil Nadu",
        preferred_language: "en",
        updated_at: new Date().toISOString(),
      };

      if (user.bio !== undefined) profilePayload.bio = user.bio;
      if (user.phone !== undefined) profilePayload.phone = user.phone;
      if (user.vehicleType !== undefined || user.vehicle !== undefined) {
        profilePayload.vehicle_type = user.vehicleType || user.vehicle;
      }
      if (user.interests !== undefined) profilePayload.interests = user.interests;
      if (user.targetDistricts !== undefined) profilePayload.target_districts = user.targetDistricts;
      if (user.budgetTier !== undefined) profilePayload.budget_tier = user.budgetTier;
      if (user.profileComplete !== undefined) profilePayload.profile_complete = user.profileComplete;

      await supabaseAdmin
        .from("user_profiles")
        .upsert(profilePayload, { onConflict: "user_id" })
        .catch(() => null);

      // Upsert linked user_stats table (Foreign key: user_id -> users.id)
      await supabaseAdmin
        .from("user_stats")
        .upsert(
          {
            user_id: targetId,
            xp: role === "super_admin" ? 1000 : 100,
            rank_title: role === "super_admin" ? "Super Admin" : "Verified Explorer",
            district_count: role === "super_admin" ? 38 : 1,
            last_active_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        )
        .catch(() => null);

      return new Response(
        JSON.stringify({
          success: true,
          exists: true,
          profileComplete: isProfileComplete || user.profileComplete || role === "super_admin",
          user: savedUser,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      console.error("[User Sync API] Exception:", err);
      return new Response(
        JSON.stringify({ error: err?.message || "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
  GET: async ({ request }) => {
    try {
      const url = new URL(request.url);
      const email = url.searchParams.get("email")?.trim().toLowerCase();

      if (!email) {
        return new Response(
          JSON.stringify({ valid: false, message: "Missing email parameter" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Check if user exists in public.users
      const { data: userRecord } = await supabaseAdmin
        .from("users")
        .select("id, email, status, role")
        .eq("email", email)
        .maybeSingle();

      // Also verify in auth.users
      const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = authList?.users?.find((u) => u.email?.toLowerCase() === email);

      if (!userRecord || !authUser || userRecord.status === "suspended" || userRecord.status === "blocked") {
        return new Response(
          JSON.stringify({
            valid: false,
            exists: false,
            message: "User account has been removed or deactivated.",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          valid: true,
          exists: true,
          role: userRecord.role,
          status: userRecord.status,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ valid: true, error: err?.message }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});
