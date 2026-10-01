import { CANONICAL_PLACES, ExplorerPlace } from "@/lib/data/canonical-places";
import { DISTRICT_DETAILS } from "@/lib/data/districts";
import { places, Place } from "@/data/places";

// Dictionary mapping Tamil script names to Canonical English names
const TAMIL_DESTINATION_MAP: Record<string, string> = {
  "கொடைக்கானல்": "Kodaikanal",
  "மதுரை": "Madurai",
  "ஊட்டி": "Ooty",
  "சென்னை": "Chennai",
  "தேனி": "Theni",
  "தஞ்சாவூர்": "Thanjavur",
  "கன்னியாகுமரி": "Kanyakumari",
  "கோயம்புத்தூர்": "Coimbatore",
  "திருச்சி": "Tiruchirappalli",
  "இராமநாதபுரம்": "Rameswaram",
  "ராமேஸ்வரம்": "Rameswaram",
  "புதுச்சேரி": "Pondicherry",
  "பாண்டிச்சேரி": "Pondicherry",
  "மகாபலிபுரம்": "Mahabalipuram",
  "மாமல்லபுரம்": "Mahabalipuram",
  "சேலம்": "Salem",
  "ஏற்காடு": "Yercaud",
  "வால்பாறை": "Valparai",
  "குற்றாலம்": "Courtallam",
  "திருவண்ணாமலை": "Thiruvannamalai",
  "காஞ்சிபுரம்": "Kanchipuram"
};

// Common typos map
const TYPO_DICTIONARY: Record<string, string> = {
  "kodaiknal": "Kodaikanal",
  "kodai": "Kodaikanal",
  "kodaikannal": "Kodaikanal",
  "maduraii": "Madurai",
  "madura": "Madurai",
  "otty": "Ooty",
  "ootiy": "Ooty",
  "nilgiris": "Ooty",
  "nilgiri": "Ooty",
  "chenai": "Chennai",
  "mahabs": "Mahabalipuram",
  "mahabalipuram": "Mahabalipuram",
  "mamallapuram": "Mahabalipuram",
  "pondicherri": "Pondicherry",
  "pondy": "Pondicherry",
  "puducherry": "Pondicherry",
  "rameshwaram": "Rameswaram",
  "rameswaram": "Rameswaram",
  "kanyakumari": "Kanyakumari",
  "kanniyakumari": "Kanyakumari",
  "tanjore": "Thanjavur",
  "thanjavur": "Thanjavur",
  "coimbatore": "Coimbatore",
  "covai": "Coimbatore",
  "kovai": "Coimbatore",
  "trichy": "Tiruchirappalli",
  "tiruchirappalli": "Tiruchirappalli",
  "valparai": "Valparai",
  "yercaud": "Yercaud",
  "courtallam": "Courtallam",
  "kuttalam": "Courtallam",
  "hampi": "Kodaikanal", // If out of state, resolve or suggest TN hill alternative
  "munnar": "Kodaikanal", // Neighboring hill station
  "rishikesh": "Madurai",
  "zanskar": "Madurai"
};

export interface ResolvedDestinationResult {
  success: boolean;
  destination?: {
    id: string;
    canonicalName: string;
    displayName: string;
    district: string;
    latitude: number;
    longitude: number;
    placeType: string;
    isDistrictHQ: boolean;
    knownPois: Place[];
  };
  requestedName: string;
  suggestions?: string[];
}

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function resolveDestination(rawInput: string): ResolvedDestinationResult {
  if (!rawInput || !rawInput.trim()) {
    return {
      success: false,
      requestedName: "(empty)",
      suggestions: ["Kodaikanal", "Madurai", "Ooty", "Thanjavur"]
    };
  }

  const clean = rawInput.trim();
  const lower = clean.toLowerCase();

  // 0. Extract explicit target destination from "to <dest>" patterns if full prompt was passed
  const toMatch = lower.match(/(?:to|in|around)\s+([a-z\s]+?)(?=\s+(starting|from|focused|via|with|for|\d+|$))/i);
  if (toMatch && toMatch[1].trim()) {
    const target = toMatch[1].trim();
    if (target.length > 2 && target !== lower) {
      if (TYPO_DICTIONARY[target]) return buildResolvedResult(TYPO_DICTIONARY[target], clean);
      if (TAMIL_DESTINATION_MAP[target]) return buildResolvedResult(TAMIL_DESTINATION_MAP[target], clean);
      const canonicalTarget = CANONICAL_PLACES.find(p => p.name.toLowerCase() === target || p.canonicalName.toLowerCase() === target || p.slug.toLowerCase() === target);
      if (canonicalTarget) return buildResolvedResult(canonicalTarget.canonicalName, clean);
    }
  }

  // 1. Check Tamil Script Dictionary
  if (TAMIL_DESTINATION_MAP[clean]) {
    return buildResolvedResult(TAMIL_DESTINATION_MAP[clean], clean);
  }

  // 2. Check Typo Dictionary
  if (TYPO_DICTIONARY[lower]) {
    return buildResolvedResult(TYPO_DICTIONARY[lower], clean);
  }

  // 3. Exact match against Canonical Places
  const canonicalMatch = CANONICAL_PLACES.find(
    (p) =>
      p.name.toLowerCase() === lower ||
      p.canonicalName.toLowerCase() === lower ||
      p.slug.toLowerCase() === lower ||
      (p.aliases && p.aliases.some((a) => a.toLowerCase() === lower))
  );

  if (canonicalMatch) {
    return buildResolvedResult(canonicalMatch.canonicalName, clean);
  }

  // 4. Exact match against District database
  const districtMatch = DISTRICT_DETAILS.find(
    (d) => d.name.toLowerCase() === lower || d.slug.toLowerCase() === lower || d.hq.toLowerCase() === lower
  );

  if (districtMatch) {
    return buildResolvedResult(districtMatch.name, clean);
  }

  // 5. Partial substring matching against place names & districts
  const substringMatch = CANONICAL_PLACES.find(
    (p) => p.name.toLowerCase() === lower || p.canonicalName.toLowerCase() === lower
  );

  if (substringMatch) {
    return buildResolvedResult(substringMatch.canonicalName, clean);
  }

  // 6. Fuzzy Levenshtein match across canonical names
  let bestMatch: string | null = null;
  let minDistance = 999;

  const candidateNames = Array.from(
    new Set([
      ...CANONICAL_PLACES.map((p) => p.canonicalName),
      ...DISTRICT_DETAILS.map((d) => d.name)
    ])
  );

  for (const candidate of candidateNames) {
    const dist = levenshtein(lower, candidate.toLowerCase());
    if (dist < minDistance && dist <= 3) {
      minDistance = dist;
      bestMatch = candidate;
    }
  }

  if (bestMatch && minDistance <= 3) {
    return buildResolvedResult(bestMatch, clean);
  }

  // 7. Destination Cannot Be Verified - DO NOT FALLBACK TO MADURAI
  return {
    success: false,
    requestedName: clean,
    suggestions: ["Kodaikanal", "Madurai", "Ooty", "Mahabalipuram", "Kanyakumari", "Thanjavur"]
  };
}

function buildResolvedResult(canonicalName: string, originalInput: string): ResolvedDestinationResult {
  const targetLower = canonicalName.toLowerCase();

  // Known Primary Destinations Override Table
  const KNOWN_DESTINATIONS: Record<string, { name: string; district: string; lat: number; lng: number }> = {
    ooty: { name: "Ooty", district: "Nilgiris", lat: 11.4102, lng: 76.6950 },
    nilgiris: { name: "Ooty", district: "Nilgiris", lat: 11.4102, lng: 76.6950 },
    kodaikanal: { name: "Kodaikanal", district: "Dindigul", lat: 10.2381, lng: 77.4892 },
    madurai: { name: "Madurai", district: "Madurai", lat: 9.9252, lng: 78.1198 },
    kanyakumari: { name: "Kanyakumari", district: "Kanyakumari", lat: 8.0883, lng: 77.5385 },
    kanniyakumari: { name: "Kanyakumari", district: "Kanyakumari", lat: 8.0883, lng: 77.5385 },
    chennai: { name: "Chennai", district: "Chennai", lat: 13.0827, lng: 80.2707 },
    pondicherry: { name: "Pondicherry", district: "Pondicherry", lat: 11.9416, lng: 79.8083 },
    pondy: { name: "Pondicherry", district: "Pondicherry", lat: 11.9416, lng: 79.8083 },
    coimbatore: { name: "Coimbatore", district: "Coimbatore", lat: 11.0168, lng: 76.9558 },
    trichy: { name: "Tiruchirappalli", district: "Tiruchirappalli", lat: 10.7905, lng: 78.7047 },
    thanjavur: { name: "Thanjavur", district: "Thanjavur", lat: 10.7870, lng: 79.1378 },
    rameswaram: { name: "Rameswaram", district: "Ramanathapuram", lat: 9.2876, lng: 79.3129 },
    yercaud: { name: "Yercaud", district: "Salem", lat: 11.7753, lng: 78.2093 },
    valparai: { name: "Valparai", district: "Coimbatore", lat: 10.3270, lng: 76.9554 },
  };

  const knownOverride = KNOWN_DESTINATIONS[targetLower] || KNOWN_DESTINATIONS[originalInput.toLowerCase()];

  const canonicalPlace = knownOverride
    ? undefined
    : CANONICAL_PLACES.find(
        (p) =>
          p.canonicalName.toLowerCase() === targetLower ||
          p.name.toLowerCase() === targetLower ||
          p.slug.toLowerCase() === targetLower
      );

  const district = knownOverride
    ? undefined
    : DISTRICT_DETAILS.find(
        (d) =>
          d.name.toLowerCase() === targetLower ||
          d.slug.toLowerCase() === targetLower ||
          d.hq.toLowerCase() === targetLower
      );

  const finalName = knownOverride?.name || canonicalPlace?.canonicalName || district?.name || canonicalName;
  const distName = knownOverride?.district || canonicalPlace?.district || district?.name || canonicalName;
  const lat = knownOverride?.lat || canonicalPlace?.latitude || district?.coords[0] || 10.2381;
  const lng = knownOverride?.lng || canonicalPlace?.longitude || district?.coords[1] || 77.4892;

  // Retrieve all known POIs matching this destination or district
  const knownPois = places.filter(
    (p) =>
      p.district.toLowerCase() === distName.toLowerCase() ||
      p.name.toLowerCase().includes(canonicalName.toLowerCase()) ||
      p.slug.toLowerCase().includes(canonicalName.toLowerCase().replace(/\s+/g, "-"))
  );

  return {
    success: true,
    requestedName: originalInput,
    destination: {
      id: canonicalPlace?.id || `dest-${finalName.toLowerCase().replace(/\s+/g, "-")}`,
      canonicalName: finalName,
      displayName: finalName,
      district: distName,
      latitude: lat,
      longitude: lng,
      placeType: canonicalPlace?.placeType || (district ? "district" : "city"),
      isDistrictHQ: !!district,
      knownPois: knownPois
    }
  };
}
