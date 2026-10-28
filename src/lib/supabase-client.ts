// src/lib/supabase-client.ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Returns the access token of the currently authenticated Supabase session, if available.
 */
export async function getSupabaseAccessToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Create a Supabase client that uses the service‑role key.
 * Only call this on the server (e.g., in API routes).
 */
export function createServerSupabaseClient() {
  const serviceKey = process.env.SUPABASE_SECRET_KEY!
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
