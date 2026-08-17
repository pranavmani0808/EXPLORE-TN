import { PlaceApiRepository, AIApiRepository, MediaApiRepository, WeatherApiRepository, PlaceDTO, MediaAssetDTO } from "./api-client";

export * from "./api-client";

function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!isLocalhost) {
      // In production deployment (e.g. Vercel), use origin base to prevent CORS loopback warnings
      return window.location.origin;
    }
  }
  return "http://localhost:8000";
}

const API_BASE_URL = getApiBaseUrl();

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/healthz`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === "Healthy" || data.status === "online";
  } catch {
    return false;
  }
}

export async function fetchRealtimeBackendTelemetry() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/telemetry`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const body = await response.json();
    return body.data;
  } catch {
    return null;
  }
}

export async function fetchAutocompleteSuggestions(query: string) {
  if (!query.trim()) return [];
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/search/autocomplete`);
    url.searchParams.append("q", query);
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    return data.suggestions || [];
  } catch {
    return [];
  }
}

export async function fetchBackendPlaces(category?: string): Promise<PlaceDTO[]> {
  return PlaceApiRepository.fetchPlaces(category);
}

export async function createPlaceNodeBackend(placeData: Partial<PlaceDTO>): Promise<{ success: boolean; place: PlaceDTO }> {
  return PlaceApiRepository.createPlace(placeData);
}

export async function uploadMediaAssetPipeline(file: File): Promise<MediaAssetDTO> {
  return MediaApiRepository.uploadMediaAsset(file);
}

export async function generatePlaceDescriptionAI(placeName: string, district: string) {
  return AIApiRepository.generatePlaceDescription(placeName, district);
}

export async function generateTripPlanAI(origin: string, destination: string, days: number) {
  return AIApiRepository.generateTripPlan(origin, destination, days);
}

export async function fetchLiveWeatherByCoordinates(lat: number, lng: number) {
  return WeatherApiRepository.fetchWeatherByCoordinates(lat, lng);
}
