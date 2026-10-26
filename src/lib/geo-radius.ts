import { CANONICAL_PLACES, ExplorerPlace, PlaceCategory } from "./data/canonical-places";

/** Haversine great-circle distance in km between two lat/lng points */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface NearbyPlace extends ExplorerPlace {
  distanceKm: number;
  estimatedRoadKm: number;  // ~1.25x straight-line
  estimatedDriveMins: number;
}

/**
 * Returns all canonical places within `radiusKm` of the given point,
 * sorted by distance ascending. Excludes the origin point itself.
 *
 * Performance optimization:
 * 1. Convert excludeIds to a Set for O(1) lookup instead of O(M) array search.
 * 2. Calculate haversine distance ONCE per place in a single pass (eliminates
 *    ~50% of trigonometric operations vs double-eval in filter and map).
 */
export function getPlacesWithinRadius(
  lat: number,
  lng: number,
  radiusKm: number,
  category?: PlaceCategory,
  excludeIds: string[] = []
): NearbyPlace[] {
  const excludeSet = excludeIds.length > 0 ? new Set(excludeIds) : null;
  const result: NearbyPlace[] = [];

  for (let i = 0; i < CANONICAL_PLACES.length; i++) {
    const p = CANONICAL_PLACES[i];
    if (excludeSet?.has(p.id)) continue;
    if (category && category !== "all" && p.primaryCategory !== category && !p.categories?.includes(category)) continue;

    const d = haversineKm(lat, lng, p.latitude, p.longitude);
    if (d > 0.5 && d <= radiusKm) {
      const distanceKm = Math.round(d * 10) / 10;
      const estimatedRoadKm = Math.round(distanceKm * 1.28 * 10) / 10; // road factor
      const estimatedDriveMins = Math.round((estimatedRoadKm / 40) * 60); // avg 40km/h
      result.push({ ...p, distanceKm, estimatedRoadKm, estimatedDriveMins });
    }
  }

  return result.sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Get places in a specific distance band (minKm..maxKm) */
export function getPlacesInBand(
  lat: number,
  lng: number,
  minKm: number,
  maxKm: number,
  category?: PlaceCategory,
  excludeIds: string[] = []
): NearbyPlace[] {
  const excludeSet = excludeIds.length > 0 ? new Set(excludeIds) : null;
  const result: NearbyPlace[] = [];

  for (let i = 0; i < CANONICAL_PLACES.length; i++) {
    const p = CANONICAL_PLACES[i];
    if (excludeSet?.has(p.id)) continue;
    if (category && category !== "all" && p.primaryCategory !== category && !p.categories?.includes(category)) continue;

    const d = haversineKm(lat, lng, p.latitude, p.longitude);
    if (d > minKm && d <= maxKm) {
      const distanceKm = Math.round(d * 10) / 10;
      const estimatedRoadKm = Math.round(distanceKm * 1.28 * 10) / 10;
      const estimatedDriveMins = Math.round((estimatedRoadKm / 40) * 60);
      result.push({ ...p, distanceKm, estimatedRoadKm, estimatedDriveMins });
    }
  }

  return result.sort((a, b) => a.distanceKm - b.distanceKm);
}
