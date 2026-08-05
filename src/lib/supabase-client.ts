import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://your-supabase-project.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "your-supabase-anon-key";

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
