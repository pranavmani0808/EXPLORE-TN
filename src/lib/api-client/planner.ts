import { getApiBaseUrl } from "./config";

const API_BASE_URL = getApiBaseUrl();

export interface SuggestedCategoryItem {
  id: string;
  label: string;
  icon: string;
  categoryKey: string;
}

export interface DestinationProfileDTO {
  destination: string;
  region: string;
  destinationTypes: string[];
  primaryTagline: string;
  interests?: SuggestedCategoryItem[];
}

export interface PlannerChatResponseDTO {
  conversationId: string;
  message: string;
  intent: string;
  plannerState: {
    origin?: string;
    destination?: string;
    durationDays?: number;
    budget?: number;
    transport?: string;
    interests?: string[];
    discoveryPhase?: string;
  };
  destinationProfile?: DestinationProfileDTO;
  suggestedCategories?: SuggestedCategoryItem[];
  missingFields: string[];
  recommendations: string[];
  route: {
    distanceKm: number;
    durationMinutes: number;
    geometry: {
      type: string;
      coordinates: number[][];
    };
    provider: string;
    profile: string;
  };
  elevation?: {
    gainMeters: number;
    highestMeters: number;
    lowestMeters: number;
  };
  costEstimate: {
    fuelCost: string;
    numericFuelCost?: number;
    fuel?: number;
    food?: number;
    tickets?: number;
    parking?: number;
    total?: number;
    budget?: number;
    withinBudget?: boolean;
    assumptions: string;
  };
  weather: {
    tempRange: string;
    condition: string;
  };
  timeline: Array<{
    time: string;
    name: string;
    description: string;
  }>;
  webEvidence?: Array<{
    title: string;
    snippet: string;
    url: string;
    domain: string;
    retrievedAt: string;
  }>;
  provenance: {
    destination: string;
    route: string;
    elevation: string;
    weather: string;
    cost: string;
    webEvidence: string;
    narrative: string;
  };
  traceId: string;
}

export class PlannerApiRepository {
  static async sendChatMessage(message: string, conversationId?: string): Promise<PlannerChatResponseDTO> {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/planner/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, conversationId }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const traceId = errBody?.error?.traceId || response.headers.get("X-Trace-ID") || `tr-err-${Date.now()}`;
      const msg = errBody?.error?.message || `Planner API error HTTP ${response.status}`;
      throw new Error(`[TraceID: ${traceId}] ${msg}`);
    }

    const json = await response.json();
    return json.data;
  }
}
