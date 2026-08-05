import waterfallsImg from "@/assets/cat-waterfalls.jpg";
import templesImg from "@/assets/cat-temples.jpg";
import routesImg from "@/assets/cat-routes.jpg";
import foodImg from "@/assets/cat-food.jpg";
import beachesImg from "@/assets/cat-beaches.jpg";
import campingImg from "@/assets/cat-camping.jpg";
import heroImg from "@/assets/hero-ghats.jpg";

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
  | "treks";

export const categories: {
  id: CategoryId;
  label: string;
  image: string;
  blurb: string;
}[] = [
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
  // Position on the stylized Tamil Nadu map (percentages)
  x: number;
  y: number;
};

export const places: Place[] = [
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
    y: 68,
  },
  {
    slug: "brihadeeswarar-thanjavur",
    name: "Brihadeeswarar Temple",
    district: "Thanjavur",
    category: "temples",
    image: templesImg,
    tagline: "A thousand years of Chola granite",
    story:
      "Raja Raja Chola I finished this in 1010 CE. The 216-foot vimana is carved from interlocking granite blocks with no mortar, and its shadow reportedly never falls outside the temple grounds at noon.",
    rating: 4.9,
    reviews: 8630,
    distanceFromChennai: "348 km",
    difficulty: "Easy",
    bestSeason: "Nov – Feb",
    roadCondition: "Excellent, four-lane most of the way",
    parking: "Free lot on the east side",
    entryFee: "Free",
    timings: "6:00 AM – 12:30 PM, 4:00 – 8:30 PM",
    safety: "Stone floor gets scorching by noon — go early",
    weather: "31°C · Sunny",
    tips: ["Golden hour on the east face is unbeatable", "Tripods need permission", "Leave footwear at the free counter"],
    nearbyFood: ["Sathars biryani", "Vasantha Bhavan filter coffee"],
    nearbyFuel: ["IOC Medical College Rd — 2 km"],
    x: 55,
    y: 52,
  },
  {
    slug: "kolli-hills-loop",
    name: "Kolli Hills 70 Hairpins",
    district: "Namakkal",
    category: "offroad",
    image: routesImg,
    tagline: "Seventy numbered hairpins into the Mountain of Death",
    story:
      "Tamil literature called these hills treacherous — hence the name. Today the climb is a rider's pilgrimage: seventy signed hairpins, jackfruit groves, and a plateau that stays fifteen degrees cooler than the plains.",
    rating: 4.8,
    reviews: 3410,
    distanceFromChennai: "365 km",
    difficulty: "Moderate",
    bestSeason: "Sep – Mar",
    roadCondition: "Smooth tar, tight radii, some gravel patches",
    parking: "Roadside bays at viewpoints",
    entryFee: "Free",
    timings: "Best 6 AM – 6 PM, avoid night descent",
    safety: "Fog after 4 PM; horn on blind corners",
    weather: "21°C · Misty",
    tips: ["Hairpin 36 has the best valley view", "Fuel up at Karavalli before the climb", "Agaya Gangai falls needs 1,200 steps"],
    nearbyFood: ["Kolli hills jackfruit stalls", "Tribal honey shops near Semmedu"],
    nearbyFuel: ["HP Karavalli base — 7 km"],
    x: 44,
    y: 40,
  },
  {
    slug: "dhanushkodi",
    name: "Dhanushkodi Ghost Town",
    district: "Ramanathapuram",
    category: "beaches",
    image: beachesImg,
    tagline: "The road that ends where two seas meet",
    story:
      "A 1964 cyclone erased this town overnight. What remains — a church shell, a railway platform, a strip of sand between the Bay of Bengal and the Indian Ocean — is one of the most haunting drives in India.",
    rating: 4.8,
    reviews: 5220,
    distanceFromChennai: "580 km",
    difficulty: "Easy",
    bestSeason: "Nov – Feb",
    roadCondition: "New causeway road, excellent",
    parking: "Free at the Arichal Munai end",
    entryFee: "Free",
    timings: "6:00 AM – 5:00 PM (closed after dark)",
    safety: "No shelter or water past Mukundarayar Chathiram",
    weather: "29°C · Strong sea breeze",
    tips: ["Carry 2L of water per person", "Sunrise here beats sunset", "No fuel for the last 40 km"],
    nearbyFood: ["Fresh grilled fish shacks", "Rameswaram idli stalls"],
    nearbyFuel: ["IOC Rameswaram — 22 km"],
    x: 46,
    y: 82,
  },
  {
    slug: "madurai-night-food",
    name: "Madurai Midnight Food Trail",
    district: "Madurai",
    category: "food",
    image: foodImg,
    tagline: "The city that eats at 2 AM",
    story:
      "Madurai never really sleeps. From jigarthanda at Famous to kari dosai on West Masi Street, the night trail is a five-stop crawl through the oldest continuously inhabited food culture in Tamil Nadu.",
    rating: 4.9,
    reviews: 6890,
    distanceFromChennai: "462 km",
    difficulty: "Easy",
    bestSeason: "Year round",
    roadCondition: "City roads, park and walk",
    parking: "Paid lots near the temple",
    entryFee: "Free · budget ₹400 per person",
    timings: "9:00 PM – 3:00 AM",
    safety: "Busy, well-lit streets; go in pairs after midnight",
    weather: "27°C · Clear",
    tips: ["Start with jigarthanda, end with kari dosai", "Carry cash", "Most stalls peak after 11 PM"],
    nearbyFood: ["Konar Kadai", "Amma Mess", "Famous Jigarthanda"],
    nearbyFuel: ["HP Simmakkal — 1.5 km"],
    x: 36,
    y: 70,
  },
  {
    slug: "kodaikanal-dolphin-nose",
    name: "Dolphin's Nose",
    district: "Dindigul",
    category: "photography",
    image: heroImg,
    tagline: "A flat rock over a 6,600 ft drop",
    story:
      "A short forest walk from Pambar ends at a jutting slab with nothing beneath it. On clear mornings you can see all the way to the plains of Theni; on most mornings you see only cloud.",
    rating: 4.6,
    reviews: 3105,
    distanceFromChennai: "520 km",
    difficulty: "Moderate",
    bestSeason: "Dec – May",
    roadCondition: "Tar to Pambar, then 1.5 km trail",
    parking: "Trailhead bays",
    entryFee: "₹10",
    timings: "7:00 AM – 4:00 PM",
    safety: "No railing — stay back from the lip in wind",
    weather: "17°C · Cloud drift",
    tips: ["24mm or wider for the ridge line", "Trail is slippery post-rain", "Local guides at the trailhead"],
    nearbyFood: ["Pambar tea shacks", "Kodai bakery lemon tarts"],
    nearbyFuel: ["IOC Kodaikanal town — 8 km"],
    x: 31,
    y: 64,
  },
  {
    slug: "yelagiri-hidden-stream",
    name: "Nilavoor Hidden Stream",
    district: "Tirupattur",
    category: "hidden",
    image: waterfallsImg,
    tagline: "A local secret behind the Yelagiri lake",
    story:
      "Barely marked on any map, this stream runs behind the village fields and pools under a stand of tamarind trees. Villagers have kept it clean for generations — pack out what you bring in.",
    rating: 4.5,
    reviews: 412,
    distanceFromChennai: "230 km",
    difficulty: "Easy",
    bestSeason: "Aug – Feb",
    roadCondition: "Village road, last 800 m unpaved",
    parking: "Roadside near the field bund",
    entryFee: "Free",
    timings: "Daylight only",
    safety: "No mobile signal; tell someone your plan",
    weather: "23°C · Pleasant",
    tips: ["Respect it — carry your trash out", "Weekdays are empty", "Ask at the village shop for directions"],
    nearbyFood: ["Yelagiri lake corn stalls", "Nilavoor home mess"],
    nearbyFuel: ["IOC Ponneri Junction — 12 km"],
    x: 52,
    y: 24,
  },
];

export const getPlace = (slug: string) => places.find((p) => p.slug === slug);

export type RouteStop = {
  name: string;
  description: string;
  distance: string;
  time: string;
  fuel: string;
  food: string;
  tip: string;
  weather: string;
  image: string;
};

export const scenicRoute = {
  slug: "chennai-kodaikanal",
  name: "Chennai → Kodaikanal Ghat Run",
  summary: "520 km of temple towns, hairpins and cloud forest over two unhurried days.",
  totalDistance: "520 km",
  totalTime: "11 h riding",
  fuelEstimate: "₹2,450",
  bestSeason: "Oct – Mar",
  stops: [
    {
      name: "Chennai — Start",
      description: "Roll out before 5 AM to clear the city and catch sunrise on the GST road.",
      distance: "0 km",
      time: "04:45",
      fuel: "Full tank",
      food: "Saravana Bhavan pongal",
      tip: "Shoot the empty flyovers in blue hour",
      weather: "26°C · Clear",
      image: heroImg,
    },
    {
      name: "Thanjavur — Chola Country",
      description: "Break at Brihadeeswarar temple while the granite is still cool.",
      distance: "348 km",
      time: "10:30",
      fuel: "₹1,180 used",
      food: "Sathars biryani",
      tip: "East face, low angle, 35mm",
      weather: "31°C · Sunny",
      image: templesImg,
    },
    {
      name: "Dindigul — Plains Halt",
      description: "Last flat stretch. Fuel, tyres, water before the climb.",
      distance: "444 km",
      time: "14:00",
      fuel: "Top up ₹520",
      food: "Dindigul thalappakatti",
      tip: "Check brake pads here",
      weather: "33°C · Hot",
      image: foodImg,
    },
    {
      name: "Ghat Road — 20 Hairpins",
      description: "The climb from Batlagundu. Cool air hits around hairpin 12.",
      distance: "492 km",
      time: "16:10",
      fuel: "—",
      food: "Silver Cascade tea stall",
      tip: "Pull into the bays, never the corners",
      weather: "21°C · Misty",
      image: routesImg,
    },
    {
      name: "Kodaikanal — Cloud Line",
      description: "Arrive before dusk, park the bike, walk the lake at first light.",
      distance: "520 km",
      time: "17:40",
      fuel: "₹2,450 total",
      food: "Pastry Corner hot chocolate",
      tip: "Dolphin's Nose at sunrise tomorrow",
      weather: "16°C · Cold",
      image: campingImg,
    },
  ] as RouteStop[],
};
