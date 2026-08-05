import { WeatherTelemetryDTO } from "./types";

const API_BASE_URL =
  (typeof process !== "undefined" && (process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL)) ||
  "http://localhost:8000";

export class WeatherApiRepository {
  static async fetchWeatherByCoordinates(lat: number, lng: number): Promise<WeatherTelemetryDTO> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/weather?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("[WeatherApiRepository] Microclimate telemetry offline:", err);
    }

    return {
      temp: "22°C",
      rain: "84 mm/h",
      fog: "Moderate Mist",
      status: "Active Watch",
      microclimate: "Ghat Plateau Microclimate",
    };
  }
}
