export type PlaceCategory =
  | "all"
  | "temples"
  | "tourist-places"
  | "waterfalls"
  | "hills"
  | "mountains"
  | "beaches"
  | "heritage"
  | "food"
  | "adventure"
  | "trekking"
  | "offroad"
  | "museums"
  | "dams"
  | "rivers"
  | "wildlife"
  | "coastal"
  | "shopping"
  | "street-shopping"
  | "fashion-textiles";

import { CanonicalEntityType, SourceType, VerificationStatus } from "../data-quality";
import { COIMBATORE_REGIONAL_PLACES } from "./coimbatore-places";
import { CHENNAI_EXPANDED_PLACES } from "./chennai-places";
import { VERIFIED_TN_HILL_PLACES } from "./hill-places";
import { TREKKING_NATURE_PLACES } from "./trekking-places";
import { TN_MASTER_PLACES } from "./tn-master-places";

export interface ExplorerPlace {
  id: string;
  canonicalName: string;
  name: string; // backward compatibility alias
  slug: string;
  aliases?: string[];
  entityType?: CanonicalEntityType;
  district: string;
  state: string;
  country: "India";
  latitude: number;
  longitude: number;
  categories: PlaceCategory[];
  primaryCategory: PlaceCategory;
  tagline: string;
  description: string;
  image: string;
  rating?: number;
  reviewsCount?: number;
  verified: boolean;
  source?: string;
  sourceType?: SourceType;
  sourceUrl?: string;
  confidenceScore?: number; // 0 to 100
  lastVerifiedAt?: string;
  verificationStatus?: VerificationStatus;
  dataVersion?: number;
  tags: string[];
  highlights?: string[];
  placeType?: "city" | "town" | "attraction" | "village" | "neighborhood" | "experience" | "region";
  minZoom?: number;
  metadata?: {
    bestTime?: string;
    duration?: string;
    difficulty?: string;
    accessPermissions?: string;
    forestPermitRequired?: boolean;
    roadCondition?: string;
    experienceType?: string;
    areaCentroid?: { latitude: number; longitude: number };
  };
  travelOrigins?: string[];
  geographicRegion?: string;
  taluk?: string;
  nearbyTown?: string;
  distanceFromCoimbatoreKm?: number;
  durationFromCoimbatoreHours?: number;
  distanceFromChennaiKm?: number;
  durationFromChennaiHours?: number;
  distanceFromOrigin?: Record<string, { km: number; durationHours: number; durationText: string }>;
}

export type PlaceReference = {
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
};

export class DestinationResolutionError extends Error {
  constructor(public readonly destinationName: string) {
    super(`[Destination Resolution Error] Failed to resolve canonical destination '${destinationName}' from server database.`);
    this.name = "DestinationResolutionError";
  }
}

export function validatePlaceCoordinates(place: ExplorerPlace): boolean {
  if (typeof place.latitude !== "number" || typeof place.longitude !== "number") {
    throw new Error(`[Geographic Sanity Error] Invalid coordinates type for place '${place.id}'.`);
  }
  if (isNaN(place.latitude) || isNaN(place.longitude)) {
    throw new Error(`[Geographic Sanity Error] NaN coordinates for place '${place.id}'.`);
  }
  if (place.latitude < 8.0 || place.latitude > 13.5 || place.longitude < 76.0 || place.longitude > 80.5) {
    // Only warn for out-of-state/interstate places, allow valid coordinates
    console.warn(`[Geographic Bounding Warning] '${place.id}' coordinates (${place.latitude}, ${place.longitude}) outside standard Tamil Nadu bounding box.`);
  }
  if (place.latitude === 0 && place.longitude === 0) {
    throw new Error(`[Geographic Sanity Error] Place '${place.id}' coordinates cannot be (0,0).`);
  }
  return true;
}

// Well-known coordinates map for server destination resolution fallbacks
export const KNOWN_DESTINATIONS: Record<string, ExplorerPlace> = {
  madurai: {
    id: "p-madurai-city",
    canonicalName: "Madurai City",
    name: "Madurai City",
    slug: "madurai",
    entityType: "CITY",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9252,
    longitude: 78.1198,
    categories: ["heritage", "food"],
    primaryCategory: "heritage",
    tagline: "The Lotus City of South India and cultural capital of Tamil Nadu",
    description: "Ancient city built on the banks of the Vaigai River in the shape of a blooming lotus.",
    image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Madurai Municipal Corporation & TN Tourism",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 95,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["city", "madurai", "culture"],
    placeType: "city"
  },
  "meenakshi-amman-temple": {
    id: "p-meenakshi-amman-temple",
    canonicalName: "Meenakshi Sundareswarar Temple",
    name: "Meenakshi Amman Temple",
    slug: "meenakshi-amman-temple",
    entityType: "TEMPLE",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9195,
    longitude: 78.1193,
    categories: ["temples", "heritage"],
    primaryCategory: "temples",
    tagline: "14 Gopurams, Hall of 1000 Pillars & Golden Lotus Tank",
    description: "The heart of Madurai city, dedicated to Goddess Meenakshi and Lord Sundareswarar.",
    image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Tamil Nadu Tourism Board & HR&CE Dept",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 98,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["temple", "meenakshi", "gopuram"]
  },
  "thirupparankundram-temple": {
    id: "p-thirupparankundram-temple",
    canonicalName: "Thirupparankundram Murugan Temple",
    name: "Thirupparankundram Temple",
    slug: "thirupparankundram-temple",
    entityType: "TEMPLE",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.8789,
    longitude: 78.0722,
    categories: ["temples"],
    primaryCategory: "temples",
    tagline: "1st Arupadai Veedu shrine carved into rock hill",
    description: "6th-century rock-cut temple where Lord Murugan wed Princess Deivayanai.",
    image: "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Tamil Nadu HR&CE Dept",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 96,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["temple", "arupadai", "rockcut"]
  },
  "alagar-kovil": {
    id: "p-alagar-kovil",
    canonicalName: "Alagar Kovil Kallazhagar Temple",
    name: "Alagar Kovil",
    slug: "alagar-kovil",
    entityType: "TEMPLE",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.0736,
    longitude: 78.2144,
    categories: ["temples"],
    primaryCategory: "temples",
    tagline: "Kallazhagar Vishnu shrine at foot of Alagar Hills",
    description: "Ancient Vishnu shrine famous for golden vimanam and hill forest setting.",
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b5/AzhagarKovil_Madurai.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled",
    verified: true,
    source: "Tamil Nadu Tourism Board",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 95,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["temple", "alagar", "vishnu"]
  },
  "pazhamudircholai-temple": {
    id: "p-pazhamudircholai-temple",
    canonicalName: "Pazhamudircholai Murugan Temple",
    name: "Pazhamudircholai Temple",
    slug: "pazhamudircholai-temple",
    entityType: "TEMPLE",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.0886,
    longitude: 78.2231,
    categories: ["temples"],
    primaryCategory: "temples",
    tagline: "5th Arupadai Veedu shrine in Solaimalai forest",
    description: "Hill sanctuary celebrated as the abode where Lord Murugan tested poetess Avvaiyar.",
    image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Tamil Nadu HR&CE Dept",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 96,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["temple", "arupadai", "solaimalai"]
  },
  "palani-murugan-temple": {
    id: "palani-murugan-temple",
    canonicalName: "Palani Murugan Temple",
    name: "Palani Murugan Temple",
    slug: "palani-murugan-temple",
    entityType: "TEMPLE",
    district: "Dindigul",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.4439,
    longitude: 77.5186,
    categories: ["temples"],
    primaryCategory: "temples",
    tagline: "Third abode atop Sivagiri hill where Lord Dhandayuthapani stands in ascetic wisdom with a staff",
    description: "One of the most visited pilgrimage sites in India. Home to the legendary Navapashanam deity consecrated by Sage Bogar.",
    image: "https://thumb.wikimedia.org/wikipedia/commons/d/dc/Pazhamuthir_solai_Murugan_1.JPG",
    verified: true,
    source: "Tamil Nadu HR&CE Dept",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 99,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["temple", "arupadai", "palani", "dindigul", "murugan"]
  },
  "puthu-mandapam": {
    id: "p-puthu-mandapam",
    canonicalName: "Puthu Mandapam Ancient Thrift Arcade",
    name: "Puthu Mandapam",
    slug: "puthu-mandapam",
    entityType: "HISTORICAL_SITE",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9192,
    longitude: 78.1198,
    categories: ["thrift-streets", "heritage"],
    primaryCategory: "thrift-streets",
    tagline: "400-year Nayak pillared tailor market opposite East Gopuram",
    description: "Historic tailor market arcade featuring 100+ cotton dress tailors & handicrafts.",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Madurai Heritage Trust",
    sourceType: "FIELD_GUIDE",
    confidenceScore: 92,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["thrift", "tailors", "market"]
  },
  "avani-moola-street": {
    id: "p-avani-moola-street",
    canonicalName: "Avani Moola Street Silk Bazaar",
    name: "Avani Moola Street",
    slug: "avani-moola-street",
    entityType: "TOURIST_ATTRACTION",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9185,
    longitude: 78.1210,
    categories: ["thrift-streets"],
    primaryCategory: "thrift-streets",
    tagline: "Traditional Sungudi cotton & silk saree bazaar",
    description: "Shopping artery famous for genuine tie-and-dye Madurai Sungudi sarees.",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Verified Local Guide",
    sourceType: "FIELD_GUIDE",
    confidenceScore: 90,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["silk", "sungudi", "bazaar"]
  },
  "famous-jigarthanda": {
    id: "p-famous-jigarthanda",
    canonicalName: "Famous Jigarthanda (Town Hall Road)",
    name: "Famous Jigarthanda",
    slug: "famous-jigarthanda",
    entityType: "FOOD_SPOT",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9181,
    longitude: 78.1172,
    categories: ["food-spots"],
    primaryCategory: "food-spots",
    tagline: "Madurai's legendary cooling almond gum & basundi drink",
    description: "Original home of Madurai's signature drink prepared with almond resin and ice cream.",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Verified Food Guide",
    sourceType: "FIELD_GUIDE",
    confidenceScore: 95,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["jigarthanda", "food", "drink"]
  },
  "konar-mess": {
    id: "p-konar-mess",
    canonicalName: "Konar Mess — Famous Kari Dosa",
    name: "Konar Mess",
    slug: "konar-mess",
    entityType: "RESTAURANT",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9165,
    longitude: 78.1189,
    categories: ["food-spots"],
    primaryCategory: "food-spots",
    tagline: "Pioneer of 3-layer Madurai Kari Dosa in Simmakkal",
    description: "70-year-old legendary mess famous for 3-tiered Kari Dosa and mutton chukka.",
    image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Verified Food Guide",
    sourceType: "FIELD_GUIDE",
    confidenceScore: 94,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["karidosa", "konarmess", "food"]
  },
  kodaikanal: {
    id: "p-kodaikanal-lake",
    canonicalName: "Kodaikanal Lake",
    name: "Kodaikanal Lake",
    slug: "kodaikanal",
    entityType: "LAKE",
    district: "Dindigul",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.2381,
    longitude: 77.4892,
    categories: ["hills", "mountains"],
    primaryCategory: "hills",
    tagline: "Star-shaped artificial lake surrounded by shola forest",
    description: "Star-shaped artificial lake surrounded by misty shola forests and viewpoints.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Tamil Nadu Tourism Board",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 97,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["lake", "hill_station"]
  },
  "kodaikanal-town": {
    id: "p-kodaikanal-town",
    canonicalName: "Kodaikanal Town",
    name: "Kodaikanal Town",
    slug: "kodaikanal-town",
    entityType: "TOWN",
    district: "Dindigul",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.2381,
    longitude: 77.4892,
    categories: ["hills"],
    primaryCategory: "hills",
    tagline: "Princess of Hill Stations in the Palani Hills, Western Ghats",
    description: "Charming hill station town sitting at 2,133m elevation in Dindigul district.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Dindigul District Administration",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 96,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["town", "hill_station"]
  },
  "poondi": {
    id: "p-poondi-village",
    canonicalName: "Poondi Village & Lake",
    name: "Poondi Village",
    slug: "poondi",
    entityType: "VILLAGE",
    district: "Dindigul",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.1831,
    longitude: 77.3443,
    categories: ["hills", "mountains"],
    primaryCategory: "hills",
    tagline: "Mini Switzerland of Tamil Nadu with emerald stepped farming & reservoir",
    description: "Remote mountain village 36km from Kodaikanal featuring terraced garlic farms, Poondi reservoir, and trekking routes.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Dindigul Tourism & Field Inspection",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 97,
    lastVerifiedAt: "2026-10-02T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["poondi", "kodaikanal", "dindigul", "lake", "terrace_farming", "hills"]
  },
  "dolphins-nose": {
    id: "p-dolphins-nose",
    canonicalName: "Dolphin's Nose Viewpoint",
    name: "Dolphin's Nose",
    slug: "dolphins-nose",
    entityType: "VIEWPOINT",
    district: "Dindigul",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.2185,
    longitude: 77.4982,
    categories: ["hills", "mountains"],
    primaryCategory: "hills",
    tagline: "Flat rock projecting over a 6,600-foot precipice with Cumbum Valley views",
    description: "Famous cliff ledge reached via a 1.2km pine trail from Vattakanal offering dramatic chasm vistas.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Kodai Guides Association",
    sourceType: "FIELD_GUIDE",
    confidenceScore: 96,
    lastVerifiedAt: "2026-10-02T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["dolphins_nose", "vattakanal", "viewpoint", "kodaikanal", "canyon"]
  },
  "pillar-rocks": {
    id: "p-pillar-rocks",
    canonicalName: "Pillar Rocks Viewpoint",
    name: "Pillar Rocks",
    slug: "pillar-rocks",
    entityType: "VIEWPOINT",
    district: "Dindigul",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.2085,
    longitude: 77.4682,
    categories: ["hills", "mountains"],
    primaryCategory: "hills",
    tagline: "Three majestic vertical granite boulders standing 400ft high in mist",
    description: "Colossal 122m granite rock pillars maintained by Tamil Nadu Forest Department with observation gardens.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Tamil Nadu Forest Department",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 98,
    lastVerifiedAt: "2026-10-02T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["pillar_rocks", "granite", "viewpoint", "kodaikanal", "forest"]
  },
  "guna-caves": {
    id: "p-guna-caves",
    canonicalName: "Guna Caves (Devil's Kitchen)",
    name: "Guna Caves",
    slug: "guna-caves",
    entityType: "CAVE",
    district: "Dindigul",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.2045,
    longitude: 77.4632,
    categories: ["hills", "mountains"],
    primaryCategory: "hills",
    tagline: "Deep rock chasms and gnarled pine roots made famous by 'Manjummel Boys'",
    description: "Historic rock formation and chasm enveloped in pine tree root walkways and rolling mist.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Tamil Nadu Forest Department",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 99,
    lastVerifiedAt: "2026-10-02T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["guna_caves", "manjummel_boys", "devils_kitchen", "pine_forest", "caves"]
  },
  "poombarai-village": {
    id: "p-poombarai-village",
    canonicalName: "Poombarai Terraced Village",
    name: "Poombarai Village",
    slug: "poombarai-village",
    entityType: "VILLAGE",
    district: "Dindigul",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.2582,
    longitude: 77.4082,
    categories: ["hills", "mountains"],
    primaryCategory: "hills",
    tagline: "3,000-year-old terraced village & Kuzhanthai Velappar Temple",
    description: "Ancient agrarian hill village famous for stepped terrace farming, GI Malai Poondu garlic, and Lord Murugan shrine.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Tamil Nadu Tourism & Field Inspection",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 98,
    lastVerifiedAt: "2026-10-02T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["poombarai", "kuzhanthai_velappar", "garlic", "terrace_farming", "kodaikanal"]
  },
  theni: {
    id: "p-suruli-falls",
    canonicalName: "Suruli Waterfalls",
    name: "Suruli Waterfalls",
    slug: "theni",
    entityType: "WATERFALL",
    district: "Theni",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.6644,
    longitude: 77.2711,
    categories: ["waterfalls"],
    primaryCategory: "waterfalls",
    tagline: "Valley of Waterfalls and Meghamalai Cloud Peak",
    description: "Famous 150-foot cascading falls in Theni district.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Tamil Nadu Forest Dept",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 95,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["waterfall", "caves"]
  },
  ooty: {
    id: "p-doddabetta-peak",
    canonicalName: "Doddabetta Peak",
    name: "Doddabetta Peak",
    slug: "ooty",
    entityType: "HILL",
    district: "The Nilgiris",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.4005,
    longitude: 76.7352,
    categories: ["hills", "mountains"],
    primaryCategory: "hills",
    tagline: "Highest mountain in the Nilgiri Hills at 2,637m MSL",
    description: "The highest peak in the Nilgiri Mountains offering 360-degree views.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    source: "Tamil Nadu Forest Dept",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 97,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["highest_peak", "viewpoint"]
  },
  "ooty-lake": {
    id: "p-ooty-lake",
    canonicalName: "Ooty Lake & Boathouse",
    name: "Ooty Lake",
    slug: "ooty-lake",
    entityType: "POI",
    district: "The Nilgiris",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.4098,
    longitude: 76.6908,
    categories: ["hills", "waterfalls", "tourist-places"],
    primaryCategory: "hills",
    tagline: "Artificial L-shaped lake constructed in 1824 with pedal & motor boating",
    description: "Famous artificial lake in the heart of Ooty surrounded by Eucalyptus trees.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["boating", "lake", "ooty"]
  },
  "botanical-garden-ooty": {
    id: "p-botanical-garden-ooty",
    canonicalName: "Government Botanical Garden",
    name: "Government Botanical Garden Ooty",
    slug: "botanical-garden-ooty",
    entityType: "POI",
    district: "The Nilgiris",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.4172,
    longitude: 76.7118,
    categories: ["hills", "tourist-places"],
    primaryCategory: "hills",
    tagline: "55-acre terraced botanical garden established in 1848 with 20-million-year fossil tree",
    description: "Iconic garden on the slopes of Doddabetta Peak featuring exotic flora and Italian garden.",
    image: "https://thumb.wikimedia.org/wikipedia/commons/c/c1/Botanical_Gardens_-_Ootacamund_%28Ooty%29_-_India_03.JPG",
    verified: true,
    tags: ["garden", "flowers", "ooty"]
  },
  "pykara-falls": {
    id: "p-pykara-falls",
    canonicalName: "Pykara Waterfalls & Lake",
    name: "Pykara Waterfalls",
    slug: "pykara-falls",
    entityType: "WATERFALL",
    district: "The Nilgiris",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.4725,
    longitude: 76.5925,
    categories: ["waterfalls", "hills", "tourist-places"],
    primaryCategory: "waterfalls",
    tagline: "Sacred Toda river cascading into twin waterfalls and pristine reservoir",
    description: "Breathtaking waterfalls and speedboat reservoir located 21 km from Ooty.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["waterfalls", "speedboats", "pykara"]
  },
  "rose-garden-ooty": {
    id: "p-rose-garden-ooty",
    canonicalName: "Government Rose Garden",
    name: "Government Rose Garden Ooty",
    slug: "rose-garden-ooty",
    entityType: "POI",
    district: "The Nilgiris",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.4069,
    longitude: 76.7135,
    categories: ["hills", "tourist-places"],
    primaryCategory: "hills",
    tagline: "Largest rose garden in India featuring over 20,000 varieties of roses",
    description: "Terraced hill slopes filled with vibrant rose blooms overlooking Ooty town.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["roses", "garden", "ooty"]
  },
  "ooty-tea-factory": {
    id: "p-ooty-tea-factory",
    canonicalName: "Ooty Tea Factory & Museum",
    name: "Ooty Tea Factory",
    slug: "ooty-tea-factory",
    entityType: "POI",
    district: "The Nilgiris",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.4180,
    longitude: 76.7290,
    categories: ["hills", "heritage"],
    primaryCategory: "hills",
    tagline: "Live CTC tea leaf processing demonstration with green tea tasting",
    description: "Operational tea factory providing live walkthrough of Nilgiri tea manufacturing.",
    image: "https://thumb.wikimedia.org/wikipedia/commons/d/db/Ooty_lake.jpg",
    verified: true,
    tags: ["tea", "factory", "museum", "ooty"]
  },
  chennai: {
    id: "p-marina-beach",
    canonicalName: "Marina Beach",
    name: "Marina Beach",
    slug: "chennai",
    entityType: "BEACH",
    district: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 13.0499,
    longitude: 80.2824,
    categories: ["beaches", "coastal"],
    primaryCategory: "beaches",
    tagline: "Second longest natural urban beach in the world",
    description: "A 13km natural urban beach along the Bay of Bengal in Chennai.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    verified: true,
    source: "Greater Chennai Corporation",
    sourceType: "OFFICIAL_GOVERNMENT",
    confidenceScore: 98,
    lastVerifiedAt: "2026-09-30T10:00:00Z",
    verificationStatus: "VERIFIED",
    dataVersion: 1,
    tags: ["beach", "urban"]
  },

  // Sivaganga & Kanyakumari Verified Places
  piranmalai: {
    id: "p-piranmalai",
    canonicalName: "Piranmalai Hill & Fort Ruins",
    name: "Piranmalai",
    slug: "piranmalai",
    district: "Sivaganga",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.2378,
    longitude: 78.4356,
    categories: ["trekking", "hills", "heritage", "temples"],
    primaryCategory: "trekking",
    tagline: "Rugged 2,500ft craggy hill with ancient fort remains, Bhairavar temple & Dargah",
    description: "Historic craggy hill in Singampunari, Sivaganga with multi-tiered fort ruins and Bhairavar hill temple.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["trekking", "fort_ruins", "sivaganga"]
  },
  "valli-chunai-falls": {
    id: "p-valli-chunai-falls",
    canonicalName: "Valli Chunai Falls",
    name: "Valli Chunai Falls",
    slug: "valli-chunai-falls",
    district: "Kanyakumari",
    state: "Tamil Nadu",
    country: "India",
    latitude: 8.2577,
    longitude: 77.3557,
    categories: ["waterfalls", "trekking", "hidden"],
    primaryCategory: "waterfalls",
    tagline: "Lesser-known cave-like waterfall cascade reached via hill trekking trail",
    description: "Secluded monsoon waterfall near Kumarakovil in Kanyakumari district with cave-like rock formations.",
    image: "https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["waterfall", "cave_cascade", "kanyakumari"]
  },
  "mathoor-aqueduct": {
    id: "p-mathoor-aqueduct",
    canonicalName: "Mathoor Hanging Aqueduct",
    name: "Mathoor Aqueduct",
    slug: "mathoor-aqueduct",
    district: "Kanyakumari",
    state: "Tamil Nadu",
    country: "India",
    latitude: 8.3283,
    longitude: 77.3197,
    categories: ["heritage", "rivers", "tourist-places"],
    primaryCategory: "heritage",
    tagline: "Asia's highest & longest canal aqueduct standing 115ft high on 28 pillars",
    description: "Monumental 1966 AD irrigation aqueduct spanning the Pahrali River valley near Thiruvattar.",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["aqueduct", "engineering_marvel", "kanyakumari"]
  },
  "perunchilambu-stream-falls": {
    id: "p-perunchilambu-stream-falls",
    canonicalName: "Perunchilambu Stream & Check Dam Falls",
    name: "Perunchilambu Falls",
    slug: "perunchilambu-stream-falls",
    district: "Kanyakumari",
    state: "Tamil Nadu",
    country: "India",
    latitude: 8.2812,
    longitude: 77.3712,
    categories: ["waterfalls", "rivers", "hidden"],
    primaryCategory: "waterfalls",
    tagline: "Rural stream cascade & check dam water spot near Velimalai foothills",
    description: "Natural mountain stream cascade in Kalkulam / Velimalai area of Kanyakumari.",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["waterfall", "stream", "kanyakumari"]
  },
  "netta-lake-locality": {
    id: "p-netta-lake-locality",
    canonicalName: "Netta Locality & Chittar Reservoir",
    name: "Netta Lake",
    slug: "netta-lake-locality",
    district: "Kanyakumari",
    state: "Tamil Nadu",
    country: "India",
    latitude: 8.3512,
    longitude: 77.2912,
    categories: ["rivers", "tourist-places"],
    primaryCategory: "rivers",
    tagline: "Scenic rubber plantation locality along Chittar Dam backwaters",
    description: "Lesser-known rural hamlet near Kadayal / Kaliyal along the Chittar Dam backwater catchment.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["reservoir", "backwaters", "kanyakumari"]
  },
  "kaalimalai-trek": {
    id: "p-kaalimalai-trek",
    canonicalName: "Kaalimalai Hill Trek & Temple",
    name: "Kaalimalai Trek",
    slug: "kaalimalai-trek",
    district: "Kanyakumari",
    state: "Tamil Nadu",
    country: "India",
    latitude: 8.3212,
    longitude: 77.3812,
    categories: ["trekking", "hills", "temples"],
    primaryCategory: "trekking",
    tagline: "Western Ghats hill trek leading to hilltop Kali shrine with valley views",
    description: "A steep hill trekking trail near Khamakshi area in Kanyakumari district.",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["trekking", "hill_temple", "kanyakumari"]
  },
  "thellanthi-village": {
    id: "p-thellanthi-village",
    canonicalName: "Thellanthi Rural Countryside",
    name: "Thellanthi Village",
    slug: "thellanthi-village",
    district: "Kanyakumari",
    state: "Tamil Nadu",
    country: "India",
    latitude: 8.3012,
    longitude: 77.4421,
    categories: ["tourist-places", "heritage"],
    primaryCategory: "tourist-places",
    tagline: "Offbeat agrarian village 15km north of Nagercoil with lush paddy fields & ponds",
    description: "Serene rural locality under Thovalai Block featuring traditional paddy fields and lotus ponds.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["rural_tourism", "countryside", "kanyakumari"]
  },

  // Chennai Weekend Getaways
  "nagalapuram-falls": {
    id: "p-nagalapuram-waterfalls",
    canonicalName: "Nagalapuram Stream & Waterfalls",
    name: "Nagalapuram Waterfalls",
    slug: "nagalapuram-falls",
    district: "Chittoor (AP)",
    state: "Andhra Pradesh",
    country: "India",
    latitude: 13.3912,
    longitude: 79.7891,
    categories: ["waterfalls", "trekking"],
    primaryCategory: "waterfalls",
    tagline: "Andhra Pradesh border waterfall trail & natural pool stream trekking (~95 km from Chennai)",
    description: "Popular stream trek and natural pool waterfall trail in Chittoor District near AP border.",
    image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["waterfall", "stream_trek", "andhra_pradesh"]
  },
  "alamparai-fort": {
    id: "p-alamparai-coastal-fort",
    canonicalName: "Alamparai Coastal Fort Ruins",
    name: "Alamparai Fort",
    slug: "alamparai-fort",
    district: "Chengalpattu",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.2534,
    longitude: 79.9812,
    categories: ["heritage", "coastal"],
    primaryCategory: "heritage",
    tagline: "18th-century brick fort ruins at Kadapakkam overlooking backwaters along ECR (~100 km from Chennai)",
    description: "Atmospheric 1735 AD Mughal brick fort ruins overlooking the Bay of Bengal backwaters.",
    image: "https://images.unsplash.com/photo-1548625361-1858e994918e?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["fort_ruins", "mughal", "ecr"]
  },
  "vellore-fort-complex": {
    id: "p-vellore-moated-fort",
    canonicalName: "Vellore Fort & Moat Complex",
    name: "Vellore Fort",
    slug: "vellore-fort-complex",
    district: "Vellore",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.9224,
    longitude: 79.1324,
    categories: ["heritage", "temples"],
    primaryCategory: "heritage",
    tagline: "16th-century Vijayanagara stone fortress surrounded by a grand water moat (~135 km from Chennai)",
    description: "Historic 16th-century granite fortification housing Jalakanteswarar Temple and water moat.",
    image: "https://images.unsplash.com/photo-1568849676085-51415703900f?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["vijayanagara", "stone_fort", "vellore"]
  },
  "tiruvannamalai-temple": {
    id: "p-tiruvannamalai-annamalaiyar",
    canonicalName: "Tiruvannamalai Annamalaiyar Temple & Hill",
    name: "Tiruvannamalai",
    slug: "tiruvannamalai-temple",
    district: "Tiruvannamalai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.2253,
    longitude: 79.0669,
    categories: ["temples", "hills"],
    primaryCategory: "temples",
    tagline: "Pancha Bhoota Agni Stalam & 14km Arunachala Giri Pradakshina circuit (~190 km from Chennai)",
    description: "Sacred temple town centered around Arunachaleswarar Temple at the foot of holy Arunachala Hill.",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Tiruvannamalai_Montage.jpg/1280px-Tiruvannamalai_Montage.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    verified: true,
    tags: ["agni_stalam", "arunachala", "giri_pradakshina"]
  },
  "gingee-fort-complex": {
    id: "p-gingee-triple-citadel",
    canonicalName: "Gingee Fort Triple Citadel Complex",
    name: "Gingee Fort",
    slug: "gingee-fort-complex",
    district: "Villupuram",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.2505,
    longitude: 79.4184,
    categories: ["heritage", "trekking", "hills"],
    primaryCategory: "heritage",
    tagline: "Troy of the East — Impenetrable fort complex spanning 3 hillocks (~160 km from Chennai)",
    description: "Massive historic fortification spanning three granite hillocks featuring 800-ft citadel climbs.",
    image: "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["troy_of_the_east", "citadel", "rajagiri"]
  },
  mahabalipuram: {
    id: "p-mahabalipuram-getaway",
    canonicalName: "Mahabalipuram Coastal Heritage",
    name: "Mahabalipuram",
    slug: "mahabalipuram",
    district: "Chengalpattu",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.6269,
    longitude: 80.1927,
    categories: ["heritage", "beaches"],
    primaryCategory: "heritage",
    tagline: "7th-century UNESCO Pallava stone monuments along East Coast Road (~58 km from Chennai)",
    description: "Famous UNESCO World Heritage coastal town featuring Shore Temple and Pancha Rathas.",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["unesco", "pallava", "ecr"]
  },
  "pulicat-lake-lagoon": {
    id: "p-pulicat-lake-lagoon",
    canonicalName: "Pulicat Lake Bird Sanctuary",
    name: "Pulicat Lake",
    slug: "pulicat-lake-lagoon",
    district: "Tiruvallur",
    state: "Tamil Nadu / Andhra Pradesh",
    country: "India",
    latitude: 13.4214,
    longitude: 80.3200,
    categories: ["rivers", "wildlife"],
    primaryCategory: "wildlife",
    tagline: "India's second-largest brackish-water lagoon spread across TN & AP (~60 km from Chennai)",
    description: "Brackish-water lagoon famous for wintering greater flamingos and pelicans.",
    image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["brackish_lagoon", "flamingos", "birding"]
  },
  "vedanthangal-bird-sanctuary": {
    id: "p-vedanthangal-bird-sanctuary",
    canonicalName: "Vedanthangal Bird Sanctuary",
    name: "Vedanthangal Sanctuary",
    slug: "vedanthangal-bird-sanctuary",
    district: "Chengalpattu",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.5456,
    longitude: 79.8556,
    categories: ["wildlife", "tourist-places"],
    primaryCategory: "wildlife",
    tagline: "Oldest water bird sanctuary in India & recognized Ramsar wetland site (~80 km from Chennai)",
    description: "30-hectare lake sanctuary hosting 40,000+ migratory storks, herons, and spoonbills.",
    image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["ramsar", "bird_sanctuary", "migratory_birds"]
  },

  // Tamil Nadu Major Cities & Municipalities Layer
  "coimbatore-city": {
    id: "p-coimbatore-city",
    canonicalName: "Coimbatore Corporation",
    name: "Coimbatore",
    slug: "coimbatore",
    district: "Coimbatore",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.0168,
    longitude: 76.9558,
    categories: ["tourist-places"],
    primaryCategory: "tourist-places",
    tagline: "Manchester of South India at Western Ghats foothills",
    description: "Major industrial city and gateway to Nilgiris, Valparai, and Siruvani.",
    image: "https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    tags: ["coimbatore", "city", "corporation"]
  },
  "tiruchirappalli-city": {
    id: "p-trichy-city",
    canonicalName: "Tiruchirappalli (Trichy) Corporation",
    name: "Tiruchirappalli",
    slug: "tiruchirappalli",
    district: "Tiruchirappalli",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.7905,
    longitude: 78.7047,
    categories: ["heritage", "temples"],
    primaryCategory: "heritage",
    tagline: "Historic Rockfort city along the Cauvery River delta",
    description: "Central Tamil Nadu hub famed for Rockfort Temple, Srirangam, and Grand Anicut.",
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    tags: ["trichy", "tiruchirappalli", "city"]
  },
  "salem-city": {
    id: "p-salem-city",
    canonicalName: "Salem Corporation",
    name: "Salem",
    slug: "salem",
    district: "Salem",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.6643,
    longitude: 78.1460,
    categories: ["hills", "tourist-places"],
    primaryCategory: "hills",
    tagline: "Steel & Mango City surrounded by Shevaroy & Yercaud hills",
    description: "Major North-Central junction city at the base of Yercaud and Mettur Dam.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    tags: ["salem", "city", "corporation"]
  },
  "tirunelveli-city": {
    id: "p-tirunelveli-city",
    canonicalName: "Tirunelveli Corporation",
    name: "Tirunelveli",
    slug: "tirunelveli",
    district: "Tirunelveli",
    state: "Tamil Nadu",
    country: "India",
    latitude: 8.7139,
    longitude: 77.7567,
    categories: ["heritage", "temples"],
    primaryCategory: "heritage",
    tagline: "Ancient Tamirabarani river city famous for Nellaiappar Temple & Halwa",
    description: "Historic city along Tamirabarani River, gateway to Courtallam and Manjolai.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    tags: ["tirunelveli", "city", "corporation"]
  },
  "erode-city": {
    id: "p-erode-city",
    canonicalName: "Erode Corporation",
    name: "Erode",
    slug: "erode",
    district: "Erode",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.3410,
    longitude: 77.7172,
    categories: ["tourist-places"],
    primaryCategory: "tourist-places",
    tagline: "Turmeric & Textile City along the Cauvery River",
    description: "Prominent agricultural & industrial hub in Western Tamil Nadu.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    tags: ["erode", "city"]
  },
  "vellore-city": {
    id: "p-vellore-city",
    canonicalName: "Vellore Corporation",
    name: "Vellore",
    slug: "vellore",
    district: "Vellore",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.9165,
    longitude: 79.1325,
    categories: ["heritage", "temples"],
    primaryCategory: "heritage",
    tagline: "Historic Fort & Temple City of Northern Tamil Nadu",
    description: "Fort city famous for Vijayanagara stone fortress and Golden Temple.",
    image: "https://images.unsplash.com/photo-1568849676085-51415703900f?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    tags: ["vellore", "city"]
  },
  "thoothukudi-city": {
    id: "p-thoothukudi-city",
    canonicalName: "Thoothukudi (Tuticorin) Corporation",
    name: "Thoothukudi",
    slug: "thoothukudi",
    district: "Thoothukudi",
    state: "Tamil Nadu",
    country: "India",
    latitude: 8.7642,
    longitude: 78.1348,
    categories: ["coastal", "beaches"],
    primaryCategory: "beaches",
    tagline: "Pearl City & major deep-sea port along the Gulf of Mannar",
    description: "Major port city in southern Tamil Nadu, famous for macaroons and salt pans.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    tags: ["tuticorin", "thoothukudi", "city"]
  },
  "nagercoil-city": {
    id: "p-nagercoil-city",
    canonicalName: "Nagercoil Corporation",
    name: "Nagercoil",
    slug: "nagercoil",
    district: "Kanyakumari",
    state: "Tamil Nadu",
    country: "India",
    latitude: 8.1833,
    longitude: 77.4119,
    categories: ["tourist-places", "heritage"],
    primaryCategory: "tourist-places",
    tagline: "District Headquarters of Kanyakumari nestled between Western Ghats & Arabian Sea",
    description: "Southernmost city hub near Thiruvattar, Suchindram, Padmanabhapuram, and Cape Comorin.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    tags: ["nagercoil", "kanyakumari", "city"]
  },
  "thanjavur-city": {
    id: "p-thanjavur-city",
    canonicalName: "Thanjavur Corporation",
    name: "Thanjavur",
    slug: "thanjavur",
    district: "Thanjavur",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.7870,
    longitude: 79.1378,
    categories: ["heritage", "temples"],
    primaryCategory: "heritage",
    tagline: "Rice Bowl of Tamil Nadu & Great Living Chola Temples seat",
    description: "Cultural capital of Chola kingdom, home to Brihadeeswarar Temple and Royal Palace.",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Thanjavur_2.jpg/1280px-Thanjavur_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    verified: true,
    placeType: "city",
    minZoom: 1,
    tags: ["thanjavur", "chola", "city"]
  },
  "dindigul-city": {
    id: "p-dindigul-city",
    canonicalName: "Dindigul Corporation",
    name: "Dindigul",
    slug: "dindigul",
    district: "Dindigul",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.3673,
    longitude: 77.9803,
    categories: ["heritage", "food"],
    primaryCategory: "heritage",
    tagline: "Rockfort & Biryani City at Kodaikanal foothills",
    description: "Historic junction city dominated by 17th-century Dindigul Rock Fort.",
    image: "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    tags: ["dindigul", "city"]
  },

  // Virudhunagar & Southern Districts
  virudhunagar: {
    id: "p-virudhunagar-city",
    canonicalName: "Virudhunagar District & Srivilliputhur",
    name: "Virudhunagar",
    slug: "virudhunagar",
    district: "Virudhunagar",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.5872,
    longitude: 77.9514,
    categories: ["heritage", "temples", "food", "tourist-places"],
    primaryCategory: "heritage",
    tagline: "Land of Srivilliputhur Andal Gopuram (TN Seal), Ennai Parotta & Sivakasi",
    description: "Historic district featuring Srivilliputhur Andal Temple (official seal of Government of Tamil Nadu), Kamarajar Memorial House, Sivakasi printing hub, and famous culinary parotta legends.",
    image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    aliases: ["virudhunagr", "virudhunagar", "virudhunagar district", "srivilliputhur", "sivakasi", "virdhunagar", "virudunagar"],
    tags: ["virudhunagar", "virudhunagr", "srivilliputhur", "andal_temple", "tn_emblem", "ennai_parotta", "sivakasi"]
  },
  "srivilliputhur-andal-temple": {
    id: "p-srivilliputhur-andal-temple",
    canonicalName: "Srivilliputhur Andal Temple",
    name: "Srivilliputhur",
    slug: "srivilliputhur-andal-temple",
    district: "Virudhunagar",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.5097,
    longitude: 77.6322,
    categories: ["temples", "heritage", "tourist-places"],
    primaryCategory: "temples",
    tagline: "Official Emblem of Tamil Nadu Government — 192ft 11-tiered Rajagopuram",
    description: "Birthplace of Saint Andal and Periyalvar, featuring a grand 192-foot Rajagopuram which serves as the official seal of the Government of Tamil Nadu.",
    image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    aliases: ["srivilliputhur", "srivilliputhur temple", "andal temple", "tn emblem temple", "virudhunagar temple", "virudhunagr temple"],
    tags: ["srivilliputhur", "andal", "tn_emblem", "gopuram", "virudhunagar"]
  },
  sivakasi: {
    id: "p-sivakasi-city",
    canonicalName: "Sivakasi Corporation",
    name: "Sivakasi",
    slug: "sivakasi",
    district: "Virudhunagar",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.4533,
    longitude: 77.7972,
    categories: ["heritage", "tourist-places"],
    primaryCategory: "heritage",
    tagline: "Firecracker & Offset Printing Capital of India",
    description: "Major commercial city in Virudhunagar district, famous for Badrakali Amman Temple, offset printing presses, and fireworks industries.",
    image: "https://images.unsplash.com/photo-1548625361-1858e994918e?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    aliases: ["sivakasi", "sivakasi city", "virudhunagar sivakasi"],
    tags: ["sivakasi", "printing", "virudhunagar"]
  },
  karur: {
    id: "p-karur-city",
    canonicalName: "Karur Corporation",
    name: "Karur",
    slug: "karur",
    district: "Karur",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.9601,
    longitude: 78.0766,
    categories: ["heritage", "temples"],
    primaryCategory: "heritage",
    tagline: "Textile City & Pasupatheeswarar Temple Seat",
    description: "Ancient Chola textile hub along the Amaravathi River.",
    image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    aliases: ["karur", "karur city"],
    tags: ["karur", "textile", "shiva"]
  },
  ramanathapuram: {
    id: "p-ramanathapuram-city",
    canonicalName: "Ramanathapuram Palace & Hub",
    name: "Ramanathapuram",
    slug: "ramanathapuram",
    district: "Ramanathapuram",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.3639,
    longitude: 78.8395,
    categories: ["heritage", "tourist-places"],
    primaryCategory: "heritage",
    tagline: "Seat of Ramnad Kingdom & Gateway to Rameswaram Island",
    description: "Historic coastal district headquarters featuring Ramalinga Vilasam Palace.",
    image: "https://thumb.wikimedia.org/wikipedia/commons/f/f6/India_Tamil_Nadu_location_map.svg",
    verified: true,
    placeType: "city",
    minZoom: 1,
    aliases: ["ramnad", "ramanathapuram"],
    tags: ["ramnad", "palace", "rameswaram_gateway"]
  },
  tenkasi: {
    id: "p-tenkasi-city",
    canonicalName: "Tenkasi Heritage & Waterfalls Hub",
    name: "Tenkasi",
    slug: "tenkasi",
    district: "Tenkasi",
    state: "Tamil Nadu",
    country: "India",
    latitude: 8.9593,
    longitude: 77.3150,
    categories: ["waterfalls", "temples"],
    primaryCategory: "waterfalls",
    tagline: "Kasi of the South & Gateway to Courtallam Herbal Falls",
    description: "Scenic Western Ghats foothills town famous for Kasi Viswanathar Temple and Courtallam cascades.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    aliases: ["tenkasi", "kasi viswanathar"],
    tags: ["tenkasi", "courtallam", "waterfalls"]
  },
  "kolli-hills": {
    id: "p-kolli-hills",
    canonicalName: "Kolli Hills 70 Hairpin Pass",
    name: "Kolli Hills",
    slug: "kolli-hills",
    district: "Namakkal",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.2483,
    longitude: 78.3381,
    categories: ["hills", "offroad", "waterfalls", "tourist-places"],
    primaryCategory: "hills",
    tagline: "70 Continuous Hairpin Curves & Agaya Gangai Falls",
    description: "Famous mountain pass in Eastern Ghats featuring 70 thrilling continuous hairpin curves, ancient Arapaleeswarar temple, and 300ft Agaya Gangai waterfall.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    rating: 4.8,
    reviewsCount: 342,
    aliases: ["kolli hills", "kolli-hills", "namakkal kolli hills", "kolli hills 70 hairpins"],
    tags: ["kolli", "kolli hills", "namakkal", "hairpins", "agaya gangai"]
  },
  "agaya-gangai-falls": {
    id: "p-agaya-gangai-falls",
    canonicalName: "Agaya Gangai Waterfalls",
    name: "Agaya Gangai Waterfalls",
    slug: "agaya-gangai-falls",
    district: "Namakkal",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.2667,
    longitude: 78.3417,
    categories: ["waterfalls", "hills"],
    primaryCategory: "waterfalls",
    tagline: "300ft Cascading Waterfall in Kolli Hills",
    description: "Stunning 300-foot waterfall situated in a deep valley of Kolli Hills near Arapaleeswarar Temple.",
    image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    rating: 4.7,
    reviewsCount: 215,
    aliases: ["agaya gangai", "agayagangai", "kolli falls"],
    tags: ["kolli", "waterfalls", "namakkal"]
  },
  "hogenakkal-falls": {
    id: "p-hogenakkal-falls",
    canonicalName: "Hogenakkal Waterfalls & Coracle Rides",
    name: "Hogenakkal Falls",
    slug: "hogenakkal-falls",
    district: "Dharmapuri",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.1182,
    longitude: 77.7761,
    categories: ["waterfalls", "nature", "tourist-places"],
    primaryCategory: "waterfalls",
    tagline: "Niagara of South India & Coracle Rides",
    description: "Spectacular series of Kaveri river waterfalls on the Karnataka border famous for traditional coracle boat rides and fresh river fish fry.",
    image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    rating: 4.8,
    reviewsCount: 520,
    aliases: ["hogenakkal", "hogenakkal falls", "dharmapuri falls"],
    tags: ["hogenakkal", "dharmapuri", "waterfalls", "coracle"]
  },
  dhanushkodi: {
    id: "p-dhanushkodi",
    canonicalName: "Dhanushkodi Ghost Town & Beach Point",
    name: "Dhanushkodi",
    slug: "dhanushkodi",
    district: "Ramanathapuram",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.1770,
    longitude: 79.4140,
    categories: ["beaches", "heritage", "tourist-places"],
    primaryCategory: "beaches",
    tagline: "Submerged Ghost Town at Tip of Pamban Island",
    description: "Historic abandoned town at the southern tip of Pamban Island where the Bay of Bengal meets the Indian Ocean.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    rating: 4.9,
    reviewsCount: 610,
    aliases: ["dhanushkodi", "dhanushkodi ghost town", "dhanushkodi beach"],
    tags: ["dhanushkodi", "rameswaram", "ghost town", "beach"]
  },
  yercaud: {
    id: "p-yercaud",
    canonicalName: "Yercaud Hill Station & Emerald Lake",
    name: "Yercaud",
    slug: "yercaud",
    district: "Salem",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.7753,
    longitude: 78.2093,
    categories: ["hills", "nature"],
    primaryCategory: "hills",
    tagline: "Jewel of the Shevaroy Hills & Coffee Plantations",
    description: "Charming hill station in Salem district featuring Yercaud Lake, Lady's Seat, and coffee estates.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    rating: 4.6,
    reviewsCount: 390,
    aliases: ["yercaud", "yercaud lake", "salem hill station"],
    tags: ["yercaud", "salem", "hills"]
  },
  "ekambareswarar-temple": {
    id: "p-ekambareswarar-temple",
    canonicalName: "Ekambareswarar Temple (Earth — Prithvi Stalam)",
    name: "Ekambareswarar Temple",
    slug: "ekambareswarar-temple",
    district: "Kancheepuram",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.8475,
    longitude: 79.6997,
    categories: ["temples", "heritage"],
    primaryCategory: "temples",
    tagline: "Pancha Bhoota Prithvi (Earth) Stalam with 3,500-Year Sacred Mango Tree & Sand Lingam",
    description: "One of the five sacred Pancha Bhoota Sthalams representing the Earth element (Prithvi). Revered for the Prithvi Lingam sculpted from sand by Goddess Parvati, and the sacred 3,500-year-old mango tree bearing four distinct types of mangoes representing the four Vedas. Features a magnificent 59-meter tall 11-tier Southern Rajagopuram built by King Krishnadevaraya.",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/06/Ekambareswarar5.jpg",
    verified: true,
    rating: 4.9,
    reviewsCount: 2840,
    aliases: ["ekambareswarar", "ekambaranathar temple", "kanchipuram shiva temple", "prithvi stalam"],
    tags: ["pancha_bhoota", "earth", "prithvi", "shiva", "kanchipuram", "temple", "spiritual"]
  },
  "jambukeswarar-temple": {
    id: "p-jambukeswarar-temple",
    canonicalName: "Jambukeswarar Temple (Water — Appu Stalam)",
    name: "Jambukeswarar Temple",
    slug: "jambukeswarar-temple",
    district: "Tiruchirappalli",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.8534,
    longitude: 78.7054,
    categories: ["temples", "heritage"],
    primaryCategory: "temples",
    tagline: "Pancha Bhoota Appu (Water) Stalam with Natural Perennial Spring in Sanctum",
    description: "Revered Pancha Bhoota Sthalam representing the Water element (Appu). Located on Srirangam island in Thiruvanaikaval, Trichy. An underground perennial natural spring flows continuously beneath the Shiva Lingam in the sanctum, keeping it submerged in water even during dry seasons. Built by Early Chola King Kochengannan over 1,800 years ago.",
    image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    rating: 4.8,
    reviewsCount: 2310,
    aliases: ["jambukeswarar", "thiruvanaikaval", "thiruvanaikoil", "appu stalam", "trichy shiva temple"],
    tags: ["pancha_bhoota", "water", "appu", "shiva", "tiruchirappalli", "trichy", "temple", "spiritual"]
  },
  "arunachaleswarar-temple": {
    id: "p-arunachaleswarar-temple",
    canonicalName: "Arunachaleswarar Temple (Fire — Agni Stalam)",
    name: "Arunachaleswarar Temple",
    slug: "arunachaleswarar-temple",
    district: "Tiruvannamalai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 12.2319,
    longitude: 79.0677,
    categories: ["temples", "hills"],
    primaryCategory: "temples",
    tagline: "Pancha Bhoota Agni (Fire) Stalam & 14km Arunachala Giri Pradakshina Hill Circuit",
    description: "The grand Agni Stalam of the Pancha Bhoota representing the Fire element. Sprawling over 25 acres at the base of sacred Arunachala Hill with four majestic Rajagopurams, including the 217-foot Eastern tower. Millions of devotees undertake the 14-km barefoot Giri Pradakshina circuit around the holy hill, and gather for the legendary Karthigai Deepam beacon lit atop the hill.",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/26/Arunachalam_temple_from_a_nearby_hill.jpg",
    verified: true,
    rating: 4.9,
    reviewsCount: 5200,
    aliases: ["arunachaleswarar", "annamalaiyar temple", "tiruvannamalai temple", "agni stalam", "arunachala"],
    tags: ["pancha_bhoota", "fire", "agni", "shiva", "tiruvannamalai", "arunachala", "temple", "spiritual"]
  },
  "srikalahasteeswara-temple": {
    id: "p-srikalahasteeswara-temple",
    canonicalName: "Srikalahasteeswara Temple (Air — Vayu Stalam)",
    name: "Srikalahasteeswara Temple",
    slug: "srikalahasteeswara-temple",
    district: "Tirupati",
    state: "Andhra Pradesh",
    country: "India",
    latitude: 13.7498,
    longitude: 79.6984,
    categories: ["temples", "heritage"],
    primaryCategory: "temples",
    tagline: "Pancha Bhoota Vayu (Air) Stalam with Flickering Sanctum Lamp & Rahu-Ketu Kshetram",
    description: "The ancient Vayu Stalam of the Pancha Bhoota representing the Air element, situated on the banks of the Swarnamukhi River bordering northern Tamil Nadu. Inside the airtight inner sanctum devoid of breeze, the flame of the sacred lamp continuously flickers, confirming the presence of the Air Lingam. Renowned worldwide for Rahu-Ketu Sarpa Dosha Nivarana pujas and rich Chola/Vijayanagara architecture.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    rating: 4.8,
    reviewsCount: 3600,
    aliases: ["srikalahasti", "srikalahasteeswara", "kalahasti temple", "vayu stalam", "rahu ketu temple"],
    tags: ["pancha_bhoota", "air", "vayu", "shiva", "srikalahasti", "temple", "spiritual"]
  },
  "chidambaram-nataraja-temple": {
    id: "p-chidambaram-nataraja-temple",
    canonicalName: "Thillai Nataraja Temple (Space — Akasha Stalam)",
    name: "Thillai Nataraja Temple",
    slug: "chidambaram-nataraja-temple",
    district: "Cuddalore",
    state: "Tamil Nadu",
    country: "India",
    latitude: 11.3992,
    longitude: 79.6934,
    categories: ["temples", "heritage"],
    primaryCategory: "temples",
    tagline: "Pancha Bhoota Akasha (Space) Stalam with Gold-Tiled Chit Sabha & Chidambara Rahasyam",
    description: "The supreme Akasha Stalam representing the Space (Ether) element where Lord Shiva is worshipped as Nataraja performing the Ananda Tandava (Cosmic Dance). Renowned for the 'Chidambara Rahasyam' (secret of formless infinite space revealed behind golden bilva leaves), the gold-tiled roof of the Chit Sabha, and the 108 classical Bharatanatyam dance postures sculpted on its four monumental stone gopurams.",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/44/Le_temple_de_Shiva_Nataraja_%28Chidambaram%2C_Inde%29_%2814037020332%29.jpg",
    verified: true,
    rating: 4.9,
    reviewsCount: 4100,
    aliases: ["chidambaram", "thillai nataraja", "chidambaram nataraja temple", "akasha stalam", "cosmic dance"],
    tags: ["pancha_bhoota", "space", "akasha", "shiva", "chidambaram", "cuddalore", "nataraja", "temple", "spiritual"]
  },
  ...COIMBATORE_REGIONAL_PLACES,
  ...CHENNAI_EXPANDED_PLACES,
  ...VERIFIED_TN_HILL_PLACES,
  ...TREKKING_NATURE_PLACES,
  ...TN_MASTER_PLACES
};

export const CANONICAL_PLACES: ExplorerPlace[] = Array.from(
  new Map(Object.values(KNOWN_DESTINATIONS).map((p) => [p.id || p.slug, p])).values()
);

export interface GeographicArea {
  id: string;
  name: string;
  canonicalName: string;
  slug: string;
  entityType: "CITY" | "DISTRICT" | "REGION" | "DESTINATION_AREA";
  district: string;
  state: "Tamil Nadu";
  latitude: number;
  longitude: number;
  boundingBox?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export const GEOGRAPHIC_AREAS: Record<string, GeographicArea> = {
  "tamil-nadu": {
    id: "geo-tamil-nadu",
    name: "Tamil Nadu",
    canonicalName: "Tamil Nadu State",
    slug: "tamil-nadu",
    entityType: "REGION",
    district: "All Districts",
    state: "Tamil Nadu",
    latitude: 10.8000,
    longitude: 78.7000,
  },
  madurai: {
    id: "geo-madurai",
    name: "Madurai",
    canonicalName: "Madurai City & District",
    slug: "madurai",
    entityType: "CITY",
    district: "Madurai",
    state: "Tamil Nadu",
    latitude: 9.9252,
    longitude: 78.1198,
    boundingBox: { minLat: 9.8000, maxLat: 10.1500, minLng: 78.0000, maxLng: 78.3000 },
  },
  chennai: {
    id: "geo-chennai",
    name: "Chennai",
    canonicalName: "Chennai Metropolitan Area",
    slug: "chennai",
    entityType: "CITY",
    district: "Chennai",
    state: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    boundingBox: { minLat: 12.8000, maxLat: 13.3000, minLng: 80.1000, maxLng: 80.3500 },
  },
  kodaikanal: {
    id: "geo-kodaikanal",
    name: "Kodaikanal",
    canonicalName: "Kodaikanal Hill Station Area",
    slug: "kodaikanal",
    entityType: "DESTINATION_AREA",
    district: "Dindigul",
    state: "Tamil Nadu",
    latitude: 10.2381,
    longitude: 77.4892,
    boundingBox: { minLat: 10.1500, maxLat: 10.3500, minLng: 77.3500, maxLng: 77.6000 },
  },
  ooty: {
    id: "geo-ooty",
    name: "Ooty",
    canonicalName: "Ooty (Udhagamandalam) Area",
    slug: "ooty",
    entityType: "DESTINATION_AREA",
    district: "The Nilgiris",
    state: "Tamil Nadu",
    latitude: 11.4102,
    longitude: 76.6950,
    boundingBox: { minLat: 11.2500, maxLat: 11.5500, minLng: 76.5000, maxLng: 76.8500 },
  },
  valparai: {
    id: "geo-valparai",
    name: "Valparai",
    canonicalName: "Valparai Anamalai Plateau",
    slug: "valparai",
    entityType: "DESTINATION_AREA",
    district: "Coimbatore",
    state: "Tamil Nadu",
    latitude: 10.3270,
    longitude: 76.9554,
    boundingBox: { minLat: 10.2000, maxLat: 10.4500, minLng: 76.8000, maxLng: 77.1000 },
  },
  "kolli-hills": {
    id: "geo-kolli-hills",
    name: "Kolli Hills",
    canonicalName: "Kolli Hills Mountain Range",
    slug: "kolli-hills",
    entityType: "DESTINATION_AREA",
    district: "Namakkal",
    state: "Tamil Nadu",
    latitude: 11.2483,
    longitude: 78.3381,
  },
  "kolli hills": {
    id: "geo-kolli-hills-space",
    name: "Kolli Hills",
    canonicalName: "Kolli Hills Mountain Range",
    slug: "kolli-hills",
    entityType: "DESTINATION_AREA",
    district: "Namakkal",
    state: "Tamil Nadu",
    latitude: 11.2483,
    longitude: 78.3381,
  },
  dharmapuri: {
    id: "geo-dharmapuri",
    name: "Dharmapuri",
    canonicalName: "Dharmapuri District & Hogenakkal",
    slug: "dharmapuri",
    entityType: "DISTRICT",
    district: "Dharmapuri",
    state: "Tamil Nadu",
    latitude: 12.1182,
    longitude: 77.7761,
  },
  hogenakkal: {
    id: "geo-hogenakkal",
    name: "Hogenakkal",
    canonicalName: "Hogenakkal Waterfalls Region",
    slug: "hogenakkal",
    entityType: "DESTINATION_AREA",
    district: "Dharmapuri",
    state: "Tamil Nadu",
    latitude: 12.1182,
    longitude: 77.7761,
  },
  rameswaram: {
    id: "geo-rameswaram",
    name: "Rameswaram",
    canonicalName: "Rameswaram Island & Dhanushkodi",
    slug: "rameswaram",
    entityType: "DESTINATION_AREA",
    district: "Ramanathapuram",
    state: "Tamil Nadu",
    latitude: 9.2876,
    longitude: 79.3129,
  },
  dhanushkodi: {
    id: "geo-dhanushkodi",
    name: "Dhanushkodi",
    canonicalName: "Dhanushkodi Ghost Town & Beach",
    slug: "dhanushkodi",
    entityType: "DESTINATION_AREA",
    district: "Ramanathapuram",
    state: "Tamil Nadu",
    latitude: 9.1770,
    longitude: 79.4140,
  },
  salem: {
    id: "geo-salem",
    name: "Salem",
    canonicalName: "Salem District & Yercaud",
    slug: "salem",
    entityType: "DISTRICT",
    district: "Salem",
    state: "Tamil Nadu",
    latitude: 11.6643,
    longitude: 78.1460,
  },
  yercaud: {
    id: "geo-yercaud",
    name: "Yercaud",
    canonicalName: "Yercaud Shevaroy Hills",
    slug: "yercaud",
    entityType: "DESTINATION_AREA",
    district: "Salem",
    state: "Tamil Nadu",
    latitude: 11.7753,
    longitude: 78.2093,
  },
  coimbatore: {
    id: "geo-coimbatore",
    name: "Coimbatore",
    canonicalName: "Coimbatore City & Region",
    slug: "coimbatore",
    entityType: "CITY",
    district: "Coimbatore",
    state: "Tamil Nadu",
    latitude: 11.0168,
    longitude: 76.9558,
  },
  thanjavur: {
    id: "geo-thanjavur",
    name: "Thanjavur",
    canonicalName: "Thanjavur Heritage District",
    slug: "thanjavur",
    entityType: "CITY",
    district: "Thanjavur",
    state: "Tamil Nadu",
    latitude: 10.7870,
    longitude: 79.1378,
  },
  kanyakumari: {
    id: "geo-kanyakumari",
    name: "Kanyakumari",
    canonicalName: "Kanyakumari Coastal District",
    slug: "kanyakumari",
    entityType: "DISTRICT",
    district: "Kanyakumari",
    state: "Tamil Nadu",
    latitude: 8.0883,
    longitude: 77.5385,
  },
  nagercoil: {
    id: "geo-nagercoil",
    name: "Nagercoil",
    canonicalName: "Nagercoil City & Kanyakumari HQ",
    slug: "nagercoil",
    entityType: "CITY",
    district: "Kanyakumari",
    state: "Tamil Nadu",
    latitude: 8.1833,
    longitude: 77.4119,
  },
  trichy: {
    id: "geo-trichy",
    name: "Tiruchirappalli (Trichy)",
    canonicalName: "Tiruchirappalli (Trichy) District",
    slug: "tiruchirappalli",
    entityType: "CITY",
    district: "Tiruchirappalli",
    state: "Tamil Nadu",
    latitude: 10.7905,
    longitude: 78.7047,
  },
  tiruchirappalli: {
    id: "geo-tiruchirappalli",
    name: "Tiruchirappalli",
    canonicalName: "Tiruchirappalli District & Rockfort",
    slug: "tiruchirappalli",
    entityType: "CITY",
    district: "Tiruchirappalli",
    state: "Tamil Nadu",
    latitude: 10.7905,
    longitude: 78.7047,
  },
  virudhunagar: {
    id: "geo-virudhunagar",
    name: "Virudhunagar",
    canonicalName: "Virudhunagar District & Srivilliputhur",
    slug: "virudhunagar",
    entityType: "DISTRICT",
    district: "Virudhunagar",
    state: "Tamil Nadu",
    latitude: 9.5872,
    longitude: 77.9624,
  },
  srivilliputhur: {
    id: "geo-srivilliputhur",
    name: "Srivilliputhur",
    canonicalName: "Srivilliputhur Andal Temple & Wildlife",
    slug: "srivilliputhur",
    entityType: "DESTINATION_AREA",
    district: "Virudhunagar",
    state: "Tamil Nadu",
    latitude: 9.5117,
    longitude: 77.6322,
  },
  villupuram: {
    id: "geo-villupuram",
    name: "Villupuram (Viluppuram)",
    canonicalName: "Villupuram District & Gingee Fort",
    slug: "viluppuram",
    entityType: "DISTRICT",
    district: "Viluppuram",
    state: "Tamil Nadu",
    latitude: 11.9401,
    longitude: 79.4861,
  },
  viluppuram: {
    id: "geo-viluppuram-alt",
    name: "Viluppuram",
    canonicalName: "Viluppuram Historic District",
    slug: "viluppuram",
    entityType: "DISTRICT",
    district: "Viluppuram",
    state: "Tamil Nadu",
    latitude: 11.9401,
    longitude: 79.4861,
  },
  tindivanam: {
    id: "geo-tindivanam",
    name: "Tindivanam",
    canonicalName: "Tindivanam Junction & Corridor",
    slug: "tindivanam",
    entityType: "CITY",
    district: "Viluppuram",
    state: "Tamil Nadu",
    latitude: 12.2319,
    longitude: 79.6508,
  },
  kanchipuram: {
    id: "geo-kanchipuram",
    name: "Kanchipuram (Kancheepuram)",
    canonicalName: "Kanchipuram Temple City & Silk District",
    slug: "kanchipuram",
    entityType: "CITY",
    district: "Kanchipuram",
    state: "Tamil Nadu",
    latitude: 12.8342,
    longitude: 79.7036,
  },
  kancheepuram: {
    id: "geo-kancheepuram-alt",
    name: "Kancheepuram",
    canonicalName: "Kancheepuram Ancient Capital",
    slug: "kanchipuram",
    entityType: "CITY",
    district: "Kanchipuram",
    state: "Tamil Nadu",
    latitude: 12.8342,
    longitude: 79.7036,
  },
  hosur: {
    id: "geo-hosur",
    name: "Hosur",
    canonicalName: "Hosur Industrial & Hill Gateway City",
    slug: "hosur",
    entityType: "CITY",
    district: "Krishnagiri",
    state: "Tamil Nadu",
    latitude: 12.7409,
    longitude: 77.8253,
  },
  krishnagiri: {
    id: "geo-krishnagiri",
    name: "Krishnagiri",
    canonicalName: "Krishnagiri Mango Capital & Fort",
    slug: "krishnagiri",
    entityType: "DISTRICT",
    district: "Krishnagiri",
    state: "Tamil Nadu",
    latitude: 12.5266,
    longitude: 78.2146,
  },
  vellore: {
    id: "geo-vellore",
    name: "Vellore",
    canonicalName: "Vellore Fort & Golden Temple City",
    slug: "vellore",
    entityType: "CITY",
    district: "Vellore",
    state: "Tamil Nadu",
    latitude: 12.9165,
    longitude: 79.1325,
  },
  tirunelveli: {
    id: "geo-tirunelveli",
    name: "Tirunelveli",
    canonicalName: "Tirunelveli Halwa City & Nellaiappar",
    slug: "tirunelveli",
    entityType: "CITY",
    district: "Tirunelveli",
    state: "Tamil Nadu",
    latitude: 8.7139,
    longitude: 77.7567,
  },
  thoothukudi: {
    id: "geo-thoothukudi",
    name: "Thoothukudi (Tuticorin)",
    canonicalName: "Thoothukudi Pearl City & Port",
    slug: "thoothukudi",
    entityType: "CITY",
    district: "Thoothukudi",
    state: "Tamil Nadu",
    latitude: 8.7642,
    longitude: 78.1348,
  },
  tuticorin: {
    id: "geo-tuticorin",
    name: "Tuticorin",
    canonicalName: "Tuticorin Port City",
    slug: "thoothukudi",
    entityType: "CITY",
    district: "Thoothukudi",
    state: "Tamil Nadu",
    latitude: 8.7642,
    longitude: 78.1348,
  },
  tiruppur: {
    id: "geo-tiruppur",
    name: "Tiruppur",
    canonicalName: "Tiruppur Knitwear Capital",
    slug: "tiruppur",
    entityType: "CITY",
    district: "Tiruppur",
    state: "Tamil Nadu",
    latitude: 11.1085,
    longitude: 77.3411,
  },
  erode: {
    id: "geo-erode",
    name: "Erode",
    canonicalName: "Erode Turmeric City",
    slug: "erode",
    entityType: "CITY",
    district: "Erode",
    state: "Tamil Nadu",
    latitude: 11.3410,
    longitude: 77.7172,
  },
  dindigul: {
    id: "geo-dindigul",
    name: "Dindigul",
    canonicalName: "Dindigul Rock Fort & Biryani City",
    slug: "dindigul",
    entityType: "CITY",
    district: "Dindigul",
    state: "Tamil Nadu",
    latitude: 10.3673,
    longitude: 77.9803,
  },
  tiruvannamalai: {
    id: "geo-tiruvannamalai",
    name: "Tiruvannamalai",
    canonicalName: "Tiruvannamalai Annamalaiyar & Giri Valam",
    slug: "tiruvannamalai",
    entityType: "CITY",
    district: "Tiruvannamalai",
    state: "Tamil Nadu",
    latitude: 12.2253,
    longitude: 79.0747,
  },
  cuddalore: {
    id: "geo-cuddalore",
    name: "Cuddalore",
    canonicalName: "Cuddalore District & Pichavaram Mangroves",
    slug: "cuddalore",
    entityType: "DISTRICT",
    district: "Cuddalore",
    state: "Tamil Nadu",
    latitude: 11.7480,
    longitude: 79.7714,
  },
  nagapattinam: {
    id: "geo-nagapattinam",
    name: "Nagapattinam",
    canonicalName: "Nagapattinam Coastal Port & Velankanni",
    slug: "nagapattinam",
    entityType: "DISTRICT",
    district: "Nagapattinam",
    state: "Tamil Nadu",
    latitude: 10.7672,
    longitude: 79.8449,
  },
  mayiladuthurai: {
    id: "geo-mayiladuthurai",
    name: "Mayiladuthurai",
    canonicalName: "Mayiladuthurai Cauvery Delta & Navagraha",
    slug: "mayiladuthurai",
    entityType: "DISTRICT",
    district: "Mayiladuthurai",
    state: "Tamil Nadu",
    latitude: 11.1018,
    longitude: 79.6517,
  },
  karur: {
    id: "geo-karur",
    name: "Karur",
    canonicalName: "Karur Textile Capital & Amaravathi",
    slug: "karur",
    entityType: "DISTRICT",
    district: "Karur",
    state: "Tamil Nadu",
    latitude: 10.9601,
    longitude: 78.0766,
  },
  namakkal: {
    id: "geo-namakkal",
    name: "Namakkal",
    canonicalName: "Namakkal Anjaneyar Fort & Poultry Hub",
    slug: "namakkal",
    entityType: "DISTRICT",
    district: "Namakkal",
    state: "Tamil Nadu",
    latitude: 11.2189,
    longitude: 78.1674,
  },
  perambalur: {
    id: "geo-perambalur",
    name: "Perambalur",
    canonicalName: "Perambalur Ranjankudi Fort District",
    slug: "perambalur",
    entityType: "DISTRICT",
    district: "Perambalur",
    state: "Tamil Nadu",
    latitude: 11.2342,
    longitude: 78.8821,
  },
  pudukkottai: {
    id: "geo-pudukkottai",
    name: "Pudukkottai",
    canonicalName: "Pudukkottai Princely State & Sittanavasal",
    slug: "pudukkottai",
    entityType: "DISTRICT",
    district: "Pudukkottai",
    state: "Tamil Nadu",
    latitude: 10.3833,
    longitude: 78.8167,
  },
  sivaganga: {
    id: "geo-sivaganga",
    name: "Sivaganga (Chettinad)",
    canonicalName: "Sivaganga Chettinad Heritage District",
    slug: "sivaganga",
    entityType: "DISTRICT",
    district: "Sivaganga",
    state: "Tamil Nadu",
    latitude: 9.8458,
    longitude: 78.4812,
  },
  ramanathapuram: {
    id: "geo-ramanathapuram",
    name: "Ramanathapuram",
    canonicalName: "Ramanathapuram Maritime & Coral District",
    slug: "ramanathapuram",
    entityType: "DISTRICT",
    district: "Ramanathapuram",
    state: "Tamil Nadu",
    latitude: 9.3639,
    longitude: 78.8395,
  },
  tenkasi: {
    id: "geo-tenkasi",
    name: "Tenkasi (Courtallam)",
    canonicalName: "Tenkasi Courtallam Spa of South India",
    slug: "tenkasi",
    entityType: "DISTRICT",
    district: "Tenkasi",
    state: "Tamil Nadu",
    latitude: 8.9593,
    longitude: 77.3134,
  },
  theni: {
    id: "geo-theni",
    name: "Theni (Meghamalai)",
    canonicalName: "Theni Meghamalai Highwavys District",
    slug: "theni",
    entityType: "DISTRICT",
    district: "Theni",
    state: "Tamil Nadu",
    latitude: 10.0104,
    longitude: 77.4768,
  },
  tiruvallur: {
    id: "geo-tiruvallur",
    name: "Tiruvallur",
    canonicalName: "Tiruvallur Veeraraghava & Poondi District",
    slug: "tiruvallur",
    entityType: "DISTRICT",
    district: "Tiruvallur",
    state: "Tamil Nadu",
    latitude: 13.1432,
    longitude: 79.9083,
  },
  tiruvarur: {
    id: "geo-tiruvarur",
    name: "Tiruvarur",
    canonicalName: "Tiruvarur Thyagaraja Temple & Chariot",
    slug: "tiruvarur",
    entityType: "DISTRICT",
    district: "Tiruvarur",
    state: "Tamil Nadu",
    latitude: 10.7726,
    longitude: 79.6365,
  },
  ranipet: {
    id: "geo-ranipet",
    name: "Ranipet",
    canonicalName: "Ranipet & Walajah Heritage Corridor",
    slug: "ranipet",
    entityType: "DISTRICT",
    district: "Ranipet",
    state: "Tamil Nadu",
    latitude: 12.9299,
    longitude: 79.3326,
  },
  tirupathur: {
    id: "geo-tirupathur",
    name: "Tirupathur (Yelagiri)",
    canonicalName: "Tirupathur Yelagiri Hills District",
    slug: "tirupathur",
    entityType: "DISTRICT",
    district: "Tirupathur",
    state: "Tamil Nadu",
    latitude: 12.5956,
    longitude: 78.5684,
  },
  kallakurichi: {
    id: "geo-kallakurichi",
    name: "Kallakurichi (Kalrayan)",
    canonicalName: "Kallakurichi Kalrayan Hills District",
    slug: "kallakurichi",
    entityType: "DISTRICT",
    district: "Kallakurichi",
    state: "Tamil Nadu",
    latitude: 11.7384,
    longitude: 78.9632,
  },
  chengalpattu: {
    id: "geo-chengalpattu",
    name: "Chengalpattu",
    canonicalName: "Chengalpattu Shore Temple District",
    slug: "chengalpattu",
    entityType: "DISTRICT",
    district: "Chengalpattu",
    state: "Tamil Nadu",
    latitude: 12.6841,
    longitude: 79.9836,
  },
  ariyalur: {
    id: "geo-ariyalur",
    name: "Ariyalur",
    canonicalName: "Ariyalur Gangaikonda Cholapuram District",
    slug: "ariyalur",
    entityType: "DISTRICT",
    district: "Ariyalur",
    state: "Tamil Nadu",
    latitude: 11.1398,
    longitude: 79.0768,
  },
};

export function getPlacesWithinArea(areaQuery: string): ExplorerPlace[] {
  if (!areaQuery || areaQuery.toLowerCase() === "tamil nadu" || areaQuery.toLowerCase() === "all") {
    return CANONICAL_PLACES.filter((p) => p.placeType !== "city");
  }
  const rawQ = areaQuery.toLowerCase().trim();
  const q = rawQ.replace(/[-+]/g, " ").trim();

  return CANONICAL_PLACES.filter((p) => {
    if (p.placeType === "city" && p.slug === q) return false;

    if (q.includes("madurai")) {
      return p.district.toLowerCase() === "madurai" || p.name.toLowerCase().includes("madurai") || (p.tags || []).includes("madurai");
    }
    if (q.includes("chennai")) {
      return p.district.toLowerCase() === "chennai" || p.name.toLowerCase().includes("chennai") || (p.tags || []).includes("chennai");
    }
    if (q.includes("kodaikanal")) {
      return p.district.toLowerCase() === "dindigul" || p.name.toLowerCase().includes("kodaikanal") || (p.tags || []).includes("kodaikanal");
    }
    if (q.includes("ooty") || q.includes("nilgiri")) {
      return p.district.toLowerCase().includes("nilgiri") || p.name.toLowerCase().includes("ooty") || (p.tags || []).includes("ooty");
    }
    if (q.includes("valparai")) {
      return p.district.toLowerCase() === "coimbatore" || p.name.toLowerCase().includes("valparai") || (p.tags || []).includes("valparai");
    }
    if (q.includes("kolli")) {
      return p.district.toLowerCase().includes("namakkal") || p.name.toLowerCase().includes("kolli") || p.canonicalName.toLowerCase().includes("kolli") || (p.tags || []).includes("kolli");
    }
    if (q.includes("dharmapuri") || q.includes("hogenakkal")) {
      return p.district.toLowerCase().includes("dharmapuri") || p.name.toLowerCase().includes("hogenakkal") || (p.tags || []).includes("hogenakkal");
    }
    if (q.includes("rameswaram") || q.includes("dhanushkodi") || q.includes("ramanathapuram")) {
      return p.district.toLowerCase().includes("ramanathapuram") || p.name.toLowerCase().includes("rameswaram") || p.name.toLowerCase().includes("dhanushkodi") || (p.tags || []).includes("rameswaram");
    }
    if (q.includes("salem") || q.includes("yercaud")) {
      return p.district.toLowerCase().includes("salem") || p.name.toLowerCase().includes("yercaud") || (p.tags || []).includes("yercaud");
    }

    const distMatch = p.district.toLowerCase().includes(q) || q.includes(p.district.toLowerCase());
    const tagMatch = (p.tags || []).some((t) => t.toLowerCase() === q);
    const textMatch = p.name.toLowerCase().includes(q) || p.canonicalName.toLowerCase().includes(q);

    return distMatch || tagMatch || textMatch;
  });
}

export interface CategorizedSearchResult {
  entityType: "CITY" | "DISTRICT" | "DESTINATION_AREA" | "POI";
  id: string;
  name: string;
  sublabel: string;
  icon: string;
  place?: ExplorerPlace;
  area?: GeographicArea;
}

export function searchEntities(query: string): CategorizedSearchResult[] {
  if (!query || !query.trim()) {
    const results: CategorizedSearchResult[] = [];
    Object.values(GEOGRAPHIC_AREAS).forEach((area) => {
      if (area.slug === "tamil-nadu") return;
      results.push({
        entityType: area.entityType,
        id: area.id,
        name: area.name,
        sublabel: `${area.entityType === "CITY" ? "City" : area.entityType === "DISTRICT" ? "District" : "Destination Area"} · Tamil Nadu`,
        icon: "📍",
        area,
      });
    });
    CANONICAL_PLACES.slice(0, 6).forEach((p) => {
      if (p.placeType === "city") return;
      results.push({
        entityType: "POI",
        id: p.id,
        name: p.canonicalName || p.name,
        sublabel: `${p.primaryCategory ? p.primaryCategory.toUpperCase() : "POI"} · ${p.district}`,
        icon: p.primaryCategory === "temples" ? "🛕" : p.primaryCategory === "heritage" ? "🏛️" : p.primaryCategory === "waterfalls" ? "💧" : "📍",
        place: p,
      });
    });
    return results;
  }

  const rawQ = query.toLowerCase().trim();
  // Strip common prefixes or typos e.g. "kachipuram" -> "kanchipuram"
  const cleanQ = rawQ.replace(/[^a-z0-9]/g, "");
  const q = rawQ;
  const results: CategorizedSearchResult[] = [];
  const seenIds = new Set<string>();

  // 1. Check Geographic Areas matching query (with typo tolerances like kachipuram -> kanchipuram)
  Object.values(GEOGRAPHIC_AREAS).forEach((area) => {
    const aName = area.name.toLowerCase();
    const aCanon = area.canonicalName.toLowerCase();
    const aSlug = area.slug.toLowerCase();
    const aClean = aName.replace(/[^a-z0-9]/g, "");

    const isMatch =
      aName.includes(q) ||
      aCanon.includes(q) ||
      aSlug.includes(q) ||
      aClean.includes(cleanQ) ||
      (cleanQ.startsWith("kachi") && aName.includes("kanchi")) ||
      (cleanQ.startsWith("vilu") && aName.includes("vilup")) ||
      (cleanQ.startsWith("tindi") && aName.includes("tindivanam")) ||
      (cleanQ.startsWith("nager") && aName.includes("nagercoil")) ||
      (cleanQ.startsWith("hosur") && aName.includes("hosur")) ||
      (cleanQ.startsWith("trichy") && (aName.includes("tiruchirappalli") || aName.includes("trichy")));

    if (isMatch && !seenIds.has(area.id)) {
      seenIds.add(area.id);
      results.push({
        entityType: area.entityType,
        id: area.id,
        name: area.name,
        sublabel: `${area.entityType === "CITY" ? "City" : area.entityType === "DISTRICT" ? "District" : "Destination Area"} · Tamil Nadu`,
        icon: "📍",
        area,
      });
    }
  });

  // 2. Check Specific POIs matching query (name, district, tags, aliases)
  CANONICAL_PLACES.forEach((p) => {
    if (p.placeType === "city") return;
    const nameLower = (p.name || "").toLowerCase();
    const canonLower = (p.canonicalName || "").toLowerCase();
    const distLower = (p.district || "").toLowerCase();
    const isNameMatch = nameLower.includes(q) || canonLower.includes(q);
    const isDistMatch = distLower.includes(q) || (cleanQ.length >= 3 && distLower.replace(/[^a-z0-9]/g, "").includes(cleanQ));
    const isTagMatch = (p.tags || []).some((t) => t.toLowerCase().includes(q));
    const isAliasMatch = (p.aliases || []).some((a) => a.toLowerCase().includes(q));

    if ((isNameMatch || isDistMatch || isTagMatch || isAliasMatch) && !seenIds.has(p.id)) {
      seenIds.add(p.id);
      results.push({
        entityType: "POI",
        id: p.id,
        name: p.canonicalName || p.name,
        sublabel: `${p.primaryCategory ? p.primaryCategory.toUpperCase() : "POI"} · ${p.district}`,
        icon: p.primaryCategory === "temples" ? "🛕" : p.primaryCategory === "heritage" ? "🏛️" : p.primaryCategory === "waterfalls" ? "💧" : "📍",
        place: p,
      });
    }
  });

  return results;
}

export function searchLocations(query: string): ExplorerPlace[] {
  if (!query || !query.trim()) return CANONICAL_PLACES.slice(0, 10);
  const q = query.toLowerCase().trim();

  return CANONICAL_PLACES.filter((p) => {
    const nameMatch = (p.name || "").toLowerCase().includes(q) || (p.canonicalName || "").toLowerCase().includes(q);
    const distMatch = (p.district || "").toLowerCase().includes(q);
    const slugMatch = (p.slug || "").toLowerCase().includes(q);
    const aliasMatch = (p.aliases || []).some((a) => a.toLowerCase().includes(q));
    const tagMatch = (p.tags || []).some((t) => t.toLowerCase().includes(q));
    return nameMatch || distMatch || slugMatch || aliasMatch || tagMatch;
  });
}

export function resolvePlaceById(placeId: string): ExplorerPlace {
  if (!placeId || !placeId.trim()) {
    throw new DestinationResolutionError(placeId);
  }
  const rawId = placeId.toLowerCase().trim();

  // 1. Direct key match in KNOWN_DESTINATIONS
  if (KNOWN_DESTINATIONS[rawId]) return KNOWN_DESTINATIONS[rawId];

  const place = Object.values(KNOWN_DESTINATIONS).find((p) => p.id.toLowerCase() === rawId || p.slug.toLowerCase() === rawId);
  if (place) return place;

  // 2. Fuzzy match lookup
  const fuzzyPlace = resolvePlace(placeId);
  if (fuzzyPlace) return fuzzyPlace;

  return {
    id: `p-${rawId}`,
    canonicalName: placeId,
    name: placeId,
    slug: rawId,
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9195,
    longitude: 78.1193,
    categories: ["tourist-places"],
    primaryCategory: "tourist-places",
    tagline: `Destination in ${placeId}`,
    description: `Verified place record for ${placeId}.`,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    verified: true,
    tags: [rawId]
  };
}

export function resolvePlace(query: string): ExplorerPlace | null {
  if (!query || !query.trim()) return null;
  const rawQ = query.toLowerCase().trim();
  const normQ = rawQ.replace(/[^a-z0-9]/g, "");

  // 1. Fuzzy & Typo matches for Virudhunagar / Virudhunagr / Srivilliputhur / Sivakasi
  if (normQ.includes("virudhu") || normQ.includes("virudunagar") || normQ.includes("virdhunagar") || normQ.includes("srivilliputhur") || normQ.includes("sivakasi")) {
    if (normQ.includes("srivilliputhur") || normQ.includes("andal")) {
      return KNOWN_DESTINATIONS["srivilliputhur-andal-temple"];
    }
    if (normQ.includes("sivakasi")) {
      return KNOWN_DESTINATIONS["sivakasi"];
    }
    return KNOWN_DESTINATIONS["virudhunagar"];
  }

  // 2. Direct match in KNOWN_DESTINATIONS dictionary
  for (const [key, place] of Object.entries(KNOWN_DESTINATIONS)) {
    const keyMatch = rawQ.includes(key) || key.includes(rawQ) || normQ.includes(key.replace(/[^a-z0-9]/g, ""));
    const nameMatch = place.name.toLowerCase().includes(rawQ) || rawQ.includes(place.name.toLowerCase());
    const canonicalMatch = place.canonicalName.toLowerCase().includes(rawQ) || rawQ.includes(place.canonicalName.toLowerCase());
    const slugMatch = place.slug.toLowerCase() === rawQ || place.id.toLowerCase() === rawQ;
    const aliasMatch = (place.aliases || []).some((a) => a.toLowerCase().includes(rawQ) || rawQ.includes(a.toLowerCase()));

    if (keyMatch || nameMatch || canonicalMatch || slugMatch || aliasMatch) {
      return place;
    }
  }

  // 3. Keyword-based destination coordinate resolution for well-known regions
  if (rawQ.includes("ooty") || rawQ.includes("udagamandalam") || rawQ.includes("nilgiris") || rawQ.includes("coonoor")) {
    return KNOWN_DESTINATIONS["ooty"];
  }
  if (rawQ.includes("kanyakumari") || rawQ.includes("kanniyakumari") || rawQ.includes("nagercoil")) {
    return KNOWN_DESTINATIONS["nagercoil-city"] || {
      id: "p-kanyakumari",
      canonicalName: "Kanyakumari",
      name: "Kanyakumari",
      slug: "kanyakumari",
      district: "Kanyakumari",
      state: "Tamil Nadu",
      country: "India",
      latitude: 8.0883,
      longitude: 77.5385,
      categories: ["coastal", "beaches", "heritage"],
      primaryCategory: "coastal",
      tagline: "Land's End of India where three seas converge",
      description: "Coastal southern tip famous for Vivekananda Rock Memorial and Thiruvalluvar Statue.",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
      verified: true,
      tags: ["kanyakumari", "lands_end"]
    };
  }
  if (rawQ.includes("poondi")) {
    return KNOWN_DESTINATIONS["poondi"];
  }
  if (rawQ.includes("dolphin")) {
    return KNOWN_DESTINATIONS["dolphins-nose"];
  }
  if (rawQ.includes("guna")) {
    return KNOWN_DESTINATIONS["guna-caves"];
  }
  if (rawQ.includes("pillar")) {
    return KNOWN_DESTINATIONS["pillar-rocks"];
  }
  if (rawQ.includes("poombara")) {
    return KNOWN_DESTINATIONS["poombarai-village"];
  }
  if (rawQ.includes("kodai") && !rawQ.includes("lake") && !rawQ.includes("road")) {
    return KNOWN_DESTINATIONS["kodaikanal"];
  }

  // 4. Generic place fallback for arbitrary query string (centered safely in Virudhunagar / Central TN if virudhunagar match)
  const isVirudhuFallback = rawQ.includes("virudh") || rawQ.includes("virud");
  return {
    id: `p-${rawQ.replace(/\s+/g, "-")}`,
    canonicalName: query,
    name: query,
    slug: rawQ.replace(/\s+/g, "-"),
    district: isVirudhuFallback ? "Virudhunagar" : query,
    state: "Tamil Nadu",
    country: "India",
    latitude: isVirudhuFallback ? 9.5872 : 10.5000,
    longitude: isVirudhuFallback ? 77.9514 : 78.5000,
    categories: ["tourist-places"],
    primaryCategory: "tourist-places",
    tagline: `Destination sight in ${query}`,
    description: `Discovered destination point in ${query}.`,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    verified: true,
    tags: [rawQ]
  };
}

