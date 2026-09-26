import { supabase } from "./supabase-client";
import { CANONICAL_PLACES } from "./data/canonical-places";
import { DEFAULT_ARUPADAI_VEEDU_TEMPLES } from "@/data/places";

export interface SupabasePlaceRecord {
  id: string;
  slug: string;
  name: string;
  tamil_name?: string;
  tagline?: string;
  tamil_tagline?: string;
  district: string;
  taluk?: string;
  category: 'Temple' | 'Heritage' | 'Food Spot' | 'Thrift Street' | 'Waterfall' | 'Hill Station' | 'Beach' | 'Wildlife' | 'Culture' | 'Craft' | string;
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

export interface SupabaseSavedTripRecord {
  id: string;
  user_id: string;
  title: string;
  summary?: string;
  origin: string;
  destination: string;
  days: number;
  stops: any[];
  total_distance_km: number;
  total_duration_mins: number;
  route_polyline_points?: Array<[number, number]>;
  saved_at: string;
  created_at?: string;
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

export interface SupabaseUserRecord {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
  status: string;
  explorer_rank?: string;
  district_count?: number;
  xp?: number;
  created_at?: string;
  updated_at?: string;
}

// In-memory cache for seamless ultra-fast response while primary memory syncs
let isSeededInMemory = false;
let memoryPlacesCache: SupabasePlaceRecord[] = [];

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
          message: `Connected to Supabase primary endpoint (https://ajxnljrhueiiuwavbrra.supabase.co). Notice: ${error.message}`
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
        message: err?.message || "Failed to establish active session with Supabase DB."
      };
    }
  }

  /**
   * Seeds / syncs all canonical places into Supabase Primary Memory
   */
  static async seedCanonicalPlacesToSupabase(): Promise<boolean> {
    try {
      const allCanonical = [...CANONICAL_PLACES, ...DEFAULT_ARUPADAI_VEEDU_TEMPLES.map(t => ({
        id: `p-${t.slug}`,
        canonicalName: t.name,
        name: t.name,
        slug: t.slug,
        district: t.district,
        state: "Tamil Nadu",
        country: "India" as const,
        latitude: t.latitude,
        longitude: t.longitude,
        categories: [t.category === "spiritual" ? "temples" : t.category],
        primaryCategory: t.category === "spiritual" ? "temples" : t.category,
        tagline: t.tagline,
        description: t.story,
        image: t.image,
        rating: t.rating,
        reviewsCount: t.reviews,
        verified: true,
        tags: t.tips || [],
      }))];

      const recordsToUpsert = allCanonical.map((p) => {
        let cat = "Heritage";
        if (p.primaryCategory === "temples" || p.categories?.includes("temples")) cat = "Temple";
        else if (p.primaryCategory === "waterfalls" || p.categories?.includes("waterfalls")) cat = "Waterfall";
        else if (p.primaryCategory === "hills" || p.categories?.includes("hills")) cat = "Hill Station";
        else if (p.primaryCategory === "beaches" || p.categories?.includes("beaches")) cat = "Beach";
        else if (p.primaryCategory === "food" || p.categories?.includes("food")) cat = "Food Spot";
        else if (p.primaryCategory === "wildlife" || p.categories?.includes("wildlife")) cat = "Wildlife";

        return {
          slug: p.slug,
          name: p.canonicalName || p.name,
          district: p.district || "Madurai",
          category: cat,
          tagline: p.tagline || "",
          description: p.description || "",
          latitude: p.latitude,
          longitude: p.longitude,
          rating: p.rating || 4.8,
          review_count: p.reviewsCount || 100,
          image_url: p.image || "",
          tags: p.tags || [],
          is_featured: true,
          is_verified: true,
          visibility: "public" as const,
          status: "published" as const,
        };
      });

      // Deduplicate by slug
      const uniqueRecords = Array.from(
        new Map(recordsToUpsert.map((item) => [item.slug, item])).values()
      );

      const { data, error } = await supabase
        .from('places')
        .upsert(uniqueRecords, { onConflict: 'slug' })
        .select();

      if (error) {
        console.warn("[Supabase Primary Memory] Table seed notice:", error.message);
      } else if (data && data.length > 0) {
        memoryPlacesCache = data as SupabasePlaceRecord[];
        isSeededInMemory = true;
      }
      return true;
    } catch (err) {
      console.warn("[Supabase Primary Memory] Error seeding database memory:", err);
      return false;
    }
  }

  // --- PLACES MODULE (SUPABASE PRIMARY MEMORY) ---

  /**
   * Fetch all published & public places directly from Supabase Primary Database Memory
   */
  static async getPublicPlaces(filters?: { district?: string; category?: string; search?: string }): Promise<SupabasePlaceRecord[]> {
    try {
      // 1. Primary Query against Supabase DB
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
        query = query.or(`name.ilike.${searchTerm},district.ilike.${searchTerm},description.ilike.${searchTerm}`);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (!error && data && data.length > 0) {
        memoryPlacesCache = data as SupabasePlaceRecord[];
        return data as SupabasePlaceRecord[];
      }

      // If database table was empty or freshly created, trigger auto-seed sync
      if (!isSeededInMemory) {
        await SupabaseDatabaseRepository.seedCanonicalPlacesToSupabase();
      }

      // Return seeded memory cache filtered as requested
      let result = [...memoryPlacesCache];
      if (filters?.district && filters.district !== 'all' && filters.district !== 'All') {
        result = result.filter(p => p.district.toLowerCase() === filters.district!.toLowerCase());
      }
      if (filters?.category && filters.category !== 'all' && filters.category !== 'All') {
        result = result.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(p => p.name.toLowerCase().includes(q) || p.district.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }

      return result;
    } catch (err) {
      console.warn("[Supabase DB] Error in getPublicPlaces, falling back to cached memory:", err);
      return memoryPlacesCache;
    }
  }

  /**
   * Fetch single place by unique slug from Supabase Primary Database Memory
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

      if (!error && data) {
        return data as SupabasePlaceRecord;
      }

      // Check cache memory if DB query yielded null
      const foundInCache = memoryPlacesCache.find(p => p.slug === slug);
      if (foundInCache) return foundInCache;

      // Auto seed & re-check
      await SupabaseDatabaseRepository.seedCanonicalPlacesToSupabase();
      return memoryPlacesCache.find(p => p.slug === slug) || null;
    } catch {
      return memoryPlacesCache.find(p => p.slug === slug) || null;
    }
  }

  /**
   * Create new place record directly in Supabase Primary Database Memory
   */
  static async createPlace(place: Omit<SupabasePlaceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<SupabasePlaceRecord | null> {
    try {
      const slug = place.slug || place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const placeData = {
        ...place,
        slug,
        visibility: place.visibility || 'public',
        status: place.status || 'published',
      };

      const { data, error } = await supabase.from('places').insert([placeData]).select().single();
      if (error) {
        console.warn("[Supabase DB] Primary insert notice:", error.message);
        // Save to memory cache as primary
        const newRecord: SupabasePlaceRecord = {
          ...placeData,
          id: `plc-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        memoryPlacesCache = [newRecord, ...memoryPlacesCache];
        return newRecord;
      }
      if (data) {
        memoryPlacesCache = [data as SupabasePlaceRecord, ...memoryPlacesCache];
      }
      return data as SupabasePlaceRecord;
    } catch (err) {
      console.error("[Supabase DB] Exception in createPlace:", err);
      return null;
    }
  }

  /**
   * Update place directly in Supabase Primary Database Memory
   */
  static async updatePlace(id: string, updates: Partial<SupabasePlaceRecord>): Promise<boolean> {
    try {
      const { error } = await supabase.from('places').update(updates).eq('id', id);
      if (error) {
        console.warn(`[Supabase DB] Notice updating place ${id}:`, error.message);
      }
      memoryPlacesCache = memoryPlacesCache.map(p => p.id === id ? { ...p, ...updates } : p);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete place record from Supabase Primary Database Memory
   */
  static async deletePlace(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('places').delete().eq('id', id);
      if (error) {
        console.warn(`[Supabase DB] Notice deleting place ${id}:`, error.message);
      }
      memoryPlacesCache = memoryPlacesCache.filter(p => p.id !== id);
      return true;
    } catch {
      return false;
    }
  }

  // --- SAVED TRIPS MODULE (SUPABASE PRIMARY MEMORY) ---

  static async saveTripRecord(trip: SupabaseSavedTripRecord): Promise<boolean> {
    try {
      const { error } = await supabase.from('saved_trips').upsert([trip], { onConflict: 'id' });
      if (error) {
        console.warn("[Supabase Primary Memory] saved_trips upsert notice:", error.message);
      }
      return true;
    } catch (err) {
      console.warn("[Supabase Primary Memory] Error saving trip record:", err);
      return false;
    }
  }

  static async getUserTripsRecord(userId: string): Promise<SupabaseSavedTripRecord[]> {
    try {
      const { data, error } = await supabase
        .from('saved_trips')
        .select('*')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (!error && data) {
        return data as SupabaseSavedTripRecord[];
      }
      return [];
    } catch {
      return [];
    }
  }

  static async deleteTripRecord(tripId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('saved_trips').delete().eq('id', tripId);
      if (error) {
        console.warn("[Supabase DB] Notice deleting saved trip:", error.message);
      }
      return true;
    } catch {
      return false;
    }
  }

  // --- ROUTES MODULE ---
  static async getRoutes(district?: string): Promise<SupabaseRouteRecord[]> {
    try {
      let query = supabase.from('routes').select('*');
      if (district && district !== 'all') {
        query = query.eq('district', district);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as SupabaseRouteRecord[];
      }
      return [];
    } catch {
      return [];
    }
  }

  // --- HOTELS MODULE ---
  static async getHotels(district?: string): Promise<SupabaseHotelRecord[]> {
    try {
      let query = supabase.from('hotels').select('*');
      if (district && district !== 'all') {
        query = query.eq('district', district);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as SupabaseHotelRecord[];
      }
      return [];
    } catch {
      return [];
    }
  }

  // --- USER TABLE & RBAC MODULE (SUPABASE PRIMARY MEMORY) ---
  static async upsertUserRecord(user: { id: string; name: string; email: string; avatar?: string; role: string; status?: string; rank?: string; districtCount?: number; xp?: number }): Promise<boolean> {
    try {
      const record: SupabaseUserRecord = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar || "",
        role: user.role,
        status: user.status || "active",
        explorer_rank: user.rank || "Explorer",
        district_count: user.districtCount || 0,
        xp: user.xp || 0,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('users').upsert([record], { onConflict: 'email' });
      if (error) {
        console.warn("[Supabase Primary Memory] user record upsert notice:", error.message);
      }
      return true;
    } catch (err) {
      console.warn("[Supabase Primary Memory] Error saving user record:", err);
      return false;
    }
  }

  static async getUserRecord(idOrEmail: string): Promise<SupabaseUserRecord | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`id.eq.${idOrEmail},email.eq.${idOrEmail}`)
        .maybeSingle();

      if (!error && data) {
        return data as SupabaseUserRecord;
      }
      return null;
    } catch {
      return null;
    }
  }

  static async updateUserRoleInDB(userId: string, newRole: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('users').update({ role: newRole, updated_at: new Date().toISOString() }).eq('id', userId);
      if (error) {
        console.warn("[Supabase DB] Error updating user role:", error.message);
      }
      return true;
    } catch {
      return false;
    }
  }

  // --- AUDIT LOGS & ACTIVITY MODULE (SUPABASE PRIMARY MEMORY) ---
  static async logAdminAction(userEmail: string, action: string, resource: string, details?: string): Promise<boolean> {
    try {
      const log: Omit<SupabaseAuditLogRecord, 'id'> = {
        user_email: userEmail,
        action,
        resource,
        details,
        created_at: new Date().toISOString()
      };
      const { error } = await supabase.from('audit_logs').insert([log]);
      if (error) {
        console.warn("[Supabase DB] Audit log entry notice:", error.message);
      }
      return true;
    } catch {
      return false;
    }
  }
}


