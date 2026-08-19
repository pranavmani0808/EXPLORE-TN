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
  summary: {
    distanceKm: number;
    durationMins: number;
  };
  distanceKm: number;
  durationMinutes: number;
  geometry: {
    type: string;
    coordinates: number[][]; // [lat, lng] pairs for Leaflet rendering
  };
  provider: string;
  travelMode: string;
  calculatedAt: string;
}

export class RouteApiRepository {
  static async calculateRoute(request: IsolatedRouteRequestDTO): Promise<IsolatedRouteResultDTO> {
    const { origin, destination, travelMode = "driving", requestId } = request;

    // 1. Try calling Backend API route calculation service first
    try {
      const baseUrl = getApiBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${baseUrl}/api/v1/routes/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json.data && json.data.geometry && json.data.geometry.coordinates) {
          const rawCoords: number[][] = json.data.geometry.coordinates;
          // Ensure coordinates are [lat, lng]
          const formattedCoords: number[][] = rawCoords.map((c) =>
            c[0] < 40 && c[1] > 60 ? [c[0], c[1]] : [c[1], c[0]]
          );
          return {
            ...json.data,
            summary: {
              distanceKm: json.data.distanceKm || json.data.summary?.distanceKm || 0,
              durationMins: json.data.durationMinutes || json.data.summary?.durationMins || 0,
            },
            geometry: {
              type: "LineString",
              coordinates: formattedCoords,
            },
          };
        }
      }
    } catch {
      // Backend service unreachable (e.g. static Vercel deployment), proceed to client-side OSRM provider
    }

    // 2. Query Live Real Road Network OSRM Engine
    const profileMap: Record<string, string> = {
      driving: "driving",
      motorcycle: "driving", // OSRM driving profile for road routing
      walking: "foot",
      cycling: "bike",
    };
    const osrmProfile = profileMap[travelMode] || "driving";
    const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

    const res = await fetch(osrmUrl);
    if (!res.ok) {
      throw new Error("Road route unavailable. Could not fetch road network geometry from routing engine.");
    }

    const data = await res.json();
    if (!data.routes || data.routes.length === 0 || !data.routes[0].geometry) {
      throw new Error("Road route unavailable. No valid road network path found between locations.");
    }

    const route = data.routes[0];
    const distKm = Math.round((route.distance / 1000) * 10) / 10;
    const durMins = Math.round(route.duration / 60);

    // Convert OSRM GeoJSON [lng, lat] to Leaflet [lat, lng]
    const osrmPolyline: number[][] = route.geometry.coordinates.map(
      (pt: [number, number]) => [pt[1], pt[0]]
    );

    return {
      requestId,
      origin,
      destination,
      destinationFingerprint: `${destination.name}:${destination.latitude}:${destination.longitude}`,
      summary: {
        distanceKm: distKm,
        durationMins: durMins,
      },
      distanceKm: distKm,
      durationMinutes: durMins,
      geometry: {
        type: "LineString",
        coordinates: osrmPolyline,
      },
      provider: "OSRM Real Road Network Engine",
      travelMode,
      calculatedAt: new Date().toISOString(),
    };
  }
}
