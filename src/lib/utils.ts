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
