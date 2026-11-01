import { CANONICAL_PLACES, ExplorerPlace, PlaceCategory } from "./data/canonical-places";

/** Haversine great-circle distance in km between two lat/lng points */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface NearbyPlace extends ExplorerPlace {
  distanceKm: number;
  estimatedRoadKm: number; // ~1.25x straight-line
  estimatedDriveMins: number;
}

/**
 * Returns all canonical places within `radiusKm` of the given point,
 * sorted by distance ascending. Excludes the origin point itself.
 *
 * Performance optimizations:
 * 1. O(1) exclusion check using Set instead of O(M) array.includes() per place.
 * 2. Fast bounding-box pre-filtering to skip expensive trigonometric haversine
 *    calculations for distant POIs across Tamil Nadu.
 * 3. Single-pass calculation: computes distance once per candidate instead of
 *    evaluating haversine twice across chained filter() and map() calls.
 */
export function getPlacesWithinRadius(
  lat: number,
  lng: number,
  radiusKm: number,
  category?: PlaceCategory,
  excludeIds: string[] | Set<string> = [],
): NearbyPlace[] {
  const excludeSet = excludeIds instanceof Set ? excludeIds : new Set(excludeIds);
  const checkCategory = Boolean(category && category !== "all");

  // Approximate coordinate bounding box for initial fast pruning
  // 1 deg latitude ≈ 110.574 km; 1 deg longitude ≈ 111.320 * cos(lat) km
  const latDelta = radiusKm / 110.574;
  const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLng = lng - lngDelta;
  const maxLng = lng + lngDelta;

  const results: NearbyPlace[] = [];

  for (let i = 0; i < CANONICAL_PLACES.length; i++) {
    const p = CANONICAL_PLACES[i];
    if (excludeSet.has(p.id)) continue;
    if (checkCategory && p.primaryCategory !== category && !p.categories?.includes(category!)) {
      continue;
    }

    // Fast bounding-box prune before trigonometry
    if (
      p.latitude < minLat ||
      p.latitude > maxLat ||
      p.longitude < minLng ||
      p.longitude > maxLng
    ) {
      continue;
    }

    const d = haversineKm(lat, lng, p.latitude, p.longitude);
    if (d > 0.5 && d <= radiusKm) {
      // Exclude origin itself (< 0.5km)
      const distanceKm = Math.round(d * 10) / 10;
      const estimatedRoadKm = Math.round(distanceKm * 1.28 * 10) / 10; // road factor
      const estimatedDriveMins = Math.round((estimatedRoadKm / 40) * 60); // avg 40km/h
      results.push({ ...p, distanceKm, estimatedRoadKm, estimatedDriveMins });
    }
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Get places in a specific distance band (minKm..maxKm)
 *
 * Performance optimizations:
 * 1. O(1) exclusion check using Set.
 * 2. Fast bounding-box pre-filtering against outer maxKm bound.
 * 3. Single-pass calculation: computes haversine distance exactly once per candidate.
 */
export function getPlacesInBand(
  lat: number,
  lng: number,
  minKm: number,
  maxKm: number,
  category?: PlaceCategory,
  excludeIds: string[] | Set<string> = [],
): NearbyPlace[] {
  const excludeSet = excludeIds instanceof Set ? excludeIds : new Set(excludeIds);
  const checkCategory = Boolean(category && category !== "all");

  const latDelta = maxKm / 110.574;
  const lngDelta = maxKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLng = lng - lngDelta;
  const maxLng = lng + lngDelta;

  const results: NearbyPlace[] = [];

  for (let i = 0; i < CANONICAL_PLACES.length; i++) {
    const p = CANONICAL_PLACES[i];
    if (excludeSet.has(p.id)) continue;
    if (checkCategory && p.primaryCategory !== category && !p.categories?.includes(category!)) {
      continue;
    }

    // Fast bounding-box prune before trigonometry
    if (
      p.latitude < minLat ||
      p.latitude > maxLat ||
      p.longitude < minLng ||
      p.longitude > maxLng
    ) {
      continue;
    }

    const d = haversineKm(lat, lng, p.latitude, p.longitude);
    if (d > minKm && d <= maxKm) {
      const distanceKm = Math.round(d * 10) / 10;
      const estimatedRoadKm = Math.round(distanceKm * 1.28 * 10) / 10;
      const estimatedDriveMins = Math.round((estimatedRoadKm / 40) * 60);
      results.push({ ...p, distanceKm, estimatedRoadKm, estimatedDriveMins });
    }
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}
