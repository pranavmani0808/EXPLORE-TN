import { GeofenceManager, LocationObservation } from "../arrival/geofence-manager";
import { ArrivalEvent, ArrivalState } from "../arrival/arrival-state-machine";
import { DynamicItineraryManager } from "../itinerary/dynamic-itinerary";

export interface ActiveTripSession {
  tripId: string;
  destinationName: string;
  originName: string;
  durationDays: number;
  geofenceManager: GeofenceManager;
  itineraryManager: DynamicItineraryManager;
  lastArrivalEvent: ArrivalEvent | null;
  trackingEnabled: boolean;
  isPaused: boolean;
}

class ActiveTripContextService {
  private currentSession: ActiveTripSession | null = null;
  private listeners: Set<(session: ActiveTripSession | null) => void> = new Set();

  public initializeTripSession(params: {
    tripId: string;
    destinationName: string;
    originName: string;
    durationDays: number;
    destinations: Array<{
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      district: string;
      category: string;
    }>;
    initialStops: Array<{
      id: string;
      name: string;
      district: string;
      latitude: number;
      longitude: number;
      type: "start" | "poi" | "meal" | "travel" | "hotel" | "rest";
      durationMinutes: number;
      timeSlot: string;
      description: string;
    }>;
  }): ActiveTripSession {
    const geofenceMgr = new GeofenceManager(params.tripId);
    geofenceMgr.registerGeofences(params.destinations);
    geofenceMgr.startTrip();

    const itineraryMgr = new DynamicItineraryManager({
      tripId: params.tripId,
      destinationName: params.destinationName,
      originName: params.originName,
      durationDays: params.durationDays,
      stops: params.initialStops,
    });

    this.currentSession = {
      tripId: params.tripId,
      destinationName: params.destinationName,
      originName: params.originName,
      durationDays: params.durationDays,
      geofenceManager: geofenceMgr,
      itineraryManager: itineraryMgr,
      lastArrivalEvent: null,
      trackingEnabled: true,
      isPaused: false,
    };

    this.notifyListeners();
    return this.currentSession;
  }

  public getSession(): ActiveTripSession | null {
    return this.currentSession;
  }

  public processLocationUpdate(obs: LocationObservation) {
    if (!this.currentSession) return;
    const res = this.currentSession.geofenceManager.processLocationUpdate(obs);
    if (res.triggeredEvent) {
      this.currentSession.lastArrivalEvent = res.triggeredEvent;
      this.notifyListeners();
    }
  }

  public subscribe(listener: (session: ActiveTripSession | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentSession);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.currentSession));
  }
}

export const activeTripContext = new ActiveTripContextService();
