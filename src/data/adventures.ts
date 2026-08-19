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
  fullDescription: string;
  image: string;
  fallbackImage: string;
  difficulty: AdventureDifficulty;
  duration: string;
  estimatedPrice: string;
  bestSeason: string;
  altitude?: string;
  coordinates: { lat: number; lng: number };
  tags: string[];
  highlights: string[];
  howToReach: {
    airport: string;
    railway: string;
    road: string;
  };
  safetyEquipment: string[];
  inclusions: string[];
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
    fullDescription: "Bir Billing is globally acclaimed as the paragliding capital of India and the host of the Paragliding World Cup. The takeoff point at Billing (2,400m altitude) offers optimal thermals and smooth wind currents allowing tandem gliders to stay airborne for 15 to 40 minutes while soaring above terraced tea gardens, Buddhist monasteries, and snow-capped Himalayan ridges before landing gracefully at Bir (1,400m).",
    image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Moderate",
    duration: "2–3 hrs (30m flight)",
    estimatedPrice: "₹3,000 – ₹5,000",
    bestSeason: "Oct – Jun",
    altitude: "2,400m (Takeoff) / 1,400m (Landing)",
    coordinates: { lat: 32.0365, lng: 76.7196 },
    tags: ["Tandem Flight", "Mountain Views", "World Famous"],
    highlights: [
      "Takeoff from Billing peak at 2,400 meters altitude",
      "Panoramic views of Dhauladhar Himalayan mountain range",
      "Tandem flight with FAI-certified professional gliders",
      "HD Go-Pro action video & photo footage package"
    ],
    howToReach: {
      airport: "Gaggal Airport (Dharamshala) - 67 km away",
      railway: "Pathankot Junction - 140 km away",
      road: "Direct overnight Volvo buses from New Delhi (520 km)"
    },
    safetyEquipment: [
      "Reserve parachute & dual harness system",
      "High-impact protective flight helmet",
      "Radio communication link between pilot & landing ground",
      "Wind meter (Anemometer) pre-flight clearance"
    ],
    inclusions: [
      "Shared jeep transport from Bir landing site to Billing takeoff site",
      "15-30 mins tandem paragliding flight",
      "GoPro 4K video recording",
      "Safety gear & pilot fee"
    ],
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
    fullDescription: "Mysore is India's premier year-round skydiving dropzone located at the base of Chamundi Hills. After a comprehensive ground briefing, you board a aircraft ascending to 10,000 feet altitude. Strapped to a master USPA instructor, you jump into pure atmosphere experiencing 30 to 40 seconds of terminal velocity freefall at 200 km/h before the parachute opens for a peaceful 5-minute canopy float over Mysore Palace and Karanji Lake.",
    image: "https://images.unsplash.com/photo-1521673161888-a1b97282b0f4?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Extreme",
    duration: "3–4 hrs (Tandem jump)",
    estimatedPrice: "₹25,000 – ₹35,000",
    bestSeason: "Oct – Mar",
    altitude: "10,000 ft (3,048m) AGL",
    coordinates: { lat: 12.2958, lng: 76.6394 },
    tags: ["Freefall", "Adrenaline", "Tandem Jump"],
    highlights: [
      "10,000 ft high-altitude aircraft jump",
      "30-40 seconds of terminal velocity freefall at 200 km/h",
      "Aerial views of Mysore Palace, Chamundi Hill & Cauvery basin",
      "USPA-certified licensed instructor tandem harness"
    ],
    howToReach: {
      airport: "Mysore Airport (Mandakalli) - 10 km from dropzone",
      railway: "Mysore Junction - 8 km away",
      road: "Expressway drive from Bengaluru (140 km / 2.5 hrs)"
    },
    safetyEquipment: [
      "Dual main and Automatic Activation Device (AAD) reserve parachute",
      "Altimeter & jumpsuit gear",
      "USPA master tandem harness",
      "Pre-jump medical fitness certification"
    ],
    inclusions: [
      "30-minute pre-jump ground instruction module",
      "10,000 ft Cessna flight ride",
      "Tandem skydiving jump with certified instructor",
      "Handcam video recording & jump certificate"
    ],
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
    altitude: "1,200 ft AGL",
    coordinates: { lat: 26.9124, lng: 75.7873 },
    tags: ["Sunrise Ride", "Royal Forts", "Scenic Glide"],
    highlights: [
      "Sunrise aerial flight over Amber Fort, Nahargarh & Aravali hills",
      "360-degree bird's-eye view of traditional Rajasthani villages",
      "Commercial pilot licensed flight operation",
      "Traditional post-flight champagne toast ceremony & certificate"
    ],
    howToReach: {
      airport: "Jaipur International Airport (Sanganer) - 15 km away",
      railway: "Jaipur Junction - 6 km away",
      road: "Delhi-Jaipur Expressway (260 km / 4.5 hrs)"
    },
    safetyEquipment: [
      "DGCA approved hot air balloon equipment",
      "Dual burner system & emergency venting valve",
      "Qualified commercial pilot with 1000+ flight hours",
      "Chase crew tracking vehicle"
    ],
    inclusions: [
      "Hotel pick-up & drop-off transfers in Jaipur",
      "60-minute hot air balloon flight",
      "Pre-flight tea & coffee snacks",
      "Flight certificate signed by captain"
    ],
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
    altitude: "12m underwater depth",
    coordinates: { lat: 12.0000, lng: 92.9800 },
    tags: ["Coral Reef", "Marine Life", "PADI Instructors"],
    highlights: [
      "Dive at famous sites like Elephant Beach & Nemo Reef",
      "Spot clownfish, stingrays, sea turtles & live brain coral",
      "One-on-one PADI certified instructor assistance",
      "No prior swimming experience required for Discover Scuba"
    ],
    howToReach: {
      airport: "Veer Savarkar Airport (Port Blair) - Fly to Port Blair",
      railway: "N/A (Island destination)",
      road: "90-minute AC catamaran ferry ride from Port Blair to Havelock"
    },
    safetyEquipment: [
      "PADI approved scuba regulator & buoyancy control device (BCD)",
      "Underwater pressure gauge & depth meter",
      "Emergency oxygen cylinder on dive boat",
      "Full neoprene wetsuit & mask gear"
    ],
    inclusions: [
      "Boat ride to dive site",
      "PADI instructor ground training session",
      "45-minute underwater scuba dive",
      "Underwater GoPro photography & video clips"
    ],
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
    altitude: "3,500m (High Altitude River Basin)",
    coordinates: { lat: 33.4833, lng: 76.8833 },
    tags: ["High Altitude", "White Water", "Grade IV Rapids"],
    highlights: [
      "Navigate Grade III to IV rapids in the 'Grand Canyon of Asia'",
      "Pass through steep 1,000 ft towering limestone cliff gorges",
      "Crystal-clear glacial water from Zanskar glacier melt",
      "Expedition guide team with safety kayakers"
    ],
    howToReach: {
      airport: "Kushok Bakula Rimpoche Airport (Leh) - 35 km to river confluence",
      railway: "Jammu Tawi - 700 km away",
      road: "Leh-Kargil highway via Nimmoo confluence"
    },
    safetyEquipment: [
      "High flotation Whitewater Type V PFD vest",
      "Kevlar whitewater helmet",
      "Drysuit & thermal under-layers",
      "Safety throw bags & rescue kayaks"
    ],
    inclusions: [
      "Whitewater kayak & paddle equipment",
      "Drysuit & safety gear rental",
      "Expert river expedition guide & safety boat",
      "Riverfront hot lunch & tea"
    ],
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
    altitude: "340m AGL",
    coordinates: { lat: 30.0869, lng: 78.2676 },
    tags: ["White Water", "Ganges Rapids", "Cliff Jump"],
    highlights: [
      "Raft 16 km (Shivpuri to Laxman Jhula) or 26 km (Marine Drive)",
      "Hit famous Grade III+ rapids: Roller Coaster, Golf Course, Clubhouse",
      "Cliff jumping option at 25-foot natural rock face",
      "Body surfing in calm river stretches"
    ],
    howToReach: {
      airport: "Jolly Grant Airport (Dehradun) - 21 km away",
      railway: "Rishikesh / Haridwar Railway Station - 25 km",
      road: "Direct overnight buses from New Delhi (240 km / 5 hrs)"
    },
    safetyEquipment: [
      "ISO-certified rafting life jacket with head collar",
      "Whitewater safety helmet",
      "Self-bailing inflatable raft",
      "Safety throw ropes & river guide"
    ],
    inclusions: [
      "Rafting gear & paddle equipment",
      "Transport from Rishikesh booking office to rafting start point",
      "Certified river guide on board",
      "Cliff jump assistance"
    ],
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
    altitude: "Sea level",
    coordinates: { lat: 15.6868, lng: 73.7042 },
    tags: ["Beach Break", "Beginner Friendly", "Sunset Surf"],
    highlights: [
      "Learn pop-up techniques on soft-top surfboard",
      "Catch 2 to 4 foot gentle waist-high sandbar waves",
      "ISA (International Surfing Association) certified instructor",
      "Warm tropical 28°C ocean water with zero wetsuit needed"
    ],
    howToReach: {
      airport: "Dabolim Airport / Mopa Airport - 55 km away",
      railway: "Thivim / Pernem Railway Station - 20 km",
      road: "Cab or scooter ride along North Goa beach road"
    },
    safetyEquipment: [
      "Soft-top beginner foam surfboard with leash",
      "UV protective rash guard shirt",
      "Lifeguard monitored beach zone",
      "Shallow water sandbar instruction zone"
    ],
    inclusions: [
      "2-hour surfing lesson (30m beach theory + 90m ocean time)",
      "Surfboard rental & leash",
      "Rashguard shirt",
      "Instructor feedback & photo session"
    ],
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
    altitude: "Sea level",
    coordinates: { lat: 8.4004, lng: 76.9787 },
    tags: ["Lighthouse Beach", "Point Break", "Kerala Coast"],
    highlights: [
      "Surf right in front of Kovalam's landmark lighthouse",
      "Consistent left and right hand beach break peelers",
      "Local Kerala surf club instructors with 10+ years ocean experience",
      "Post-surf coconut water & seaside cafe culture"
    ],
    howToReach: {
      airport: "Trivandrum International Airport (TRV) - 15 km away",
      railway: "Trivandrum Central Railway Station - 14 km",
      road: "Direct auto-rickshaw or taxi drive from Trivandrum city"
    },
    safetyEquipment: [
      "Pro surfboard with urethane ankle leash",
      "Rashguard & zinc sunscreen",
      "Kerala Tourism lifeguard station monitoring",
      "First aid kit"
    ],
    inclusions: [
      "Surfboard & leash rental",
      "Personal surf instructor guidance",
      "Lighthouse beach entry",
      "Locker & shower facilities"
    ],
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
    altitude: "Phase 1: 3,050m / Phase 2: 4,200m (Apharwat Peak)",
    coordinates: { lat: 34.0484, lng: 74.3805 },
    tags: ["Asia's Highest Cable Car", "Powder Snow", "Himalayan Peak"],
    highlights: [
      "Phase 1: Gulmarg to Kongdoori mountain meadow (3,050m)",
      "Phase 2: Kongdoori to Apharwat Peak shoulder (4,200m near LOC)",
      "360° views of Nanga Parbat and Pir Panjal mountain ranges",
      "Access to world-class backcountry powder ski terrain"
    ],
    howToReach: {
      airport: "Sheikh ul-Alam Airport (Srinagar) - 56 km away",
      railway: "Jammu Tawi Railway Station - 290 km",
      road: "Scenic mountain taxi drive from Srinagar via Tangmarg (2 hrs)"
    },
    safetyEquipment: [
      "French Pomagalski automated enclosed gondola cabins",
      "Avalanche warning system & ski patrol post",
      "High altitude medical emergency station",
      "Wind safety auto-brake mechanism"
    ],
    inclusions: [
      "Phase 1 & Phase 2 cable car round-trip tickets",
      "Station boarding queue assistance",
      "Panoramic observation deck access at Apharwat Peak",
      "Snow viewpoint guidance"
    ],
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
    altitude: "6m seabed depth",
    coordinates: { lat: 11.9961, lng: 92.9515 },
    tags: ["No Swimming Needed", "Underwater Walk", "Helmet Dive"],
    highlights: [
      "Walk freely on the sea floor at 6 to 7 meters depth",
      "Transparent helmet supplies continuous fresh surface air",
      "Hand-feed schools of colorful Sergeant Major fish and clownfish",
      "Safe for non-swimmers, children & seniors (Ages 7 to 70)"
    ],
    howToReach: {
      airport: "Fly to Port Blair (Veer Savarkar Airport)",
      railway: "N/A (Island destination)",
      road: "Speedboat ride from Havelock jetty to Elephant Beach (20 mins)"
    },
    safetyEquipment: [
      "Custom weighted underwater helmet with airhose supply",
      "Surface air compressor with backup reserve tank",
      "Dive master escort holding your hand underwater",
      "Subsurface rope trail barrier"
    ],
    inclusions: [
      "Speedboat transfer to Elephant Beach platform",
      "Pre-walk safety briefing & helmet fitting",
      "25-minute underwater sea walk with dive guide",
      "Free underwater photography video CD/digital transfer"
    ],
    popularityScore: 94,
    featured: false,
  },
];
