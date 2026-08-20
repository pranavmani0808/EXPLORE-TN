import { PlaceDTO, PlaceExploreCompositeDTO, HomeExperienceDTO, TripExperienceDTO } from "./types";
import { getApiBaseUrl } from "./config";

export class PlaceApiRepository {
  static async fetchPlaces(category?: string, extras?: { district?: string; query?: string }): Promise<PlaceDTO[]> {
    try {
      const baseUrl = getApiBaseUrl();
      const url = new URL(`${baseUrl}/api/v1/places`, baseUrl || (typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:8000"));
      if (category && category !== "All" && category !== "all") {
        url.searchParams.append("category", category);
      }
      if (extras?.district && extras.district !== "all") {
        url.searchParams.append("district", extras.district);
      }
      if (extras?.query) {
        url.searchParams.append("q", extras.query);
      }
      const res = await fetch(`${url.pathname}${url.search}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const payload = await res.json();
      const rows = payload.data || payload.places || [];
      return rows.map((row: Record<string, unknown>) => ({
        id: String(row.id ?? row.slug ?? ""),
        name: String(row.name ?? ""),
        slug: String(row.slug ?? ""),
        district: String(row.district ?? ""),
        city: String(row.district ?? ""),
        category: String(row.category ?? ""),
        coordinates: {
          latitude: Number(row.latitude ?? 0),
          longitude: Number(row.longitude ?? 0),
        },
        elevationMeters: Number(String(row.elevation ?? "0").replace(/[^\d.]/g, "")) || 0,
        heroImage: String(row.image ?? ""),
        rating: Number(row.rating ?? 4.6),
        reviewCount: Number(row.reviewsCount ?? row.reviews ?? 0),
        flowStatus: String(row.status ?? "PUBLISHED"),
        difficulty: String(row.difficulty ?? "Moderate"),
        tagline: row.tagline ? String(row.tagline) : undefined,
        description: row.description ? String(row.description) : undefined,
      }));
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
