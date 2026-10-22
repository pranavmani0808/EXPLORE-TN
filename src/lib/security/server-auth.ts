/**
 * Server-only authentication helpers for the ExploreTN API layer.
 * Verifies Supabase access tokens presented by clients and resolves platform roles.
 *
 * NEVER import this module from client components: it requires the
 * Supabase service key and must stay in the server bundle only.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

function getSupabaseUrl(): string | null {
  return process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || null;
}

/**
 * Lazily create the service-role Supabase client. Throws when the server
 * environment is missing required credentials instead of silently degrading
 * to weaker (anon) privileges.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const serviceKey = process.env["SUPABASE_SECRET_KEY"];
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin configuration missing. Set SUPABASE_URL and SUPABASE_SECRET_KEY in the server environment."
    );
  }
  if (adminClient) return adminClient;
  adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const client: SupabaseClient = adminClient;
  return client;
}

export interface VerifiedSession {
  userId: string;
  email: string;
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() || null;
}

/**
 * Validate a Supabase access token by resolving it against Supabase Auth.
 * The returned identity always comes from the token, never from the request body.
 */
export async function verifySupabaseSession(request: Request): Promise<VerifiedSession | null> {
  const token = getBearerToken(request);
  const url = getSupabaseUrl();
  const anonKey =
    process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_ANON_KEY"];
  if (!token || !url || !anonKey) return null;

  try {
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string; email?: string };
    if (!user?.id || !user?.email) return null;
    return { userId: user.id, email: user.email.toLowerCase() };
  } catch {
    return null;
  }
}

/**
 * Resolve the platform role for a user from public.users.
 * Matches on the auth UUID first, then falls back to email for legacy rows
 * that were created with synthetic ids.
 */
export async function getUserRole(userId: string, email?: string): Promise<string | null> {
  try {
    const admin = getSupabaseAdminClient();
    const query = admin.from("users").select("role, status").eq("id", userId);
    if (email) query.or(`email.eq.${email}`);
    const { data } = await query.maybeSingle();
    return data?.role ?? null;
  } catch {
    return null;
  }
}

export function unauthorized(): Response {
  return new Response(
    JSON.stringify({
      error: "Authentication required. Sign in and send the Supabase session token as a Bearer header.",
    }),
    { status: 401, headers: { "Content-Type": "application/json", "WWW-Authenticate": "Bearer" } }
  );
}

export function forbidden(message = "Administrator privileges required."): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

export type AdminGuardResult =
  | { ok: true; session: VerifiedSession; role: string }
  | { ok: false; response: Response };

/**
 * Guard for administrator-only endpoints: verifies the caller's Supabase
 * session and confirms their role in public.users.
 */
export async function requireAdmin(request: Request): Promise<AdminGuardResult> {
  const session = await verifySupabaseSession(request);
  if (!session) return { ok: false, response: unauthorized() };

  const role = (await getUserRole(session.userId, session.email)) || "";
  if (role !== "admin" && role !== "super_admin") return { ok: false, response: forbidden() };

  return { ok: true, session, role };
}
