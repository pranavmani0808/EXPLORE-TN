import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  "https://ajxnljrhueiiuwavbrra.supabase.co";

const SUPABASE_ANON_KEY =
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  "sb_publishable_7iBDUCQZQoCO6zg6KamalA_kdzdjk-8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabaseProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'explorer' | 'place_manager' | 'route_manager' | 'community_manager' | 'super_admin';
  status: 'active' | 'suspended' | 'pending';
  rank: string;
  district_count: number;
  created_at: string;
  updated_at: string;
}
