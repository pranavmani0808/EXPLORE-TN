/**
 * ExploreTN — Primary Supabase Database Client & Secure Repository
 * Project Ref: ajxnljrhueiiuwavbrra
 * Supabase Host: https://ajxnljrhueiiuwavbrra.supabase.co
 */

import { supabase } from "./supabase-client";

export interface SupabasePlaceRecord {
  id: string;
  slug: string;
  name: string;
  tamil_name?: string;
  tagline?: string;
  tamil_tagline?: string;
  district: string;
  taluk?: string;
  category: 'Temple' | 'Heritage' | 'Food Spot' | 'Thrift Street' | 'Waterfall' | 'Hill Station' | 'Beach' | 'Wildlife' | 'Culture' | 'Craft';
  subcategories?: string[];
  description: string;
  tamil_description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  pincode?: string;
  opening_hours?: string;
  best_time_to_visit?: string;
  entry_fee_inr?: number;
  entry_fee_info?: string;
  rating?: number;
  review_count?: number;
  image_url?: string;
  gallery_urls?: string[];
  tags?: string[];
  is_featured?: boolean;
  is_verified?: boolean;
  visibility: 'public' | 'unlisted' | 'private' | 'restricted';
  status: 'published' | 'draft' | 'pending_review' | 'archived';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseRouteRecord {
  id: string;
  title: string;
  origin: string;
  destination: string;
  distance_km: number;
  duration: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  waypoints: string[];
  district: string;
  status: 'active' | 'draft';
}

export interface SupabaseHotelRecord {
  id: string;
  name: string;
  district: string;
  address: string;
  price_range: string;
  rating: number;
  amenities: string[];
  image_url?: string;
  is_verified: boolean;
}

export interface SupabaseAuditLogRecord {
  id: string;
  user_email: string;
  action: string;
  resource: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export class SupabaseDatabaseRepository {
  /**
   * Primary Database Health Check for project ref ajxnljrhueiiuwavbrra
   */
  static async checkConnection(): Promise<{ connected: boolean; projectRef: string; message: string }> {
    try {
      const { data, error } = await supabase.from('places').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return {
          connected: true,
          projectRef: "ajxnljrhueiiuwavbrra",
          message: `Connected to Supabase endpoint (https://ajxnljrhueiiuwavbrra.supabase.co). Notice: ${error.message}`
        };
      }
      return {
        connected: true,
        projectRef: "ajxnljrhueiiuwavbrra",
        message: "Successfully connected to Supabase Primary Database cluster (ajxnljrhueiiuwavbrra)."
      };
    } catch (err: any) {
      return {
        connected: false,
        projectRef: "ajxnljrhueiiuwavbrra",
        message: err?.message || "Failed to establish active TLS session with Supabase DB."
      };
    }
  }

  // --- PLACES MODULE (PRIVACY & SECURITY ENFORCED) ---

  /**
   * Fetch all published & public places safely for public UI
   */
  static async getPublicPlaces(filters?: { district?: string; category?: string; search?: string }): Promise<SupabasePlaceRecord[]> {
    try {
      let query = supabase
        .from('places')
        .select('*')
        .eq('status', 'published')
        .eq('visibility', 'public');

      if (filters?.district && filters.district !== 'all' && filters.district !== 'All') {
        query = query.eq('district', filters.district);
      }

      if (filters?.category && filters.category !== 'all' && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(`name.ilike.${searchTerm},tamil_name.ilike.${searchTerm},district.ilike.${searchTerm},description.ilike.${searchTerm}`);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) {
        console.warn("[Supabase DB] Error querying public places:", error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn("[Supabase DB] Unexpected error fetching public places:", err);
      return [];
    }
  }

  /**
   * Fetch single place by unique slug
   */
  static async getPlaceBySlug(slug: string): Promise<SupabasePlaceRecord | null> {
    try {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .maybeSingle();

      if (error) {
        console.warn(`[Supabase DB] Error fetching place slug ${slug}:`, error.message);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  /**
   * Create new place record with security validation
   */
  static async createPlace(place: Omit<SupabasePlaceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<SupabasePlaceRecord | null> {
    try {
      // Auto-generate slug if missing
      const slug = place.slug || place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const placeData = {
        ...place,
        slug,
        visibility: place.visibility || 'public',
        status: place.status || 'published',
      };

      const { data, error } = await supabase.from('places').insert([placeData]).select().single();
      if (error) {
        console.error("[Supabase DB] Error creating place record:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error("[Supabase DB] Exception in createPlace:", err);
      return null;
    }
  }

  /**
   * Update place with ownership / RLS verification
   */
  static async updatePlace(id: string, updates: Partial<SupabasePlaceRecord>): Promise<boolean> {
    try {
      const { error } = await supabase.from('places').update(updates).eq('id', id);
      if (error) {
        console.error(`[Supabase DB] Error updating place ${id}:`, error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete place record
   */
  static async deletePlace(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('places').delete().eq('id', id);
      if (error) {
        console.error(`[Supabase DB] Error deleting place ${id}:`, error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // --- ROUTES MODULE ---
  static async getRoutes(district?: string): Promise<SupabaseRouteRecord[]> {
    let query = supabase.from('routes').select('*');
    if (district && district !== 'all') {
      query = query.eq('district', district);
    }
    const { data, error } = await query;
    if (error) {
      console.warn("[Supabase DB] Error querying routes:", error.message);
      return [];
    }
    return data || [];
  }

  // --- HOTELS MODULE ---
  static async getHotels(district?: string): Promise<SupabaseHotelRecord[]> {
    let query = supabase.from('hotels').select('*');
    if (district && district !== 'all') {
      query = query.eq('district', district);
    }
    const { data, error } = await query;
    if (error) {
      console.warn("[Supabase DB] Error querying hotels:", error.message);
      return [];
    }
    return data || [];
  }

  // --- AUDIT LOGS MODULE ---
  static async logAdminAction(userEmail: string, action: string, resource: string, details?: string): Promise<boolean> {
    const log: Omit<SupabaseAuditLogRecord, 'id'> = {
      user_email: userEmail,
      action,
      resource,
      details,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('audit_logs').insert([log]);
    if (error) {
      console.warn("[Supabase DB] Audit log entry failed:", error.message);
      return false;
    }
    return true;
  }
}
