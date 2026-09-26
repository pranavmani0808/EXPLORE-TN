import { PlaceDTO, PlaceExploreCompositeDTO, HomeExperienceDTO, TripExperienceDTO } from "./types";
import { getApiBaseUrl } from "./config";
import { SupabaseDatabaseRepository } from "@/lib/supabase-database";

export class PlaceApiRepository {
  static async fetchPlaces(category?: string, district?: string, query?: string): Promise<any[]> {
    try {
      // Primary memory query via Supabase DB
      const supabasePlaces = await SupabaseDatabaseRepository.getPublicPlaces({
        category,
        district,
        search: query,
      });

      if (supabasePlaces && supabasePlaces.length > 0) {
        return supabasePlaces;
      }

      // HTTP API fallback if running server-side
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
      if (res.ok) {
        const payload = await res.json();
        return payload.data || payload.places || [];
      }
    } catch (err) {
      console.warn("[PlaceApiRepository] Notice fetching places from primary database:", err);
    }
    return [];
  }

  static async fetchPlaceByIdOrSlug(idOrSlug: string): Promise<any | null> {
    try {
      const place = await SupabaseDatabaseRepository.getPlaceBySlug(idOrSlug);
      if (place) return place;

      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/places/${encodeURIComponent(idOrSlug)}`);
      if (res.ok) {
        const payload = await res.json();
        return payload.data || null;
      }
    } catch (err) {
      console.warn(`[PlaceApiRepository] Notice fetching place for ${idOrSlug}:`, err);
    }
    return null;
  }

  static async resolvePlace(query: string): Promise<any | null> {
    try {
      const places = await SupabaseDatabaseRepository.getPublicPlaces({ search: query });
      if (places && places.length > 0) {
        return places[0];
      }

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
      console.warn(`[PlaceApiRepository] Notice resolving place query "${query}":`, err);
    }
    return null;
  }

  static async fetchNearbyPlaces(lat: number, lng: number, radius: number = 50, category?: string): Promise<any[]> {
    try {
      const places = await SupabaseDatabaseRepository.getPublicPlaces({ category });
      if (places && places.length > 0) {
        // Calculate haversine distance filtering
        return places.filter(p => {
          const dLat = (p.latitude - lat) * (Math.PI / 180);
          const dLng = (p.longitude - lng) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat * (Math.PI / 180)) * Math.cos(p.latitude * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distanceKm = 6371 * c;
          return distanceKm <= radius;
        });
      }

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
      console.warn("[PlaceApiRepository] Notice nearby query:", err);
    }
    return [];
  }

  static async searchPlaces(q: string, category?: string): Promise<any[]> {
    try {
      const places = await SupabaseDatabaseRepository.getPublicPlaces({ search: q, category });
      if (places && places.length > 0) {
        return places;
      }

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
      console.warn(`[PlaceApiRepository] Notice searching query "${q}":`, err);
    }
    return [];
  }

  // Experience-Oriented BFF Endpoint 1: Screen-Level Home Bundle
  static async fetchHomeExperience(): Promise<HomeExperienceDTO> {
    try {
      const places = await SupabaseDatabaseRepository.getPublicPlaces();
      const placesCount = places.length > 0 ? `${places.length}+` : "105+";

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
          { label: "Verified Places", value: placesCount },
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
    } catch (err) {
      console.warn("[PlaceApiRepository] Home Experience notice:", err);
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
      curatedCollections: [],
    };
  }

  // Experience-Oriented BFF Endpoint 3: Screen-Level Single Place Page DTO
  static async fetchTripExperience(slug: string): Promise<TripExperienceDTO | null> {
    try {
      const place = await SupabaseDatabaseRepository.getPlaceBySlug(slug);
      if (place) {
        return {
          place: {
            id: place.id,
            canonicalName: place.name,
            name: place.name,
            slug: place.slug,
            district: place.district,
            state: "Tamil Nadu",
            country: "India",
            latitude: place.latitude,
            longitude: place.longitude,
            categories: [place.category.toLowerCase() as any],
            primaryCategory: place.category.toLowerCase() as any,
            tagline: place.tagline || "",
            description: place.description,
            image: place.image_url || "",
            rating: place.rating,
            reviewsCount: place.review_count,
            verified: place.is_verified ?? true,
            tags: place.tags || [],
          },
          nearbyPlaces: [],
          recommendedRoutes: [],
        };
      }
    } catch (err) {
      console.warn(`[PlaceApiRepository] Trip Experience notice for slug ${slug}:`, err);
    }
    return null;
  }
}

