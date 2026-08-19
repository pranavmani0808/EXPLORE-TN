export type AdventureCategory =
  | "All"
  | "Air Adventures"
  | "Water Adventures"
  | "Mountain Adventures"
  | "Snow Adventures"
  | "Extreme Adventures";

export type AdventureDifficulty = "Easy" | "Moderate" | "Advanced" | "Extreme";

export interface AdventureActivity {
  id: string;
  name: string;
  destination: string;
  state: string;
  country: string;
  category: AdventureCategory;
  description: string;
  image: string;
  fallbackImage: string;
  difficulty: AdventureDifficulty;
  duration: string;
  estimatedPrice: string;
  bestSeason: string;
  tags: string[];
  popularityScore: number;
  featured?: boolean;
}

export const adventureCategories: AdventureCategory[] = [
  "All",
  "Air Adventures",
  "Water Adventures",
  "Mountain Adventures",
  "Snow Adventures",
  "Extreme Adventures",
];

export const adventureActivities: AdventureActivity[] = [
  {
    id: "paragliding-bir-billing",
    name: "Paragliding",
    destination: "Bir Billing",
    state: "Himachal Pradesh",
    country: "India",
    category: "Air Adventures",
    description: "Soar over Dhauladhar mountain peaks and pine forests at world's 2nd highest paragliding takeoff point (2,400m).",
    image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Moderate",
    duration: "2–3 hrs (30m flight)",
    estimatedPrice: "₹3,000 – ₹5,000",
    bestSeason: "Oct – Jun",
    tags: ["Tandem Flight", "Mountain Views", "World Famous"],
    popularityScore: 98,
    featured: true,
  },
  {
    id: "skydiving-mysore",
    name: "Skydiving",
    destination: "Mysore",
    state: "Karnataka",
    country: "India",
    category: "Extreme Adventures",
    description: "Freefall at 200 km/h from 10,000 feet with stunning aerial panoramas of Chamundi Hills and Mysore Palace.",
    image: "https://images.unsplash.com/photo-1521673161888-a1b97282b0f4?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Extreme",
    duration: "3–4 hrs (Tandem jump)",
    estimatedPrice: "₹25,000 – ₹35,000",
    bestSeason: "Oct – Mar",
    tags: ["Freefall", "Adrenaline", "Tandem Jump"],
    popularityScore: 95,
    featured: true,
  },
  {
    id: "hot-air-balloon-jaipur",
    name: "Hot-Air Balloon Ride",
    destination: "Jaipur",
    state: "Rajasthan",
    country: "India",
    category: "Air Adventures",
    description: "Drift peacefully over ancient Pink City forts, Amber Palace walls, and royal Aravali landscapes at sunrise.",
    image: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Easy",
    duration: "3 hrs (60m flight)",
    estimatedPrice: "₹12,000 – ₹18,000",
    bestSeason: "Sep – Apr",
    tags: ["Sunrise Ride", "Royal Forts", "Scenic Glide"],
    popularityScore: 92,
    featured: true,
  },
  {
    id: "scuba-diving-havelock",
    name: "Scuba Diving",
    destination: "Havelock Island",
    state: "Andaman & Nicobar Islands",
    country: "India",
    category: "Water Adventures",
    description: "Dive into crystal clear Bay of Bengal waters to explore vibrant coral reefs, sea turtles, and marine life.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Moderate",
    duration: "4 hrs (45m underwater)",
    estimatedPrice: "₹4,500 – ₹7,000",
    bestSeason: "Nov – Apr",
    tags: ["Coral Reef", "Marine Life", "PADI Instructors"],
    popularityScore: 96,
    featured: true,
  },
  {
    id: "kayaking-zanskar",
    name: "Kayaking",
    destination: "Zanskar River",
    state: "Ladakh",
    country: "India",
    category: "Mountain Adventures",
    description: "Paddle through roaring Grade IV rapids cut deep into dramatic 1,000-foot granite Ladakh canyon walls.",
    image: "https://images.unsplash.com/photo-1508873696983-2df515122519?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Advanced",
    duration: "Half-Day / Multi-Day",
    estimatedPrice: "₹5,000 – ₹8,000",
    bestSeason: "Jun – Sep",
    tags: ["High Altitude", "White Water", "Grade IV Rapids"],
    popularityScore: 89,
    featured: false,
  },
  {
    id: "river-rafting-rishikesh",
    name: "River Rafting",
    destination: "Rishikesh",
    state: "Uttarakhand",
    country: "India",
    category: "Water Adventures",
    description: "Conquer legendary Ganges white water rapids including Roller Coaster and Golf Course against Himalayan foothill views.",
    image: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1508873696983-2df515122519?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Moderate",
    duration: "3–5 hrs (16–26 km)",
    estimatedPrice: "₹1,500 – ₹3,500",
    bestSeason: "Sep – Jun",
    tags: ["White Water", "Ganges Rapids", "Cliff Jump"],
    popularityScore: 99,
    featured: true,
  },
  {
    id: "surfing-goa",
    name: "Surfing",
    destination: "Goa",
    state: "Goa",
    country: "India",
    category: "Water Adventures",
    description: "Catch beginner-friendly warm ocean waves along Arambol and Morjim beach breaks with certified ISA surf guides.",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Easy",
    duration: "2 hrs (Lesson + Practice)",
    estimatedPrice: "₹2,000 – ₹3,500",
    bestSeason: "Nov – Apr",
    tags: ["Beach Break", "Beginner Friendly", "Sunset Surf"],
    popularityScore: 91,
    featured: false,
  },
  {
    id: "surfing-kovalam",
    name: "Surfing",
    destination: "Kovalam",
    state: "Kerala",
    country: "India",
    category: "Water Adventures",
    description: "Ride Arabian Sea point breaks under the shadow of Kovalam's iconic red-and-white lighthouse tower.",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Moderate",
    duration: "2 hrs",
    estimatedPrice: "₹2,200 – ₹4,000",
    bestSeason: "Oct – May",
    tags: ["Lighthouse Beach", "Point Break", "Kerala Coast"],
    popularityScore: 88,
    featured: false,
  },
  {
    id: "gulmarg-gondola-kashmir",
    name: "Gulmarg Gondola Ride",
    destination: "Gulmarg",
    state: "Jammu & Kashmir",
    country: "India",
    category: "Snow Adventures",
    description: "Ride Asia's longest and highest cable car (4,200m) to Kongdoori & Apharwat Peak for alpine skiing and snow slopes.",
    image: "https://images.unsplash.com/photo-1548625361-185871f302b5?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Easy",
    duration: "2–4 hrs",
    estimatedPrice: "₹1,000 – ₹2,500",
    bestSeason: "Dec – Mar (Snow)",
    tags: ["Asia's Highest Cable Car", "Powder Snow", "Himalayan Peak"],
    popularityScore: 97,
    featured: true,
  },
  {
    id: "sea-walking-elephant-beach",
    name: "Sea Walking",
    destination: "Elephant Beach, Havelock Island",
    state: "Andaman & Nicobar Islands",
    country: "India",
    category: "Water Adventures",
    description: "Walk on the ocean seabed at 6-meter depth using oxygen helmets surrounded by exotic clownfish and live corals.",
    image: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Easy",
    duration: "2 hrs (25m walking)",
    estimatedPrice: "₹3,500 – ₹5,000",
    bestSeason: "Oct – May",
    tags: ["No Swimming Needed", "Underwater Walk", "Helmet Dive"],
    popularityScore: 94,
    featured: false,
  },
];
