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
 */
export function getPlacesWithinRadius(
  lat: number,
  lng: number,
  radiusKm: number,
  category?: PlaceCategory,
  excludeIds: string[] = []
): NearbyPlace[] {
  return CANONICAL_PLACES.filter((p) => {
    if (excludeIds.includes(p.id)) return false;
    if (category && category !== "all" && p.primaryCategory !== category && !p.categories?.includes(category)) return false;
    const d = haversineKm(lat, lng, p.latitude, p.longitude);
    return d > 0.5 && d <= radiusKm; // exclude origin itself (< 0.5km)
  })
    .map((p) => {
      const distanceKm = Math.round(haversineKm(lat, lng, p.latitude, p.longitude) * 10) / 10;
      const estimatedRoadKm = Math.round(distanceKm * 1.28 * 10) / 10; // road factor
      const estimatedDriveMins = Math.round((estimatedRoadKm / 40) * 60); // avg 40km/h
      return { ...p, distanceKm, estimatedRoadKm, estimatedDriveMins };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
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
  return CANONICAL_PLACES.filter((p) => {
    if (excludeIds.includes(p.id)) return false;
    if (category && category !== "all" && p.primaryCategory !== category && !p.categories?.includes(category)) return false;
    const d = haversineKm(lat, lng, p.latitude, p.longitude);
    return d > minKm && d <= maxKm;
  })
    .map((p) => {
      const distanceKm = Math.round(haversineKm(lat, lng, p.latitude, p.longitude) * 10) / 10;
      const estimatedRoadKm = Math.round(distanceKm * 1.28 * 10) / 10;
      const estimatedDriveMins = Math.round((estimatedRoadKm / 40) * 60);
      return { ...p, distanceKm, estimatedRoadKm, estimatedDriveMins };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
