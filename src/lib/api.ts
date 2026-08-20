import { PlaceApiRepository, AIApiRepository, MediaApiRepository, WeatherApiRepository, PlaceDTO, MediaAssetDTO } from "./api-client";
import { getApiBaseUrl } from "./api-client/config";
import type { BackendSearchSuggestion } from "./api-client/types";
import { CANONICAL_PLACES } from "./data/canonical-places";

export * from "./api-client";
export type { BackendSearchSuggestion };

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/healthz`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === "Healthy" || data.status === "online";
  } catch {
    return false;
  }
}

export async function fetchRealtimeBackendTelemetry() {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/admin/telemetry`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function fetchAutocompleteSuggestions(query: string): Promise<BackendSearchSuggestion[]> {
  if (!query.trim()) return [];

  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/places/search/autocomplete?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      const rows = data.data || [];
      if (rows.length > 0) return rows;
    }
  } catch (err) {
    console.warn("Autocomplete API offline:", err);
  }

  const q = query.toLowerCase().trim();
  return CANONICAL_PLACES.filter((p) => {
    const hay = `${p.name} ${p.district} ${p.tagline} ${p.slug} ${p.tags.join(" ")}`.toLowerCase();
    return hay.includes(q);
  })
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      district: p.district,
      category: p.primaryCategory,
    }));
}

export async function createPlaceNodeBackend(payload: any) {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/v1/places`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`Create place failed with status ${res.status}`);
  }
  const data = await res.json();
  return data.data;
}

export async function generatePlaceDescriptionAI(placeName: string, district: string) {
  return AIApiRepository.generatePlaceDescription(placeName, district);
}

export async function uploadMediaAssetPipeline(file: File) {
  return MediaApiRepository.uploadMediaAsset(file);
}
