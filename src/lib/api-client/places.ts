import { PlaceDTO, PlaceExploreCompositeDTO, HomeExperienceDTO, TripExperienceDTO } from "./types";
import { getApiBaseUrl } from "./config";

export class PlaceApiRepository {
  static async fetchPlaces(category?: string, district?: string, query?: string): Promise<any[]> {
    try {
      const baseUrl = getApiBaseUrl();
      const url = new URL(`${baseUrl}/api/v1/places`);
      if (category && category !== "all" && category !== "All" && category !== "All Categories") {
        url.searchParams.append("category", category);
      }
      if (district && district !== "all" && district !== "All" && district !== "All Districts") {
        url.searchParams.append("district", district);
      }
      if (query) {
        url.searchParams.append("query", query);
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const payload = await res.json();
      return payload.data || payload.places || [];
    } catch (err) {
      console.warn("[PlaceApiRepository] Server API places query failed:", err);
      return [];
    }
  }

  static async fetchPlaceByIdOrSlug(idOrSlug: string): Promise<any | null> {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/places/${encodeURIComponent(idOrSlug)}`);
      if (res.ok) {
        const payload = await res.json();
        return payload.data || null;
      }
    } catch (err) {
      console.warn(`[PlaceApiRepository] Server API place fetch failed for ${idOrSlug}:`, err);
    }
    return null;
  }

  static async resolvePlace(query: string): Promise<any | null> {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/places/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data || null;
      }
    } catch (err) {
      console.warn(`[PlaceApiRepository] Server API place resolve failed for query "${query}":`, err);
    }
    return null;
  }

  static async fetchNearbyPlaces(lat: number, lng: number, radius: number = 50, category?: string): Promise<any[]> {
    try {
      const baseUrl = getApiBaseUrl();
      const url = new URL(`${baseUrl}/api/v1/places/nearby`);
      url.searchParams.append("lat", lat.toString());
      url.searchParams.append("lng", lng.toString());
      url.searchParams.append("radius", radius.toString());
      if (category) url.searchParams.append("category", category);

      const res = await fetch(url.toString());
      if (res.ok) {
        const payload = await res.json();
        return payload.data || [];
      }
    } catch (err) {
      console.warn("[PlaceApiRepository] Server API nearby query failed:", err);
    }
    return [];
  }

  static async searchPlaces(q: string, category?: string): Promise<any[]> {
    try {
      const baseUrl = getApiBaseUrl();
      const url = new URL(`${baseUrl}/api/v1/places/search`);
      url.searchParams.append("q", q);
      if (category) url.searchParams.append("category", category);

      const res = await fetch(url.toString());
      if (res.ok) {
        const payload = await res.json();
        return payload.data || [];
      }
    } catch (err) {
      console.warn(`[PlaceApiRepository] Server API search failed for query "${q}":`, err);
    }
    return [];
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
      console.warn("[PlaceApiRepository] BFF Home Experience offline:", err);
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
        { label: "Verified Places", value: "105+" },
        { label: "Ghat Routes", value: "42" },
        { label: "District Guides", value: "38" },
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
