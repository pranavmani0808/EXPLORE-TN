import { CANONICAL_PLACES, ExplorerPlace } from "@/lib/data/canonical-places";
import { places, Place } from "@/data/places";
import { getHaversineKm } from "@/lib/planner-engine/poi-ranker";

export interface NearbyRecommendationItem {
  id: string;
  name: string;
  district: string;
  category: string;
  primaryCategory: string;
  latitude: number;
  longitude: number;
  description: string;
  image: string;
  rating: number;
  distanceKm: number;
  detourMinutes?: number;
  openingHours: string;
  entryFee: string;
  tagline: string;
  matchReason: string;
  score: number;
  placeObject?: ExplorerPlace;
}

export type DiscoveryCategory =
  | "all"
  | "food"
  | "waterfalls"
  | "hills"
  | "temples"
  | "beaches"
  | "shopping"
  | "adventure"
  | "family"
  | "cafes"
  | "hotel";

export function findNearbyRecommendations(params: {
  userLat: number;
  userLng: number;
  radiusKm?: number;
  category?: DiscoveryCategory;
  searchQuery?: string;
  destinationName?: string;
}): NearbyRecommendationItem[] {
  const { userLat, userLng, radiusKm = 30, category = "all", searchQuery = "", destinationName = "" } = params;
  const q = searchQuery.toLowerCase().trim();
  const destNameLower = destinationName.toLowerCase();

  // Combine CANONICAL_PLACES and places data
  const rawList: ExplorerPlace[] = [...CANONICAL_PLACES];

  const results: NearbyRecommendationItem[] = [];

  rawList.forEach((p) => {
    const distKm = getHaversineKm(userLat, userLng, p.latitude, p.longitude);

    // Filter by max radius or district match
    const isDistrictMatch = destNameLower && p.district.toLowerCase().includes(destNameLower);
    if (distKm > radiusKm && !isDistrictMatch) return;

    // Filter by category if specified
    const pCat = (p.primaryCategory || "tourist-places").toLowerCase();
    const pTags = (p.tags || []).map((t) => t.toLowerCase());

    if (category !== "all") {
      if (category === "food") {
        const isFood = pCat.includes("food") || pTags.includes("food") || pTags.includes("restaurant") || p.name.toLowerCase().includes("mess") || p.name.toLowerCase().includes("bhavan");
        if (!isFood) return;
      } else if (category === "waterfalls") {
        if (!pCat.includes("waterfall") && !pTags.includes("waterfall")) return;
      } else if (category === "hills") {
        if (!pCat.includes("hill") && !pCat.includes("mountain") && !pTags.includes("peak")) return;
      } else if (category === "temples") {
        if (!pCat.includes("temple") && !pCat.includes("heritage") && !pTags.includes("temple")) return;
      } else if (category === "beaches") {
        if (!pCat.includes("beach") && !pCat.includes("coastal") && !pTags.includes("beach")) return;
      } else if (category === "shopping") {
        if (!pCat.includes("shopping") && !pTags.includes("bazaar") && !pTags.includes("market")) return;
      } else if (category === "adventure") {
        if (!pCat.includes("adventure") && !pCat.includes("offroad") && !pTags.includes("trek")) return;
      }
    }

    // Filter by search query if provided
    if (q) {
      const matchesName = p.name.toLowerCase().includes(q) || p.canonicalName.toLowerCase().includes(q);
      const matchesDistrict = p.district.toLowerCase().includes(q);
      const matchesTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesDesc = (p.description || "").toLowerCase().includes(q) || (p.tagline || "").toLowerCase().includes(q);
      if (!matchesName && !matchesDistrict && !matchesTags && !matchesDesc) return;
    }

    // Calculate Contextual Recommendation Score
    let score = 60; // Base score
    const reasons: string[] = [];

    // Distance scoring: closer places get higher priority
    if (distKm <= 5) {
      score += 35;
      reasons.push("Very close (< 5 km)");
    } else if (distKm <= 15) {
      score += 20;
      reasons.push(`Nearby (${distKm.toFixed(1)} km)`);
    } else {
      score -= Math.round(distKm * 0.5);
    }

    // District / Destination match bonus
    if (isDistrictMatch) {
      score += 25;
      reasons.push(`In ${p.district}`);
    }

    // Time-of-day scoring heuristics
    const currentHour = new Date().getHours();
    if (currentHour >= 7 && currentHour <= 10 && (category === "food" || pCat.includes("food"))) {
      score += 15;
      reasons.push("Ideal for breakfast");
    } else if (currentHour >= 12 && currentHour <= 15 && (category === "food" || pCat.includes("food"))) {
      score += 20;
      reasons.push("Ideal for lunch");
    } else if (currentHour >= 16 && currentHour <= 19 && (pCat.includes("hill") || pCat.includes("beach") || pCat.includes("viewpoint"))) {
      score += 20;
      reasons.push("Great for sunset & evening view");
    }

    // Rating bonus
    if (p.rating) {
      score += Math.round(p.rating * 5);
    }

    const detourMins = Math.round((distKm / 40) * 60);

    results.push({
      id: p.id || p.slug,
      name: p.canonicalName || p.name,
      district: p.district,
      category: p.primaryCategory || "Attraction",
      primaryCategory: p.primaryCategory || "Attraction",
      latitude: p.latitude,
      longitude: p.longitude,
      description: p.description || p.tagline,
      image: p.image || "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
      rating: p.rating || 4.5,
      distanceKm: parseFloat(distKm.toFixed(1)),
      detourMinutes: detourMins,
      openingHours: "08:30 AM - 06:00 PM",
      entryFee: "Free",
      tagline: p.tagline || `Top spot in ${p.district}`,
      matchReason: reasons.join(" · ") || "Recommended spot",
      score,
      placeObject: p,
    });
  });

  return results.sort((a, b) => b.score - a.score);
}

export function parseNaturalLanguageDiscoveryIntent(query: string): {
  category: DiscoveryCategory;
  keywords: string[];
  maxRadiusKm: number;
} {
  const q = query.toLowerCase().trim();
  let category: DiscoveryCategory = "all";
  let maxRadiusKm = 35;

  if (q.includes("food") || q.includes("restaurant") || q.includes("eat") || q.includes("dosa") || q.includes("bhavan") || q.includes("lunch") || q.includes("dinner") || q.includes("biryani")) {
    category = "food";
  } else if (q.includes("waterfall") || q.includes("falls") || q.includes("cascade") || q.includes("stream")) {
    category = "waterfalls";
  } else if (q.includes("hill") || q.includes("viewpoint") || q.includes("peak") || q.includes("mist")) {
    category = "hills";
  } else if (q.includes("temple") || q.includes("heritage") || q.includes("fort") || q.includes("shrine") || q.includes("palace")) {
    category = "temples";
  } else if (q.includes("beach") || q.includes("sea") || q.includes("coast") || q.includes("ocean")) {
    category = "beaches";
  } else if (q.includes("mall") || q.includes("shop") || q.includes("bazaar") || q.includes("saree")) {
    category = "shopping";
  } else if (q.includes("stay") || q.includes("hotel") || q.includes("resort") || q.includes("night") || q.includes("lodge")) {
    category = "hotel";
  } else if (q.includes("adventure") || q.includes("trek") || q.includes("hike") || q.includes("offroad")) {
    category = "adventure";
  }

  if (q.includes("2 hours") || q.includes("nearby") || q.includes("close")) {
    maxRadiusKm = 20;
  } else if (q.includes("50km") || q.includes("far")) {
    maxRadiusKm = 50;
  }

  return {
    category,
    keywords: [q],
    maxRadiusKm,
  };
}
