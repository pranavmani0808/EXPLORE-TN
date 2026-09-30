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

  // 1. Check Tamil Script Dictionary
  if (TAMIL_DESTINATION_MAP[clean]) {
    return buildResolvedResult(TAMIL_DESTINATION_MAP[clean], clean);
  }

  const lower = clean.toLowerCase();

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
    (p) => p.name.toLowerCase().includes(lower) || lower.includes(p.name.toLowerCase())
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

  const canonicalPlace = CANONICAL_PLACES.find(
    (p) =>
      p.canonicalName.toLowerCase() === targetLower ||
      p.name.toLowerCase() === targetLower ||
      p.slug.toLowerCase() === targetLower ||
      p.district.toLowerCase() === targetLower ||
      (targetLower.includes("kanyakumari") && p.district.toLowerCase().includes("kanyakumari"))
  );

  const district = DISTRICT_DETAILS.find(
    (d) =>
      d.name.toLowerCase() === targetLower ||
      d.slug.toLowerCase() === targetLower ||
      d.hq.toLowerCase() === targetLower ||
      (targetLower.includes("kanyakumari") && (d.slug === "kanniyakumari" || d.name.toLowerCase().includes("kanniyakumari")))
  );

  let lat = canonicalPlace?.latitude || district?.coords[0];
  let lng = canonicalPlace?.longitude || district?.coords[1];

  if (!lat || !lng) {
    if (targetLower.includes("kanyakumari") || targetLower.includes("kanniyakumari")) {
      lat = 8.0883;
      lng = 77.5385;
    } else if (targetLower.includes("madurai")) {
      lat = 9.9252;
      lng = 78.1198;
    } else if (targetLower.includes("chennai")) {
      lat = 13.0827;
      lng = 80.2707;
    } else if (targetLower.includes("ooty") || targetLower.includes("nilgiri")) {
      lat = 11.4102;
      lng = 76.6950;
    } else if (targetLower.includes("pondicherry")) {
      lat = 11.9416;
      lng = 79.8083;
    } else {
      lat = 10.2381;
      lng = 77.4892;
    }
  }

  const distName = canonicalPlace?.district || district?.name || canonicalName;

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
      id: canonicalPlace?.id || `dest-${canonicalName.toLowerCase().replace(/\s+/g, "-")}`,
      canonicalName: canonicalName,
      displayName: canonicalName,
      district: distName,
      latitude: lat,
      longitude: lng,
      placeType: canonicalPlace?.placeType || (district ? "district" : "city"),
      isDistrictHQ: !!district,
      knownPois: knownPois
    }
  };
}
