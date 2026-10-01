export type ArrivalState =
  | "not_started"
  | "trip_active"
  | "approaching"
  | "arrival_pending"
  | "arrived"
  | "exploring"
  | "departed"
  | "paused"
  | "completed";

export interface DestinationGeofence {
  destinationId: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  district: string;
  category: string;
}

export interface ArrivalEvent {
  id: string;
  tripId: string;
  destinationId: string;
  destinationName: string;
  timestamp: string;
  confirmationMethod: "geofence_dwell" | "manual_user_confirm" | "proximity_trigger";
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface TripTrackingContext {
  tripId: string;
  activeDestinationId?: string;
  currentState: ArrivalState;
  trackingEnabled: boolean;
  isPaused: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
    lastUpdated: string;
  };
  confirmedArrivals: Record<string, ArrivalEvent>;
  dwellStartTime?: number;
}

const VALID_TRANSITIONS: Record<ArrivalState, ArrivalState[]> = {
  not_started: ["trip_active", "paused"],
  trip_active: ["approaching", "arrival_pending", "arrived", "paused", "completed"],
  approaching: ["arrival_pending", "arrived", "trip_active", "paused"],
  arrival_pending: ["arrived", "approaching", "trip_active", "paused"],
  arrived: ["exploring", "departed", "paused"],
  exploring: ["departed", "approaching", "paused", "completed"],
  departed: ["approaching", "trip_active", "paused", "completed"],
  paused: ["trip_active", "approaching", "arrived", "exploring"],
  completed: ["trip_active", "not_started"],
};

export function canTransitionArrivalState(from: ArrivalState, to: ArrivalState): boolean {
  if (from === to) return true;
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function computeGeofenceRadius(category: string, placeType?: string): number {
  const cat = (category || "").toLowerCase();
  const type = (placeType || "").toLowerCase();

  if (cat.includes("hill") || cat.includes("mountain") || cat.includes("beach") || type.includes("area")) {
    return 2.5; // 2.5 km for hill stations, beaches, & regions
  }
  if (cat.includes("temple") || cat.includes("heritage") || cat.includes("fort")) {
    return 1.2; // 1.2 km for temple towns & historical forts
  }
  if (cat.includes("waterfall") || cat.includes("lake") || cat.includes("viewpoint")) {
    return 0.8; // 800m for compact natural attractions
  }
  return 1.0; // Default 1 km geofence
}
