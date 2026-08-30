export interface WeatherForecast {
  destination: string;
  temperatureC: number;
  condition: string;
  humidityPercent: number;
  windSpeedKmh: number;
  rainfallMm: number;
  ghatAdvisory: string;
  retrievedAt: string;
}

export interface TTDCAdvisory {
  id: string;
  category: string;
  title: string;
  description: string;
  affectedDistrict: string;
  validUntil: string;
  isOfficialGovtAlert: boolean;
}

export interface GeocodeResult {
  placeName: string;
  latitude: number;
  longitude: number;
  district: string;
  category: string;
  relevanceScore: number;
  bbox?: number[];
}

export interface ExternalApiResponse<T = any> {
  url: string;
  statusCode: number;
  data: T;
  latencyMs: number;
  retrievedAt: string;
}

import { getApiBaseUrl } from "@/lib/api-client/config";

export class IntegrationsApiRepository {
  private static get baseUrl(): string {
    return `${getApiBaseUrl()}/api/v1/integrations`;
  }

  static async getWeatherForecast(destination: string): Promise<WeatherForecast> {
    const res = await fetch(`${this.baseUrl}/weather?destination=${encodeURIComponent(destination)}`);
    if (!res.ok) throw new Error(`Failed to fetch weather forecast for ${destination}`);
    const envelope = await res.json();
    return envelope.data;
  }

  static async getTTDCAdvisories(district?: string): Promise<TTDCAdvisory[]> {
    const url = district ? `${this.baseUrl}/ttdc/advisories?district=${encodeURIComponent(district)}` : `${this.baseUrl}/ttdc/advisories`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch TTDC advisories');
    const envelope = await res.json();
    return envelope.data;
  }

  static async searchGeocoding(query: string): Promise<GeocodeResult[]> {
    const res = await fetch(`${this.baseUrl}/geocoding/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`Failed to perform geocoding search for ${query}`);
    const envelope = await res.json();
    return envelope.data;
  }

  static async proxyExternalApi<T = any>(payload: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, any>;
    body?: any;
  }): Promise<ExternalApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}/external/proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'External API Proxy request failed');
    }
    const envelope = await res.json();
    return envelope.data;
  }
}
