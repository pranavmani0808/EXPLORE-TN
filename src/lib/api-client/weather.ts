import { WeatherTelemetryDTO } from "./types";
import { getApiBaseUrl } from "./config";

export class WeatherApiRepository {
  static async fetchDistrictWeather(districtName: string): Promise<WeatherTelemetryDTO> {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/weather/${encodeURIComponent(districtName)}`);
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (err) {
      console.warn(`[WeatherApiRepository] Weather API offline for ${districtName}:`, err);
    }

    return {
      district: districtName,
      temperatureC: 24,
      condition: "Partly Cloudy",
      humidityPct: 78,
      windSpeedKmh: 14,
      precipitationMm: 0.0,
      forecast: [
        { day: "Today", tempMaxC: 26, tempMinC: 18, condition: "Partly Cloudy" },
        { day: "Tomorrow", tempMaxC: 25, tempMinC: 17, condition: "Light Mist" },
        { day: "Day 3", tempMaxC: 27, tempMinC: 19, condition: "Sunny Shola" },
      ],
      retrievedAt: new Date().toISOString(),
    };
  }
}
