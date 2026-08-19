import waterfallsImg from "@/assets/cat-waterfalls.jpg";
import templesImg from "@/assets/cat-temples.jpg";
import routesImg from "@/assets/cat-routes.jpg";
import foodImg from "@/assets/cat-food.jpg";
import beachesImg from "@/assets/cat-beaches.jpg";
import campingImg from "@/assets/cat-camping.jpg";
import heroImg from "@/assets/hero-ghats.jpg";
import thiruttaniImg from "@/assets/temples/thiruttani.jpg";
import swamimalaiImg from "@/assets/temples/swamimalai.jpg";
import palaniImg from "@/assets/temples/palani.jpg";
import tiruchendurImg from "@/assets/temples/tiruchendur.jpg";
import pazhamudircholaiImg from "@/assets/temples/pazhamudircholai.jpg";
import thirupparankundramImg from "@/assets/temples/thirupparankundram.jpg";

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
  coords?: [number, number];
};

export const arupadaiVeeduTemples: Place[] = [
  {
    slug: "thiruttani-murugan-temple",
    name: "Thiruttani Murugan Temple",
    district: "Tiruvallur",
    category: "spiritual",
    image: thiruttaniImg,
    tagline: "1st Arupadai Veedu — Hilltop abode where Murugan found tranquility",
    story: "Located on Tanigai hill in Tiruvallur district, Thiruttani Murugan Temple features 365 steps representing each day of the year. It marks where Lord Murugan found peace after vanquishing Surapadman.",
    rating: 4.9,
    reviews: 3420,
    distanceFromChennai: "84 km",
    difficulty: "Easy",
    bestSeason: "Year-round",
    roadCondition: "4-lane NH to hill road",
    parking: "Dedicated hilltop parking",
    entryFee: "Free (Special darshan ₹50)",
    timings: "5:45 AM – 9:00 PM",
    safety: "Mind steps during afternoon heat",
    weather: "26°C · Clear",
    tips: ["Climb early morning for cool breeze", "365 steps represent 365 days"],
    nearbyFood: ["Hotel Saravana Bhavan", "Murugan Mess"],
    nearbyFuel: ["IOC Thiruttani Bypass"],
    x: 82,
    y: 22,
    trailOrder: 1,
    coords: [13.1788, 79.6074],
  },
  {
    slug: "swamimalai-murugan-temple",
    name: "Swamimalai Murugan Temple",
    district: "Thanjavur",
    category: "spiritual",
    image: swamimalaiImg,
    tagline: "2nd Arupadai Veedu — Abode where Lord Murugan taught the Pranava Mantra to Lord Shiva",
    story: "Situated on a 60-foot artificial hillock near Kumbakonam, Swamimalai features 60 steps representing the 60 Tamil calendar years. Lord Murugan presides here as Balamurugan or Swaminatha Swami.",
    rating: 4.8,
    reviews: 2890,
    distanceFromChennai: "295 km",
    difficulty: "Easy",
    bestSeason: "Oct – Mar",
    roadCondition: "Good state highway via Kumbakonam",
    parking: "Temple car street parking",
    entryFee: "Free",
    timings: "5:00 AM – 12:00 PM, 4:00 PM – 9:00 PM",
    safety: "Be mindful of crowd during festival days",
    weather: "28°C · Sunny",
    tips: ["Famous for bronze icon casting nearby", "Taste Kumbakonam degree coffee"],
    nearbyFood: ["Rayas Hotel", "Kumbakonam Degree Coffee"],
    nearbyFuel: ["HP Swamimalai Main Rd"],
    x: 65,
    y: 52,
    trailOrder: 2,
    coords: [10.9567, 79.3274],
  },
  {
    slug: "palani-murugan-temple",
    name: "Palani Murugan Temple",
    district: "Dindigul",
    category: "spiritual",
    image: palaniImg,
    tagline: "3rd Arupadai Veedu — Sacred Sivagiri hill abode of Lord Dhandayuthapani Swamy",
    story: "Perched atop the steep Sivagiri hill in Palani, Dindigul district, this world-renowned shrine houses the sacred idol consecrated by Sage Bhogar using Navapashanam (nine medicinal herbal minerals).",
    rating: 4.9,
    reviews: 8940,
    distanceFromChennai: "485 km",
    difficulty: "Moderate",
    bestSeason: "Year-round",
    roadCondition: "Smooth 4-lane NH44 via Dindigul",
    parking: "Multi-level parking at hill base",
    entryFee: "Free (Winch/Ropeway ₹50)",
    timings: "5:00 AM – 9:00 PM",
    safety: "Hold handrails on step climb; ropeway available",
    weather: "25°C · Pleasant",
    tips: ["Take ropeway for panoramic valley views", "Sample traditional Palani Panchamirtham"],
    nearbyFood: ["Hotel Ganpat", "Nalapaka Pure Veg"],
    nearbyFuel: ["BP Palani Bypass"],
    x: 38,
    y: 58,
    trailOrder: 3,
    coords: [10.4497, 77.5204],
  },
  {
    slug: "tiruchendur-murugan-temple",
    name: "Tiruchendur Murugan Temple",
    district: "Thoothukudi",
    category: "spiritual",
    image: tiruchendurImg,
    tagline: "4th Arupadai Veedu — Seashore abode where Murugan vanquished Surapadman",
    story: "The only Arupadai Veedu shrine located right on the seashore of the Gulf of Mannar in Tiruchendur, Thoothukudi district. It commemorates Lord Murugan's victory over the demon Surapadman.",
    rating: 4.9,
    reviews: 9120,
    distanceFromChennai: "620 km",
    difficulty: "Easy",
    bestSeason: "Oct – Mar",
    roadCondition: "4-lane NH44 via Madurai & Tirunelveli",
    parking: "Expansive beachside parking",
    entryFee: "Free",
    timings: "5:00 AM – 9:00 PM",
    safety: "Watch high tide waves at sea bath ghat",
    weather: "29°C · Sea breeze",
    tips: ["Take holy dip in Nazhi Kinaru sea spring", "Best viewed at sunrise over the ocean"],
    nearbyFood: ["Hotel Mani", "Sagar Beach Mess"],
    nearbyFuel: ["IOC Tiruchendur Bypass"],
    x: 48,
    y: 88,
    trailOrder: 4,
    coords: [8.4962, 78.1288],
  },
  {
    slug: "pazhamudircholai-murugan-temple",
    name: "Pazhamudircholai Murugan Temple",
    district: "Madurai",
    category: "spiritual",
    image: pazhamudircholaiImg,
    tagline: "5th Arupadai Veedu — Dense forest hill shrine of Solaimalai",
    story: "Nestled amidst dense evergreen forests atop the Solaimalai hill range near Alagar Kovil in Madurai district. Famous for the legendary episode where Lord Murugan tested Tamil poetess Avvaiyar.",
    rating: 4.8,
    reviews: 4120,
    distanceFromChennai: "465 km",
    difficulty: "Easy",
    bestSeason: "Oct – Mar",
    roadCondition: "Forest winding road from Alagar Kovil",
    parking: "Hilltop parking lot",
    entryFee: "Free",
    timings: "6:00 AM – 6:00 PM",
    safety: "Beware of monkeys near forest entrance",
    weather: "24°C · Forest shade",
    tips: ["Visit nearby Noopura Ganga mountain spring", "Combined trip with Alagar Kovil Vishnu temple"],
    nearbyFood: ["Alagar Kovil temple mess", "Madurai Jigarthanda stall"],
    nearbyFuel: ["HP Alagar Kovil Main Rd"],
    x: 46,
    y: 64,
    trailOrder: 5,
    coords: [10.0911, 78.2173],
  },
  {
    slug: "thirupparankundram-murugan-temple",
    name: "Thirupparankundram Murugan Temple",
    district: "Madurai",
    category: "spiritual",
    image: thirupparankundramImg,
    tagline: "6th Arupadai Veedu — Ancient rock-cut cave shrine where Murugan married Deivayanai",
    story: "A 6th-century rock-cut cave temple carved into a massive granite hill on the outskirts of Madurai city, celebrating the celestial marriage of Lord Murugan to Deivayanai.",
    rating: 4.9,
    reviews: 5100,
    distanceFromChennai: "460 km",
    difficulty: "Easy",
    bestSeason: "Year-round",
    roadCondition: "City asphalt road",
    parking: "Temple car street lot",
    entryFee: "Free",
    timings: "5:30 AM – 1:00 PM, 4:00 PM – 9:00 PM",
    safety: "Rock floor can be slick when wet",
    weather: "27°C · Clear",
    tips: ["Admire 6th-century Pandya cave rock sculptures", "Famous Madurai Jigarthanda nearby"],
    nearbyFood: ["Murugan Idli Shop", "Madurai Famous Jigarthanda"],
    nearbyFuel: ["BP Thirupparankundram Main Rd"],
    x: 44,
    y: 67,
    trailOrder: 6,
    coords: [9.8797, 78.0710],
  }
];

export const places: Place[] = [
  ...arupadaiVeeduTemples,
  {
    slug: "kumbakkarai-falls",
    name: "Kumbakkarai Falls",
    district: "Theni",
    category: "waterfalls",
    image: waterfallsImg,
    tagline: "Cold cascade at the foot of the Kodai hills",
    story:
      "Long before the ghat road existed, pilgrims climbing to Kodaikanal stopped here to wash off the dust of the plains. The upper pools are carved into a single sheet of granite, polished smooth by centuries of monsoon water.",
    rating: 4.7,
    reviews: 1284,
    distanceFromChennai: "487 km",
    difficulty: "Easy",
    bestSeason: "Jul – Jan",
    roadCondition: "Tarred, narrow last 3 km",
    parking: "Paid lot, ₹30 for two-wheelers",
    entryFee: "₹20 per person",
    timings: "6:00 AM – 5:30 PM",
    safety: "Avoid pools during upstream rain; watch for sudden flow",
    weather: "24°C · Light showers",
    tips: [
      "Reach before 8 AM to have the upper pool to yourself",
      "Carry grip sandals — the granite is slick",
      "Cash only at the entry counter",
    ],
    nearbyFood: ["Periyakulam banana halwa stalls", "Hotel Sri Amman mess"],
    nearbyFuel: ["IOC Periyakulam — 9 km", "HP Theni bypass — 21 km"],
    x: 30,
    y: 62,
  },
  {
    slug: "kolukkumalai-sunrise",
    name: "Kolukkumalai Ridge",
    district: "Theni",
    category: "sunrise",
    image: campingImg,
    tagline: "Sunrise above a sea of clouds at 7,900 ft",
    story:
      "The world's highest tea estate sits on this ridge, reachable only by a jeep track that climbs 4,000 feet of loose rock. At dawn the clouds pool in the valley below and the sun breaks over the Bodi hills.",
    rating: 4.9,
    reviews: 2140,
    distanceFromChennai: "532 km",
    difficulty: "Moderate",
    bestSeason: "Oct – Mar",
    roadCondition: "Rough jeep track, 4x4 only",
    parking: "Jeep base point at Bodimettu",
    entryFee: "Jeep share ₹500",
    timings: "Jeeps leave 4:00 AM",
    safety: "Do not self-drive the track; edge drops are unprotected",
    weather: "12°C · Clear, windy",
    tips: ["Book the jeep the night before", "Two layers minimum — it bites at 4 AM", "Camp permits from the estate office"],
    nearbyFood: ["Bodi tea shops", "Suruli roadside parotta"],
    nearbyFuel: ["BP Bodinayakanur — 18 km"],
    x: 26,
    y: 65,
  }
];

export function getPlace(slug: string): Place | undefined {
  return places.find((p) => p.slug === slug);
}

export const scenicRoute = {
  name: "Chennai → Kodaikanal Ghat Run",
  summary: "520 km of Chola temple towns, 20 hairpin curves, and misty cloud forests.",
  totalDistance: "520 km",
  totalTime: "11 h riding",
  fuelEstimate: "₹2,450",
  bestSeason: "Oct – Mar",
  stops: [
    { name: "Chennai — Start", distance: "0 km", weather: "26°C · Clear", image: heroImg },
    { name: "Thanjavur — Chola Country", distance: "348 km", weather: "31°C · Sunny", image: templesImg },
    { name: "Dindigul — Plains Halt", distance: "444 km", weather: "32°C · Clear", image: foodImg },
    { name: "Kodaikanal — Cloud Line", distance: "520 km", weather: "16°C · Mist", image: campingImg },
  ]
};
