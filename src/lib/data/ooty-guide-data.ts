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
    name: "Moddy's Cafe (Moddy's Chocolates)",
    slug: "moddys-cafe-ooty",
    category: "Artisan Bakery & Desserts",
    typeIcon: "☕",
    tagline: "For Amazing Hot Chocolate & Pastries with Signature Handcrafted Chocolates",
    description: "Legendary Ooty establishment operating since 1951. Famous among tourists and locals alike for rich, thick hot chocolate, warm butter croissants, handcrafted truffles, decadent fudge, and freshly baked pastries.",
    specialties: [
      "Signature Thick Belgian Hot Chocolate",
      "Fresh Oven-Baked Pastries & Croissants",
      "Handcrafted Truffles & Almond Fudge",
      "Blueberry Cheesecake & Sizzling Brownies"
    ],
    approxCostForTwo: "₹400 – ₹700",
    timings: "09:00 AM – 10:00 PM Daily",
    location: "144, Commercial Road, Ooty",
    latitude: 11.4118,
    longitude: 76.7052,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewsCount: 18500,
    verified: true
  },
  {
    rank: 2,
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
    id: "ooty-doddabetta-peak",
    name: "Doddabetta Peak",
    slug: "doddabetta-peak",
    category: "Peak & Viewpoint",
    icon: "⛰️",
    tagline: "Highest point in nilgiris at 2,637m MSL with 360° Telescope House",
    description: "The highest mountain summit in Tamil Nadu's Nilgiris. Offers sweeping panoramic views across the blue mountains, Coimbatore plains, and Mysore plateau from the octagonal telescope house observatory.",
    latitude: 11.4005,
    longitude: 76.7352,
    elevation: 2637,
    timings: "09:00 AM – 06:00 PM Daily",
    entryFee: "₹10 Entry, nominal telescope viewing fee",
    bestTime: "Early Morning 09:00 AM – 11:00 AM",
    rating: 4.8,
    reviewsCount: 38500,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    highlights: ["Highest Point in Nilgiris (2,637m)", "Two-Tier Telescope Observatory", "Misty Shola Forest Ridge"],
    verified: true
  },
  {
    rank: 2,
    id: "ooty-botanical-garden",
    name: "Botanical Garden",
    slug: "botanical-garden-ooty",
    category: "Garden",
    icon: "🌸",
    tagline: "100+ year old garden established in 1848 with 20-million-year-old fossil tree & terraced lawns",
    description: "World-famous 55-acre terraced garden established over 170+ years ago. Features Italian floral layouts, rare exotic temperate trees, glasshouses, and a 20-million-year-old petrified fossil tree trunk.",
    latitude: 11.4172,
    longitude: 76.7118,
    elevation: 2240,
    timings: "07:00 AM – 06:30 PM Daily",
    entryFee: "₹40 Adults, ₹20 Children",
    bestTime: "Morning 07:30 AM – 10:30 AM",
    rating: 4.8,
    reviewsCount: 42000,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    highlights: ["100+ Year Old Heritage Garden", "20-Million-Year Petrified Fossil Tree Trunk", "Italian Geometric Flower Terraces"],
    verified: true
  },
  {
    rank: 3,
    id: "ooty-pine-forest",
    name: "Pine Forest",
    slug: "ooty-pine-forest",
    category: "Peak & Viewpoint",
    icon: "🌲",
    tagline: "Iconic tall pine trees forming an enchanting woodland canopy on gentle slopes",
    description: "Nestled between Ooty and Thalakunda, this iconic pine forest features orderly rows of towering, slender pine trees. A favorite filming location where morning sunbeams stream through the tree canopy.",
    latitude: 11.4312,
    longitude: 76.6625,
    elevation: 2250,
    timings: "08:30 AM – 06:00 PM Daily",
    entryFee: "₹10 Entry per person",
    bestTime: "Morning 08:30 AM – 11:30 AM & 03:30 PM – 05:30 PM",
    rating: 4.8,
    reviewsCount: 19500,
    image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80",
    highlights: ["Iconic Tall Pine Trees", "Cinematic Sunbeam Canopy", "Peaceful Woodland Walking Trails"],
    verified: true
  },
  {
    rank: 4,
    id: "ooty-wenlock-downs",
    name: "9th Mile Shooting Spot",
    slug: "wenlock-downs-ooty",
    category: "Meadow & Valley",
    icon: "⛰️",
    tagline: "Movie shooting famous spot featuring 20,000-acre rolling green undulating meadows",
    description: "Famous across Indian cinema as 'Shooting Medu'. Endless rolling green grassland hills and valleys where hundreds of iconic Bollywood and South Indian movies have been filmed.",
    latitude: 11.4428,
    longitude: 76.6345,
    elevation: 2280,
    timings: "09:00 AM – 06:00 PM Daily",
    entryFee: "₹20 Entry per person",
    bestTime: "Morning 09:00 AM – 11:30 AM & Golden Hour 04:00 PM – 05:30 PM",
    rating: 4.8,
    reviewsCount: 21000,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    highlights: ["Movie Shooting Famous Spot", "20,000-Acre Undulating Green Meadows", "Horse Riding across Grassland Ridges"],
    verified: true
  },
  {
    rank: 5,
    id: "ooty-pykara-falls",
    name: "Pykara Falls",
    slug: "pykara-falls",
    category: "Waterfall",
    icon: "🌊",
    tagline: "Beautiful water falls cascading dramatically in twin tiers over granite mountain rocks",
    description: "Formed by the sacred mountain river Pykara descending through the Nilgiri shola forests in two magnificent tiered waterfalls. Surrounded by untouched nature and scenic viewing decks.",
    latitude: 11.4725,
    longitude: 76.5925,
    elevation: 2150,
    timings: "08:30 AM – 05:30 PM Daily",
    entryFee: "₹10 Waterfall entry",
    bestTime: "10:00 AM – 03:30 PM",
    rating: 4.8,
    reviewsCount: 31000,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    highlights: ["Beautiful Twin Cascades", "Sacred Toda Mountain River", "Protected Shola Forest Trail"],
    verified: true
  },
  {
    rank: 6,
    id: "ooty-pykara-lake-boating",
    name: "Pykara Lake Boating",
    slug: "pykara-lake-boating",
    category: "Lake & Boating",
    icon: "🚤",
    tagline: "Scenic boat ride on pristine mountain waters with speedboats and leisurely cruises",
    description: "Operated by Tamil Nadu Tourism (TTDC). Speed over crystal clear waters flanked by undisturbed pine slopes and misty hills. One of South India's most scenic boat rides.",
    latitude: 11.4680,
    longitude: 76.5980,
    elevation: 2150,
    timings: "09:00 AM – 05:30 PM Daily",
    entryFee: "Speedboat: ₹750–₹1,200 · Motorboat: ₹200–₹400",
    bestTime: "10:00 AM – 04:00 PM",
    rating: 4.8,
    reviewsCount: 26000,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    highlights: ["Scenic Mountain Boat Ride", "Speedboat Safari on Lake Pykara", "Surrounding Virgin Shola Forests"],
    verified: true
  },
  {
    rank: 7,
    id: "ooty-tea-chocolate-factory",
    name: "Tea & Chocolate Factory",
    slug: "ooty-tea-factory",
    category: "Heritage & Railway",
    icon: "🍵",
    tagline: "Live chocolate & tea tasting with live processing demonstration and factory shop",
    description: "Located near Doddabetta Peak. Tour the live CTC tea manufacturing plant, observe artisan homemade chocolate crafting, and enjoy complimentary hot Nilgiri cardamom tea and fresh chocolate samples.",
    latitude: 11.4180,
    longitude: 76.7290,
    elevation: 2300,
    timings: "09:00 AM – 06:30 PM Daily",
    entryFee: "₹30 Entry fee (Includes complimentary hot cup of tea)",
    bestTime: "10:00 AM – 04:00 PM",
    rating: 4.7,
    reviewsCount: 24500,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    highlights: ["Live Chocolate & Tea Tasting", "Live CTC Factory Tour", "Steep Tea Garden Viewpoints"],
    verified: true
  },
  {
    rank: 8,
    id: "ooty-nilgiri-mountain-railway",
    name: "Ooty Toy Train (Nilgiri Mountain Railway)",
    slug: "ooty-toy-train",
    category: "Heritage & Railway",
    icon: "🚂",
    tagline: "UNESCO world heritage toy train with vintage steam engine across 16 tunnels & 250 bridges",
    description: "Built in 1908 and designated a UNESCO World Heritage site in 2005. Powered by genuine X-class Swiss steam locomotives utilizing the historic Abt rack-and-pinion system over steep mountain tracks.",
    latitude: 11.4064,
    longitude: 76.7032,
    elevation: 2203,
    timings: "Mettupalayam to Ooty: Departs 07:10 AM | Ooty to Mettupalayam: Departs 02:00 PM",
    entryFee: "First Class: ~₹600, Second Class: ~₹250 (IRCTC advance booking)",
    bestTime: "Morning Departure 07:10 AM from Mettupalayam or 12:15 PM from Coonoor",
    rating: 4.9,
    reviewsCount: 47000,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    highlights: ["UNESCO World Heritage Status", "16 Rock-Cut Tunnels & 250 Bridges", "Historic Swiss Steam Locomotive"],
    verified: true
  },
  {
    rank: 9,
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
    rank: 10,
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
    rank: 11,
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
    rank: 12,
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
    rank: 13,
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
    rank: 14,
    id: "ooty-cairn-hill",
    name: "Cairn Hill Nature Reserve",
    slug: "ooty-cairn-hill",
    category: "Peak & Viewpoint",
    icon: "🌲",
    tagline: "168-hectare historic reserve forest planted in 1868 with ancient cypress groves & hanging bridge",
    description: "One of the oldest surviving cypress plantations in the Nilgiris (planted 1868) on the Ooty-Avalanche road. Features scenic walking trails through towering cypress and pine trees, a swinging wooden bridge, pre-historic burial cairns, watchtower, and orchidarium.",
    latitude: 11.3912,
    longitude: 76.6854,
    elevation: 2180,
    timings: "09:00 AM – 05:00 PM Daily",
    entryFee: "₹30 Entry per person",
    bestTime: "08:30 AM – 11:30 AM & 03:00 PM – 05:00 PM",
    rating: 4.8,
    reviewsCount: 7800,
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    highlights: ["1868 Ancient Cypress Trees", "Swinging Wooden Canopy Bridge", "Forest Watchtower & Birdwatching Trail", "Prehistoric Tribal Burial Cairns"],
    verified: true
  },
  {
    rank: 15,
    id: "gene-pool-nadugani",
    name: "Gene Pool Eco Tourism Centre",
    slug: "gene-pool-nadugani",
    category: "Peak & Viewpoint",
    icon: "🌿",
    tagline: "Vast plant genetic reserve with 2,000+ medicinal plants, tree house, butterfly garden & nature treks",
    description: "Located at Nadugani near Gudalur along the Nilgiri Biosphere reserve. Established to conserve rare, endangered and endemic flora of the Western Ghats. Features over 2,000 plant species, an arboretum, orchidarium, medicinal herbal garden, tree house observatory, and guided forest nature treks.",
    latitude: 11.5120,
    longitude: 76.4385,
    elevation: 1100,
    timings: "09:00 AM – 05:00 PM Daily",
    entryFee: "₹50 Entry fee",
    bestTime: "09:00 AM – 01:00 PM",
    rating: 4.7,
    reviewsCount: 5400,
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80",
    highlights: ["2,000+ Western Ghats Plant Species", "Guided Forest Trekking Trails", "Tree House & Orchidarium", "Medicinal Flora Conservation"],
    verified: true
  },
  {
    rank: 16,
    id: "elk-hill-murugan-temple",
    name: "Elk Hill Murugan Temple",
    slug: "elk-hill-murugan-temple",
    category: "Culture & Tribal",
    icon: "🛕",
    tagline: "Panoramic hilltop shrine featuring a 40-foot golden Lord Murugan statue inspired by Batu Caves",
    description: "Perched atop Elk Hill overlooking the entire Ooty town and misty blue valleys. Reached via ~300 scenic stone steps, the temple features an impressive 40-foot golden statue of Lord Murugan, modeled after Malaysia's famous Batu Caves idol. Celebrates grand Thaipusam kavadi festivities amidst serene pine slopes.",
    latitude: 11.4022,
    longitude: 76.7095,
    elevation: 2260,
    timings: "09:00 AM – 06:00 PM Daily",
    entryFee: "Free Entry",
    bestTime: "Morning 09:00 AM – 11:30 AM",
    rating: 4.8,
    reviewsCount: 12500,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    highlights: ["40-Foot Golden Murugan Statue (Batu Caves Replica)", "300 Scenic Hill Steps", "Panoramic 360° Valley Views", "Grand Thaipusam Celebrations"],
    verified: true
  },
  {
    rank: 17,
    id: "kodanad-view-point",
    name: "Kodanad View Point (Kotagiri)",
    slug: "kodanad-view-point",
    category: "Peak & Viewpoint",
    icon: "🌄",
    tagline: "Spectacular 220° cliff-edge view overlooking Moyar River gorge, Bhavanisagar dam & tea valleys",
    description: "Situated 18 km from Kotagiri at an elevation of 6,500 feet. Offers one of South India's grandest cliff vantage points with sweeping 220-degree panoramas of the deep Moyar river canyon, Rangaswamy Peak, Thengumarahada tribal valley, and Bhavanisagar reservoir surrounded by emerald tea estates.",
    latitude: 11.5192,
    longitude: 76.9085,
    elevation: 1980,
    timings: "09:00 AM – 06:00 PM Daily",
    entryFee: "Free Public Access",
    bestTime: "09:00 AM – 01:00 PM & 03:30 PM – 05:30 PM",
    rating: 4.8,
    reviewsCount: 22000,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    highlights: ["220° Valley & Canyon Panoramas", "Moyar River & Bhavanisagar Dam View", "Rangaswamy Peak & Pillar Vista", "Rolling Kodanad Tea Estates"],
    verified: true
  },
  {
    rank: 18,
    id: "needle-rock-view-point",
    name: "Needle Rock View Point (Soochimalai)",
    slug: "needle-rock-view-point",
    category: "Peak & Viewpoint",
    icon: "⛰️",
    tagline: "Dramatic needle-shaped conical rock peak with 360° views across Gudalur & Nilambur forests",
    description: "Located near Gudalur along the Ooty-Mysore highway, locally celebrated as 'Soochimalai' (Oosi Malai) due to its sharp conical needle-like rock protrusion. A gentle 1 km walking trek leads to the ridge providing jaw-dropping 360-degree views of dense Mudumalai forests, Bandipur borders, and golden cloud sunsets.",
    latitude: 11.4985,
    longitude: 76.4680,
    elevation: 1400,
    timings: "08:00 AM – 06:00 PM Daily",
    entryFee: "₹20–₹40 Entry per person",
    bestTime: "Morning 08:30 AM – 11:30 AM & Golden Sunset 04:00 PM – 05:30 PM",
    rating: 4.8,
    reviewsCount: 17800,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    highlights: ["Sharp Needle-Shaped Rock Peak", "1 km Scenic Ridge Trail", "360° Sunset Horizon over Forests", "Kerala Border & Nilambur Valley Panoramas"],
    verified: true
  },
  {
    rank: 19,
    id: "ketti-valley-viewpoint",
    name: "Ketti Valley View Point",
    slug: "ketti-valley-viewpoint",
    category: "Peak & Viewpoint",
    icon: "🏞️",
    tagline: "12 km from Ooty — sweeping panoramic views over the second largest gorge valley in the world",
    description: "Known as the Switzerland of South India, Ketti Valley is one of the world's largest inhabited valleys. The telescope viewpoint situated on Ooty-Coonoor highway reveals terraced vegetable farms, tiny hamlets, and misty Western Ghats mountains.",
    latitude: 11.3712,
    longitude: 76.7380,
    elevation: 2150,
    timings: "07:00 AM – 07:00 PM Daily",
    entryFee: "₹10 Telescope View Fee",
    bestTime: "Morning 07:30 AM – 11:00 AM & 04:00 PM – 06:00 PM",
    rating: 4.7,
    reviewsCount: 19400,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    highlights: ["2nd Largest Inhabited Valley in World", "Telescope House Viewing", "Terraced Vegetable Slopes"],
    verified: true
  },
  {
    rank: 20,
    id: "dolphins-nose-viewpoint",
    name: "Dolphin's Nose View Point",
    slug: "dolphins-nose-viewpoint",
    category: "Peak & Viewpoint",
    icon: "🐬",
    tagline: "14 km from Coonoor/Ooty — colossal rock cliff offering unobstructed views of Catherine Falls",
    description: "An enormous rock formation shaped like a dolphin's nose projecting over a sheer drop of thousands of feet. Provides breathtaking views of Catherine Falls plunging into the canyon and endless tea carpeted gorges.",
    latitude: 11.3541,
    longitude: 76.8835,
    elevation: 1550,
    timings: "08:30 AM – 06:00 PM Daily",
    entryFee: "₹15 Entry per person",
    bestTime: "08:30 AM – 11:30 AM (Clear mountain visibility)",
    rating: 4.8,
    reviewsCount: 23500,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    highlights: ["Dolphin-Shaped Rock Cliff", "Unobstructed Catherine Falls View", "Deep Canyon Ravine Vista"],
    verified: true
  },
  {
    rank: 21,
    id: "lambs-rock-viewpoint",
    name: "Lamb's Rock View Point",
    slug: "lambs-rock-viewpoint",
    category: "Peak & Viewpoint",
    icon: "🪨",
    tagline: "13 km from Coonoor/Ooty — jagged precipice dropping dramatically toward Coimbatore plains",
    description: "Named after Captain Lamb who developed access to this dramatic cliff edge. Towering above the dense shola vegetation, Lamb's Rock provides sweeping vistas of the Hulical Ravine, Nilgiri tea slopes, and Coimbatore plains.",
    latitude: 11.3562,
    longitude: 76.8423,
    elevation: 1600,
    timings: "08:30 AM – 05:30 PM Daily",
    entryFee: "₹20 Entry per person",
    bestTime: "09:00 AM – 12:00 PM & 03:30 PM – 05:00 PM",
    rating: 4.7,
    reviewsCount: 16800,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    highlights: ["Hulical Ravine Gorge Vista", "Dramatic Cliff Edge", "Lush Tea Estate Drive"],
    verified: true
  },
  {
    rank: 22,
    id: "sims-park-coonoor",
    name: "Sim's Park Coonoor",
    slug: "sims-park-coonoor",
    category: "Garden",
    icon: "🌺",
    tagline: "18 km from Ooty — historic 30-acre natural garden home to rare Japanese maples & fruit trees",
    description: "Established in 1874 by J.D. Sim, this 30-acre natural botanical garden is landscaped along the natural hill slopes of Coonoor. Features over 1,000 species of rare plants, ancient Rudraksha trees, Queensland Karry pines, and an ornamental boating pond.",
    latitude: 11.3533,
    longitude: 76.7972,
    elevation: 1780,
    timings: "09:00 AM – 06:00 PM Daily",
    entryFee: "₹30 Adults, ₹15 Children",
    bestTime: "09:00 AM – 01:00 PM (May Fruit Show is iconic)",
    rating: 4.8,
    reviewsCount: 28400,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    highlights: ["Annual May Fruit Show", "Rare Japanese Cherry & Maples", "Natural Valley Contours & Boating Pond"],
    verified: true
  },
  {
    rank: 23,
    id: "govt-museum-ooty",
    name: "Government Museum Ooty",
    slug: "govt-museum-ooty",
    category: "Culture & Tribal",
    icon: "🏛️",
    tagline: "3 km from Ooty Bus Stand — rich collection of Toda tribal artifacts, Nilgiri butterflies & ecology",
    description: "Situated on Mysore Road, this museum preserves the distinct tribal heritage of Nilgiri indigenous communities including Toda, Kota, Kurumba, and Irula tribes. Displays traditional huts, bronze sculptures, geology, and Nilgiri butterfly fauna.",
    latitude: 11.4190,
    longitude: 76.6965,
    elevation: 2220,
    timings: "09:30 AM – 05:00 PM (Closed Fridays)",
    entryFee: "₹10 Entry per person",
    bestTime: "10:00 AM – 04:00 PM",
    rating: 4.5,
    reviewsCount: 3800,
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80",
    highlights: ["Indigenous Toda Tribal Artifacts", "Nilgiri Eco-Fauna Specimens", "Stone Sculptures & Woodcraft"],
    verified: true
  },
  {
    rank: 24,
    id: "lovedale-railway-station",
    name: "Lovedale Heritage Railway Station",
    slug: "lovedale-railway-station",
    category: "Heritage & Railway",
    icon: "🚂",
    tagline: "13 km along rail grade — quaint Victorian hill station perched amidst blue gum eucalyptus hills",
    description: "One of the most photogenic halts on the UNESCO Nilgiri Mountain Railway. Built in the late Victorian era with old wooden ticket counters and flower gardens, Lovedale sits surrounded by misty pine forests and tea ridges near Lawrence School.",
    latitude: 11.3820,
    longitude: 76.7088,
    elevation: 2190,
    timings: "08:00 AM – 06:00 PM Daily",
    entryFee: "Free Railway Platform Access",
    bestTime: "Morning Toy Train Arrival (10:30 AM – 11:30 AM)",
    rating: 4.8,
    reviewsCount: 8200,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    highlights: ["UNESCO Mountain Railway Station", "Victorian Architecture & Flower Beds", "Peaceful Pine Forest Environs"],
    verified: true
  },
  {
    rank: 25,
    id: "govt-orange-farm-burliar",
    name: "Government Orange Farm (Burliar)",
    slug: "govt-orange-farm-burliar",
    category: "Garden",
    icon: "🍊",
    tagline: "4 km from Kallar/Mettupalayam Ghat — lush 1871 fruit farm cultivating Mandarin oranges, mangosteen & spices",
    description: "Established in 1871 along the Mettupalayam-Coonoor ghat road in Burliar. A renowned state horticultural station cultivating Coorg & Nilgiri mandarin oranges, exotic mangosteen, nutmeg, clove, and jackfruit trees on tiered mountain slopes.",
    latitude: 11.3325,
    longitude: 76.8480,
    elevation: 850,
    timings: "09:00 AM – 05:00 PM Daily",
    entryFee: "₹15 Entry per person",
    bestTime: "10:00 AM – 03:30 PM",
    rating: 4.6,
    reviewsCount: 4900,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    highlights: ["Mandarin Orange Orchards", "Exotic Mangosteen & Spices", "Historic 1871 State Fruit Station"],
    verified: true
  },
  {
    rank: 26,
    id: "uyilatti-holy-water-falls",
    name: "Uyilatti Holy Water Falls (Elk Falls)",
    slug: "uyilatti-holy-water-falls",
    category: "Waterfall",
    icon: "🌊",
    tagline: "Untouched 80-foot double cascade & sacred mountain theertham near Rangaswamy Peak & Sullivan's Bungalow",
    description: "Also celebrated as Elk Falls near Uyilatty village and Kookalthorai in the Kotagiri range. Originating from pristine high-altitude catchment streams near sacred Rangaswamy Peak, this peaceful 80-foot two-tiered waterfall tumbles into a sparkling forest pool. Revered by local communities for its pure mountain waters, flanked by sprawling tea gardens and orange groves without noisy commercial stalls.",
    latitude: 11.4385,
    longitude: 76.8842,
    elevation: 1750,
    timings: "08:00 AM – 05:30 PM Daily",
    entryFee: "Free Public Nature Access",
    bestTime: "Post-Monsoon (September to January) & 09:00 AM – 02:00 PM",
    rating: 4.8,
    reviewsCount: 6200,
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
    highlights: ["80-Foot Double-Tiered Waterfall", "Sacred Natural Mountain Spring", "Quiet Offbeat Tea Valley Hike", "Historic Sullivan's First Camp Region"],
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

// =========================================================================
// 6. EXPLORE OOTY ROUTE MAP & DISTANCE GUIDE (From User Uploaded Infographic)
// Clean transit spine with distances, no watermark/channel handles
// =========================================================================
export interface OotyRouteBranchSpot {
  name: string;
  distanceKm: number;
  distanceDisplay: string;
  category: "viewpoint" | "garden" | "lake" | "heritage" | "activity" | "forest" | "temple" | "wildlife";
  side: "left" | "right";
  description: string;
  connectedHub: "mettupalayam-ketti" | "ooty-bus-stand" | "ooty-ketti" | "ooty-gudalur" | "coonoor-spur";
}

export interface OotySpineStation {
  name: string;
  code: string;
  distanceFromStart?: string;
  role: "start" | "waypoint" | "hub" | "terminus";
  elevation: string;
  note: string;
}

export const OOTY_ROUTE_SPINE_STATIONS: OotySpineStation[] = [
  {
    name: "COIMBATORE (METTUPALAYAM)",
    code: "MTP",
    role: "start",
    elevation: "325m MSL",
    note: "Starting hub at the base of Nilgiri Ghats. Starting point of heritage Toy Train."
  },
  {
    name: "KALLAR",
    code: "KLR",
    distanceFromStart: "12 KM",
    role: "waypoint",
    elevation: "384m MSL",
    note: "Base ghat check post and start of the 36 hairpin mountain bends."
  },
  {
    name: "KETTI",
    code: "KTI",
    distanceFromStart: "76 KM",
    role: "waypoint",
    elevation: "2,150m MSL",
    note: "Gateway to the majestic Ketti Valley, world's 2nd largest inhabited valley."
  },
  {
    name: "OOTY BUS STAND",
    code: "UAM",
    distanceFromStart: "88 KM",
    role: "hub",
    elevation: "2,240m MSL",
    note: "Central nerve centre connecting town sights, lake, gardens & Gudalur highway."
  },
  {
    name: "OOTY RAILWAY STATION",
    code: "UAM-R",
    distanceFromStart: "1.5 KM from Bus Stand",
    role: "waypoint",
    elevation: "2,210m MSL",
    note: "UNESCO World Heritage terminus for the Nilgiri Mountain Railway."
  },
  {
    name: "GUDALUR",
    code: "GDR",
    distanceFromStart: "48 KM from Ooty",
    role: "terminus",
    elevation: "1,180m MSL",
    note: "Gateway town connecting to Mudumalai Sanctuary, Bandipur, and Mysuru."
  }
];

export const OOTY_ROUTE_MAP_BRANCHES: OotyRouteBranchSpot[] = [
  // --- Metttupalayam / Kallar to Ketti Sector ---
  {
    name: "Ketti Valley View Point",
    distanceKm: 12,
    distanceDisplay: "12 KM",
    category: "viewpoint",
    side: "left",
    description: "Panoramic view over Switzerland of South India with telescope station",
    connectedHub: "mettupalayam-ketti"
  },
  {
    name: "Dolphin's Nose View Point",
    distanceKm: 14,
    distanceDisplay: "14 KM",
    category: "viewpoint",
    side: "left",
    description: "Sheer rock face projecting over Catherine Falls gorge",
    connectedHub: "mettupalayam-ketti"
  },
  {
    name: "Lamb's Rock View Point",
    distanceKm: 13,
    distanceDisplay: "13 KM",
    category: "viewpoint",
    side: "left",
    description: "Cliff edge viewpoint overlooking Hulical Ravine and Coimbatore plains",
    connectedHub: "mettupalayam-ketti"
  },
  {
    name: "Sim's Park",
    distanceKm: 18,
    distanceDisplay: "18 KM",
    category: "garden",
    side: "left",
    description: "1874 natural terraced botanical park in Coonoor with rare flora & lake",
    connectedHub: "mettupalayam-ketti"
  },
  {
    name: "Wenlock Downs (9th Mile)",
    distanceKm: 9,
    distanceDisplay: "9 KM",
    category: "viewpoint",
    side: "right",
    description: "Endless rolling green cinema meadows and shola peaks",
    connectedHub: "mettupalayam-ketti"
  },
  {
    name: "Pine Forest",
    distanceKm: 10,
    distanceDisplay: "10 KM",
    category: "forest",
    side: "right",
    description: "Towering orderly pine woods canopy favored by movie directors",
    connectedHub: "mettupalayam-ketti"
  },
  {
    name: "Lovedale (Lovely Land) Railway Station",
    distanceKm: 13,
    distanceDisplay: "13 KM",
    category: "heritage",
    side: "right",
    description: "Quaint colonial heritage mountain railway halt amidst pine ridges",
    connectedHub: "mettupalayam-ketti"
  },

  // --- Ketti Valley / Southwest Sector ---
  {
    name: "Shooting Spot (Ketti)",
    distanceKm: 6.5,
    distanceDisplay: "6.5 KM",
    category: "activity",
    side: "left",
    description: "Scenic valley clearing famous for cinema film sets",
    connectedHub: "ooty-ketti"
  },
  {
    name: "Horse Ride (Ketti Valley)",
    distanceKm: 7,
    distanceDisplay: "7 KM",
    category: "activity",
    side: "left",
    description: "Guided horseback trails through pine woods and valley slopes",
    connectedHub: "ooty-ketti"
  },

  // --- Central Ooty Bus Stand Hub Sector ---
  {
    name: "Botanical Garden",
    distanceKm: 2,
    distanceDisplay: "2 KM",
    category: "garden",
    side: "right",
    description: "175-year-old 55-acre heritage garden with fossil tree trunk",
    connectedHub: "ooty-bus-stand"
  },
  {
    name: "Ooty Lake / Boating Area",
    distanceKm: 3,
    distanceDisplay: "3 KM",
    category: "lake",
    side: "right",
    description: "65-acre 1824 recreational reservoir with pedal & motorboats",
    connectedHub: "ooty-bus-stand"
  },
  {
    name: "Tea Museum & Factory",
    distanceKm: 2.5,
    distanceDisplay: "2.5 KM",
    category: "heritage",
    side: "right",
    description: "Live CTC tea leaf manufacture and artisan chocolate tasting",
    connectedHub: "ooty-bus-stand"
  },
  {
    name: "Rose Garden",
    distanceKm: 2,
    distanceDisplay: "2 KM",
    category: "garden",
    side: "right",
    description: "South Asia's premier rosary with 20,000+ cultivars on Elk Hill",
    connectedHub: "ooty-bus-stand"
  },
  {
    name: "Govt. Museum",
    distanceKm: 3,
    distanceDisplay: "3 KM",
    category: "heritage",
    side: "right",
    description: "Indigenous Toda tribal culture, artifacts and Nilgiri butterfly fauna",
    connectedHub: "ooty-bus-stand"
  },
  {
    name: "Dodda Betta Peak",
    distanceKm: 6,
    distanceDisplay: "6 KM",
    category: "viewpoint",
    side: "right",
    description: "Highest Nilgiris peak (2,637m) with telescope house observatory",
    connectedHub: "ooty-bus-stand"
  },

  // --- Coonoor Spur Sector ---
  {
    name: "Govt. Orange Farm (Burliar)",
    distanceKm: 4,
    distanceDisplay: "4 KM",
    category: "garden",
    side: "right",
    description: "1871 fruit research station growing Mandarin oranges & exotic spices",
    connectedHub: "coonoor-spur"
  },
  {
    name: "Coonoor (Kunnoor) Town",
    distanceKm: 18,
    distanceDisplay: "18 KM",
    category: "heritage",
    side: "right",
    description: "Scenic hill town known for Nilgiri tea estates and cooler altitude",
    connectedHub: "coonoor-spur"
  },
  {
    name: "Coonoor Railway Station",
    distanceKm: 19,
    distanceDisplay: "19 KM",
    category: "heritage",
    side: "right",
    description: "Key locomotive changeover station for the Nilgiri Mountain Railway",
    connectedHub: "coonoor-spur"
  },
  {
    name: "Lakshmi Narayana Temple (Kunnoor)",
    distanceKm: 20,
    distanceDisplay: "20 KM",
    category: "temple",
    side: "right",
    description: "Historic stone temple sanctuary with peaceful Nilgiri mountain backdrop",
    connectedHub: "coonoor-spur"
  },

  // --- West / Gudalur Highway Sector ---
  {
    name: "Pykara Lake",
    distanceKm: 20,
    distanceDisplay: "20 KM",
    category: "lake",
    side: "left",
    description: "Pristine reservoir surrounded by shola forests and speedboats",
    connectedHub: "ooty-gudalur"
  },
  {
    name: "Pykara Waterfalls",
    distanceKm: 23,
    distanceDisplay: "23 KM",
    category: "viewpoint",
    side: "left",
    description: "Two-tiered dramatic natural cascade plunging through granite boulders",
    connectedHub: "ooty-gudalur"
  },
  {
    name: "Mudumalai Wildlife Sanctuary",
    distanceKm: 35,
    distanceDisplay: "35 KM",
    category: "wildlife",
    side: "left",
    description: "Tiger reserve safari hub with wild elephants, gaur, and leopard habitats",
    connectedHub: "ooty-gudalur"
  },
  {
    name: "Avalanche Lake",
    distanceKm: 28,
    distanceDisplay: "28 KM",
    category: "lake",
    side: "left",
    description: "Pristine biosphere reserve lake with trout streams and safari gypsies",
    connectedHub: "ooty-gudalur"
  },
  {
    name: "Pykara Check Post",
    distanceKm: 27,
    distanceDisplay: "27 KM",
    category: "activity",
    side: "left",
    description: "High mountain forest boundary pass towards Gudalur & Nadugani",
    connectedHub: "ooty-gudalur"
  }
];

