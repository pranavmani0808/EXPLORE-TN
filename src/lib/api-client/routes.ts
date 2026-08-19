import { getApiBaseUrl } from "./config";

export interface CoordinatesDTO {
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  country?: string;
}

export interface IsolatedRouteRequestDTO {
  requestId: string;
  origin: CoordinatesDTO;
  waypoints?: CoordinatesDTO[];
  destination: CoordinatesDTO;
  travelMode?: string;
}

export interface IsolatedRouteResultDTO {
  requestId: string;
  origin: CoordinatesDTO;
  waypoints?: CoordinatesDTO[];
  destination: CoordinatesDTO;
  destinationFingerprint: string;
  distanceKm: number;
  durationMinutes: number;
  geometry: {
    type: string;
    coordinates: number[][];
  };
  provider: string;
  travelMode: string;
  calculatedAt: string;
}

export class RouteApiRepository {
  static async calculateRoute(request: IsolatedRouteRequestDTO): Promise<IsolatedRouteResultDTO> {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/routes/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const msg = errBody?.detail || `Route Engine API error HTTP ${response.status}`;
      throw new Error(msg);
    }

    const json = await response.json();
    return json.data;
  }
}
