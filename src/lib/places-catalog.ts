import { PlaceApiRepository } from "@/lib/api-client/places";
import type { PlaceDTO } from "@/lib/api-client/types";
import {
  CANONICAL_PLACES,
  type ExplorerPlace,
  type PlaceCategory,
} from "@/lib/data/canonical-places";
import heroImg from "@/assets/hero-ghats.jpg";

export type CatalogSource = "api" | "local" | "merged";

export interface CatalogLoadResult {
  places: ExplorerPlace[];
  source: CatalogSource;
  apiCount: number;
}

const CATEGORY_ALIASES: Record<string, PlaceCategory> = {
  temple: "temples",
  temples: "temples",
  waterfall: "waterfalls",
  waterfalls: "waterfalls",
  hill: "hills",
  hills: "hills",
  mountain: "mountains",
  mountains: "mountains",
  beach: "beaches",
  beaches: "beaches",
  coastal: "coastal",
  heritage: "heritage",
  food: "food",
  adventure: "adventure",
  trek: "trekking",
  trekking: "trekking",
  offroad: "offroad",
  museum: "museums",
  museums: "museums",
  dam: "dams",
  dams: "dams",
  river: "rivers",
  rivers: "rivers",
  wildlife: "wildlife",
  "tourist-places": "tourist-places",
};

function asCategory(raw: string): PlaceCategory {
  const key = raw.toLowerCase().replace(/_/g, "-").trim();
  return CATEGORY_ALIASES[key] || CATEGORY_ALIASES[key.replace(/s$/, "")] || "tourist-places";
}

function findCanonical(slug: string, name: string): ExplorerPlace | undefined {
  const s = slug.toLowerCase();
  const n = name.toLowerCase();
  return CANONICAL_PLACES.find(
    (p) =>
      p.slug.toLowerCase() === s ||
      p.id.toLowerCase() === s ||
      p.name.toLowerCase() === n ||
      p.slug.toLowerCase().includes(s) ||
      s.includes(p.slug.toLowerCase()),
  );
}

export function dtoToExplorerPlace(dto: PlaceDTO): ExplorerPlace {
  const canonical = findCanonical(dto.slug, dto.name);
  const category = asCategory(dto.category);
  return {
    id: dto.id || dto.slug,
    canonicalName: dto.name,
    name: dto.name,
    slug: dto.slug,
    district: dto.district,
    state: canonical?.state || "Tamil Nadu",
    country: "India",
    latitude: dto.coordinates.latitude,
    longitude: dto.coordinates.longitude,
    categories: canonical?.categories || [category],
    primaryCategory: canonical?.primaryCategory || category,
    tagline: dto.tagline || canonical?.tagline || dto.description || "",
    description: dto.description || canonical?.description || dto.tagline || "",
    image: dto.heroImage || canonical?.image || heroImg,
    rating: dto.rating || canonical?.rating || 4.6,
    reviewsCount: dto.reviewCount || canonical?.reviewsCount || 0,
    verified: true,
    source: "ExplorerTN API",
    tags: canonical?.tags || [dto.category, dto.district].filter(Boolean),
    highlights: canonical?.highlights,
    aliases: canonical?.aliases,
    metadata: canonical?.metadata,
  };
}

export function filterExplorerPlaces(
  items: ExplorerPlace[],
  filters: { category?: string; district?: string; query?: string },
): ExplorerPlace[] {
  const category = (filters.category || "all").toLowerCase();
  const district = (filters.district || "all").toLowerCase();
  const query = (filters.query || "").toLowerCase().trim();

  return items.filter((place) => {
    const matchesCategory =
      category === "all" ||
      place.primaryCategory === category ||
      place.categories.includes(category as PlaceCategory) ||
      place.categories.some((c) => c.includes(category.replace(/s$/, "")));

    const matchesDistrict = district === "all" || place.district.toLowerCase() === district;

    const hay = [place.name, place.canonicalName, place.district, place.tagline, place.description, ...place.tags]
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || hay.includes(query);

    return matchesCategory && matchesDistrict && matchesQuery;
  });
}

export async function loadExploreCatalog(): Promise<CatalogLoadResult> {
  const apiPlaces = await PlaceApiRepository.fetchPlaces();
  if (apiPlaces.length === 0) {
    return { places: CANONICAL_PLACES, source: "local", apiCount: 0 };
  }

  const mapped = apiPlaces.map(dtoToExplorerPlace);
  const seen = new Set(mapped.map((p) => p.slug.toLowerCase()));
  const extras = CANONICAL_PLACES.filter((p) => !seen.has(p.slug.toLowerCase()));

  return {
    places: extras.length ? [...mapped, ...extras] : mapped,
    source: extras.length ? "merged" : "api",
    apiCount: apiPlaces.length,
  };
}
