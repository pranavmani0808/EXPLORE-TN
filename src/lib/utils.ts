import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Computes or formats distance/travel time from Chennai (13.0827°N, 80.2707°E).
 * Returns formatted string like "~460 km · 8 hrs" or null if invalid / unavailable.
 * Never returns "Variable".
 */
export function getDistanceFromChennai(
  latitude?: number,
  longitude?: number,
  explicitDistance?: string
): string | null {
  if (
    explicitDistance &&
    explicitDistance.toLowerCase() !== "variable" &&
    explicitDistance.trim() !== ""
  ) {
    return explicitDistance;
  }
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    isNaN(latitude) ||
    isNaN(longitude) ||
    (latitude === 0 && longitude === 0)
  ) {
    return null;
  }

  // Chennai Coordinates
  const CHENNAI_LAT = 13.0827;
  const CHENNAI_LNG = 80.2707;

  const R = 6371; // Earth radius in km
  const dLat = ((latitude - CHENNAI_LAT) * Math.PI) / 180;
  const dLng = ((longitude - CHENNAI_LNG) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((CHENNAI_LAT * Math.PI) / 180) *
      Math.cos((latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;

  if (straightKm < 5) return "~5 km · 15 mins";

  // Road distance multiplier (~1.25x haversine distance in TN)
  const roadKm = Math.round(straightKm * 1.25);
  // Average speed ~50 km/h
  const totalHours = roadKm / 50;
  const hoursInt = Math.floor(totalHours);
  const mins = Math.round((totalHours - hoursInt) * 60);

  let timeStr = "";
  if (hoursInt > 0) {
    timeStr = `${hoursInt} hr${hoursInt > 1 ? "s" : ""}`;
    if (mins > 0) timeStr += ` ${mins}m`;
  } else {
    timeStr = `${mins} mins`;
  }

  return `~${roadKm} km · ${timeStr}`;
}

/**
 * Calculates road distance (km) and travel duration between any two WGS84 coordinates.
 */
export function getDistanceBetweenCoordinates(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): { distanceKm: number; durationMins: number; distanceStr: string; durationStr: string } {
  if (
    typeof lat1 !== "number" ||
    typeof lng1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lng2 !== "number" ||
    isNaN(lat1) ||
    isNaN(lng1) ||
    isNaN(lat2) ||
    isNaN(lng2)
  ) {
    return { distanceKm: 0, durationMins: 0, distanceStr: "0 km", durationStr: "0 min" };
  }

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;

  if (straightKm < 0.2) {
    return { distanceKm: 0.2, durationMins: 3, distanceStr: "0.2 km", durationStr: "3 min" };
  }

  // ~1.28x road curvature factor for Tamil Nadu terrain (ghats/highways)
  const roadKm = Math.round(straightKm * 1.28 * 10) / 10;
  // ~45 km/h average speed including traffic & ghat bends
  const totalMins = Math.max(3, Math.round((roadKm / 45) * 60));

  const hoursInt = Math.floor(totalMins / 60);
  const minsRemaining = totalMins % 60;
  const durationStr =
    hoursInt > 0
      ? `${hoursInt}h ${minsRemaining > 0 ? `${minsRemaining}m` : ""}`
      : `${totalMins} min`;

  return {
    distanceKm: roadKm,
    durationMins: totalMins,
    distanceStr: `${roadKm} km`,
    durationStr,
  };
}

/**
 * Nearest-neighbor TSP solver to produce an optimized visiting sequence for 3+ stops.
 * Keeps the starting origin fixed at index 0.
 */
export function optimizeRouteOrder<T extends { latitude: number; longitude: number }>(stops: T[]): T[] {
  if (stops.length <= 2) return [...stops];

  const unvisited = [...stops.slice(1)];
  const result: T[] = [stops[0]];

  while (unvisited.length > 0) {
    const last = result[result.length - 1];
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const cand = unvisited[i];
      const dist = getDistanceBetweenCoordinates(
        last.latitude,
        last.longitude,
        cand.latitude,
        cand.longitude
      ).distanceKm;

      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    result.push(unvisited.splice(nearestIdx, 1)[0]);
  }

  return result;
}

