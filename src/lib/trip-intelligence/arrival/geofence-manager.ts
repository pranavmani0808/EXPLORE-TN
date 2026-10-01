import {
  ArrivalState,
  ArrivalEvent,
  DestinationGeofence,
  canTransitionArrivalState,
  computeGeofenceRadius,
} from "./arrival-state-machine";
import { getHaversineKm } from "@/lib/planner-engine/poi-ranker";

const STORAGE_KEY_PREFIX = "etn_trip_tracking_v1_";
const DWELL_TIME_THRESHOLD_MS = 5000; // 5 seconds dwell inside geofence required

export interface LocationObservation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export class GeofenceManager {
  private tripId: string;
  private geofences: Map<string, DestinationGeofence> = new Map();
  private currentState: ArrivalState = "not_started";
  private activeDestinationId: string | null = null;
  private trackingEnabled: boolean = true;
  private isPaused: boolean = false;
  private lastObservation: LocationObservation | null = null;
  private dwellStartTimestamp: number | null = null;
  private confirmedArrivals: Map<string, ArrivalEvent> = new Map();

  constructor(tripId: string) {
    this.tripId = tripId;
    this.loadStateFromStorage();
  }

  public registerGeofences(
    destinations: Array<{
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      district: string;
      category: string;
      radiusKm?: number;
    }>
  ) {
    destinations.forEach((d) => {
      const radiusKm = d.radiusKm ?? computeGeofenceRadius(d.category);
      this.geofences.set(d.id, {
        destinationId: d.id,
        name: d.name,
        latitude: d.latitude,
        longitude: d.longitude,
        district: d.district,
        category: d.category,
        radiusKm,
      });
    });
    if (!this.activeDestinationId && destinations.length > 0) {
      this.activeDestinationId = destinations[0].id;
    }
  }

  public setTrackingEnabled(enabled: boolean) {
    this.trackingEnabled = enabled;
    if (!enabled) {
      this.transitionTo("paused");
    } else if (this.currentState === "paused") {
      this.transitionTo("trip_active");
    }
    this.persistState();
  }

  public togglePause(): boolean {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.transitionTo("paused");
    } else {
      this.transitionTo("trip_active");
    }
    this.persistState();
    return this.isPaused;
  }

  public startTrip() {
    this.transitionTo("trip_active");
    this.persistState();
  }

  public processLocationUpdate(obs: LocationObservation): {
    state: ArrivalState;
    triggeredEvent: ArrivalEvent | null;
    currentDistanceKm: number | null;
    activeDestination: DestinationGeofence | null;
  } {
    this.lastObservation = obs;

    if (!this.trackingEnabled || this.isPaused || this.currentState === "not_started" || this.currentState === "completed") {
      return {
        state: this.currentState,
        triggeredEvent: null,
        currentDistanceKm: null,
        activeDestination: this.getActiveGeofence(),
      };
    }

    const activeFence = this.getActiveGeofence();
    if (!activeFence) {
      return {
        state: this.currentState,
        triggeredEvent: null,
        currentDistanceKm: null,
        activeDestination: null,
      };
    }

    // Ignore location updates with very poor accuracy (> 250m) to protect against GPS noise
    if (obs.accuracy && obs.accuracy > 250) {
      return {
        state: this.currentState,
        triggeredEvent: null,
        currentDistanceKm: null,
        activeDestination: activeFence,
      };
    }

    const distanceKm = getHaversineKm(obs.lat, obs.lng, activeFence.latitude, activeFence.longitude);
    const now = obs.timestamp || Date.now();
    let triggeredEvent: ArrivalEvent | null = null;

    // 1. Check if inside Geofence
    if (distanceKm <= activeFence.radiusKm) {
      if (this.currentState === "trip_active" || this.currentState === "approaching") {
        this.transitionTo("arrival_pending");
        this.dwellStartTimestamp = now;
      } else if (this.currentState === "arrival_pending") {
        const dwellDuration = now - (this.dwellStartTimestamp || now);
        if (dwellDuration >= DWELL_TIME_THRESHOLD_MS) {
          // Idempotency check: Don't trigger duplicate arrival event if already confirmed for this destination
          if (!this.confirmedArrivals.has(activeFence.destinationId)) {
            triggeredEvent = {
              id: `arr-${activeFence.destinationId}-${now}`,
              tripId: this.tripId,
              destinationId: activeFence.destinationId,
              destinationName: activeFence.name,
              timestamp: new Date(now).toISOString(),
              confirmationMethod: "geofence_dwell",
              latitude: obs.lat,
              longitude: obs.lng,
              accuracyMeters: obs.accuracy,
            };
            this.confirmedArrivals.set(activeFence.destinationId, triggeredEvent);
            this.transitionTo("arrived");
            this.dispatchArrivalEvent(triggeredEvent);
          }
        }
      }
    } else if (distanceKm <= activeFence.radiusKm * 2.5) {
      // Approaching boundary
      if (this.currentState === "trip_active") {
        this.transitionTo("approaching");
      }
      this.dwellStartTimestamp = null;
    } else {
      // Outside boundary
      if (this.currentState === "arrived" || this.currentState === "exploring") {
        this.transitionTo("departed");
      } else if (this.currentState === "approaching" || this.currentState === "arrival_pending") {
        this.transitionTo("trip_active");
      }
      this.dwellStartTimestamp = null;
    }

    this.persistState();

    return {
      state: this.currentState,
      triggeredEvent,
      currentDistanceKm: distanceKm,
      activeDestination: activeFence,
    };
  }

  public confirmArrivalManually(destinationId?: string): ArrivalEvent | null {
    const fence = destinationId ? this.geofences.get(destinationId) : this.getActiveGeofence();
    if (!fence) return null;

    const now = Date.now();
    const event: ArrivalEvent = {
      id: `arr-manual-${fence.destinationId}-${now}`,
      tripId: this.tripId,
      destinationId: fence.destinationId,
      destinationName: fence.name,
      timestamp: new Date(now).toISOString(),
      confirmationMethod: "manual_user_confirm",
      latitude: this.lastObservation?.lat || fence.latitude,
      longitude: this.lastObservation?.lng || fence.longitude,
    };

    this.confirmedArrivals.set(fence.destinationId, event);
    this.transitionTo("arrived");
    this.dispatchArrivalEvent(event);
    this.persistState();
    return event;
  }

  public getActiveGeofence(): DestinationGeofence | null {
    if (!this.activeDestinationId) return null;
    return this.geofences.get(this.activeDestinationId) || null;
  }

  public setActiveDestination(destinationId: string) {
    if (this.geofences.has(destinationId)) {
      this.activeDestinationId = destinationId;
      this.dwellStartTimestamp = null;
      if (this.confirmedArrivals.has(destinationId)) {
        this.currentState = "arrived";
      } else {
        this.currentState = "trip_active";
      }
      this.persistState();
    }
  }

  public getConfirmedArrivals(): ArrivalEvent[] {
    return Array.from(this.confirmedArrivals.values());
  }

  public getCurrentState(): ArrivalState {
    return this.currentState;
  }

  public isTrackingActive(): boolean {
    return this.trackingEnabled && !this.isPaused;
  }

  private transitionTo(nextState: ArrivalState) {
    if (canTransitionArrivalState(this.currentState, nextState)) {
      this.currentState = nextState;
    }
  }

  private dispatchArrivalEvent(event: ArrivalEvent) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("etn_destination_arrived", {
          detail: { event, fence: this.geofences.get(event.destinationId) },
        })
      );
    }
  }

  private persistState() {
    if (typeof window === "undefined") return;
    try {
      const data = {
        currentState: this.currentState,
        activeDestinationId: this.activeDestinationId,
        trackingEnabled: this.trackingEnabled,
        isPaused: this.isPaused,
        confirmedArrivals: Array.from(this.confirmedArrivals.entries()),
      };
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${this.tripId}`, JSON.stringify(data));
    } catch {}
  }

  private loadStateFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${this.tripId}`);
      if (raw) {
        const data = JSON.parse(raw);
        this.currentState = data.currentState || "not_started";
        this.activeDestinationId = data.activeDestinationId || null;
        this.trackingEnabled = data.trackingEnabled ?? true;
        this.isPaused = data.isPaused ?? false;
        if (data.confirmedArrivals) {
          this.confirmedArrivals = new Map(data.confirmedArrivals);
        }
      }
    } catch {}
  }
}
