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
  "valparai": "Valparai",
  "yercaud": "Yercaud",
  "courtallam": "Courtallam",
  "kuttalam": "Courtallam",
  "munnar": "Munnar",
  "parambikulam": "Parambikulam Tiger Reserve",
  "coonoor": "Coonoor",
  "aliyar": "Aliyar Dam",
  "topslip": "Topslip",
  "pollachi": "Pollachi",
  "nelliyampathy": "Nelliyampathy",
  "bhavanisagar": "Bhavanisagar Dam",
  "siruvani": "Siruvani Waterfalls",
  "kotagiri": "Kotagiri",
  "velliangiri": "Velliangiri Hills",
  "anaikatti": "Anaikatti",
  "palamalai": "Palamalai",
  "dhimbam": "Dhimbam",
  "dhimbum": "Dhimbam",
  "rakachi": "Sri Rakachi Amman Kovil Falls",
  "rakachi amman": "Sri Rakachi Amman Kovil Falls",
  "ayyanar kovil falls": "Sri Rakachi Amman Kovil Falls",
  "marina beach": "Marina Beach",
  "mylapore": "Mylapore",
  "kapaleeshwarar": "Kapaleeshwarar Temple",
  "dakshinachitra": "DakshinaChitra",
  "besant nagar beach": "Besant Nagar Beach (Elliot's Beach)",
  "elliots beach": "Besant Nagar Beach (Elliot's Beach)",
  "nungambakkam": "Nungambakkam",
  "theosophical society": "Theosophical Society",
  "adyar": "Adyar",
  "crocodile bank": "Madras Crocodile Bank",
  "vgp": "VGP Universal Kingdom",
  "ecr beach": "ECR Beach",
  "anna nagar": "Anna Nagar",
  "manjolai": "Manjolai Tea Estates & KMTR",
  "pachamalai": "Pachamalai Hills & Top Sengattupatti",
  "pachaimalai": "Pachamalai Hills & Top Sengattupatti",
  "bargur": "Bargur Hills (Anthiyur Range)",
  "bargur hills": "Bargur Hills (Anthiyur Range)",
  "meghamalai": "Megamalai (High Wavy Mountains)",
  "megamalai": "Megamalai (High Wavy Mountains)",
  "pandrimalai": "Pandrimalai Hills",
  "t nagar": "T. Nagar Shopping District",
  "t.nagar": "T. Nagar Shopping District",
  "sowcarpet": "Sowcarpet Wholesale & Ethnic Bazaar",
  "pondy bazaar": "Pondy Bazaar Street & Pedestrian Plaza",
  "ranganathan street": "Ranganathan Street Budget Market",
  "purasawalkam": "Purasawalkam Family Textile & Jewelry Belt",
  "nettukuppam": "Nettukuppam Beach & Broken Pier",
  "sadras": "Sadras Beach & 17th-Century Dutch Fort",
  "covelong": "Covelong Beach (Kovalam Surfing Hub)",
  "kovalam": "Covelong Beach (Kovalam Surfing Hub)",
  "kovalam beach": "Covelong Beach (Kovalam Surfing Hub)",
  "santhome beach": "Santhome Beach",
  "n4 beach": "N4 Beach (Tondiarpet Pier)",
  "n8 beach": "N8 Beach (Kasimedu Coastal Pier)",
  "kasimedu beach": "Kasimedu Beach & Fishing Harbour",
  "ennore beach": "Nettukuppam Beach & Broken Pier",
  "nettukuppam beach": "Nettukuppam Beach & Broken Pier",
  "karikattu kuppam": "Nettukuppam Beach & Broken Pier",
  "bessie": "Besant Nagar Beach (Elliot's Beach)",
  "thiruvanmiyur beach": "Thiruvanmiyur Beach",
  "breezy beach": "Breezy Beach (Valmiki Nagar)",
  "valmiki nagar beach": "Breezy Beach (Valmiki Nagar)",
  "kottivakkam beach": "Kottivakkam Beach",
  "palavakkam beach": "Palavakkam Beach",
  "neelankarai beach": "Neelankarai Beach",
  "akkarai beach": "Akkarai Beach",
  "injambakkam beach": "Injambakkam Beach",
  "uthandi beach": "Uthandi Beach",
  "vgp golden beach": "VGP Golden Beach",
  "muttukadu beach": "Muttukadu Beach & Backwaters",
  "mahabalipuram beach": "Mahabalipuram Beach (Mamallapuram)",
  "mamallapuram beach": "Mahabalipuram Beach (Mamallapuram)",
  "nagalapuram": "Nagalapuram Hills & Waterfalls",
  "tada falls": "Tada Falls (Ubbalamadugu Falls)",
  "ubbalamadugu": "Tada Falls (Ubbalamadugu Falls)",
  "swamimalai yelagiri": "Swamimalai Hills (Yelagiri)",
  "vedanthangal": "Vedanthangal Bird Sanctuary",
  "kailasakona": "Kailasakona Waterfall & Temple",
  "vallimalai": "Vallimalai Hills & Subramanya Temple",
  "alipiri": "Tirumala Alipiri Footpath Trek",
  "tirumala footpath": "Tirumala Alipiri Footpath Trek",
  "gudiyam caves": "Gudiyam Caves (Prehistoric Rock Shelters)",
  "mamandur forest": "Mamandur Forest & Seshachalam Eco-Tourism",
  "tenneri": "Tenneri & Kanchipuram Rural Hill Trails",
  "chembarambakkam": "Chembarambakkam Lake Viewpoint Walkway & Erikarai Road",
  "chembarabakkam": "Chembarambakkam Lake Viewpoint Walkway & Erikarai Road",
  "knk road": "Khader Nawaz Khan Road (KNK Road)",
  "khader nawaz khan road": "Khader Nawaz Khan Road (KNK Road)",
  "knk": "Khader Nawaz Khan Road (KNK Road)",
  "phoenix marketcity": "Phoenix Marketcity Velachery",
  "phoenix marketcity velachery": "Phoenix Marketcity Velachery",
  "phoenix mall": "Phoenix Marketcity Velachery",
  "phoenix velachery": "Phoenix Marketcity Velachery",
  "breakthru": "Breakthru - The Real Escape Room (College Road)",
  "breakthru college road": "Breakthru - The Real Escape Room (College Road)",
  "breakthru escape room": "Breakthru - The Real Escape Room (College Road)",
  "madras international karting arena": "Madras International Karting Arena (MIKA)",
  "mika": "Madras International Karting Arena (MIKA)",
  "mika karting": "Madras International Karting Arena (MIKA)",
  "sriperumbudur": "Sriperumbudur (Heritage, Temples & Industrial Hub)",
  "vgp snow kingdom": "VGP Snow Kingdom (East Coast Road)",
  "vgp snowkingdom": "VGP Snow Kingdom (East Coast Road)",
  "snowkingdom ecr": "VGP Snow Kingdom (East Coast Road)",
  "glow garden mahabalipuram": "Mahab's Glow Garden (Mahabalipuram)",
  "glow garden": "Mahab's Glow Garden (Mahabalipuram)",
  "mahabs glow garden": "Mahab's Glow Garden (Mahabalipuram)",
  "the beach terrace ecr": "The Beach Terrace (ECR Oceanfront Santorini Resto-Bar)",
  "beach terrace": "The Beach Terrace (ECR Oceanfront Santorini Resto-Bar)",
  "go xtreme adventures sholinganallur": "Go Xtreme Paintball & Adventure Zone (Sholinganallur / Uthandi ECR)",
  "go xtreme": "Go Xtreme Paintball & Adventure Zone (Sholinganallur / Uthandi ECR)",
  "go xtreme adventures": "Go Xtreme Paintball & Adventure Zone (Sholinganallur / Uthandi ECR)",
  "eco-park chetpet": "Chetpet Eco-Park & Sport Fishing Lake",
  "chetpet eco park": "Chetpet Eco-Park & Sport Fishing Lake",
  "chetpet lake": "Chetpet Eco-Park & Sport Fishing Lake"
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
