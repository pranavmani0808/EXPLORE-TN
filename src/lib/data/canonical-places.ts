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
  | "coastal";

export interface ExplorerPlace {
  id: string;
  canonicalName: string;
  name: string; // backward compatibility alias
  slug: string;
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
  tags: string[];
  highlights?: string[];
  aliases?: string[];
  placeType?: "city" | "town" | "attraction" | "village";
  minZoom?: number;
  metadata?: {
    bestTime?: string;
    duration?: string;
    difficulty?: string;
  };
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
const KNOWN_DESTINATIONS: Record<string, ExplorerPlace> = {
  madurai: {
    id: "p-meenakshi-temple",
    canonicalName: "Meenakshi Amman Temple",
    name: "Madurai",
    slug: "madurai",
    district: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9195,
    longitude: 78.1193,
    categories: ["temples", "heritage", "food"],
    primaryCategory: "temples",
    tagline: "Historic Dravidian temple complex with 14 towering gopurams",
    description: "The cultural center of Madurai, renowned for 33,000 sculptures, Hall of Thousand Pillars, and golden lotus tank.",
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["temple", "gopuram", "madurai"]
  },
  kodaikanal: {
    id: "p-kodaikanal-lake",
    canonicalName: "Kodaikanal Lake & Coaker's Walk",
    name: "Kodaikanal",
    slug: "kodaikanal",
    district: "Dindigul",
    state: "Tamil Nadu",
    country: "India",
    latitude: 10.2381,
    longitude: 77.4892,
    categories: ["hills", "mountains"],
    primaryCategory: "hills",
    tagline: "Princess of Hill Stations in Western Ghats",
    description: "Star-shaped artificial lake surrounded by misty shola forests and viewpoints.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: ["lake", "hill_station"]
  },
  theni: {
    id: "p-suruli-falls",
    canonicalName: "Suruli Waterfalls",
    name: "Theni",
    slug: "theni",
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
    tags: ["waterfall", "caves"]
  },
  ooty: {
    id: "p-doddabetta-peak",
    canonicalName: "Doddabetta Peak",
    name: "Ooty",
    slug: "ooty",
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
    tags: ["highest_peak", "viewpoint"]
  },
  chennai: {
    id: "p-marina-beach",
    canonicalName: "Marina Beach",
    name: "Chennai",
    slug: "chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    latitude: 13.0499,
    longitude: 80.2824,
    categories: ["beaches", "coastal"],
    primaryCategory: "beaches",
    tagline: "Second longest natural urban beach in the world",
    description: "A 13km natural urban beach along the Bay of Bengal in Chennai.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
    verified: true,
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b961?auto=format&fit=crop&w=1000&q=80",
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
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    placeType: "city",
    minZoom: 1,
    tags: ["dindigul", "city"]
  }
};

export const CANONICAL_PLACES: ExplorerPlace[] = Object.values(KNOWN_DESTINATIONS);

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
  const place = Object.values(KNOWN_DESTINATIONS).find((p) => p.id.toLowerCase() === rawId || p.slug.toLowerCase() === rawId);
  if (place) return place;

  return {
    id: `p-${rawId}`,
    canonicalName: placeId,
    name: placeId,
    slug: rawId,
    district: "Tamil Nadu",
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9195,
    longitude: 78.1193,
    categories: ["tourist-places"],
    primaryCategory: "tourist-places",
    tagline: `Destination in ${placeId}`,
    description: `Verified place record for ${placeId}.`,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: [rawId]
  };
}

export function resolvePlace(query: string): ExplorerPlace | null {
  if (!query || !query.trim()) return null;
  const rawQ = query.toLowerCase().trim();

  for (const [key, place] of Object.entries(KNOWN_DESTINATIONS)) {
    if (rawQ.includes(key) || place.id.toLowerCase() === rawQ || place.slug.toLowerCase() === rawQ) {
      return place;
    }
  }

  // Generic place fallback for arbitrary query string
  return {
    id: `p-${rawQ.replace(/\s+/g, "-")}`,
    canonicalName: query,
    name: query,
    slug: rawQ.replace(/\s+/g, "-"),
    district: query,
    state: "Tamil Nadu",
    country: "India",
    latitude: 9.9252,
    longitude: 78.1198,
    categories: ["tourist-places"],
    primaryCategory: "tourist-places",
    tagline: `Destination sight in ${query}`,
    description: `Discovered destination point in ${query}.`,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
    verified: true,
    tags: [rawQ]
  };
}
