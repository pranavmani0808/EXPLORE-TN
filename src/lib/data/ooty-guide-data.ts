export interface OotySeasonGuide {
  seasonKey: "summer" | "monsoon" | "post-monsoon" | "winter";
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

export interface OotyFoodSpot {
  rank: number;
  name: string;
  slug: string;
  category: "Heritage Fine Dining" | "Scenic Mountain Cafe" | "Pure Vegetarian North & South" | "Tandoori & Grill Cuisine" | "Artisan Bakery & Desserts";
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

export interface OotyTravelTip {
  step: number;
  title: string;
  icon: string;
  advice: string;
  actionableHint: string;
}

export interface OotyTransitOption {
  mode: "air" | "train" | "bus";
  title: string;
  route: string;
  icon: string;
  image: string;
  description: string;
  tips: string[];
}

export interface OotyMustVisitPlace {
  rank: number;
  id: string;
  name: string;
  slug: string;
  category: "Garden" | "Peak & Viewpoint" | "Lake & Boating" | "Heritage & Railway" | "Waterfall" | "Culture & Tribal" | "Meadow & Valley";
  icon: string;
  tagline: string;
  description: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timings: string;
  entryFee: string;
  bestTime: string;
  rating: number;
  reviewsCount: number;
  image: string;
  highlights: string[];
  verified: boolean;
}

// =========================================================================
// 1. BEST SEASONS & TIMING GUIDE (From User Uploaded Infographic 3/12)
// =========================================================================
export const OOTY_SEASON_GUIDES: OotySeasonGuide[] = [
  {
    seasonKey: "summer",
    months: "April to June",
    seasonTitle: "Peak Summer Season",
    badge: "🌸 Peak Summer",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    icon: "🌸",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    description: "Pleasant weather, perfect for sightseeing, botanical flower shows, boating on Ooty lake, and family outdoor activities.",
    activities: [
      "Annual Government Botanical Garden Flower Show (May)",
      "Pedal & motor boating on Ooty Lake & Pykara Lake",
      "Scenic toy train rides on Nilgiri Mountain Railway",
      "Strolling through vibrant Rose Garden blooms"
    ],
    weather: {
      temp: "15°C – 25°C",
      condition: "Pleasant, sunny daytime with mild mountain breeze",
      clothing: "Light cottons with light woollens/jackets for chilly evenings"
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
    description: "Lush velvety green tea carpets, roaring waterfalls, dramatic rolling mist clouds, fewer crowds, and a tranquil refreshing hill vibe.",
    activities: [
      "Witnessing Pykara Falls in maximum monsoon spate",
      "Steaming Nilgiri tea tasting at high-altitude tea factories",
      "Dramatic mist photography over Wenlock Downs & tea slopes",
      "Budget-friendly tranquil luxury resort stays"
    ],
    weather: {
      temp: "11°C – 18°C",
      condition: "Frequent misty showers and fresh foggy breeze",
      clothing: "Rain jackets, umbrellas, waterproof shoes, and warm layers"
    }
  },
  {
    seasonKey: "post-monsoon",
    months: "October to November",
    seasonTitle: "Post-Monsoon Season",
    badge: "🍃 Fresh Post-Monsoon",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    icon: "🍃",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    description: "Crystal clear blue skies, washed emerald greenery, scenic lake reflections, and one of the finest overall windows to visit the Nilgiris.",
    activities: [
      "Panoramic views from Doddabetta Peak telescope house",
      "Lakeside picnics at Avalanche & Emerald Lake",
      "Trekking across Pine Forest and Wenlock 9th Mile",
      "Outdoor cafe dining with valley vistas"
    ],
    weather: {
      temp: "12°C – 20°C",
      condition: "Crisp mountain air, brilliant clear skies, and evening chill",
      clothing: "Medium woollens, cardigans, and windbreakers"
    }
  },
  {
    seasonKey: "winter",
    months: "December to February",
    seasonTitle: "Winter Season",
    badge: "❄️ Chilly Winter",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    icon: "❄️",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    description: "Crisp cool mornings with occasional frost on grassy valleys, night drop in temperature, cozy fireplace evenings, and authentic British hill station aura.",
    activities: [
      "Campfire and fireplace dinners at heritage colonial bungalows",
      "Early morning sunrise photography at Doddabetta Peak",
      "Shopping for Nilgiri homemade dark chocolates and winter wear",
      "Steaming hot tandoori & Mughlai cuisine at Angaara"
    ],
    weather: {
      temp: "5°C – 16°C (sub-zero frost on peak valleys)",
      condition: "Cold, crisp sunny days and icy night chill",
      clothing: "Heavy woollens, thermal innerwear, gloves, beanies, and warm jackets"
    }
  }
];

export const OOTY_OVERALL_BEST_WINDOW = {
  window: "October to June",
  tagline: "Great weather, beautiful landscapes, and perfect for all kinds of travelers.",
  recommendation: "Book toy train tickets 60–90 days ahead via IRCTC and secure weekend hotels early."
};

// =========================================================================
// 2. BEST FOOD SPOTS IN OOTY (From User Uploaded Infographic 10/12)
// =========================================================================
export const OOTY_FOOD_SPOTS: OotyFoodSpot[] = [
  {
    rank: 1,
    name: "Earl's Secret",
    slug: "earls-secret-ooty",
    category: "Heritage Fine Dining",
    typeIcon: "🏰",
    tagline: "Colonial Glasshouse Fine Dining amidst Pine Lawns at King's Cliff",
    description: "Housed in the historic King's Cliff heritage mansion, Earl's Secret is Ooty's most celebrated colonial dining venue. Dine inside a sunlit glass conservatory surrounded by pine trees, manicured lawns, and vintage Anglo-Indian charm.",
    specialties: [
      "Continental Roast Chicken",
      "Classic Cream of Wild Mushroom Soup",
      "Signature Brownie with Chocolate Fudge",
      "Wood-Fired Pasta & Herbed Garlic Sourdough"
    ],
    approxCostForTwo: "₹1,200 – ₹1,800",
    timings: "12:30 PM – 3:30 PM, 7:00 PM – 10:30 PM",
    location: "King's Cliff, Havelock Road, Ooty",
    latitude: 11.4178,
    longitude: 76.7025,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewsCount: 4200,
    verified: true
  },
  {
    rank: 2,
    name: "Le Cafe",
    slug: "le-cafe-ooty",
    category: "Scenic Mountain Cafe",
    typeIcon: "☕",
    tagline: "Cozy Blue Wood Mountain Cafe with Fresh Brews, Pizzas & Pastries",
    description: "Quaint European-style cafe in the heart of Ooty featuring royal blue facades, warm wooden interiors, and panoramic hilltop window views. Famous for freshly baked thin-crust artisan pizzas, french crepes, and specialty Nilgiri drip coffees.",
    specialties: [
      "Wood-fired Margherita & Pepperoni Pizzas",
      "Nutella Banana French Crepes",
      "Hot Artisan Belgian Hot Chocolate",
      "Nilgiri Blue Mountain Espresso"
    ],
    approxCostForTwo: "₹600 – ₹900",
    timings: "9:00 AM – 10:00 PM",
    location: "Commercial Road, Upper Bazaar, Ooty",
    latitude: 11.4112,
    longitude: 76.7068,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewsCount: 3800,
    verified: true
  },
  {
    rank: 3,
    name: "Kailash Parbat - Pure Veg",
    slug: "kailash-parbat-ooty",
    category: "Pure Vegetarian North & South",
    typeIcon: "🍃",
    tagline: "Renowned Pure Vegetarian Haven for Royal Chaats, Thalis & Chole Bhature",
    description: "The gold standard for pure vegetarian diners visiting Ooty. Serves authentic Mumbai-style street chaats, fluffy Chole Bhature, rich paneer gravies, and grand North Indian thalis in a clean, family-friendly setting.",
    specialties: [
      "Authentic Delhi-style Chole Bhature",
      "Special Pani Puri & Dahi Sev Puri Platter",
      "Paneer Tikka Lababdar & Garlic Naan",
      "Royal Maharaja North Indian Thali"
    ],
    approxCostForTwo: "₹600 – ₹1,000",
    timings: "11:00 AM – 10:30 PM",
    location: "Near Botanical Garden Main Gate, Ooty",
    latitude: 11.4158,
    longitude: 76.7102,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviewsCount: 3100,
    verified: true
  },
  {
    rank: 4,
    name: "Angaara Restaurant Ooty",
    slug: "angaara-restaurant-ooty",
    category: "Tandoori & Grill Cuisine",
    typeIcon: "🔥",
    tagline: "Sizzling Tandoor Kebabs, Arabian Shawarmas & Rich Dum Biryanis",
    description: "Ooty's crowd-favorite destination for sizzling charcoal grills, clay oven kebabs, Arabian platters, and steaming aromatic biryanis. Perfect for satisfying hearty meat cravings after a long day in chilly Nilgiri winds.",
    specialties: [
      "Angaara Special Sizzler Chicken & Mutton Platter",
      "Authentic Arabian Alfaham Chicken",
      "Slow-Cooked Dum Biryani with Salna",
      "Crispy Garlic Butter Tandoori Rotis"
    ],
    approxCostForTwo: "₹800 – ₹1,300",
    timings: "12:00 PM – 11:00 PM",
    location: "Commercial Road, Near ATC Stand, Ooty",
    latitude: 11.4089,
    longitude: 76.7045,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewsCount: 5400,
    verified: true
  },
  {
    rank: 5,
    name: "Sugar Dribble Cafe",
    slug: "sugar-dribble-cafe-ooty",
    category: "Artisan Bakery & Desserts",
    typeIcon: "🧁",
    tagline: "Chic Pastel Dessert Studio, Handcrafted Cheesecakes & Artisan Hot Bakes",
    description: "Trendy, aesthetically decorated dessert parlour and cafe in Ooty. Loved by travelers for handcrafted cheesecakes, decadent molten chocolate cakes, freshly brewed coffee, and Instagram-worthy dessert plating.",
    specialties: [
      "Lotus Biscoff & Blueberry Baked Cheesecake",
      "Molten Belgian Chocolate Sizzling Brownie",
      "Artisan Tiramisu & Fresh Strawberry Waffles",
      "Cold Brew Tonics & Hazelnut Cappuccino"
    ],
    approxCostForTwo: "₹450 – ₹750",
    timings: "10:30 AM – 10:00 PM",
    location: "Mysore Road, Near Gem Park, Ooty",
    latitude: 11.4135,
    longitude: 76.7088,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewsCount: 2200,
    verified: true
  }
];

// =========================================================================
// 3. 12 MUST-VISIT PLACES IN OOTY (From User Uploaded Infographic 2/12)
// =========================================================================
export const OOTY_MUST_VISIT_PLACES: OotyMustVisitPlace[] = [
  {
    rank: 1,
    id: "ooty-botanical-garden",
    name: "Botanical Garden",
    slug: "botanical-garden-ooty",
    category: "Garden",
    icon: "🌸",
    tagline: "55-acre terraced British botanical garden established in 1848 with 20-million-year-old fossil tree",
    description: "Spread over 55 acres on the lower slopes of Doddabetta Peak. Features 6 distinct sections: Lower Garden, New Garden, Italian Garden, Conservatory, Fountain Terrace, and Nurseries with thousands of exotic temperate flora.",
    latitude: 11.4172,
    longitude: 76.7118,
    elevation: 2240,
    timings: "07:00 AM – 06:30 PM Daily",
    entryFee: "₹40 Adults, ₹20 Children",
    bestTime: "Morning 07:30 AM – 10:30 AM",
    rating: 4.8,
    reviewsCount: 42000,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    highlights: ["20-Million-Year Petrified Fossil Tree Trunk", "Italian Geometric Flower Terraces", "Glasshouse with Rare Orchids & Ferns"],
    verified: true
  },
  {
    rank: 2,
    id: "ooty-doddabetta-peak",
    name: "Doddabetta Peak",
    slug: "doddabetta-peak",
    category: "Peak & Viewpoint",
    icon: "⛰️",
    tagline: "Highest mountain peak in the Nilgiri Hills at 2,637m MSL with 360° Telescope House",
    description: "The highest mountain summit in Tamil Nadu's Nilgiris. Offers sweeping bird's-eye views across the Coimbatore plains, Mysore plateau, and Mukurthi national park ranges from the Tamil Nadu Tourism telescope observatory.",
    latitude: 11.4005,
    longitude: 76.7352,
    elevation: 2637,
    timings: "09:00 AM – 06:00 PM Daily",
    entryFee: "₹10 Entry, nominal telescope viewing fee",
    bestTime: "Early Morning 09:00 AM – 11:00 AM (before heavy mist covers summit)",
    rating: 4.8,
    reviewsCount: 38500,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    highlights: ["2,637m Summit Panoramic Views", "Two-tier Octagonal Telescope House", "Misty Shola Forest Ridge Drive"],
    verified: true
  },
  {
    rank: 3,
    id: "ooty-rose-garden",
    name: "Rose Garden",
    slug: "rose-garden-ooty",
    category: "Garden",
    icon: "🌹",
    tagline: "India's largest rose garden with 20,000+ varieties of roses across 5 curved terrace slopes",
    description: "Situated on the slopes of Elk Hill at 2,200m elevation. Holds over 20,000 cultivars of roses, including Miniature Roses, Hybrid Tea Roses, Floribunda, Ramblers, and unique green & black tinted roses.",
    latitude: 11.4069,
    longitude: 76.7135,
    elevation: 2200,
    timings: "08:30 AM – 06:00 PM Daily",
    entryFee: "₹40 Adults, ₹20 Children",
    bestTime: "09:00 AM – 12:00 PM (March to June for peak bloom)",
    rating: 4.7,
    reviewsCount: 29000,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    highlights: ["20,000+ Unique Rose Varieties", "Nila Maadam Viewpoint Observatory", "South Asia's Largest Specialized Rosary"],
    verified: true
  },
  {
    rank: 4,
    id: "ooty-lake-boathouse",
    name: "Ooty Lake & Boat House",
    slug: "ooty-lake",
    category: "Lake & Boating",
    icon: "🚤",
    tagline: "65-acre historic artificial lake built in 1824 with pedal, row & motor boating against eucalyptus groves",
    description: "Constructed by John Sullivan in 1824 by damming mountain streams. Offers relaxing boating facilities managed by TTDC, cycling tracks along the bank, mini toy train rides, and lakeside carnival stalls.",
    latitude: 11.4098,
    longitude: 76.6908,
    elevation: 2240,
    timings: "09:00 AM – 06:00 PM Daily",
    entryFee: "₹15 Entry + Boating fee (₹150–₹500 depending on boat type)",
    bestTime: "Morning 09:30 AM – 12:00 PM & 03:30 PM – 05:30 PM",
    rating: 4.6,
    reviewsCount: 52000,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    highlights: ["Pedal & Motor Boating on 65-acre Lake", "Lakeside Cycling Path & Pony Rides", "Surrounding Eucalyptus & Willow Groves"],
    verified: true
  },
  {
    rank: 5,
    id: "ooty-tea-factory-museum",
    name: "Tea Factory & Tea Museum",
    slug: "ooty-tea-factory",
    category: "Heritage & Railway",
    icon: "🍵",
    tagline: "Live CTC tea leaf factory demonstration, Nilgiri orthodox tea tasting & museum",
    description: "Located near Doddabetta Peak on a 1-acre hillside slope. Walk through the full production pipeline from green tea leaf plucking, withering, CTC rolling, drying, to packaging, followed by fresh cardamon tea tasting.",
    latitude: 11.4180,
    longitude: 76.7290,
    elevation: 2300,
    timings: "09:00 AM – 06:30 PM Daily",
    entryFee: "₹30 Entry fee (includes complimentary hot cup of tea)",
    bestTime: "10:00 AM – 04:00 PM",
    rating: 4.7,
    reviewsCount: 24500,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    highlights: ["Live CTC Factory Machinery Walkthrough", "Fresh Mountain Tea & Chocolate Tasting", "Steep Tea Garden Viewpoints"],
    verified: true
  },
  {
    rank: 6,
    id: "ooty-pykara-lake-waterfalls",
    name: "Pykara Lake & Waterfalls",
    slug: "pykara-falls",
    category: "Waterfall",
    icon: "🌊",
    tagline: "Sacred Toda mountain river plunging in twin cascades and pristine lake speedboat reservoir",
    description: "Located 21 km from Ooty along the Mysore Highway. Pykara is the largest river in the Nilgiris, sacred to the Toda people. Features dramatic twin waterfalls falling through granite boulders and an expansive boathouse reservoir with high-speed motorboats.",
    latitude: 11.4725,
    longitude: 76.5925,
    elevation: 2150,
    timings: "08:30 AM – 05:30 PM Daily",
    entryFee: "₹10 Waterfall entry, Boating separate",
    bestTime: "10:00 AM – 03:30 PM (Post-monsoon water flow is spectacular)",
    rating: 4.8,
    reviewsCount: 31000,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    highlights: ["Twin Stepped Granite Waterfalls", "Speedboat Safari on Lake Pykara", "Surrounding Virgin Shola Forests"],
    verified: true
  },
  {
    rank: 7,
    id: "ooty-wenlock-downs",
    name: "Wenlock Downs (9th Mile & 6th Mile)",
    slug: "wenlock-downs-ooty",
    category: "Meadow & Valley",
    icon: "⛰️",
    tagline: "Expansive 20,000-acre rolling green undulating meadows famous for Indian cinema shooting",
    description: "Often called the 'Shooting Medu' or 'Golf Downs', Wenlock Downs comprises endless rolling green grasslands reminiscent of the British countryside. Perfect for serene strolls, horseback rides, and panoramic photography.",
    latitude: 11.4428,
    longitude: 76.6345,
    elevation: 2280,
    timings: "09:00 AM – 06:00 PM Daily",
    entryFee: "₹20 Entry per person",
    bestTime: "Morning 09:00 AM – 11:30 AM & Golden Hour 04:00 PM – 05:30 PM",
    rating: 4.8,
    reviewsCount: 21000,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    highlights: ["Endless Undulating Green Meadows", "Classic Bollywood & Kollywood Shooting Spot", "Horse Riding across Grassland Ridges"],
    verified: true
  },
  {
    rank: 8,
    id: "ooty-avalanche-lake",
    name: "Avalanche Lake",
    slug: "avalanche-lake-ooty",
    category: "Lake & Boating",
    icon: "🏞️",
    tagline: "Pristine emerald sanctuary surrounded by blooming rhododendrons, orchids & trout streams",
    description: "Located 28 km south of Ooty in a protected biosphere sanctuary. Named after a massive landslide that formed the natural basin in 1823. Accessible via Forest Department safari vehicles, featuring wild trout hatchery and pristine wilderness.",
    latitude: 11.3052,
    longitude: 76.5912,
    elevation: 2350,
    timings: "09:00 AM – 03:00 PM (Forest Safari Hours)",
    entryFee: "₹150–₹250 for Forest Safari Bus/Jeep",
    bestTime: "09:30 AM – 01:00 PM (Requires entry via Eco-Tourism centre)",
    rating: 4.9,
    reviewsCount: 16500,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    highlights: ["Untouched Forest Ecosystem", "Trout Hatchery & Fly-Fishing Streams", "Rare Magnolia & Rhododendron Blooms"],
    verified: true
  },
  {
    rank: 9,
    id: "ooty-emerald-lake",
    name: "Emerald Lake",
    slug: "emerald-lake-ooty",
    category: "Lake & Boating",
    icon: "💎",
    tagline: "Tranquil sapphire-blue waters tucked amidst Silent Valley tea estates without tourist bustle",
    description: "Part of the Silent Valley reserve region 25 km from Ooty. Renowned for its calm, mirror-like azure waters, tea plantation backdrop, and absence of commercial tourist noise. A paradise for quiet birdwatching and contemplation.",
    latitude: 11.3285,
    longitude: 76.6215,
    elevation: 2200,
    timings: "06:00 AM – 06:00 PM Daily",
    entryFee: "Free Public Access",
    bestTime: "Sunrise 06:30 AM – 09:00 AM & 03:30 PM – 05:30 PM",
    rating: 4.9,
    reviewsCount: 14200,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    highlights: ["Serene Deep Blue Water Mirror", "Picturesque Tea Estate Shoreline", "Quiet Birdwatching Habitat"],
    verified: true
  },
  {
    rank: 10,
    id: "ooty-saint-monica-lake",
    name: "Saint Monica Lake",
    slug: "saint-monica-lake-ooty",
    category: "Lake & Boating",
    icon: "🌲",
    tagline: "Picturesque forest catchment lake surrounded by towering pine woods & quiet trails",
    description: "A lesser-known, scenic woodland catchment reservoir nestled along the upper Nilgiri ridges near Ooty. Flanked by whispering pine trees and eucalyptus groves, offering tranquil picnic surroundings away from congested city points.",
    latitude: 11.3850,
    longitude: 76.6720,
    elevation: 2210,
    timings: "07:00 AM – 05:30 PM Daily",
    entryFee: "Free Public Access",
    bestTime: "08:00 AM – 11:00 AM",
    rating: 4.7,
    reviewsCount: 4800,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    highlights: ["Pine & Shola Forest Reflection", "Offbeat Peaceful Walkways", "Cool Mountain Microclimate"],
    verified: true
  },
  {
    rank: 11,
    id: "ooty-toda-village",
    name: "Toda Village & Tribal Settlement",
    slug: "toda-village-ooty",
    category: "Culture & Tribal",
    icon: "🛖",
    tagline: "Authentic barrel-vaulted Toda huts, ancient buffalo temple rituals & handcrafted embroidery",
    description: "The indigenous Toda people have lived in the high Nilgiris for millennia. Visit traditional barrel-vaulted thatch-and-bamboo dwellings (Mund), see the sacred dairy temples with stone horn motifs, and buy authentic red-and-black Toda shawls (Poothkuli).",
    latitude: 11.4285,
    longitude: 76.7195,
    elevation: 2260,
    timings: "09:00 AM – 05:00 PM",
    entryFee: "Free / Community cultural token",
    bestTime: "10:00 AM – 03:00 PM",
    rating: 4.7,
    reviewsCount: 8900,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    highlights: ["Traditional Barrel-Vaulted Toda Huts", "GI-Tagged Toda Red-and-Black Embroidery", "Sacred Temple Buffalo Culture"],
    verified: true
  },
  {
    rank: 12,
    id: "ooty-nilgiri-mountain-railway",
    name: "Nilgiri Mountain Railway (Toy Train)",
    slug: "ooty-toy-train",
    category: "Heritage & Railway",
    icon: "🚂",
    tagline: "UNESCO World Heritage steam locomotive climbing through 16 tunnels and 250 viaduct bridges",
    description: "Built in 1908 and declared a UNESCO World Heritage site in 2005. Powered by genuine X-class Swiss steam locomotives utilizing the Abt rack-and-pinion system on steep mountain grades from Mettupalayam to Ooty via Coonoor.",
    latitude: 11.4064,
    longitude: 76.7032,
    elevation: 2203,
    timings: "Mettupalayam to Ooty: Departs 07:10 AM | Ooty to Mettupalayam: Departs 02:00 PM",
    entryFee: "First Class: ~₹600, Second Class: ~₹250 (IRCTC advance booking)",
    bestTime: "Morning Departure 07:10 AM from Mettupalayam or 12:15 PM from Coonoor",
    rating: 4.9,
    reviewsCount: 47000,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    highlights: ["UNESCO World Heritage Status", "16 Rock-Cut Tunnels & 250 Bridges", "Ascending Blue Mountain Tea Valleys"],
    verified: true
  }
];

// =========================================================================
// 4. PUBLIC TRANSPORTATION TO OOTY (From User Uploaded Infographic 5/12)
// =========================================================================
export const OOTY_TRANSIT_OPTIONS: OotyTransitOption[] = [
  {
    mode: "air",
    title: "By Air — Coimbatore Airport (CJB)",
    route: "Coimbatore Airport ➔ Mettupalayam ➔ Coonoor ➔ Ooty (~88 km / 2.5–3 hrs)",
    icon: "✈️",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    description: "Coimbatore International Airport (CJB) is the nearest airport to Ooty. Frequent flights connect from Chennai, Bangalore, Mumbai, Delhi, and Hyderabad. Taxis and prepaid airport cabs operate directly up the ghat road to Ooty.",
    tips: [
      "Nearest airport: 88 km from Ooty",
      "Prepaid cab fares typically range ₹2,200 – ₹3,000 to Ooty",
      "Combine flight with morning toy train at Mettupalayam for a classic experience"
    ]
  },
  {
    mode: "train",
    title: "By Train — Coimbatore ➔ Mettupalayam ➔ Ooty Toy Train",
    route: "Nilgiri Express (Chennai to Mettupalayam) ➔ Heritage Toy Train (Mettupalayam to Ooty)",
    icon: "🚂",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    description: "Take the overnight Nilgiri Superfast Express (Train 12671) from Chennai Central to Mettupalayam arriving at 06:15 AM, perfectly connecting with the morning UNESCO Mountain Toy Train (Train 56136) departing Mettupalayam at 07:10 AM.",
    tips: [
      "Book 60–90 days ahead on IRCTC (seats sell out instantly)",
      "If Mettupalayam-Ooty train is full, take bus/cab to Coonoor and ride the Coonoor-Ooty section",
      "Sit on the right side when going uphill from Mettupalayam for best valley panoramas"
    ]
  },
  {
    mode: "bus",
    title: "By Bus — Regular Buses from Coimbatore & Mettupalayam",
    route: "Frequent TNSTC & SETC buses every 15–20 minutes from Coimbatore Gandhipuram & Mettupalayam",
    icon: "🚌",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    description: "Frequent, affordable government (TNSTC) and private deluxe buses operate round the clock from Coimbatore New Bus Stand (Gandhipuram) and Mettupalayam directly to Ooty Central Bus Stand via Kotagiri or Coonoor.",
    tips: [
      "Buses every 15–20 mins from Mettupalayam & Coimbatore",
      "Affordable fares: ₹60 – ₹140 for government buses; ₹250–₹500 for Volvo/AC",
      "Scenic 36-hairpin Kallar Ghat route via Coonoor or scenic Kotagiri pass"
    ]
  }
];

// =========================================================================
// 5. 8 SMART OOTY TRAVEL TIPS (From User Uploaded Infographic 11/12)
// =========================================================================
export const OOTY_TRAVEL_TIPS: OotyTravelTip[] = [
  {
    step: 1,
    title: "Carry Warm Clothes",
    icon: "🧥",
    advice: "Temperatures can drop sharply into single digits, especially after sunset and in winter (sub-zero frost).",
    actionableHint: "Pack thermal innerwear, fleece jackets, beanies, and woollen socks even during summer evenings."
  },
  {
    step: 2,
    title: "Carry Rain Protection",
    icon: "🌧️",
    advice: "Sudden mountain drizzles and misty cloudbursts are common across the Nilgiris throughout the year.",
    actionableHint: "Keep a compact windproof umbrella or waterproof poncho in your daypack."
  },
  {
    step: 3,
    title: "Start Sightseeing Early",
    icon: "🚗",
    advice: "Popular attractions like Botanical Garden, Doddabetta Peak, and Ooty Lake get crowded after 11:00 AM.",
    actionableHint: "Head out by 08:30 AM to beat traffic bottlenecks on narrow mountain roads."
  },
  {
    step: 4,
    title: "Book Weekends Early",
    icon: "📅",
    advice: "Hotel rates surge by 40–80% on long weekends and summer flower show weeks with high occupancy.",
    actionableHint: "Confirm accommodations and required Tamil Nadu e-Pass permits at least 2–3 weeks in advance."
  },
  {
    step: 5,
    title: "Plan the Toy Train in Advance",
    icon: "🚂",
    advice: "The UNESCO Nilgiri Mountain Railway has limited coaches and seats fill up months ahead.",
    actionableHint: "Book via IRCTC 60–90 days ahead or grab unreserved general quota tickets early morning at station counter."
  },
  {
    step: 6,
    title: "Compare Taxi Packages",
    icon: "💰",
    advice: "Local cab stands have standardized union rate charts for Ooty, Coonoor, Pykara, and Avalanche circuits.",
    actionableHint: "Check official pre-paid rates at Ooty Railway Station or ATC Taxi Stand before hiring."
  },
  {
    step: 7,
    title: "Carry Comfortable Footwear",
    icon: "👟",
    advice: "Exploring Doddabetta, Botanical terraces, Wenlock Downs, and Pykara entails substantial hillside walking.",
    actionableHint: "Wear sturdy sports shoes or light trekking boots with reliable grip on damp grassy slopes."
  },
  {
    step: 8,
    title: "Try Nilgiri Tea & Homemade Chocolates",
    icon: "🍫",
    advice: "Ooty is world-famous for fresh green CTC orthodox teas and artisan handcrafted dark chocolates.",
    actionableHint: "Visit King Star or Moddy's on Commercial Road for authentic fudge, truffles, and spice-infused dark bars."
  }
];
