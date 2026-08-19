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

  static async fetchAlternativeRoutes(request: IsolatedRouteRequestDTO): Promise<RouteOption[]> {
    const { origin, destination, waypoints = [], travelMode = "driving" } = request;

    const profileMap: Record<string, string> = {
      driving: "driving",
      motorcycle: "driving",
      walking: "foot",
      cycling: "bike",
    };
    const osrmProfile = profileMap[travelMode] || "driving";

    const originName = (origin.name || "").toLowerCase();
    const destName = (destination.name || "").toLowerCase();
    const isChennaiPondicherry =
      (originName.includes("chennai") && destName.includes("pondi")) ||
      (originName.includes("pondi") && destName.includes("chennai"));

    if (isChennaiPondicherry && waypoints.length === 0) {
      const options: RouteOption[] = [];

      // 1. Fastest via NH44 / Tindivanam
      try {
        const fastRes = await fetch(
          `https://router.project-osrm.org/route/v1/${osrmProfile}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
        );
        if (fastRes.ok) {
          const fastData = await fastRes.json();
          if (fastData.routes?.[0]?.geometry) {
            const r0 = fastData.routes[0];
            options.push({
              id: "fastest",
              name: "Fastest Route",
              description: "via NH44 & Tindivanam",
              distanceKm: Math.round((r0.distance / 1000) * 10) / 10,
              durationMins: Math.round(r0.duration / 60),
              geometry: r0.geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]),
            });
          }
        }
      } catch {
        // ignore error
      }

      // 2. ECR Scenic Route (Mahabalipuram -> Marakkanam)
      try {
        const ecrRes = await fetch(
          `https://router.project-osrm.org/route/v1/${osrmProfile}/${origin.longitude},${origin.latitude};80.1927,12.6269;79.9530,12.1960;${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
        );
        if (ecrRes.ok) {
          const ecrData = await ecrRes.json();
          if (ecrData.routes?.[0]?.geometry) {
            const rEcr = ecrData.routes[0];
            options.push({
              id: "ecr_scenic",
              name: "ECR Scenic",
              description: "Coastal road · Mahabalipuram",
              distanceKm: Math.round((rEcr.distance / 1000) * 10) / 10,
              durationMins: Math.round(rEcr.duration / 60),
              geometry: rEcr.geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]),
            });
          }
        }
      } catch {
        // ignore error
      }

      // 3. Alternative GST / Inner Highway
      try {
        const altRes = await fetch(
          `https://router.project-osrm.org/route/v1/${osrmProfile}/${origin.longitude},${origin.latitude};79.9836,12.6840;${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
        );
        if (altRes.ok) {
          const altData = await altRes.json();
          if (altData.routes?.[0]?.geometry) {
            const rAlt = altData.routes[0];
            options.push({
              id: "alternative",
              name: "Alternative Highway",
              description: "via Chengalpattu Bypass",
              distanceKm: Math.round((rAlt.distance / 1000) * 10) / 10,
              durationMins: Math.round(rAlt.duration / 60),
              geometry: rAlt.geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]),
            });
          }
        }
      } catch {
        // ignore error
      }

      if (options.length > 0) return options;
    }

    // Generic origin/destination fallback: Query OSRM with alternatives=true
    try {
      const stopsSeq = [origin, ...waypoints, destination];
      const coordsStr = stopsSeq.map((s) => `${s.longitude},${s.latitude}`).join(";");
      const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${coordsStr}?overview=full&geometries=geojson&alternatives=true`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          return data.routes.map((r: any, idx: number) => {
            const label = idx === 0 ? "Fastest Route" : idx === 1 ? "Alternative 1" : `Alternative ${idx}`;
            const desc = idx === 0 ? "Main Highway Corridor" : "Secondary Road Corridor";
            return {
              id: idx === 0 ? "fastest" : `alt_${idx}`,
              name: label,
              description: desc,
              distanceKm: Math.round((r.distance / 1000) * 10) / 10,
              durationMins: Math.round(r.duration / 60),
              geometry: r.geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]),
            };
          });
        }
      }
    } catch {
      // ignore
    }

    return [];
  }
}

export interface RouteOption {
  id: string;
  name: string;
  description: string;
  distanceKm: number;
  durationMins: number;
  geometry: [number, number][];
  viaWaypoints?: CoordinatesDTO[];
}
