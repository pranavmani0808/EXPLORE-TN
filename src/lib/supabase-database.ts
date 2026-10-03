import { supabase } from "./supabase-client";
import { CANONICAL_PLACES } from "./data/canonical-places";
import { DEFAULT_ARUPADAI_VEEDU_TEMPLES, DEFAULT_PANCHA_BHOOTA_TEMPLES } from "@/data/places";
import { TAMIL_NADU_DISTRICTS } from "./data/districts";

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

function isMatchCategory(p: any, targetCat?: string): boolean {
  if (!targetCat || targetCat.toLowerCase() === 'all' || targetCat.toLowerCase() === 'all categories') return true;
  const target = targetCat.toLowerCase().trim();
  const cat = (p.category || '').toLowerCase();
  const prim = (p.primary_category || '').toLowerCase();
  const tags = Array.isArray(p.tags) ? p.tags.map((t: any) => String(t).toLowerCase()) : [];
  const allCats = [cat, prim, ...tags];

  if (target === 'hills' || target === 'mountains' || target === 'hill-escapes' || target === 'hills of tn') {
    return allCats.some(c => c.includes('hill') || c.includes('mountain') || c.includes('peak') || c.includes('ghat') || c.includes('viewpoint') || c.includes('hairpin') || c.includes('shola'));
  }
  if (target === 'beaches' || target === 'coastal' || target === 'coastal-heritage') {
    return allCats.some(c => c.includes('beach') || c.includes('coast') || c.includes('sea') || c.includes('ocean') || c.includes('shore'));
  }
  if (target === 'temples' || target === 'heritage' || target === 'spiritual') {
    return allCats.some(c => c.includes('temple') || c.includes('heritage') || c.includes('spiritual') || c.includes('gopuram') || c.includes('shrine') || c.includes('sacred') || c.includes('fort') || c.includes('palace'));
  }
  if (target === 'waterfalls') {
    return allCats.some(c => c.includes('waterfall') || c.includes('falls') || c.includes('cascade') || c.includes('stream'));
  }
  if (target === 'food' || target === 'culinary') {
    return allCats.some(c => c.includes('food') || c.includes('culinary') || c.includes('mess') || c.includes('eatery') || c.includes('sweet') || c.includes('hotel'));
  }
  if (target === 'hidden-spots' || target === 'hidden' || target === 'offbeat') {
    return allCats.some(c => c.includes('hidden') || c.includes('offbeat') || c.includes('secret') || c.includes('unexplored') || c.includes('remote'));
  }
  if (target === 'trending' || target === 'popular') {
    return (p.rating ?? 4.8) >= 4.5 || allCats.some(c => c.includes('trending') || c.includes('popular') || c.includes('featured'));
  }
  if (target === 'nature' || target === 'wildlife') {
    return allCats.some(c => c.includes('nature') || c.includes('wildlife') || c.includes('forest') || c.includes('sanctuary') || c.includes('reserve') || c.includes('park'));
  }
  if (target === 'trekking' || target === 'adventure') {
    return allCats.some(c => c.includes('trek') || c.includes('adventure') || c.includes('hike') || c.includes('offroad'));
  }

  return allCats.some(c => c.includes(target) || target.includes(c));
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
      // Extract all spots from all 38 Tamil Nadu districts
      const districtSpotsCanonical = Object.values(TAMIL_NADU_DISTRICTS).flatMap((d) =>
        d.spots.map((s) => {
          let primaryCategory = "tourist-spots";
          if (s.category === "temples") primaryCategory = "temples";
          else if (s.category === "food-spots") primaryCategory = "food";
          else if (s.category === "hills") primaryCategory = "hills";
          else if (s.category === "falls") primaryCategory = "waterfalls";
          else if (s.category === "beaches") primaryCategory = "beaches";
          else if (s.category === "thrift-streets") primaryCategory = "shopping";

          return {
            id: s.id,
            canonicalName: s.name,
            name: s.name,
            slug: s.id,
            district: d.name.replace(/\s+District$/i, ""),
            state: "Tamil Nadu",
            country: "India" as const,
            latitude: s.latitude,
            longitude: s.longitude,
            categories: [s.category, primaryCategory],
            primaryCategory,
            tagline: s.tagline,
            description: s.description,
            image: s.image,
            rating: s.rating,
            reviewsCount: s.reviewsCount,
            verified: s.verified,
            tags: [s.category, d.slug, ...(s.highlights || []), ...(s.mustTry || [])],
          };
        })
      );

      const allCanonical = [
        ...CANONICAL_PLACES,
        ...districtSpotsCanonical,
        ...DEFAULT_ARUPADAI_VEEDU_TEMPLES.map(t => ({
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
        })),
        ...DEFAULT_PANCHA_BHOOTA_TEMPLES.map(t => ({
          id: `p-${t.slug}`,
          canonicalName: `${t.name} (${t.element})`,
          name: t.name,
          slug: t.slug,
          district: t.district,
          state: t.district === "Tirupati" ? "Andhra Pradesh" : "Tamil Nadu",
          country: "India" as const,
          latitude: t.latitude,
          longitude: t.longitude,
          categories: ["temples", "spiritual", "pancha_bhoota"],
          primaryCategory: "temples",
          tagline: t.tagline,
          description: t.story,
          image: t.image,
          rating: t.rating,
          reviewsCount: t.reviews,
          verified: true,
          tags: ["temple", "shiva", "pancha_bhoota", t.element, ...(t.tips || [])],
        }))
      ];

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
      if (!isSeededInMemory) {
        await SupabaseDatabaseRepository.seedCanonicalPlacesToSupabase();
      }

      let dbRecords: SupabasePlaceRecord[] = [];
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('rating', { ascending: false });

      if (!error && data && data.length > 0) {
        dbRecords = data as SupabasePlaceRecord[];
      }

      // Combine DB records with memory cache records (deduped by slug)
      const combinedMap = new Map<string, SupabasePlaceRecord>();
      [...memoryPlacesCache, ...dbRecords].forEach(p => {
        if (p.slug) combinedMap.set(p.slug, p);
      });

      let result = Array.from(combinedMap.values());

      // Filter by district
      if (filters?.district && filters.district !== 'all' && filters.district !== 'All') {
        const d = filters.district.toLowerCase().trim();
        result = result.filter(p => p.district && (p.district.toLowerCase().includes(d) || d.includes(p.district.toLowerCase())));
      }

      // Filter by category
      if (filters?.category && filters.category !== 'all' && filters.category !== 'All') {
        result = result.filter(p => isMatchCategory(p, filters.category));
      }

      // Filter by search query
      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(p =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.district && p.district.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.tagline && p.tagline.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some(t => String(t).toLowerCase().includes(q)))
        );
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
      // 1. Memory cache check first
      const cached = memoryPlacesCache.find(p => p.slug === slug || p.id === slug);
      if (cached) return cached;

      // 2. Database query
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        memoryPlacesCache = [data as SupabasePlaceRecord, ...memoryPlacesCache.filter(p => p.slug !== slug)];
        return data as SupabasePlaceRecord;
      }

      if (!isSeededInMemory) {
        await SupabaseDatabaseRepository.seedCanonicalPlacesToSupabase();
        return memoryPlacesCache.find(p => p.slug === slug || p.id === slug) || null;
      }
      return null;
    } catch {
      return memoryPlacesCache.find(p => p.slug === slug || p.id === slug) || null;
    }
  }

  /**
   * Create new place record directly in Supabase Primary Database Memory
   */
  static async createPlace(placeInput: any): Promise<SupabasePlaceRecord | null> {
    try {
      const name = placeInput.name || "New Explorer Spot";
      const slug = placeInput.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const district = placeInput.district || "General";
      const category = (placeInput.category || "heritage").toLowerCase();

      const placeRecord: SupabasePlaceRecord = {
        id: placeInput.id || `plc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name,
        canonical_name: placeInput.canonical_name || name,
        slug,
        district,
        state: placeInput.state || "Tamil Nadu",
        category,
        primary_category: placeInput.primary_category || category,
        latitude: Number(placeInput.latitude || placeInput.coordinates?.latitude || placeInput.lat) || 10.5,
        longitude: Number(placeInput.longitude || placeInput.coordinates?.longitude || placeInput.lng) || 78.5,
        tagline: placeInput.tagline || `Verified destination in ${district}`,
        description: placeInput.description || `Explore ${name} located in ${district}, Tamil Nadu.`,
        image_url: placeInput.image_url || placeInput.heroImage || placeInput.image || "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
        rating: Number(placeInput.rating) || 5.0,
        review_count: Number(placeInput.review_count) || 1,
        is_verified: true,
        visibility: "public",
        status: "published",
        tags: Array.isArray(placeInput.tags) ? placeInput.tags : [category, district.toLowerCase(), "featured", "verified"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 1. Add to local memory cache immediately so UI gets instant reflection
      memoryPlacesCache = [placeRecord, ...memoryPlacesCache.filter(p => p.slug !== slug)];

      // 2. Persist to Supabase Database table
      const { data, error } = await supabase.from('places').upsert([placeRecord], { onConflict: 'slug' }).select().single();
      if (error) {
        console.warn("[Supabase DB] Primary insert notice:", error.message);
      } else if (data) {
        memoryPlacesCache = [data as SupabasePlaceRecord, ...memoryPlacesCache.filter(p => p.slug !== slug)];
        return data as SupabasePlaceRecord;
      }

      return placeRecord;
    } catch (err) {
      console.error("[Supabase DB] Exception in createPlace:", err);
      return null;
    }
  }

  /**
   * Fetch district-wise categorized collection table from Supabase / Memory
   * Categorizes places into Tourist Spots, Food, Temples, Hills, Falls, and Beaches
   */
  static async getDistrictCollectionTable(districtSlug: string): Promise<{
    districtName: string;
    districtSlug: string;
    totalCount: number;
    categories: {
      touristSpots: SupabasePlaceRecord[];
      foodSpots: SupabasePlaceRecord[];
      temples: SupabasePlaceRecord[];
      hills: SupabasePlaceRecord[];
      falls: SupabasePlaceRecord[];
      beaches: SupabasePlaceRecord[];
    };
  }> {
    const places = await SupabaseDatabaseRepository.getPublicPlaces({ district: districtSlug });

    const categories = {
      touristSpots: [] as SupabasePlaceRecord[],
      foodSpots: [] as SupabasePlaceRecord[],
      temples: [] as SupabasePlaceRecord[],
      hills: [] as SupabasePlaceRecord[],
      falls: [] as SupabasePlaceRecord[],
      beaches: [] as SupabasePlaceRecord[],
    };

    places.forEach((p) => {
      const cat = (p.category || '').toLowerCase();
      const prim = (p.primary_category || '').toLowerCase();
      const tags = (p.tags || []).map((t: string) => String(t).toLowerCase());
      const allTokens = [cat, prim, ...tags].join(' ');

      if (allTokens.includes('beach') || allTokens.includes('coast')) {
        categories.beaches.push(p);
      } else if (allTokens.includes('waterfall') || allTokens.includes('falls') || allTokens.includes('cascade')) {
        categories.falls.push(p);
      } else if (allTokens.includes('hill') || allTokens.includes('mountain') || allTokens.includes('peak') || allTokens.includes('valley') || allTokens.includes('ghat')) {
        categories.hills.push(p);
      } else if (allTokens.includes('temple') || allTokens.includes('shrine') || allTokens.includes('spiritual')) {
        categories.temples.push(p);
      } else if (allTokens.includes('food') || allTokens.includes('culinary') || allTokens.includes('mess') || allTokens.includes('sweet') || allTokens.includes('parotta') || allTokens.includes('biryani')) {
        categories.foodSpots.push(p);
      } else {
        categories.touristSpots.push(p);
      }
    });

    return {
      districtName: places[0]?.district || districtSlug,
      districtSlug,
      totalCount: places.length,
      categories,
    };
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

  // --- USER QUERIES HELP DESK (SUPABASE PRIMARY MEMORY) ---
  static async getUserQueries(): Promise<any[]> {
    try {
      const { data, error } = await supabase.from('user_queries').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(q => ({
          id: q.id,
          userName: q.user_name || "Explorer",
          userEmail: q.user_email || "user@exploretn.com",
          queryType: q.query_type || "General Travel",
          locationContext: q.location_context || "Tamil Nadu",
          subject: q.subject || "Travel Inquiry",
          message: q.message || "",
          status: q.status || "Open",
          submittedAt: new Date(q.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          aiSuggestedAnswer: q.ai_suggested_answer,
          adminReply: q.admin_reply,
          resolvedBy: q.resolved_by
        }));
      }
    } catch (e) {
      console.warn("[Supabase DB] Query fetch notice:", e);
    }
    // Fallback to localStorage for instant local persistency
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("etn_user_queries");
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
    }
    return [];
  }

  static async createUserQuery(query: { userName: string; userEmail: string; queryType: string; locationContext: string; subject: string; message: string; aiSuggestedAnswer?: string }): Promise<any> {
    const record = {
      id: `q-${Date.now()}`,
      user_name: query.userName,
      user_email: query.userEmail,
      query_type: query.queryType,
      location_context: query.locationContext,
      subject: query.subject,
      message: query.message,
      status: "Open",
      ai_suggested_answer: query.aiSuggestedAnswer || `Verified location details for ${query.locationContext}. Support team will assist shortly.`,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('user_queries').insert([record]);
    } catch (e) {
      console.warn("[Supabase DB] Error inserting user query:", e);
    }

    const newItem = {
      id: record.id,
      userName: record.user_name,
      userEmail: record.user_email,
      queryType: record.query_type,
      locationContext: record.location_context,
      subject: record.subject,
      message: record.message,
      status: "Open",
      submittedAt: "Just now",
      aiSuggestedAnswer: record.ai_suggested_answer
    };

    if (typeof window !== "undefined") {
      const existing = await this.getUserQueries();
      const updated = [newItem, ...existing];
      localStorage.setItem("etn_user_queries", JSON.stringify(updated));
    }
    return newItem;
  }

  static async resolveUserQuery(queryId: string, replyText: string, resolvedBy: string = "Admin"): Promise<boolean> {
    try {
      await supabase.from('user_queries').update({
        status: "Resolved",
        admin_reply: replyText,
        resolved_by: resolvedBy
      }).eq('id', queryId);
    } catch (e) {
      console.warn("[Supabase DB] Resolve query notice:", e);
    }

    if (typeof window !== "undefined") {
      const existing = await this.getUserQueries();
      const updated = existing.map(q => q.id === queryId ? { ...q, status: "Resolved", adminReply: replyText, resolvedBy } : q);
      localStorage.setItem("etn_user_queries", JSON.stringify(updated));
    }
    return true;
  }

  // --- PLACE SUGGESTIONS STUDIO (SUPABASE PRIMARY MEMORY) ---
  static async getPlaceSuggestions(): Promise<any[]> {
    try {
      const { data, error } = await supabase.from('place_suggestions').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(s => ({
          id: s.id,
          name: s.name,
          district: s.district,
          category: s.category || "hills",
          submittedBy: s.submitted_by || "Community Scout",
          scoutBadge: s.scout_badge || "Verified Scout",
          latitude: s.latitude,
          longitude: s.longitude,
          tagline: s.tagline || "",
          description: s.description || "",
          image: s.image_url || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
          submittedAt: new Date(s.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: s.status || "Pending"
        }));
      }
    } catch (e) {
      console.warn("[Supabase DB] Place suggestions fetch notice:", e);
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("etn_place_suggestions");
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
    }
    return [];
  }

  static async createPlaceSuggestion(sug: { name: string; district: string; category: string; submittedBy: string; latitude: number; longitude: number; tagline: string; description: string; image?: string }): Promise<any> {
    const record = {
      id: `sug-${Date.now()}`,
      name: sug.name,
      district: sug.district,
      category: sug.category,
      submitted_by: sug.submittedBy,
      scout_badge: "District Scout",
      latitude: sug.latitude,
      longitude: sug.longitude,
      tagline: sug.tagline,
      description: sug.description,
      image_url: sug.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
      status: "Pending",
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('place_suggestions').insert([record]);
    } catch (e) {
      console.warn("[Supabase DB] Error creating place suggestion:", e);
    }

    const newItem = {
      id: record.id,
      name: record.name,
      district: record.district,
      category: record.category,
      submittedBy: record.submitted_by,
      scoutBadge: record.scout_badge,
      latitude: record.latitude,
      longitude: record.longitude,
      tagline: record.tagline,
      description: record.description,
      image: record.image_url,
      submittedAt: "Just now",
      status: "Pending"
    };

    if (typeof window !== "undefined") {
      const existing = await this.getPlaceSuggestions();
      const updated = [newItem, ...existing];
      localStorage.setItem("etn_place_suggestions", JSON.stringify(updated));
    }
    return newItem;
  }

  static async updateSuggestionStatus(id: string, status: "Approved" | "Rejected"): Promise<boolean> {
    try {
      await supabase.from('place_suggestions').update({ status }).eq('id', id);
    } catch (e) {
      console.warn("[Supabase DB] Error updating suggestion status:", e);
    }

    if (typeof window !== "undefined") {
      const existing = await this.getPlaceSuggestions();
      const updated = existing.map(s => s.id === id ? { ...s, status } : s);
      localStorage.setItem("etn_place_suggestions", JSON.stringify(updated));
    }
    return true;
  }
}



