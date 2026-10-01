/**
 * Trip Store — localStorage-based persistent trip management.
 * Stores trip stops, origin, destination and basic metadata.
 */

export interface TripStop {
  id: string;
  name: string;
  canonicalName?: string;
  latitude: number;
  longitude: number;
  district?: string;
  category?: string;
  addedAt: string;
}

export interface ActiveTrip {
  id: string;
  originName: string;
  originLat: number;
  originLng: number;
  destinationName: string;
  destinationLat: number;
  destinationLng: number;
  stops: TripStop[];
  travelMode: "driving" | "motorcycle" | "walking" | "cycling";
  travelDate?: string;
  departureTime?: string;
  status: "planning" | "active" | "completed";
  createdAt: string;
  updatedAt: string;
}

const TRIP_KEY = "etn_active_trip";

export function getActiveTrip(): ActiveTrip | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TRIP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveTrip(trip: ActiveTrip): void {
  if (typeof window === "undefined") return;
  try {
    trip.updatedAt = new Date().toISOString();
    localStorage.setItem(TRIP_KEY, JSON.stringify(trip));
    window.dispatchEvent(new CustomEvent("etn_trip_updated", { detail: trip }));
  } catch {
    // ignore storage errors
  }
}

export function clearActiveTrip(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TRIP_KEY);
  window.dispatchEvent(new CustomEvent("etn_trip_updated", { detail: null }));
}

export function addStopToTrip(stop: TripStop): ActiveTrip | null {
  const trip = getActiveTrip();
  if (!trip) return null;
  if (trip.stops.some((s) => s.id === stop.id)) return trip; // dedupe
  trip.stops.push(stop);
  saveActiveTrip(trip);
  return trip;
}

export function removeStopFromTrip(stopId: string): ActiveTrip | null {
  const trip = getActiveTrip();
  if (!trip) return null;
  trip.stops = trip.stops.filter((s) => s.id !== stopId);
  saveActiveTrip(trip);
  return trip;
}

export function createNewTrip(params: {
  originName: string;
  originLat: number;
  originLng: number;
  destinationName: string;
  destinationLat: number;
  destinationLng: number;
  travelMode?: ActiveTrip["travelMode"];
  travelDate?: string;
  departureTime?: string;
}): ActiveTrip {
  const trip: ActiveTrip = {
    id: `trip-${Date.now()}`,
    originName: params.originName,
    originLat: params.originLat,
    originLng: params.originLng,
    destinationName: params.destinationName,
    destinationLat: params.destinationLat,
    destinationLng: params.destinationLng,
    stops: [],
    travelMode: params.travelMode || "driving",
    travelDate: params.travelDate,
    departureTime: params.departureTime,
    status: "planning",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveActiveTrip(trip);
  return trip;
}

/** Estimate fuel cost (INR) based on distance and vehicle */
export function estimateFuelCost(
  distanceKm: number,
  vehicleType: "car" | "bike" | "bus" = "car"
): number {
  const fuelPricePerLitre = 104; // avg Tamil Nadu petrol price
  const efficiency: Record<string, number> = { car: 14, bike: 40, bus: 6 };
  const kmpl = efficiency[vehicleType] || 14;
  return Math.round((distanceKm / kmpl) * fuelPricePerLitre);
}

/** Format duration in minutes to "X h Y min" */
export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
