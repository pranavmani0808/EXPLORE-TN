import { DailyItinerary, DailyActivity, CostBreakdown, CandidatePOI } from "@/lib/planner-engine/types";
import { getHaversineKm } from "@/lib/planner-engine/poi-ranker";

export interface ItineraryStop {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  type: "start" | "poi" | "meal" | "travel" | "hotel" | "rest";
  durationMinutes: number;
  timeSlot: string;
  isCustomAdded?: boolean;
  isSkipped?: boolean;
  originalIndex?: number;
  entryFee?: string;
  costEstimate?: number;
  description: string;
}

export interface DynamicItineraryState {
  tripId: string;
  destinationName: string;
  originName: string;
  durationDays: number;
  originalStops: ItineraryStop[];
  activeStops: ItineraryStop[];
  dailyItineraries: DailyItinerary[];
  totalDistanceKm: number;
  totalDrivingMinutes: number;
  totalCostEstimate: number;
  isModified: boolean;
  isExtendedOvernight: boolean;
  extendedNights: number;
}

export class DynamicItineraryManager {
  private state: DynamicItineraryState;

  constructor(initialData: {
    tripId: string;
    destinationName: string;
    originName: string;
    durationDays: number;
    stops: ItineraryStop[];
    dailyItineraries?: DailyItinerary[];
    totalDistanceKm?: number;
    totalDrivingMinutes?: number;
    totalCostEstimate?: number;
  }) {
    const stops = initialData.stops || [];
    this.state = {
      tripId: initialData.tripId,
      destinationName: initialData.destinationName,
      originName: initialData.originName,
      durationDays: initialData.durationDays,
      originalStops: [...stops],
      activeStops: [...stops],
      dailyItineraries: initialData.dailyItineraries || [],
      totalDistanceKm: initialData.totalDistanceKm || 0,
      totalDrivingMinutes: initialData.totalDrivingMinutes || 0,
      totalCostEstimate: initialData.totalCostEstimate || 0,
      isModified: false,
      isExtendedOvernight: false,
      extendedNights: 0,
    };
    this.recalculateSchedule();
  }

  public getState(): DynamicItineraryState {
    return { ...this.state };
  }

  public addStop(
    poi: {
      id: string;
      name: string;
      district: string;
      latitude: number;
      longitude: number;
      category?: string;
      description?: string;
    },
    insertIndex?: number
  ): DynamicItineraryState {
    const newStop: ItineraryStop = {
      id: `custom-${poi.id}-${Date.now()}`,
      name: poi.name,
      district: poi.district,
      latitude: poi.latitude,
      longitude: poi.longitude,
      type: poi.category?.toLowerCase().includes("hotel") ? "hotel" : poi.category?.toLowerCase().includes("food") ? "meal" : "poi",
      durationMinutes: 45,
      timeSlot: "12:00 PM",
      isCustomAdded: true,
      description: poi.description || `Spontaneously added spot in ${poi.district}`,
      costEstimate: 100,
    };

    const targetIdx = insertIndex !== undefined ? insertIndex : Math.max(1, this.state.activeStops.length - 1);
    this.state.activeStops.splice(targetIdx, 0, newStop);
    this.state.isModified = true;
    this.recalculateSchedule();
    return this.getState();
  }

  public removeStop(stopId: string): DynamicItineraryState {
    this.state.activeStops = this.state.activeStops.filter((s) => s.id !== stopId);
    this.state.isModified = true;
    this.recalculateSchedule();
    return this.getState();
  }

  public toggleSkipStop(stopId: string): DynamicItineraryState {
    this.state.activeStops = this.state.activeStops.map((s) => {
      if (s.id === stopId) {
        return { ...s, isSkipped: !s.isSkipped };
      }
      return s;
    });
    this.state.isModified = true;
    this.recalculateSchedule();
    return this.getState();
  }

  public reorderStops(fromIndex: number, toIndex: number): DynamicItineraryState {
    if (fromIndex < 0 || fromIndex >= this.state.activeStops.length || toIndex < 0 || toIndex >= this.state.activeStops.length) {
      return this.getState();
    }
    const [moved] = this.state.activeStops.splice(fromIndex, 1);
    this.state.activeStops.splice(toIndex, 0, moved);
    this.state.isModified = true;
    this.recalculateSchedule();
    return this.getState();
  }

  public extendTripOvernight(nights: number = 1, stayLocation?: string): DynamicItineraryState {
    this.state.isExtendedOvernight = true;
    this.state.extendedNights += nights;
    this.state.durationDays += nights;

    const stayName = stayLocation || `Overnight Resort & Stay near ${this.state.destinationName}`;
    const hotelStop: ItineraryStop = {
      id: `stay-${Date.now()}`,
      name: stayName,
      district: this.state.destinationName,
      latitude: this.state.activeStops[this.state.activeStops.length - 1]?.latitude || 11.4102,
      longitude: this.state.activeStops[this.state.activeStops.length - 1]?.longitude || 76.6950,
      type: "hotel",
      durationMinutes: 480,
      timeSlot: "08:00 PM",
      isCustomAdded: true,
      description: `Overnight accommodation & rest stop in ${this.state.destinationName}`,
      costEstimate: 2200 * nights,
    };

    this.state.activeStops.push(hotelStop);
    this.state.isModified = true;
    this.recalculateSchedule();
    return this.getState();
  }

  public restoreOriginalItinerary(): DynamicItineraryState {
    this.state.activeStops = [...this.state.originalStops];
    this.state.isModified = false;
    this.state.isExtendedOvernight = false;
    this.state.extendedNights = 0;
    this.recalculateSchedule();
    return this.getState();
  }

  private recalculateSchedule() {
    const validStops = this.state.activeStops.filter((s) => !s.isSkipped);
    if (validStops.length === 0) return;

    let totalDistKm = 0;
    let totalMins = 0;
    let totalCost = 0;

    const isHillRegion = ["ooty", "kodaikanal", "valparai", "yercaud", "kolli"].some((h) =>
      this.state.destinationName.toLowerCase().includes(h)
    );
    const roadFactor = isHillRegion ? 1.42 : 1.25;
    const avgSpeed = isHillRegion ? 32 : 55;

    let currentMinutesFromMidnight = 8 * 60; // Start trip at 08:00 AM

    validStops.forEach((stop, idx) => {
      if (idx > 0) {
        const prev = validStops[idx - 1];
        const dist = getHaversineKm(prev.latitude, prev.longitude, stop.latitude, stop.longitude) * roadFactor;
        const driveMins = Math.round((dist / avgSpeed) * 60);

        totalDistKm += dist;
        totalMins += driveMins;
        currentMinutesFromMidnight += driveMins;
      }

      // Format time string (e.g. 510 -> 08:30 AM)
      const hours = Math.floor(currentMinutesFromMidnight / 60) % 24;
      const mins = currentMinutesFromMidnight % 60;
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const formattedTime = `${formattedHours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} ${ampm}`;

      stop.timeSlot = formattedTime;
      currentMinutesFromMidnight += stop.durationMinutes;
      totalMins += stop.durationMinutes;
      totalCost += stop.costEstimate || 50;
    });

    // Add estimated fuel cost (~ ₹10/km)
    const fuelCost = Math.round(totalDistKm * 9.5);
    totalCost += fuelCost;

    this.state.totalDistanceKm = Math.round(totalDistKm);
    this.state.totalDrivingMinutes = totalMins;
    this.state.totalCostEstimate = totalCost;
  }
}
