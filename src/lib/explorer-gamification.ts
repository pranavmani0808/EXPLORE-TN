export interface SavedPlaceItem {
  id: string;
  name: string;
  category: string;
  district: string;
  imageUrl?: string;
  rating?: number;
  savedAt: string;
}

export interface SavedRouteItem {
  id: string;
  title: string;
  district?: string;
  date: string;
  stops: number;
  status: "Upcoming" | "Completed";
  savedAt: string;
}

export interface ExplorerStats {
  districtsExplored: number;
  hillStations: number;
  waterfalls: number;
  placesVisited: number;
  xpEarned: number;
  level: number;
  rankTitle: string;
}

import { getCurrentAuthUser } from "./auth-rbac";

function getUserStorageKey(baseKey: string): string {
  if (typeof window === "undefined") return baseKey;
  try {
    const user = getCurrentAuthUser();
    if (user && user.id) {
      return `${baseKey}_${user.id}`;
    }
  } catch {
    // fallback
  }
  return `${baseKey}_guest`;
}

export function getSavedPlaces(): SavedPlaceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getUserStorageKey("etn_saved_places");
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePlaceToCollection(item: SavedPlaceItem) {
  if (typeof window === "undefined") return;
  const key = getUserStorageKey("etn_saved_places");
  const current = getSavedPlaces();
  if (current.some((p) => p.id === item.id)) return;
  const updated = [item, ...current];
  localStorage.setItem(key, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("etn_saved_places_updated", { detail: updated }));
}

export function removeSavedPlace(id: string) {
  if (typeof window === "undefined") return;
  const key = getUserStorageKey("etn_saved_places");
  const current = getSavedPlaces();
  const updated = current.filter((p) => p.id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("etn_saved_places_updated", { detail: updated }));
}

export function getSavedRoutes(): SavedRouteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getUserStorageKey("etn_saved_routes");
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRouteToCollection(route: SavedRouteItem) {
  if (typeof window === "undefined") return;
  const key = getUserStorageKey("etn_saved_routes");
  const current = getSavedRoutes();
  if (current.some((r) => r.id === route.id)) return;
  const updated = [route, ...current];
  localStorage.setItem(key, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("etn_saved_routes_updated", { detail: updated }));
}

export function removeSavedRoute(id: string) {
  if (typeof window === "undefined") return;
  const key = getUserStorageKey("etn_saved_routes");
  const current = getSavedRoutes();
  const updated = current.filter((r) => r.id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("etn_saved_routes_updated", { detail: updated }));
}

export function getExplorerGamificationStats(): ExplorerStats {
  const savedPlaces = getSavedPlaces();
  const savedRoutes = getSavedRoutes();

  const placesVisited = savedPlaces.length;
  
  const districtsSet = new Set<string>();
  savedPlaces.forEach((p) => {
    if (p.district) districtsSet.add(p.district.trim().toLowerCase());
  });
  savedRoutes.forEach((r) => {
    if (r.district) districtsSet.add(r.district.trim().toLowerCase());
  });
  const districtsExplored = districtsSet.size;

  const hillStations = savedPlaces.filter(
    (p) =>
      p.category?.toLowerCase().includes("hill") ||
      p.category?.toLowerCase().includes("ghat") ||
      p.category?.toLowerCase().includes("mountain")
  ).length;

  const waterfalls = savedPlaces.filter(
    (p) =>
      p.category?.toLowerCase().includes("waterfall") ||
      p.category?.toLowerCase().includes("falls")
  ).length;

  const xpEarned = districtsExplored * 100 + placesVisited * 50 + savedRoutes.length * 75;
  const level = Math.floor(xpEarned / 100) + 1;

  let rankTitle = "Novice Explorer";
  if (level >= 10) rankTitle = "Master Explorer";
  else if (level >= 5) rankTitle = "Ghat Conqueror";
  else if (level >= 3) rankTitle = "District Scout";
  else if (level >= 2) rankTitle = "Trail Pathfinder";

  return {
    districtsExplored,
    hillStations,
    waterfalls,
    placesVisited,
    xpEarned,
    level,
    rankTitle,
  };
}
