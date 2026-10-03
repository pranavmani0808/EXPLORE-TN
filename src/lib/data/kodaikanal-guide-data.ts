export interface KodaiSeasonGuide {
  seasonKey: "summer" | "monsoon" | "cool-peaceful";
  months: string;
  seasonTitle: string;
  badge: string;
  badgeColor: string;
  icon: string;
  image: string;
  description: string;
  activities: string[];
  weather: {
    temp: string;
    condition: string;
    clothing: string;
  };
}

export interface KodaiFoodSpot {
  rank: number;
  name: string;
  slug: string;
  category: "Fine Dining & European" | "Continental Bistro" | "Artisan Hot Beverages" | "Cozy View Cafe" | "Authentic Punjabi Dhaba" | "Pan-Asian & Bowls" | "Lakeside Dining";
  typeIcon: string;
  tagline: string;
  description: string;
  specialties: string[];
  approxCostForTwo: string;
  timings: string;
  location: string;
  latitude: number;
  longitude: number;
  image: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
}

export interface KodaiTransitOption {
  mode: "air" | "train" | "bus";
  title: string;
  route: string;
  icon: string;
  image: string;
  description: string;
  tips: string[];
}

export interface KodaiMustVisitPlaceSummary {
  rank: number;
  name: string;
  slug: string;
  category: string;
  icon: string;
  tagline: string;
  elevation: string;
  timings: string;
}

// =========================================================================
// 1. BEST TIME TO VISIT KODAIKANAL (From User Uploaded Infographic 3/11)
// =========================================================================
export const KODAI_SEASON_GUIDES: KodaiSeasonGuide[] = [
  {
    seasonKey: "summer",
    months: "April to June",
    seasonTitle: "Peak Summer Season",
    badge: "🌸 Peak Summer",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    icon: "🌸",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    description: "Pleasant mountain weather, vibrant blooming Bryant Park flower beds, sunny days ideal for trekking, cycling around Kodaikanal Lake, and family outdoor sightseeing.",
    activities: [
      "Annual Summer Festival & Flower Show at Bryant Park",
      "Pedal & row boating on the star-shaped Kodaikanal Lake",
      "Walking the cliffside rim of Coaker's Walk with telescope views",
      "Exploring Guna Caves and Pillar Rocks misty decks"
    ],
    weather: {
      temp: "19°C – 28°C",
      condition: "Pleasant daytime sunshine and mild cooling evening breeze",
      clothing: "Light cottons with light jackets or shawls for evening chill"
    }
  },
  {
    seasonKey: "monsoon",
    months: "July to September",
    seasonTitle: "Monsoon Season",
    badge: "🌧️ Lush Monsoon",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    icon: "🌧️",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    description: "Verdant green slopes, rolling thick cloud banks drifting through pine canopies, roaring cascades at Silver Cascade and Kumbakkarai, fewer crowds, and romantic solitude.",
    activities: [
      "Sipping hot artisan chocolate while watching rain clouds drift over pine forests",
      "Witnessing Silver Cascade and Kumbakkarai Falls in full spate",
      "Scenic drives to mist-covered Poombarai and Mannavanur valleys",
      "Cozy stays with fireplace and valley views at heritage hillside cottages"
    ],
    weather: {
      temp: "12°C – 18°C",
      condition: "Rolling monsoon showers, heavy fog, and misty cloud covers",
      clothing: "Raincoats, windbreakers, umbrellas, and waterproof footwear"
    }
  },
  {
    seasonKey: "cool-peaceful",
    months: "October to February",
    seasonTitle: "Cool & Peaceful Winter",
    badge: "❄️ Cool & Peaceful",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    icon: "❄️",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    description: "Crisp cool mornings, peaceful crowd-free streets, crystal-clear blue horizons across Cumbum Valley from Dolphin's Nose, and chilly fireside nights.",
    activities: [
      "Clear sunrise viewing from Dolphin's Nose and Coaker's Walk",
      "Quiet nature walks along Pine Forest and Berijam Lake sanctuary",
      "Kayaking & coracle boating at Mannavanur Lake",
      "Campfires and outdoor barbecues in Vattakanal & Poondi"
    ],
    weather: {
      temp: "8°C – 17°C (occasional night dips to 4°C)",
      condition: "Crisp cool air, crystal clear visibility, and cold winter nights",
      clothing: "Heavy woollens, warm fleece jackets, beanies, and sweaters"
    }
  }
];

export const KODAI_OVERALL_BEST_WINDOW = {
  window: "October to June",
  tagline: "Great weather, beautiful landscapes, and perfect for all kinds of travelers.",
  recommendation: "Book weekend accommodations early and obtain mandatory Tamil Nadu e-Pass before ascending the ghat."
};

// =========================================================================
// 2. 7 BEST FOOD SPOTS IN KODAIKANAL (From User Uploaded Infographic 9/11)
// =========================================================================
export const KODAI_FOOD_SPOTS: KodaiFoodSpot[] = [
  {
    rank: 1,
    name: "Bistro 1845",
    slug: "bistro-1845-kodaikanal",
    category: "Fine Dining & European",
    typeIcon: "🍴",
    tagline: "Fine Colonial Dining & European Flavours at The Tamara Kodai",
    description: "Nestled in the luxury heritage resort The Tamara Kodai (dates back to 1845). Bistro 1845 serves refined Anglo-Indian, Continental, and gourmet South Indian cuisine overlooking landscaped heritage gardens and pine hills.",
    specialties: [
      "Rosemary Roast Lamb Chops",
      "Wild Mushroom & Truffle Cream Risotto",
      "Signature Tamara Dark Chocolate Fondant",
      "Freshly Baked Artisanal Sourdough & Herb Butter"
    ],
    approxCostForTwo: "₹1,800 – ₹2,500",
    timings: "12:30 PM – 03:30 PM, 07:00 PM – 10:30 PM",
    location: "The Tamara Kodai, St. Mary's Road, Kodaikanal",
    latitude: 10.2295,
    longitude: 77.4985,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewsCount: 2900,
    verified: true
  },
  {
    rank: 2,
    name: "Slate & Pearl",
    slug: "slate-and-pearl-kodaikanal",
    category: "Continental Bistro",
    typeIcon: "☕",
    tagline: "Chic Mountain Bistro with Gourmet Pastas, Wood-Fired Sourdoughs & Artisanal Roasts",
    description: "Sophisticated boutique cafe renowned for aesthetic interiors, specialty roasts, and fresh locally sourced mountain produce. A favorite for brunch lovers craving fluffy pancakes, artisan wood-fired sandwiches, and crafted coffees.",
    specialties: [
      "Smoked Chicken & Pesto Panini",
      "Al Dente Sun-dried Tomato Cream Tagliatelle",
      "Signature French Toast with Mountain Honey",
      "Pour-Over Single Origin Nilgiri Coffee"
    ],
    approxCostForTwo: "₹800 – ₹1,200",
    timings: "09:00 AM – 10:00 PM",
    location: "PT Road, Near Seven Roads Junction, Kodaikanal",
    latitude: 10.2355,
    longitude: 77.4912,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewsCount: 1850,
    verified: true
  },
  {
    rank: 3,
    name: "Jeba Hot Chocolate",
    slug: "jeba-hot-chocolate-kodaikanal",
    category: "Artisan Hot Beverages",
    typeIcon: "☕",
    tagline: "Thick, Decadent Melting Hot Chocolate Concoctions in Chilly Mountain Air",
    description: "Famous local institution celebrating Kodaikanal's chocolate legacy. Serves piping hot, velvety, thick molten chocolate cups infused with dark cocoa, cinnamon, marshmallows, and hazelnuts that warm up travelers instantly.",
    specialties: [
      "Thick Molten Dark Belgian Hot Chocolate",
      "Marshmallow & Hazelnut Loaded Hot Chocolate",
      "Spiced Cinnamon Chili Hot Chocolate",
      "Handcrafted Kodai Chocolate Slabs to take home"
    ],
    approxCostForTwo: "₹250 – ₹450",
    timings: "10:00 AM – 09:30 PM",
    location: "Bazaar Road, Near Lake Road, Kodaikanal",
    latitude: 10.2338,
    longitude: 77.4892,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewsCount: 3400,
    verified: true
  },
  {
    rank: 4,
    name: "Whistler Cafe",
    slug: "whistler-cafe-kodaikanal",
    category: "Cozy View Cafe",
    typeIcon: "🍰",
    tagline: "Cozy Glasshouse Cafe with Pine Valley Views, Cheesecakes & Hot Bakes",
    description: "Aesthetic glass-walled mountain cafe set amid whispering pine foliage. Ideal for afternoon reads, conversations over freshly baked blueberry cheesecakes, wood-fired thin pizzas, and specialty valley teas.",
    specialties: [
      "Classic New York Baked Blueberry Cheesecake",
      "Crispy Thin-Crust Farmhouse Pizza",
      "Hot Apple Cinnamon Crumble with Vanilla Ice Cream",
      "Iced Peach & Passionfruit Cold Brews"
    ],
    approxCostForTwo: "₹650 – ₹950",
    timings: "09:30 AM – 10:00 PM",
    location: "Noyce Road, Near Coaker's Walk, Kodaikanal",
    latitude: 10.2312,
    longitude: 77.4948,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewsCount: 2150,
    verified: true
  },
  {
    rank: 5,
    name: "Punjabi Tadka Tiny Restaurants",
    slug: "punjabi-tadka-kodaikanal",
    category: "Authentic Punjabi Dhaba",
    typeIcon: "🍲",
    tagline: "Steaming Tandoori Rotis, Dal Makhani & Butter-Laden Homestyle Curries",
    description: "Cozy, buzzing homestyle dhabas in Kodaikanal serving piping-hot North Indian comfort food. Perfect on chilly evenings with sizzling tandoori rotis, creamy dal makhani, paneer butter masala, and authentic lassi.",
    specialties: [
      "Slow-Cooked Creamy Dal Makhani",
      "Stuffed Amritsari Aloo & Paneer Kulchas",
      "Smoky Tandoori Chicken & Paneer Tikka",
      "Thick Sweet Punjabi Malai Lassi"
    ],
    approxCostForTwo: "₹450 – ₹700",
    timings: "11:30 AM – 10:30 PM",
    location: "Hospital Road & Woodville Road, Kodaikanal",
    latitude: 10.2342,
    longitude: 77.4875,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviewsCount: 3800,
    verified: true
  },
  {
    rank: 6,
    name: "Kantina Kodaikanal",
    slug: "kantina-kodaikanal",
    category: "Pan-Asian & Bowls",
    typeIcon: "🍜",
    tagline: "Vibrant Asian Street Food, Steaming Ramen Bowls & Dim Sum Baskets",
    description: "Trendy, energetic dining venue bringing modern Pan-Asian flavors to the mist of Kodaikanal. Savor steaming ramen broths, handmade momos, bao buns, and sizzling stir-fried noodles.",
    specialties: [
      "Spicy Miso Ramen with Charred Greens & Soft Egg",
      "Steamed Tibetan Chicken & Corn Dim Sums",
      "Crispy Korean Glazed Wings",
      "Bao Buns with Szechuan Tofu / Pork"
    ],
    approxCostForTwo: "₹750 – ₹1,100",
    timings: "12:00 PM – 10:00 PM",
    location: "Anna Salai, Kodaikanal Main Town",
    latitude: 10.2368,
    longitude: 77.4925,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewsCount: 1620,
    verified: true
  },
  {
    rank: 7,
    name: "Lakeview Kodaikanal",
    slug: "lakeview-kodaikanal",
    category: "Lakeside Dining",
    typeIcon: "🏞️",
    tagline: "Scenic Lake-Facing Multi-Cuisine Dining with Shimmering Water Panoramas",
    description: "Perched along the scenic rim of Kodaikanal Lake, Lakeview offers front-row seats to pedal boats gliding across misty waters. Serves an extensive multi-cuisine menu of South Indian thalis, tandoori grills, and Chinese favorites.",
    specialties: [
      "Lakeview Special Sizzler Platters",
      "Crispy Chettinad Pepper Chicken / Paneer",
      "Fresh Filter Coffee & Hot Pakodas",
      "Multi-Cuisine Family Buffet Lunch"
    ],
    approxCostForTwo: "₹600 – ₹1,000",
    timings: "08:00 AM – 10:00 PM Daily",
    location: "Lake Road, Directly Opposite Kodaikanal Lake Boat Club",
    latitude: 10.2318,
    longitude: 77.4870,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviewsCount: 4500,
    verified: true
  }
];

// =========================================================================
// 3. 12 MUST-VISIT PLACES IN KODAIKANAL (From User Uploaded Infographic 2/11)
// =========================================================================
export const KODAI_MUST_VISIT_PLACES_SUMMARY: KodaiMustVisitPlaceSummary[] = [
  { rank: 1, name: "Kodaikanal Lake", slug: "kodaikanal-lake", category: "Lake & Boating", icon: "⛵", tagline: "60-acre star-shaped lake with pedal & row boating", elevation: "2,285m", timings: "06:00 AM – 06:30 PM" },
  { rank: 2, name: "Coaker's Walk", slug: "coakers-walk", category: "Viewpoint & Rim Walk", icon: "🚶", tagline: "1km cliffside paved walk overlooking dolphin valley", elevation: "2,133m", timings: "07:00 AM – 07:00 PM" },
  { rank: 3, name: "Bryant Park", slug: "bryant-park", category: "Botanical Park", icon: "🌸", tagline: "20-acre landscaped park with 325+ floral species", elevation: "2,200m", timings: "09:00 AM – 06:00 PM" },
  { rank: 4, name: "Pillar Rocks", slug: "pillar-rocks", category: "Granite Cliffs", icon: "⛰️", tagline: "Three 400ft vertical granite pillars rising into mist", elevation: "2,225m", timings: "09:00 AM – 04:30 PM" },
  { rank: 5, name: "Guna Caves", slug: "guna-caves", category: "Geological Chasms", icon: "🪨", tagline: "Manjummel Boys fame rock chasms with gnarled roots", elevation: "2,210m", timings: "09:00 AM – 04:30 PM" },
  { rank: 6, name: "Pine Forest", slug: "pine-forest", category: "Forest Woods", icon: "🌲", tagline: "Historic timber plantation with towering dense pines", elevation: "2,150m", timings: "09:00 AM – 05:00 PM" },
  { rank: 7, name: "Berijam Lake", slug: "berijam-lake", category: "Biosphere Sanctuary", icon: "🌊", tagline: "Protected pristine forest lake requiring Forest e-permit", elevation: "2,165m", timings: "09:30 AM – 03:00 PM" },
  { rank: 8, name: "Poombarai Village", slug: "poombarai-village", category: "Terrace Village", icon: "🏘️", tagline: "3,000-year stepped farm village & Bogar temple", elevation: "1,920m", timings: "Open 24 Hours" },
  { rank: 9, name: "Mannavanur Lake", slug: "mannavanur-lake", category: "Eco Lake & Pasture", icon: "🐑", tagline: "Rolling New Zealand-style green meadows & coracle rides", elevation: "1,880m", timings: "09:00 AM – 05:00 PM" },
  { rank: 10, name: "Kookal Lake", slug: "kookal-lake", category: "Marshland Lake", icon: "🏞️", tagline: "Offbeat high-altitude marshland biodiversity haven", elevation: "1,890m", timings: "06:00 AM – 06:00 PM" },
  { rank: 11, name: "Kumbakkarai Falls", slug: "kumbakkarai-falls", category: "Natural Cascade", icon: "💦", tagline: "Two-tier natural bathing cascade at hill foothills", elevation: "400m", timings: "08:00 AM – 04:30 PM" },
  { rank: 12, name: "Dolphin's Nose", slug: "dolphins-nose", category: "Precipice Ledge", icon: "🐬", tagline: "Flat projecting rock cliff over 6,600ft deep chasm", elevation: "2,050m", timings: "06:00 AM – 05:30 PM" },
];

// =========================================================================
// 4. PUBLIC TRANSPORTATION TO KODAIKANAL (From User Uploaded Infographic 10/11)
// =========================================================================
export const KODAI_TRANSIT_OPTIONS: KodaiTransitOption[] = [
  {
    mode: "air",
    title: "By Air — Madurai Airport (IXM)",
    route: "Madurai Airport ➔ Usilampatti ➔ Batlagundu ➔ Kodaikanal (~120 km / 3 hrs)",
    icon: "✈️",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    description: "Madurai International Airport (IXM) is the closest and most convenient airport to Kodaikanal (120 km away). Frequent flights connect from Chennai, Bangalore, Hyderabad, Mumbai, and Delhi. Taxis and prepaid cabs ascend the scenic Batlagundu Ghat Road in ~3 hours.",
    tips: [
      "Nearest airport: 120 km (Coimbatore is 175 km, Trichy is 195 km)",
      "Prepaid cab fares typically range ₹3,000 – ₹3,800 to Kodaikanal",
      "Stop at Batlagundu foothills for fresh banana chips and coconut water before the ghat climb"
    ]
  },
  {
    mode: "train",
    title: "By Train — Kodai Road & Palani Railway Stations",
    route: "Kodai Road Railway Station (80 km) or Palani Railway Station (65 km via Palani Ghat)",
    icon: "🚂",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    description: "Kodai Road (Station Code: KQN) on the Chennai-Madurai main line is the primary railhead 80 km away, connected with regular taxis and TNSTC buses. Alternatively, Palani Railway Station (PLNI) on the Coimbatore-Dindigul line is 65 km away via the scenic Palani Ghat Pass.",
    tips: [
      "Kodai Road station has frequent connecting buses directly to Kodaikanal bus stand (2.5 hrs)",
      "Palani station is ideal if traveling from Coimbatore, Pollachi, or Kerala",
      "Prepaid cabs and shared jeeps readily available at Kodai Road station entrance"
    ]
  },
  {
    mode: "bus",
    title: "By Bus — Government & Private Buses",
    route: "Regular TNSTC & Private buses from Madurai, Dindigul, Palani, Chennai & Bangalore",
    icon: "🚌",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    description: "Frequent TNSTC buses operate every 30 minutes from Madurai (Arapalayam Bus Stand) and Dindigul Central Bus Stand. Overnight AC sleeper buses (SETC, KPN, SRM, Parveen) run daily from Chennai (520 km) and Bangalore (460 km) directly into Kodaikanal town.",
    tips: [
      "Buses every 30 mins from Madurai Arapalayam & Dindigul",
      "Overnight sleeper buses arrive right at Kodaikanal Central Lake bus depot by 07:00 AM",
      "Affordable fares: ₹110 – ₹180 for government buses; ₹800 – ₹1,400 for luxury AC sleepers"
    ]
  }
];
