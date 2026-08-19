import { CANONICAL_PLACES, ExplorerPlace } from "@/lib/data/canonical-places";
import waterfallsImg from "@/assets/cat-waterfalls.jpg";
import templesImg from "@/assets/cat-temples.jpg";
import routesImg from "@/assets/cat-routes.jpg";
import foodImg from "@/assets/cat-food.jpg";
import beachesImg from "@/assets/cat-beaches.jpg";
import campingImg from "@/assets/cat-camping.jpg";
import heroImg from "@/assets/hero-ghats.jpg";
import palaniImg from "@/assets/temples/palani.jpg";

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

export type Place = {
  slug: string;
  name: string;
  district: string;
  category: CategoryId;
  image: string;
  tagline: string;
  story: string;
  rating: number;
  reviews: number;
  distanceFromChennai: string;
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
  return {
    slug: p.slug,
    name: p.name,
    district: p.district,
    category: cat,
    image: p.image,
    tagline: p.tagline,
    story: p.description,
    rating: p.rating || 4.7,
    reviews: p.reviewsCount || 1200,
    distanceFromChennai: "Variable",
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

export function getPlace(slug: string): Place | undefined {
  if (!slug) return undefined;
  const q = slug.toLowerCase().trim();
  return places.find((p) => p.slug.toLowerCase() === q || p.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === q);
}

export const arupadaiVeeduTemples: Place[] = places.filter((p) =>
  [
    "thiruttani-murugan-temple",
    "swamimalai-murugan-temple",
    "palani-murugan-temple",
    "tiruchendur-murugan-temple",
    "thirupparankundram-temple",
    "pazhamudircholai-temple",
  ].includes(p.slug)
);
