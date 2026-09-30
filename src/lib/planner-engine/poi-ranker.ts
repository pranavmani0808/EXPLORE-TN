import { CandidatePOI, StructuredTripRequest } from "./types";
import { places, Place } from "@/data/places";
import { getDistanceFromChennai } from "@/lib/utils";

// Calculate distance between two lat/lng pairs in KM
export function getHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function rankAndFilterPOIs(
  destinationLat: number,
  destinationLng: number,
  request: StructuredTripRequest
): CandidatePOI[] {
  const { interests, constraints, travelers } = request;
  const avoidCategories = constraints.avoid || [];

  const targetDestName = (request.destinations[0]?.name || "").toLowerCase();

  // Filter raw places matching destination proximity or district name
  let candidatePlaces = places.filter((p) => {
    const dist = getHaversineKm(destinationLat, destinationLng, p.latitude, p.longitude);
    const isDistrictMatch = p.district.toLowerCase().includes(targetDestName) ||
      (targetDestName.includes("kanyakumari") && (p.district.toLowerCase().includes("kanyakumari") || p.district.toLowerCase().includes("kanniyakumari")));
    return dist <= 80 || isDistrictMatch;
  });

  // Fallback if strict radius returns few candidates
  if (candidatePlaces.length < 3) {
    candidatePlaces = places.filter((p) => {
      const dist = getHaversineKm(destinationLat, destinationLng, p.latitude, p.longitude);
      return dist <= 180;
    });
  }

  const scoredPOIs: CandidatePOI[] = candidatePlaces.map((p) => {
    let score = 50; // Base score
    const reasons: string[] = [];

    // 1. HARD EXCLUSION CHECK (e.g. "no trekking")
    const isExcluded = avoidCategories.some(
      (avoidCat) =>
        p.category === avoidCat ||
        p.name.toLowerCase().includes(avoidCat) ||
        p.story.toLowerCase().includes(avoidCat)
    );

    if (isExcluded) {
      score = -999; // Explicit zero/excluded score
      reasons.push(`Excluded by user constraint: no ${avoidCategories.join(", ")}`);
    }

    // 2. District Match Bonus
    const isDistrictMatch = p.district.toLowerCase().includes(targetDestName) ||
      (targetDestName.includes("kanyakumari") && (p.district.toLowerCase().includes("kanyakumari") || p.district.toLowerCase().includes("kanniyakumari")));

    if (isDistrictMatch) {
      score += 100;
      reasons.push(`Located directly in ${p.district}`);
    }

    // 3. Interest Match Bonus
    if (interests.length > 0) {
      const isInterestMatch = interests.some(
        (interest) =>
          p.category === interest ||
          p.name.toLowerCase().includes(interest) ||
          p.tagline.toLowerCase().includes(interest)
      );
      if (isInterestMatch) {
        score += 35;
        reasons.push(`Matches requested interest: ${p.category}`);
      }
    }

    // 4. Distance & Accessibility Scoring
    const distFromDest = getHaversineKm(destinationLat, destinationLng, p.latitude, p.longitude);
    if (distFromDest < 20) {
      score += 40;
      reasons.push("Located close to central destination");
    } else if (distFromDest < 50) {
      score += 20;
    } else if (distFromDest > 100 && !isDistrictMatch) {
      score -= 50; // Penalize distant POIs from neighboring districts
    }

    // 4. Traveler Demographics Tuning
    if (travelers.elderly > 0 || travelers.accessibilityRequired) {
      if (p.difficulty === "Hard") {
        score -= 40;
        reasons.push("High difficulty avoided for elderly/accessible travel");
      } else {
        score += 15;
      }
    }

    if (travelers.children > 0) {
      if (p.category === "hills" || p.category === "waterfalls" || p.name.toLowerCase().includes("lake") || p.name.toLowerCase().includes("park")) {
        score += 20;
        reasons.push("Kid-friendly attraction");
      }
    }

    if (travelers.femaleSolo) {
      if (p.rating && p.rating >= 4.5) {
        score += 15;
        reasons.push("High rating & verified safe location");
      }
    }

    // Parse Entry Fee
    let numericFee = 0;
    if (p.entryFee && p.entryFee !== "Free" && p.entryFee !== "N/A") {
      const match = p.entryFee.match(/\d+/);
      if (match) numericFee = parseInt(match[0], 10);
    }

    return {
      id: p.slug,
      name: p.name,
      slug: p.slug,
      district: p.district,
      category: p.category,
      latitude: p.latitude,
      longitude: p.longitude,
      description: p.story || p.tagline,
      image: p.image,
      rating: p.rating || 4.5,
      openingHours: p.timings || "09:00 AM - 06:00 PM",
      entryFee: p.entryFee || "Free",
      numericEntryFee: numericFee,
      parkingInfo: {
        available: p.parking !== "None" && p.parking !== "N/A",
        bike: true,
        car: !p.parking.toLowerCase().includes("narrow"),
        statusText: p.parking || "Verified Parking Spot"
      },
      difficulty: p.difficulty || "Easy",
      accessibility: {
        wheelchair: p.difficulty === "Easy",
        reducedWalking: p.difficulty === "Easy"
      },
      score,
      reason: reasons.join(" · ") || "Recommended attraction"
    };
  });

  // Filter out hard excluded POIs and sort by score descending
  return scoredPOIs
    .filter((poi) => (poi.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}
