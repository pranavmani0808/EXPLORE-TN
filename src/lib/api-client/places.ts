import { PlaceDTO, PlaceExploreCompositeDTO, HomeExperienceDTO, TripExperienceDTO } from "./types";
import { getApiBaseUrl } from "./config";

export class PlaceApiRepository {
  static async fetchPlaces(category?: string): Promise<PlaceDTO[]> {
    try {
      const baseUrl = getApiBaseUrl();
      const url = new URL(`${baseUrl}/api/v1/discover`);
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
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/places/experience/home`);
      if (res.ok) {
        const payload = await res.json();
        if (payload.data && payload.data.hero) {
          return payload.data;
        }
      }
    } catch (err) {
      console.warn("[PlaceApiRepository] BFF Home Experience offline, falling back:", err);
    }
    return {
      hero: {
        eyebrow: "Tamil Nadu Ghats & Coasts",
        title: "Curated trails for the serious explorer.",
        description: "From 70 hairpin bends in Kolli Hills to misty shola forests in Nilgiris.",
        primaryAction: { label: "Explore 14 Districts", href: "/explore" },
        secondaryAction: { label: "View Ghat Routes", href: "/routes" },
        imageAsset: "/assets/hero-ghats.jpg",
      },
      stats: [
        { label: "Verified Places", value: "128+" },
        { label: "Ghat Routes", value: "42" },
        { label: "District Guides", value: "14" },
        { label: "Community Scouts", value: "1,240" },
      ],
      curatedCollections: [
        {
          id: "col-1",
          slug: "hairpin-bends",
          title: "The 70 Hairpin Pass",
          itemCount: 8,
          coverImage: "/assets/cat-hairpin.jpg",
          tagline: "Kolli Hills & Valparai ghat runs",
        },
        {
          id: "col-2",
          slug: "shola-waterfalls",
          title: "High Altitude Waterfalls",
          itemCount: 12,
          coverImage: "/assets/cat-waterfalls.jpg",
          tagline: "Post-monsoon cascades in Nilgiris & Theni",
        },
      ],
    };
  }

  // Experience-Oriented BFF Endpoint 2: Screen-Level Explore Unified Bundle
  static async fetchExploreExperience(filters?: { district?: string; category?: string; query?: string }): Promise<PlaceExploreCompositeDTO> {
    try {
      const baseUrl = getApiBaseUrl();
      const url = new URL(`${baseUrl}/api/v1/places/experience/explore`);
      if (filters?.district) url.searchParams.append("district", filters.district);
      if (filters?.category) url.searchParams.append("category", filters.category);
      if (filters?.query) url.searchParams.append("query", filters.query);

      const res = await fetch(url.toString());
      if (res.ok) {
        const payload = await res.json();
        if (payload.data && payload.data.nodes) {
          return payload.data;
        }
      }
    } catch (err) {
      console.warn("[PlaceApiRepository] BFF Explore Experience offline:", err);
    }

    return {
      nodes: [],
      activeFilters: {
        district: filters?.district || "All Districts",
        category: filters?.category || "All Categories",
        query: filters?.query || "",
      },
      spatialExtent: {
        center: [10.2381, 77.4892],
        zoom: 7,
      },
    };
  }

  // Experience-Oriented BFF Endpoint 3: Screen-Level Single Place Page DTO
  static async fetchTripExperience(slug: string): Promise<TripExperienceDTO | null> {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/places/experience/trip/${slug}`);
      if (res.ok) {
        const payload = await res.json();
        if (payload.data && payload.data.place) {
          return payload.data;
        }
      }
    } catch (err) {
      console.warn(`[PlaceApiRepository] BFF Trip Experience offline for slug ${slug}:`, err);
    }
    return null;
  }
}
