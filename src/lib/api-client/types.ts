export interface ApiErrorResponse {
  code: string;
  message: string;
  traceId: string;
  timestamp: string;
}

export interface CoordinatesDTO {
  latitude: number;
  longitude: number;
}

export interface PlaceDTO {
  id: string;
  name: string;
  slug: string;
  district: string;
  city: string;
  category: string;
  coordinates: CoordinatesDTO;
  elevationMeters: number;
  heroImage: string;
  rating: number;
  reviewCount: number;
  flowStatus?: string;
  difficulty: string;
  tagline?: string;
  description?: string;
}

export interface BackendSearchSuggestion {
  id: string;
  slug: string;
  name: string;
  district: string;
  category: string;
}

// Experience-Oriented BFF Response DTOs (Single API Call Per Screen)
export interface HomeExperienceDTO {
  heroSpotlight: PlaceDTO;
  trendingPlaces: PlaceDTO[];
  popularRoutes: { id: string; name: string; distance: string; hairpins: number }[];
  weatherAlerts: { district: string; message: string; severity: string }[];
  communityStories: { id: string; title: string; author: string }[];
  traceId: string;
}

export interface PlaceExploreCompositeDTO {
  place: PlaceDTO;
  weather: {
    temp: string;
    rain: string;
    fog: string;
    status: string;
    microclimate: string;
  };
  reviews: { id: string; user: string; comment: string; rating: number }[];
  nearby: { name: string; distance: string; type: string }[];
  aiSummary: { text: string; tokenCount: number };
  routeInfo: { distanceKm: number; hairpins: number; ridingTime: string };
  traceId: string;
}

export interface TripExperienceDTO {
  tripId: string;
  origin: string;
  destination: string;
  itinerary: { day: number; title: string; places: string[]; fuelStops: string[] }[];
  gpxTrackUrl: string;
  emergencyContacts: { service: string; phone: string }[];
  weatherForecast: string;
  traceId: string;
}

export interface RouteDTO {
  id: string;
  slug: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  hairpinCount: number;
  elevationGainFt: number;
  status: "Draft" | "Verified" | "Featured";
}

export interface MediaAssetDTO {
  assetId: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  webpUrl: string;
  sizeBytes: number;
  exifGps?: { lat: number; lng: number; locationName: string };
  aiTags: string[];
}

export interface WeatherTelemetryDTO {
  temp: string;
  rain: string;
  fog: string;
  status: string;
  microclimate: string;
}

export interface AIGenerationDTO {
  text: string;
  tokenCount: number;
  traceId: string;
}
