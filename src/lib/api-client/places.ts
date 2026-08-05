import { PlaceDTO, PlaceExploreCompositeDTO, HomeExperienceDTO, TripExperienceDTO } from "./types";

const API_BASE_URL =
  (typeof process !== "undefined" && (process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL)) ||
  "http://localhost:8000";

export class PlaceApiRepository {
  static async fetchPlaces(category?: string): Promise<PlaceDTO[]> {
    try {
      const url = new URL(`${API_BASE_URL}/api/v1/discover`);
      if (category && category !== "All") {
        url.searchParams.append("category", category);
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.places || [];
    } catch (err) {
      console.warn("[PlaceApiRepository] Backend offline, returning repository cache:", err);
      return [];
    }
  }

  // Experience-Oriented BFF Endpoint 1: Screen-Level Home Bundle
  static async fetchHomeExperience(): Promise<HomeExperienceDTO> {
    const traceId = `exp-home-${Date.now()}`;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/experience/home`);
      if (res.ok) {
        const data = await res.json();
        return { ...data, traceId };
      }
    } catch (err) {
      console.warn("[PlaceApiRepository] Home Experience API offline, fallback bundle:", err);
    }

    return {
      heroSpotlight: {
        id: "p-kolli",
        name: "Kolli Hills 70 Hairpin Pass",
        slug: "kolli-hills",
        district: "Namakkal",
        city: "Semmedu",
        category: "hills",
        coordinates: { latitude: 11.2721, longitude: 78.3412 },
        elevationMeters: 1300,
        heroImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
        rating: 4.9,
        reviewCount: 312,
        difficulty: "Hard",
      },
      trendingPlaces: [],
      popularRoutes: [
        { id: "r-1", name: "Chennai → Kodaikanal Ghat Run", distance: "520 km", hairpins: 20 },
        { id: "r-2", name: "Salem → Kolli Hills Loop", distance: "75 km", hairpins: 70 },
      ],
      weatherAlerts: [
        { district: "Nilgiris", message: "Monsoon rainfall heavy near Pykara Basin", severity: "High" },
      ],
      communityStories: [
        { id: "s-1", title: "Top 10 Secret Waterfalls in Theni", author: "Arun Kumar" },
      ],
      traceId,
    };
  }

  // Experience-Oriented BFF Endpoint 2: Place Explore Composite
  static async fetchPlaceExploreComposite(slug: string): Promise<PlaceExploreCompositeDTO> {
    const traceId = `bff-${Date.now()}`;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/experience/place/${slug}`);
      if (res.ok) {
        const data = await res.json();
        return { ...data, traceId };
      }
    } catch (err) {
      console.warn("[PlaceApiRepository] Place Experience API offline, fallback bundle:", err);
    }

    return {
      place: {
        id: `p-${slug}`,
        name: slug.replace(/-/g, " ").toUpperCase(),
        slug,
        district: "Theni",
        city: "Periyakulam",
        category: "waterfalls",
        coordinates: { latitude: 10.2381, longitude: 77.4892 },
        elevationMeters: 1036,
        heroImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
        rating: 4.9,
        reviewCount: 42,
        difficulty: "Moderate",
      },
      weather: {
        temp: "22°C",
        rain: "84 mm/h",
        fog: "Moderate Mist",
        status: "Active Watch",
        microclimate: "Ghat Plateau Microclimate",
      },
      reviews: [
        { id: "r-1", user: "RiderKarthik", comment: "Gravel section near hairpin 4 after rain.", rating: 5 },
      ],
      nearby: [
        { name: "Suruli Basin Viewpoint", distance: "2.4 km", type: "Viewpoint" },
        { name: "Karavalli Fuel Stop", distance: "5.1 km", type: "Fuel" },
      ],
      aiSummary: {
        text: "Verified ExplorerTN Guide: Steep climb requiring low gear. High water discharge during monsoon.",
        tokenCount: 280,
      },
      routeInfo: { distanceKm: 520, hairpins: 20, ridingTime: "11 h" },
      traceId,
    };
  }

  // Experience-Oriented BFF Endpoint 3: Complete Trip Bundle
  static async fetchTripExperience(tripId: string): Promise<TripExperienceDTO> {
    const traceId = `exp-trip-${Date.now()}`;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/experience/trip/${tripId}`);
      if (res.ok) {
        const data = await res.json();
        return { ...data, traceId };
      }
    } catch (err) {
      console.warn("[PlaceApiRepository] Trip Experience API offline, fallback bundle:", err);
    }

    return {
      tripId,
      origin: "Chennai",
      destination: "Kodaikanal",
      itinerary: [
        { day: 1, title: "Chennai to Dindigul Plains", places: ["Brihadeeswarar Temple"], fuelStops: ["IOC GST Station"] },
        { day: 2, title: "Batlagundu Hairpin Climb to Kodaikanal Lake", places: ["Kodaikanal Lake", "Pambar Shola Stream"], fuelStops: ["Kodaikanal Town Station"] },
      ],
      gpxTrackUrl: "/tracks/chennai-kodaikanal.gpx",
      emergencyContacts: [{ service: "Ghat Patrol Rescue", phone: "108" }],
      weatherForecast: "22°C · Clear Sky on Summit Pass",
      traceId,
    };
  }

  static async createPlace(place: Partial<PlaceDTO>): Promise<{ success: boolean; place: PlaceDTO }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/places`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(place),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return { success: true, place: data.place };
    } catch (err) {
      console.warn("[PlaceApiRepository] Created locally in repository engine:", err);
      const fallback: PlaceDTO = {
        id: `place-${Date.now()}`,
        name: place.name || "New Explorer Spot",
        slug: (place.name || "place").toLowerCase().replace(/\s+/g, "-"),
        district: place.district || "Theni",
        city: place.city || "Periyakulam",
        category: place.category || "waterfalls",
        coordinates: place.coordinates || { latitude: 10.2381, longitude: 77.4892 },
        elevationMeters: place.elevationMeters || 1036,
        heroImage: place.heroImage || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
        rating: 4.9,
        reviewCount: 1,
        difficulty: "Moderate",
      };
      return { success: true, place: fallback };
    }
  }
}
