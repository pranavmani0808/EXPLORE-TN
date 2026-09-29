export type TransportMode = "car" | "bike" | "bus" | "train" | "flight" | "mixed";
export type TravelStyle = "relaxed" | "balanced" | "packed" | "budget" | "scenic" | "family" | "adventure";

export interface StructuredLocation {
  name: string;
  canonicalId?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  confidence: number;
}

export interface StructuredTripRequest {
  origin: StructuredLocation;
  destinations: StructuredLocation[];
  duration: {
    days: number;
    exact: boolean;
  };
  dates?: {
    start?: string;
    end?: string;
  };
  travelers: {
    adults: number;
    children: number;
    elderly: number;
    solo: boolean;
    groupSize: number;
    femaleSolo?: boolean;
    accessibilityRequired?: boolean;
  };
  transport: {
    mode: TransportMode;
    preferences: string[];
    maxDrivingHoursPerDay?: number;
    avoidHighways?: boolean;
    avoidNightDriving?: boolean;
  };
  budget: {
    amount?: number;
    currency: string;
    strict: boolean;
    tier?: "budget" | "standard" | "premium" | "luxury" | "free";
  };
  interests: string[];
  travelStyle: TravelStyle;
  constraints: {
    avoid: string[];
    mustVisit: string[];
    mustInclude: string[];
    accessibilityRequired: boolean;
    dietaryRestrictions: string[]; // e.g. "veg", "vegan"
  };
  foodPreferences: string[];
  accommodationPreferences: string[];
  safetyPreferences: string[];
  confidence: number;
  rawPrompt: string;
}

export interface CandidatePOI {
  id: string;
  name: string;
  slug: string;
  district: string;
  category: string;
  latitude: number;
  longitude: number;
  description: string;
  image: string;
  rating?: number;
  openingHours: string;
  closedDays?: string[];
  openingTimeMin?: number; // e.g. 360 = 06:00 AM
  closingTimeMin?: number; // e.g. 1080 = 06:00 PM
  entryFee: string;
  numericEntryFee: number;
  parkingInfo: {
    available: boolean;
    bike: boolean;
    car: boolean;
    statusText: string;
  };
  difficulty: "Easy" | "Moderate" | "Hard";
  accessibility: {
    wheelchair: boolean;
    reducedWalking: boolean;
  };
  score?: number;
  reason?: string;
}

export interface DailyActivity {
  timeSlot: string; // e.g. "08:30"
  poiId?: string;
  title: string;
  description: string;
  durationMinutes: number;
  travelTimeFromPrevMinutes?: number;
  distanceFromPrevKm?: number;
  type: "start" | "poi" | "meal" | "travel" | "hotel" | "rest";
  parking?: string;
  safetyNote?: string;
  whyThisPlace?: string;
  costEstimate?: number;
}

export interface DailyItinerary {
  dayNumber: number;
  dateStr?: string;
  title: string;
  startingLocation: string;
  overnightLocation: string;
  totalDistanceKm: number;
  totalDrivingMinutes: number;
  activities: DailyActivity[];
  dayCost: number;
  weatherSummary: string;
  roadNotes?: string[];
}

export interface CostBreakdown {
  transportCost: number;
  stayCost: number;
  foodCost: number;
  activitiesCost: number;
  parkingTollsCost: number;
  totalEstimated: number;
  budgetAmount?: number;
  withinBudget: boolean;
  budgetDifference: number; // positive = saved, negative = exceeded
  assumptions: string[];
}

export interface ConstraintTraceItem {
  constraint: string;
  requested: any;
  actual: any;
  status: "passed" | "failed" | "warning";
  message: string;
}

export interface ItineraryValidationResult {
  isValid: boolean;
  destinationMatch: boolean;
  durationMatch: boolean;
  budgetMatch: boolean;
  transportMatch: boolean;
  exclusionsRespected: boolean;
  openingHoursValid: boolean;
  noDuplicatePois: boolean;
  routeRealistic: boolean;
  traces: ConstraintTraceItem[];
  errors: string[];
}

export interface VerifiedItineraryResponse {
  conversationId: string;
  traceId: string;
  request: StructuredTripRequest;
  narrativeSummary: string;
  destinationSummary: {
    name: string;
    district: string;
    tagline: string;
    canonicalId: string;
  };
  routeSummary: {
    totalDistanceKm: number;
    totalDrivingMinutes: number;
    stopsCount: number;
    ghatSectionDetected: boolean;
    hairpinBendsInfo?: string;
  };
  costBreakdown: CostBreakdown;
  weatherInfo: {
    tempRange: string;
    condition: string;
    advisory?: string;
  };
  dailyItineraries: DailyItinerary[];
  safetyNotes: string[];
  parkingOverview: {
    carParkingStatus: string;
    bikeParkingStatus: string;
    confidence: "Verified" | "Partially Verified" | "Data Unavailable";
  };
  explanations: Array<{
    placeName: string;
    reason: string;
  }>;
  validation: ItineraryValidationResult;
  confidence: {
    destination: "Verified" | "Unknown";
    route: "OSRM Calculated" | "Estimated";
    weather: "Live/Forecast" | "Seasonal Average";
    cost: "Itemized Engine" | "Estimated";
    overallScore: number;
  };
  suggestedCategories?: Array<{ id: string; label: string; icon: string; categoryKey: string }>;
  unknownDestinationError?: {
    requested: string;
    suggestions: string[];
  };
}
