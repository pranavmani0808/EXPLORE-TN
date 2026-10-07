export interface UserLocation {
  city: string;
  coords?: { lat: number; lng: number };
  enabled: boolean;
}

export const DEFAULT_USER_LOCATION: UserLocation = {
  city: "Chennai, Tamil Nadu",
  coords: { lat: 13.0827, lng: 80.2707 },
  enabled: true,
};

import { getCurrentAuthUser } from "./auth-rbac";

function getLocationStorageKey(): string {
  if (typeof window === "undefined") return "etn_user_current_location_guest";
  try {
    const user = getCurrentAuthUser();
    if (user && user.id) {
      return `etn_user_current_location_${user.id}`;
    }
  } catch {}
  return "etn_user_current_location_guest";
}

export function getStoredUserLocation(): UserLocation {
  if (typeof window === "undefined") return DEFAULT_USER_LOCATION;
  try {
    const key = getLocationStorageKey();
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_USER_LOCATION, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_USER_LOCATION;
}

/**
 * Returns the user's configured hometown from their explorer profile/settings.
 * Prioritizes:
 * 1. Stored user preferences homeLocation (from /settings or onboarding modal)
 * 2. Authenticated user profile city
 * 3. Stored GPS detected user location city (if not the generic fallback)
 */
export function getUserHomeLocation(): { name: string; isConfigured: boolean } {
  if (typeof window === "undefined") return { name: "Madurai", isConfigured: false };
  try {
    const user = getCurrentAuthUser();
    // 1. Check user preferences storage key
    const prefKey = user && user.id ? `etn_user_preferences_${user.id}` : "etn_user_preferences_guest";
    const rawPref = localStorage.getItem(prefKey);
    if (rawPref) {
      const parsed = JSON.parse(rawPref);
      if (parsed.homeLocation && typeof parsed.homeLocation === "string" && parsed.homeLocation.trim()) {
        return { name: parsed.homeLocation.trim(), isConfigured: true };
      }
    }

    // 2. Check auth user city if present
    if (user && (user as any).city && typeof (user as any).city === "string" && (user as any).city.trim()) {
      return { name: (user as any).city.trim(), isConfigured: true };
    }

    // 3. Check general guest preferences if user preferences had no homeLocation
    const guestPref = localStorage.getItem("etn_user_preferences_guest");
    if (guestPref) {
      const parsed = JSON.parse(guestPref);
      if (parsed.homeLocation && typeof parsed.homeLocation === "string" && parsed.homeLocation.trim()) {
        return { name: parsed.homeLocation.trim(), isConfigured: true };
      }
    }

    // 4. Check stored GPS user location
    const storedLoc = getStoredUserLocation();
    if (storedLoc && storedLoc.city && storedLoc.city !== "Chennai, Tamil Nadu" && storedLoc.city !== "Detected Live Location") {
      const cleanCity = storedLoc.city.split(",")[0].trim();
      if (cleanCity) return { name: cleanCity, isConfigured: true };
    }
  } catch (err) {
    console.warn("[getUserHomeLocation] Error resolving hometown:", err);
  }

  return { name: "Madurai", isConfigured: false };
}

export function saveStoredUserLocation(loc: Partial<UserLocation>) {
  if (typeof window === "undefined") return;
  const key = getLocationStorageKey();
  const current = getStoredUserLocation();
  const updated = { ...current, ...loc };
  localStorage.setItem(key, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("etn_location_updated", { detail: updated }));
}

export async function detectBrowserGPSLocation(): Promise<{ city: string; coords: { lat: number; lng: number } }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        // Reverse Geocoding fallback or city match
        let city = "Detected Live Location";
        // Approx city bounding
        if (Math.abs(coords.lat - 13.08) < 0.3 && Math.abs(coords.lng - 80.27) < 0.3) {
          city = "Chennai, Tamil Nadu";
        } else if (Math.abs(coords.lat - 9.92) < 0.3 && Math.abs(coords.lng - 78.11) < 0.3) {
          city = "Madurai, Tamil Nadu";
        } else if (Math.abs(coords.lat - 11.01) < 0.3 && Math.abs(coords.lng - 76.95) < 0.3) {
          city = "Coimbatore, Tamil Nadu";
        } else if (Math.abs(coords.lat - 11.41) < 0.3 && Math.abs(coords.lng - 76.70) < 0.3) {
          city = "Ooty, The Nilgiris";
        } else {
          city = `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E`;
        }

        saveStoredUserLocation({ city, coords, enabled: true });
        resolve({ city, coords });
      },
      (err) => {
        reject(err);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}
