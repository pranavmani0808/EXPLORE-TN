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
  const foundInPlaces = places.find((p) => p.slug.toLowerCase() === q || p.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === q);
  if (foundInPlaces) return foundInPlaces;

  const foundArupadai = DEFAULT_ARUPADAI_VEEDU_TEMPLES.find((p) => p.slug.toLowerCase() === q || p.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === q);
  if (foundArupadai) return foundArupadai;

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

  return undefined;
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

