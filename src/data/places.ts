import { CANONICAL_PLACES, ExplorerPlace } from "@/lib/data/canonical-places";
import waterfallsImg from "@/assets/cat-waterfalls.jpg";
import templesImg from "@/assets/cat-temples.jpg";
import routesImg from "@/assets/cat-routes.jpg";
import foodImg from "@/assets/cat-food.jpg";
import beachesImg from "@/assets/cat-beaches.jpg";
import campingImg from "@/assets/cat-camping.jpg";
import heroImg from "@/assets/hero-ghats.jpg";
import thirupparankundramImg from "@/assets/temples/thirupparankundram.jpg";
import tiruchendurImg from "@/assets/temples/tiruchendur.jpg";
import palaniImg from "@/assets/temples/palani.jpg";
import swamimalaiImg from "@/assets/temples/swamimalai.jpg";
import thiruttaniImg from "@/assets/temples/thiruttani.jpg";
import pazhamudircholaiImg from "@/assets/temples/pazhamudircholai.jpg";

export type CategoryId =
  | "waterfalls"
  | "temples"
  | "food"
  | "hills"
  | "photography"
  | "camping"
  | "offroad"
  | "beaches"
  | "sunrise"
  | "sunset"
  | "hidden"
  | "spiritual"
  | "treks";

export const categories: {
  id: CategoryId;
  label: string;
  image: string;
  blurb: string;
}[] = [
  { id: "spiritual", label: "Arupadai Veedu", image: palaniImg, blurb: "Six sacred abodes of Lord Murugan" },
  { id: "waterfalls", label: "Waterfalls", image: waterfallsImg, blurb: "Monsoon-fed cascades deep in the Ghats" },
  { id: "temples", label: "Temples", image: templesImg, blurb: "Thousand-year gopurams and quiet shrines" },
  { id: "hills", label: "Hill Stations", image: campingImg, blurb: "Cloud forests, tea slopes, cold mornings" },
  { id: "food", label: "Food Trails", image: foodImg, blurb: "Banana-leaf feasts and roadside legends" },
  { id: "beaches", label: "Coastal Explorer", image: beachesImg, blurb: "Empty shores along the Coromandel" },
  { id: "offroad", label: "Scenic & Off-road", image: routesImg, blurb: "Hairpins, ghat roads, forest tracks" },
  { id: "camping", label: "Camping", image: campingImg, blurb: "Above the cloud line, under the stars" },
  { id: "photography", label: "Photography", image: heroImg, blurb: "Golden hour vantage points" },
];

import { getDistanceFromChennai } from "@/lib/utils";

export type Place = {
  slug: string;
  name: string;
  district: string;
  category: CategoryId;
  image: string;
  tagline: string;
  story: string;
  rating?: number;
  reviews?: number;
  distanceFromChennai?: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  bestSeason: string;
  roadCondition: string;
  parking: string;
  entryFee: string;
  timings: string;
  safety: string;
  weather: string;
  tips: string[];
  nearbyFood: string[];
  nearbyFuel: string[];
  x: number;
  y: number;
  trailOrder?: number;
  coords: [number, number];
  latitude: number;
  longitude: number;
};

// Map CANONICAL_PLACES into legacy Place[] format
export const places: Place[] = CANONICAL_PLACES.map((p, idx) => {
  const cat = p.primaryCategory === "temples" ? "spiritual" : (p.primaryCategory as CategoryId);
  const calculatedDistance = getDistanceFromChennai(p.latitude, p.longitude) || undefined;
  return {
    slug: p.slug,
    name: p.name,
    district: p.district,
    category: cat,
    image: p.image,
    tagline: p.tagline,
    story: p.description,
    rating: p.rating,
    reviews: p.reviewsCount,
    distanceFromChennai: calculatedDistance,
    difficulty: "Easy",
    bestSeason: "Year-round",
    roadCondition: "State Highway",
    parking: "Available",
    entryFee: "Free",
    timings: "Open daily",
    safety: "Follow local guidelines",
    weather: "Pleasant",
    tips: p.highlights || [],
    nearbyFood: ["Local Eatery"],
    nearbyFuel: ["Petrol Bunk"],
    x: 50,
    y: 50,
    trailOrder: idx + 1,
    coords: [p.latitude, p.longitude],
    latitude: p.latitude,
    longitude: p.longitude,
  };
});

import { getKodaiPoiBySlug } from "@/lib/data/kodaikanal-pois";

export function getPlace(slug: string): Place | undefined {
  if (!slug) return undefined;
  const q = slug.toLowerCase().trim();
  const normalizedSlug = q.replace(/[^a-z0-9]+/g, "-");

  // 1. Direct match in legacy places array
  const foundInPlaces = places.find(
    (p) =>
      p.slug.toLowerCase() === q ||
      p.slug.toLowerCase() === normalizedSlug ||
      p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalizedSlug
  );
  if (foundInPlaces) return foundInPlaces;

  // 2. Direct match in Arupadai Veedu temples
  const foundArupadai = DEFAULT_ARUPADAI_VEEDU_TEMPLES.find(
    (p) =>
      p.slug.toLowerCase() === q ||
      p.slug.toLowerCase() === normalizedSlug ||
      p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalizedSlug
  );
  if (foundArupadai) return foundArupadai;

  // 2b. Direct match in Pancha Bhoota Sthalams
  const foundPanchaBhoota = DEFAULT_PANCHA_BHOOTA_TEMPLES.find(
    (p) =>
      p.slug.toLowerCase() === q ||
      p.slug.toLowerCase() === normalizedSlug ||
      p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalizedSlug
  );
  if (foundPanchaBhoota) return foundPanchaBhoota;

  // 3. Direct match in Kodai POIs
  const kodaiPoi = getKodaiPoiBySlug(q);
  if (kodaiPoi) {
    return {
      slug: kodaiPoi.slug,
      name: kodaiPoi.name,
      district: "Dindigul",
      category: "hills",
      image: kodaiPoi.images[0] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      tagline: kodaiPoi.shortDescription,
      story: kodaiPoi.description,
      rating: Number((kodaiPoi.popularity / 2).toFixed(1)) || 4.8,
      reviews: 420,
      distanceFromChennai: "520 km",
      difficulty: kodaiPoi.accessibility === "Trek Access Only" ? "Hard" : kodaiPoi.accessibility === "Steep Walk Required" ? "Moderate" : "Easy",
      bestSeason: kodaiPoi.bestTimeToVisit,
      roadCondition: kodaiPoi.roadCondition,
      parking: kodaiPoi.parking.carParking,
      entryFee: kodaiPoi.entryFee,
      timings: kodaiPoi.openingHours,
      safety: kodaiPoi.safetyInformation[0] || "Follow mountain driving & trail safety rules.",
      weather: kodaiPoi.weather,
      tips: [kodaiPoi.bestTimeToVisit, `Elevation: ${kodaiPoi.elevation}m MSL`],
      nearbyFood: kodaiPoi.nearbyFood,
      nearbyFuel: kodaiPoi.nearbyFuel,
      x: 35,
      y: 70,
      trailOrder: 1,
      coords: [kodaiPoi.latitude, kodaiPoi.longitude],
      latitude: kodaiPoi.latitude,
      longitude: kodaiPoi.longitude,
    };
  }

  // 4. Match against CANONICAL_PLACES (Includes all 146 places, 19 beaches, hill stations, waterfalls, etc.)
  const canonical = CANONICAL_PLACES.find(
    (p) =>
      p.slug.toLowerCase() === q ||
      p.slug.toLowerCase() === normalizedSlug ||
      p.id.toLowerCase() === q ||
      p.name.toLowerCase() === q ||
      p.canonicalName.toLowerCase() === q ||
      p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalizedSlug ||
      (p.aliases && p.aliases.some((a) => a.toLowerCase() === q || a.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalizedSlug))
  );

  if (canonical) {
    const cat = canonical.primaryCategory === "temples" ? "spiritual" : (canonical.primaryCategory as CategoryId);
    return {
      slug: canonical.slug,
      name: canonical.canonicalName || canonical.name,
      district: canonical.district,
      category: cat || "hills",
      image: canonical.image || "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
      tagline: canonical.tagline || "",
      story: canonical.description || "",
      rating: canonical.rating || 4.8,
      reviews: canonical.reviewsCount || 120,
      distanceFromChennai: getDistanceFromChennai(canonical.latitude, canonical.longitude) || undefined,
      difficulty: "Easy",
      bestSeason: "Year-round",
      roadCondition: "State Highway",
      parking: "Available",
      entryFee: "Free",
      timings: "Open daily",
      safety: "Follow local guidelines",
      weather: "Pleasant",
      tips: canonical.highlights || [],
      nearbyFood: ["Local Eateries"],
      nearbyFuel: ["Petrol Bunk"],
      x: 50,
      y: 50,
      coords: [canonical.latitude, canonical.longitude],
      latitude: canonical.latitude,
      longitude: canonical.longitude,
    };
  }

  // 5. Ultimate Fallback: Synthesize Place object so no valid place link ever throws 500
  const titleFormatted = q.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    slug: q,
    name: titleFormatted,
    district: "Tamil Nadu",
    category: "hills",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
    tagline: `Scenic destination in Tamil Nadu`,
    story: `${titleFormatted} is a scenic place in Tamil Nadu. Explore local travel guidelines, parking, timings, and regional attractions.`,
    rating: 4.8,
    reviews: 120,
    distanceFromChennai: "Central TN",
    difficulty: "Easy",
    bestSeason: "Year-round",
    roadCondition: "State Highway",
    parking: "Available",
    entryFee: "Free",
    timings: "06:00 AM – 06:00 PM Daily",
    safety: "Follow local travel guidelines",
    weather: "Pleasant",
    tips: ["Carry drinking water", "Respect local culture"],
    nearbyFood: [],
    nearbyFuel: [],
    x: 50,
    y: 50,
    coords: [10.8, 78.7],
    latitude: 10.8,
    longitude: 78.7,
  };
}

export const ARUPADAI_VEEDU_SLUGS = [
  "thiruttani-murugan-temple",
  "swamimalai-murugan-temple",
  "palani-murugan-temple",
  "pazhamudircholai-murugan-temple",
  "thirupparankundram-murugan-temple",
  "tiruchendur-murugan-temple",
];

export const DEFAULT_ARUPADAI_VEEDU_TEMPLES: Place[] = [
  {
    slug: "thiruttani-murugan-temple",
    name: "Thiruttani Murugan Temple",
    district: "Tiruvallur",
    category: "spiritual",
    image: thiruttaniImg,
    tagline: "Fifth abode atop Tanigaimalai with 365 steps representing days of the year, where Lord Murugan found peace.",
    story: "Perched on a serene hill 84km from Chennai, Thiruttani represents peace and spiritual calm after the battle of Tiruchendur.",
    rating: 4.8,
    reviews: 2100,
    distanceFromChennai: "84 km",
    difficulty: "Easy",
    bestSeason: "Year-round",
    roadCondition: "NH 716 Four-lane",
    parking: "Hilltop & Base Parking",
    entryFee: "Free",
    timings: "06:00 AM – 09:00 PM",
    safety: "Motorable road to hilltop available",
    weather: "Pleasant",
    tips: ["Drive up to hilltop parking or climb 365 steps", "Enjoy panoramic view of surrounding hills"],
    nearbyFood: ["South Indian Vegetarian Tiffin"],
    nearbyFuel: ["HPCL Bunk 1km"],
    x: 75,
    y: 20,
    trailOrder: 1,
    coords: [13.1783, 79.6074],
    latitude: 13.1783,
    longitude: 79.6074,
  },
  {
    slug: "swamimalai-murugan-temple",
    name: "Swamimalai Murugan Temple",
    district: "Thanjavur",
    category: "spiritual",
    image: swamimalaiImg,
    tagline: "Fourth abode where Lord Murugan expounded the supreme Pranava Mantra (Om) to Lord Shiva.",
    story: "Built on an artificial hillock with 60 steps representing the 60 Tamil years, Swamimalai is renowned for its bronze icon casting heritage.",
    rating: 4.8,
    reviews: 1850,
    distanceFromChennai: "290 km",
    difficulty: "Easy",
    bestSeason: "October to March",
    roadCondition: "Kumbakonam Highway",
    parking: "Temple Car Street Parking",
    entryFee: "Free",
    timings: "06:00 AM – 01:00 PM, 04:00 PM – 09:00 PM",
    safety: "Well maintained stair access",
    weather: "Warm River Basin",
    tips: ["Explore traditional bronze handicraft workshops nearby", "Climb 60 Tamil Year steps"],
    nearbyFood: ["Degree Coffee Shops", "Kumbakonam Filter Coffee"],
    nearbyFuel: ["IOCL Bunk 2km"],
    x: 65,
    y: 45,
    trailOrder: 2,
    coords: [10.9572, 79.3242],
    latitude: 10.9572,
    longitude: 79.3242,
  },
  {
    slug: "palani-murugan-temple",
    name: "Palani Murugan Temple",
    district: "Dindigul",
    category: "spiritual",
    image: palaniImg,
    tagline: "Third abode atop Sivagiri hill where Lord Dhandayuthapani stands in ascetic wisdom with a staff.",
    story: "One of the most visited pilgrimage sites in India. Home to the legendary Navapashanam deity consecrated by Sage Bogar.",
    rating: 4.9,
    reviews: 4800,
    distanceFromChennai: "485 km",
    difficulty: "Moderate",
    bestSeason: "September to March",
    roadCondition: "NH 83 Highway",
    parking: "Hill Base Multi-level Parking",
    entryFee: "Free (Ropeway/Winch nominal)",
    timings: "06:00 AM – 08:00 PM",
    safety: "Ropeway and funicular winch available for elderly",
    weather: "Cool Hill Breeze",
    tips: ["Take the Panchamirtham prasad home", "Ride the scenic hill funicular train"],
    nearbyFood: ["Palani Panchamirtham Stalls", "Traditional Mess"],
    nearbyFuel: ["BPCL Bunk 1.5km"],
    x: 42,
    y: 55,
    trailOrder: 3,
    coords: [10.4503, 77.5204],
    latitude: 10.4503,
    longitude: 77.5204,
  },
  {
    slug: "pazhamudircholai-murugan-temple",
    name: "Pazhamudircholai Murugan Temple",
    district: "Madurai",
    category: "spiritual",
    image: pazhamudircholaiImg,
    tagline: "Sixth abode nestled in dense forest slopes near Solaimalai where Lord Murugan blessed Avvaiyar.",
    story: "Located amidst green forest hills near Alagar Kovil, 25km north of Madurai. Celebrated for the famous Avvaiyar jamun tree episode.",
    rating: 4.8,
    reviews: 1920,
    distanceFromChennai: "445 km",
    difficulty: "Easy",
    bestSeason: "October to March",
    roadCondition: "Scenic Forest Ghat Road",
    parking: "Hillside Parking Area",
    entryFee: "Free (Forest toll nominal)",
    timings: "06:00 AM – 06:00 PM",
    safety: "Watch for monkeys near woodland areas",
    weather: "Cool Forested Hills",
    tips: ["Visit nearby Nupura Ganga natural spring", "Combine visit with Kallazhagar Temple at hill base"],
    nearbyFood: ["Alagar Kovil Temple Prasad Dosa", "Hillside Refreshment Stalls"],
    nearbyFuel: ["IOCL Bunk 5km"],
    x: 50,
    y: 60,
    trailOrder: 4,
    coords: [10.0827, 78.2144],
    latitude: 10.0827,
    longitude: 78.2144,
  },
  {
    slug: "thirupparankundram-murugan-temple",
    name: "Thirupparankundram Murugan Temple",
    district: "Madurai",
    category: "spiritual",
    image: thirupparankundramImg,
    tagline: "First abode where Lord Murugan married Goddess Deivayanai in rock-cut cave architecture.",
    story: "Located 8km from Madurai, this ancient cave temple carved out of a granite hill marks the divine wedding site of Lord Murugan and Deivayanai.",
    rating: 4.9,
    reviews: 2450,
    distanceFromChennai: "460 km",
    difficulty: "Easy",
    bestSeason: "October to March",
    roadCondition: "Four-lane Highway",
    parking: "Available",
    entryFee: "Free",
    timings: "05:30 AM – 01:00 PM, 04:00 PM – 09:00 PM",
    safety: "Safe for families & senior pilgrims",
    weather: "Pleasant",
    tips: ["Visit early morning for peaceful darshan", "Explore the rock-cut cave inner sanctum"],
    nearbyFood: ["Famous Madurai Jigarthanda", "South Indian Tiffin Halls"],
    nearbyFuel: ["IOCL Bunk 1.2km"],
    x: 48,
    y: 62,
    trailOrder: 5,
    coords: [9.8809, 78.0711],
    latitude: 9.8809,
    longitude: 78.0711,
  },
  {
    slug: "tiruchendur-murugan-temple",
    name: "Tiruchendur Murugan Temple",
    district: "Thoothukudi",
    category: "spiritual",
    image: tiruchendurImg,
    tagline: "Second abode situated right on the Gulf of Mannar sea shore where Lord Murugan vanquished Surapadman.",
    story: "The only Arupadai Veedu shrine located along the ocean coast. A grand 137ft nine-tier Rajagopuram stands proudly facing the Bay of Bengal.",
    rating: 4.9,
    reviews: 3100,
    distanceFromChennai: "610 km",
    difficulty: "Easy",
    bestSeason: "October to February",
    roadCondition: "State Highway",
    parking: "Ample Seafront Parking",
    entryFee: "Free",
    timings: "05:00 AM – 09:00 PM",
    safety: "Mind ocean tides near beach area",
    weather: "Breezy Coastal",
    tips: ["Dip in Nazhi Kinaru sacred well", "Witness evening sea-breeze Aarati"],
    nearbyFood: ["Tiruchendur Karupatti Sweets", "Seafront Restaurants"],
    nearbyFuel: ["HP Bunk 800m"],
    x: 52,
    y: 82,
    trailOrder: 6,
    coords: [8.4962, 78.1289],
    latitude: 8.4962,
    longitude: 78.1289,
  }
];

export const arupadaiVeeduTemples: Place[] = ARUPADAI_VEEDU_SLUGS.map((slug) => {
  const found = places.find((p) => p.slug === slug || p.slug.includes(slug.split("-")[0]));
  if (found) return found;
  return DEFAULT_ARUPADAI_VEEDU_TEMPLES.find((d) => d.slug === slug || d.slug.includes(slug.split("-")[0])) || DEFAULT_ARUPADAI_VEEDU_TEMPLES[0];
});

export const PANCHA_BHOOTA_SLUGS = [
  "ekambareswarar-temple",
  "jambukeswarar-temple",
  "arunachaleswarar-temple",
  "srikalahasteeswara-temple",
  "chidambaram-nataraja-temple",
];

export const DEFAULT_PANCHA_BHOOTA_TEMPLES: (Place & { element: string; elementTamil: string; elementSymbol: string })[] = [
  {
    slug: "ekambareswarar-temple",
    name: "Ekambareswarar Temple",
    district: "Kancheepuram",
    category: "spiritual",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
    tagline: "Earth (Prithvi) Stalam with 3,500-Year Sacred Mango Tree & Sand Lingam",
    story: "One of the five sacred Pancha Bhoota Sthalams representing the Earth element (Prithvi). Revered for the Prithvi Lingam sculpted from sand by Goddess Parvati beneath a sacred mango tree. Features an imposing 59-meter tall 11-tier Southern Rajagopuram built by King Krishnadevaraya in 1509 CE.",
    rating: 4.9,
    reviews: 2840,
    distanceFromChennai: "75 km",
    difficulty: "Easy",
    bestSeason: "October to March (Panguni Uthiram in March/April)",
    roadCondition: "NH 48 Four-lane Highway",
    parking: "Temple Car Street Parking",
    entryFee: "Free",
    timings: "06:00 AM – 12:30 PM, 04:00 PM – 08:30 PM",
    safety: "Broad paved walkways, wheelchair assistance available",
    weather: "Pleasant Temple Town",
    tips: ["Revere the 3,500-year-old sacred mango tree in the courtyard", "Admire the 1000-pillared hall built by Vijayanagara kings"],
    nearbyFood: ["Saravana Bhavan Kanchipuram", "Traditional Kanchipuram Idli outlets"],
    nearbyFuel: ["Indian Oil Bunk 800m"],
    x: 74,
    y: 22,
    trailOrder: 1,
    coords: [12.8475, 79.6997],
    latitude: 12.8475,
    longitude: 79.6997,
    element: "Earth (Prithvi)",
    elementTamil: "நிலம் (பிருத்வி)",
    elementSymbol: "🌍",
  },
  {
    slug: "jambukeswarar-temple",
    name: "Jambukeswarar Temple",
    district: "Tiruchirappalli",
    category: "spiritual",
    image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1000&q=80",
    tagline: "Water (Appu) Stalam with Perennial Underground Spring in Sanctum",
    story: "Revered Pancha Bhoota Sthalam representing the Water element (Appu), situated in Thiruvanaikaval between Cauvery and Kollidam rivers. An underground perennial natural spring flows continuously beneath the Shiva Lingam in the inner sanctum, keeping it submerged in holy water throughout the year. Built by Early Chola King Kochengannan over 1,800 years ago.",
    rating: 4.8,
    reviews: 2310,
    distanceFromChennai: "325 km",
    difficulty: "Easy",
    bestSeason: "October to March",
    roadCondition: "NH 45 Grand Southern Trunk Road",
    parking: "Temple Car Street & North Gopuram Grounds",
    entryFee: "Free",
    timings: "05:30 AM – 01:00 PM, 03:00 PM – 09:00 PM",
    safety: "Covered pradakshina paths, senior-friendly access",
    weather: "Breezy Cauvery Island",
    tips: ["Witness the noon Uchikala Pooja where the priest dresses as Goddess Akhilandeshwari", "Observe water trickling continuously from the spring in the sanctum"],
    nearbyFood: ["Srirangam Temple Prasadam Mess", "Traditional Veg Thali near North Gopuram"],
    nearbyFuel: ["Bharat Petroleum Bunk 1.2km"],
    x: 58,
    y: 52,
    trailOrder: 2,
    coords: [10.8534, 78.7054],
    latitude: 10.8534,
    longitude: 78.7054,
    element: "Water (Appu)",
    elementTamil: "நீர் (அப்பு)",
    elementSymbol: "💧",
  },
  {
    slug: "arunachaleswarar-temple",
    name: "Arunachaleswarar Temple",
    district: "Tiruvannamalai",
    category: "spiritual",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
    tagline: "Fire (Agni) Stalam & 14km Arunachala Giri Pradakshina Hill Circuit",
    story: "The magnificent Agni Stalam of the Pancha Bhoota representing the Fire element, standing at the foot of sacred Arunachala Hill. Encompassing 25 acres with four imposing Rajagopurams, including the 217-foot Eastern tower. Famous for the 14-km barefoot Giri Pradakshina circumambulation and the grand Karthigai Deepam festival where a mammoth sacred flame is lit atop Arunachala peak.",
    rating: 4.9,
    reviews: 5200,
    distanceFromChennai: "195 km",
    difficulty: "Easy (Giri Pradakshina Moderate)",
    bestSeason: "October to March (Karthigai Deepam in Nov/Dec)",
    roadCondition: "NH 77 Four-lane Highway",
    parking: "Pazhani Aandavar Car Parking & East Gopuram Complex",
    entryFee: "Free",
    timings: "05:30 AM – 12:30 PM, 03:30 PM – 09:30 PM",
    safety: "Wide pedestrian pathways, clean Giri Valam path with rest shelters",
    weather: "Pleasant Hill Foot Weather",
    tips: ["Undertake the 14km Giri Valam circuit on full moon nights or early mornings", "Visit Sri Ramana Ashram situated along the Giri Pradakshina route"],
    nearbyFood: ["Udupi Brindavan Restaurant", "Sri Ramana Vegetarian Canteen"],
    nearbyFuel: ["HPCL Bunk Girivalam Road 1.5km"],
    x: 68,
    y: 35,
    trailOrder: 3,
    coords: [12.2319, 79.0677],
    latitude: 12.2319,
    longitude: 79.0677,
    element: "Fire (Agni)",
    elementTamil: "நெருப்பு (தேயு)",
    elementSymbol: "🔥",
  },
  {
    slug: "srikalahasteeswara-temple",
    name: "Srikalahasteeswara Temple",
    district: "Tirupati",
    category: "spiritual",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    tagline: "Air (Vayu) Stalam with Flickering Sanctum Lamp & Rahu-Ketu Kshetram",
    story: "The ancient Vayu Stalam of the Pancha Bhoota representing the Air element, situated on the banks of the Swarnamukhi River bordering northern Tamil Nadu. Inside the airtight inner sanctum devoid of any wind, the lamp flame continuously flickers, confirming the living presence of the Air Lingam. Renowned worldwide for Rahu-Ketu Sarpa Dosha Nivarana pujas and rich Chola/Vijayanagara stone sculpture.",
    rating: 4.8,
    reviews: 3600,
    distanceFromChennai: "115 km",
    difficulty: "Easy",
    bestSeason: "September to March (Maha Shivaratri in Feb/March)",
    roadCondition: "NH 716 / Tada-Srikalahasti Highway",
    parking: "Devasthanam Multi-level Car Parking",
    entryFee: "Free (Special Pooja tickets available)",
    timings: "06:00 AM – 09:00 PM Continuous",
    safety: "Organized queue lines, crowd control systems during Rahu Kalam",
    weather: "River Breeze",
    tips: ["Observe the sanctum deepam that flickers perpetually even without air draft", "Book Rahu-Ketu Pooja tickets early during auspicious Rahu Kalam timings"],
    nearbyFood: ["Srikalahasti Devasthanam Annadanam", "Bhimas Deluxe Tiffin"],
    nearbyFuel: ["Indian Oil Bunk 600m"],
    x: 75,
    y: 12,
    trailOrder: 4,
    coords: [13.7498, 79.6984],
    latitude: 13.7498,
    longitude: 79.6984,
    element: "Air (Vayu)",
    elementTamil: "காற்று (வாயு)",
    elementSymbol: "💨",
  },
  {
    slug: "chidambaram-nataraja-temple",
    name: "Thillai Nataraja Temple",
    district: "Cuddalore",
    category: "spiritual",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80",
    tagline: "Space (Akasha) Stalam with Gold-Tiled Chit Sabha & Chidambara Rahasyam",
    story: "The supreme Akasha Stalam representing the Space (Ether) element where Lord Shiva is worshipped as Nataraja performing the cosmic dance of creation and dissolution (Ananda Tandava). Famous for the 'Chidambara Rahasyam' (secret of formless divine space behind golden bilva leaves), the 21,600 gold tiles on the sanctum roof representing human breaths, and the 108 classical Bharatanatyam dance postures carved in stone.",
    rating: 4.9,
    reviews: 4100,
    distanceFromChennai: "235 km",
    difficulty: "Easy",
    bestSeason: "October to March (Natyanjali Dance Festival in Feb/March)",
    roadCondition: "ECR / NH 32 Highway",
    parking: "East Car Street & Temple Tank Grounds",
    entryFee: "Free",
    timings: "06:00 AM – 12:00 PM, 05:00 PM – 10:00 PM",
    safety: "Well-paved ancient stone courtyards, quiet ambiance",
    weather: "Coastal Temple Town",
    tips: ["Witness the spectacular evening Ruby Nataraja (Rathina Sabai) Abhishekam", "Explore the 108 Bharatanatyam mudras sculpted on the East and West Gopurams"],
    nearbyFood: ["Sri Krishna Bhavan Traditional Mess", "Vandaiyar Hotel Cuddalore Road"],
    nearbyFuel: ["Bharat Petroleum Bunk 1km"],
    x: 72,
    y: 42,
    trailOrder: 5,
    coords: [11.3992, 79.6934],
    latitude: 11.3992,
    longitude: 79.6934,
    element: "Space (Akasha)",
    elementTamil: "ஆகாயம் (ஆகாய ஸ்தலம்)",
    elementSymbol: "🌌",
  },
];

export const panchaBhootaTemples: Place[] = PANCHA_BHOOTA_SLUGS.map((slug) => {
  const found = places.find((p) => p.slug === slug || p.slug.includes(slug.split("-")[0]));
  if (found) return found;
  return DEFAULT_PANCHA_BHOOTA_TEMPLES.find((d) => d.slug === slug || d.slug.includes(slug.split("-")[0])) || DEFAULT_PANCHA_BHOOTA_TEMPLES[0];
});


