function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!isLocalhost) {
      return window.location.origin;
    }
  }
  return "http://localhost:8000";
}

const API_BASE_URL = getApiBaseUrl();

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
  };
  missingFields: string[];
  recommendations: string[];
  route: {
    totalDistanceKm: number;
    estimatedTime: string;
  };
  costEstimate: {
    fuelCost: string;
    numericFuelCost?: number;
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
  provenance: {
    destination: string;
    route: string;
    weather: string;
    cost: string;
    narrative: string;
  };
  traceId: string;
}

export class PlannerApiRepository {
  static async sendChatMessage(message: string, conversationId?: string): Promise<PlannerChatResponseDTO> {
    const response = await fetch(`${API_BASE_URL}/api/v1/planner/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, conversationId }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const traceId = errBody?.error?.traceId || response.headers.get("X-Trace-ID") || `tr-err-${Date.now()}`;
      const msg = errBody?.error?.message || `Planner API error ${response.status}`;
      throw new Error(`[TraceID: ${traceId}] ${msg}`);
    }

    const json = await response.json();
    return json.data;
  }
}
