import { SupabaseDatabaseRepository, SupabaseSavedTripRecord } from "./supabase-database";

export interface SavedTripPlan {
  id: string;
  userId?: string;
  title: string;
  summary?: string;
  origin: string;
  destination: string;
  days: number;
  stops: any[];
  totalDistanceKm: number;
  totalDurationMins: number;
  routePolylinePoints?: Array<[number, number]>;
  savedAt: string;
}

const GUEST_DRAFT_KEY = "explore_tn_guest_ai_plan";
const USER_SAVED_TRIPS_KEY = "explore_tn_user_saved_trips";
const GUEST_COOKIE_KEY = "explore_tn_guest_session";

/**
 * Helper to set browser cookie with 30-day expiration
 */
export function setGuestCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Helper to read browser cookie
 */
export function getGuestCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (let c of cookies) {
    const [k, v] = c.trim().split("=");
    if (k === name && v) {
      return decodeURIComponent(v);
    }
  }
  return null;
}

/**
 * Persists current guest AI trip plan in Supabase Primary Memory, localStorage AND browser cookies
 */
export function saveGuestTripDraft(plan: any) {
  if (typeof window === "undefined" || !plan) return;
  try {
    const draftData: SavedTripPlan = {
      id: plan.id || `trip-${Date.now()}`,
      title: plan.title || `${plan.origin?.name || 'Madurai'} to ${plan.destination?.name || 'Kanyakumari'} AI Road Trip`,
      summary: plan.summary || "",
      origin: plan.origin?.name || plan.origin || "Madurai",
      destination: plan.destination?.name || plan.destination || "Kanyakumari",
      days: plan.raw_intent?.days || plan.days || 2,
      stops: plan.ordered_stops || plan.stops || [],
      totalDistanceKm: plan.total_distance_km || 0,
      totalDurationMins: plan.total_driving_time_mins || 0,
      routePolylinePoints: plan.route_polyline_points || [],
      savedAt: new Date().toISOString(),
    };

    const jsonStr = JSON.stringify(draftData);
    localStorage.setItem(GUEST_DRAFT_KEY, jsonStr);

    // Save lightweight session cookie for browser persistence across tabs/sessions
    const cookiePayload = JSON.stringify({
      id: draftData.id,
      origin: draftData.origin,
      destination: draftData.destination,
      days: draftData.days,
      savedAt: draftData.savedAt
    });
    setGuestCookie(GUEST_COOKIE_KEY, cookiePayload, 30);

    // Primary database record sync to Supabase
    const dbRecord: SupabaseSavedTripRecord = {
      id: draftData.id,
      user_id: "guest",
      title: draftData.title,
      summary: draftData.summary,
      origin: draftData.origin,
      destination: draftData.destination,
      days: draftData.days,
      stops: draftData.stops,
      total_distance_km: draftData.totalDistanceKm,
      total_duration_mins: draftData.totalDurationMins,
      route_polyline_points: draftData.routePolylinePoints,
      saved_at: draftData.savedAt,
    };
    SupabaseDatabaseRepository.saveTripRecord(dbRecord);
  } catch (e) {
    console.error("Failed to save guest trip draft:", e);
  }
}

/**
 * Retrieves guest AI trip draft from localStorage with browser Cookie fallback
 */
export function getGuestTripDraft(): SavedTripPlan | null {
  if (typeof window === "undefined") return null;
  try {
    // 1. Primary read from localStorage
    const data = localStorage.getItem(GUEST_DRAFT_KEY);
    if (data) return JSON.parse(data);

    // 2. Cookie fallback if localStorage was cleared
    const cookieData = getGuestCookie(GUEST_COOKIE_KEY);
    if (cookieData) {
      const parsed = JSON.parse(cookieData);
      return {
        id: parsed.id || `trip-${Date.now()}`,
        title: `${parsed.origin || 'Madurai'} to ${parsed.destination || 'Kanyakumari'} AI Road Trip`,
        summary: "Recovered from guest browser cookie session",
        origin: parsed.origin || "Madurai",
        destination: parsed.destination || "Kanyakumari",
        days: parsed.days || 2,
        stops: [],
        totalDistanceKm: 0,
        totalDurationMins: 0,
        savedAt: parsed.savedAt || new Date().toISOString(),
      };
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Saves a trip directly into user's account saved trips in Supabase Primary Database Memory
 */
export function saveTripToUserAccount(plan: any, userId: string): SavedTripPlan {
  const existingTrips = getUserSavedTrips(userId);
  const tripId = plan.id || `trip-${Date.now()}`;

  const savedItem: SavedTripPlan = {
    id: tripId,
    userId,
    title: plan.title || `${plan.origin?.name || 'Madurai'} to ${plan.destination?.name || 'Kanyakumari'} AI Road Trip`,
    summary: plan.summary || "",
    origin: plan.origin?.name || plan.origin || "Madurai",
    destination: plan.destination?.name || plan.destination || "Kanyakumari",
    days: plan.raw_intent?.days || plan.days || 2,
    stops: plan.ordered_stops || plan.stops || [],
    totalDistanceKm: plan.total_distance_km || 0,
    totalDurationMins: plan.total_driving_time_mins || 0,
    routePolylinePoints: plan.route_polyline_points || [],
    savedAt: new Date().toISOString(),
  };

  const updatedTrips = [savedItem, ...existingTrips.filter((t) => t.id !== tripId)];
  if (typeof window !== "undefined") {
    localStorage.setItem(`${USER_SAVED_TRIPS_KEY}_${userId}`, JSON.stringify(updatedTrips));
    // Clear guest draft once saved to user account
    localStorage.removeItem(GUEST_DRAFT_KEY);
  }

  // Write directly to Supabase Primary Database Memory
  const dbRecord: SupabaseSavedTripRecord = {
    id: savedItem.id,
    user_id: userId,
    title: savedItem.title,
    summary: savedItem.summary,
    origin: savedItem.origin,
    destination: savedItem.destination,
    days: savedItem.days,
    stops: savedItem.stops,
    total_distance_km: savedItem.totalDistanceKm,
    total_duration_mins: savedItem.totalDurationMins,
    route_polyline_points: savedItem.routePolylinePoints,
    saved_at: savedItem.savedAt,
  };
  SupabaseDatabaseRepository.saveTripRecord(dbRecord);

  return savedItem;
}

/**
 * Automatically syncs guest trip draft to user account upon authentication
 */
export function syncGuestDraftToUserAccount(userId: string): SavedTripPlan | null {
  const draft = getGuestTripDraft();
  if (!draft) return null;

  return saveTripToUserAccount(draft, userId);
}

/**
 * Returns saved trips list for a given user ID from Supabase Primary Database Memory
 */
export function getUserSavedTrips(userId: string): SavedTripPlan[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const data = localStorage.getItem(`${USER_SAVED_TRIPS_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

