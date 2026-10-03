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
  {
    id: "scuba-diving-rameshwaram",
    name: "Scuba Diving in Rameswaram",
    destination: "Olaikuda / Sangumal Beach, Rameswaram",
    state: "Tamil Nadu",
    country: "India",
    category: "Water Adventures",
    description: "Explore Gulf of Mannar biosphere coral reefs, colorful clownfish, and sea grass beds with certified PADI dive masters.",
    fullDescription: "Scuba diving in Rameswaram takes place primarily around the tranquil waters of Olaikuda Beach and Sangumal Beach near Holy Island Water Sports. Situated inside the biologically rich Gulf of Mannar Marine National Park, the diving sites showcase fringing coral reefs, sea anemones, clownfish, starfish, and stingrays. Diving programs include professional shallow-water pool training followed by an open-water escorted dive up to 6–10 meters with underwater HD GoPro footage.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Easy",
    duration: "2–3 hrs (30–45m dive)",
    estimatedPrice: "₹4,000 – ₹5,000",
    bestSeason: "Oct – Apr",
    altitude: "6m–10m ocean depth",
    coordinates: { lat: 9.2974, lng: 79.3242 },
    tags: ["Gulf of Mannar", "Coral Reefs", "PADI Certified", "Marine Life"],
    highlights: [
      "Dive inside the biodiverse Gulf of Mannar Marine Biosphere",
      "Observe fringing coral reefs, parrotfish, sea turtles, and clownfish",
      "Full 1-on-1 accompaniment by certified PADI dive masters",
      "Includes complimentary underwater 4K GoPro photos and videos"
    ],
    howToReach: {
      airport: "Madurai Airport (IXM) - 175 km away",
      railway: "Rameswaram Railway Station (RMM) - 3.5 km away",
      road: "Drive across Pamban Road Bridge via NH87 into Rameswaram island"
    },
    safetyEquipment: [
      "PADI-standard buoyancy control devices (BCD) & regulators",
      "Full-body neoprene wetsuits & dive boots",
      "Emergency oxygen kit on dive support vessel",
      "Certified ocean safety rescue diver escort"
    ],
    inclusions: [
      "Theory & breathing technique briefing on shore",
      "Shallow water practice session",
      "30-45 minutes ocean reef dive",
      "HD underwater photography and video transfer"
    ],
    popularityScore: 96,
    featured: true,
  },
  {
    id: "paragliding-yelagiri",
    name: "Paragliding in Yelagiri",
    destination: "Yelagiri Hills (Kottur / Raneri)",
    state: "Tamil Nadu",
    country: "India",
    category: "Air Adventures",
    description: "Tandem paragliding flight soaring above lush Jawadhu hill ranges and orchards at 920m altitude.",
    fullDescription: "Organized through the Yelagiri Adventure Sports Association (YASA), Yelagiri is Tamil Nadu's premiere paragliding destination. With launching sites situated near Kottur and Raneri at an altitude of approximately 920 meters, tandem gliders catch thermal updrafts over terraced fruit orchards, rose gardens, and forested Western-Ghats offshoots. Passengers fly tandem with experienced pilots before touching down at dedicated landing fields.",
    image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Moderate",
    duration: "1–2 hrs (15–20m flight)",
    estimatedPrice: "₹2,500 – ₹4,000",
    bestSeason: "Oct – Feb",
    altitude: "920m (Takeoff point)",
    coordinates: { lat: 12.5833, lng: 78.6333 },
    tags: ["Tandem Paragliding", "Jawadhu Hills", "YASA Certified", "Aerial Views"],
    highlights: [
      "Aerial vista of Yelagiri valley, Athanavur, and Punganoor lake",
      "Tandem flights accompanied by licensed aero-sports pilots",
      "Smooth thermal wind conditions ideal for first-time flyers",
      "GoPro flight footage recording packages available"
    ],
    howToReach: {
      airport: "Bengaluru Kempegowda Airport (BLR) - 160 km / Chennai - 225 km",
      railway: "Jolarpettai Junction (JTJ) - 21 km away",
      road: "Drive up 14 hairpin bends on Ghat Road from Ponneri junction"
    },
    safetyEquipment: [
      "Dual harness with reserve parachute system",
      "Impact-resistant aviation safety helmet",
      "Anemometer continuous wind speed monitoring",
      "Two-way VHF radio ground link"
    ],
    inclusions: [
      "Ground transport to Kottur takeoff ridge",
      "Pre-flight safety instructions & gear fitting",
      "15-20 min tandem paragliding joyride",
      "Landing recovery transfer"
    ],
    popularityScore: 92,
    featured: true,
  },
  {
    id: "off-roading-kolli-hills",
    name: "Off Roading & Ghat Driving in Kolli Hills",
    destination: "Kolli Hills (Semmedu & Solakkadu)",
    state: "Tamil Nadu",
    country: "India",
    category: "Extreme Adventures",
    description: "Navigate 70 continuous hairpin bends followed by rugged rocky trails through cardamom estates and coffee plantations.",
    fullDescription: "Kolli Hills (Mountain of Death) is legendary for its 70 continuous, numbered hairpin bends ascending 1,300 meters from Kalappanaickenpatti to Semmedu. Beyond the paved ghat circuit, adventure enthusiasts explore designated rugged estate trails, rocky forest fringes near Solakkadu, and steep off-road tracks connecting tribal hamlets and pepper valleys. The ride offers adrenaline, dramatic drop-offs, and dense fog rolling across hairpin turns 30 to 55.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Advanced",
    duration: "Full Day (4–6 hrs)",
    estimatedPrice: "₹1,500 – ₹3,500 (Vehicle / Guide)",
    bestSeason: "Sep – Mar",
    altitude: "1,300m MSL",
    coordinates: { lat: 11.2485, lng: 78.3387 },
    tags: ["70 Hairpin Bends", "4x4 Trails", "Motorcycling", "Eastern Ghats"],
    highlights: [
      "Conquer India's most intense continuous 70-hairpin mountain climb",
      "Navigate rugged 4x4 dirt trails across coffee and silver oak estates",
      "Panoramic viewpoints at Seekuparai, Selur Nadu, and Sirumalai view",
      "Dense fog encounters and challenging mountain switchbacks"
    ],
    howToReach: {
      airport: "Tiruchirappalli International Airport (TRZ) - 95 km away",
      railway: "Salem Junction - 85 km / Namakkal Railway Station - 45 km",
      road: "Route via Namakkal -> Kalappanaickenpatti -> Karavalli checkpost"
    },
    safetyEquipment: [
      "High-traction off-road tires & 4WD low-range transmission",
      "Certified riding armor / full-face helmet for bikers",
      "Fog lamps & GPS offline trail navigation",
      "Emergency tire inflator & tow straps"
    ],
    inclusions: [
      "Guided route orientation and convoy coordination",
      "Hairpin bend navigation safety briefing",
      "Estate trail access permissions",
      "Local tribal lunch stopover experience"
    ],
    popularityScore: 95,
    featured: true,
  },
  {
    id: "trek-agasthiyar-falls",
    name: "Trek to Agasthiyar Falls",
    destination: "Papanasam, KMTR, Tirunelveli",
    state: "Tamil Nadu",
    country: "India",
    category: "Mountain Adventures",
    description: "Hike through pristine Western Ghats rainforest in Kalakkad-Mundanthurai Tiger Reserve to the sacred Thamirabarani cascade.",
    fullDescription: "The trek to Agasthiyar Falls (Papanasam Falls) takes adventurers into the bio-rich buffer zone of the Kalakkad Mundanthurai Tiger Reserve (KMTR). Starting near the ancient Papanasanathar Temple along the perennial Thamirabarani River, a scenic trail leads uphill towards the roaring 25-meter cascade where Sage Agastya was blessed with the divine vision of Lord Shiva. The path continues towards the serene Kalyanatheertham pool higher up the Western Ghats slope.",
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Easy",
    duration: "2–4 hrs (3 km walk/hike)",
    estimatedPrice: "₹100 – ₹500 (Forest entry & parking)",
    bestSeason: "Oct – Mar",
    altitude: "350m MSL",
    coordinates: { lat: 8.7042, lng: 77.3683 },
    tags: ["KMTR Tiger Reserve", "Thamirabarani River", "Sacred Waterfall", "Herbal Waters"],
    highlights: [
      "Breathtaking 25-meter natural waterfall with mineral-rich herbal waters",
      "Hike alongside the crystal-clear Thamirabarani riverbank",
      "Spot endemic Western Ghats butterflies, hornbills, and Nilgiri langurs",
      "Continue uphill to the sacred, tranquil Kalyanatheertham pool"
    ],
    howToReach: {
      airport: "Tuticorin Airport (TCR) - 80 km / Madurai Airport - 170 km",
      railway: "Tirunelveli Junction - 48 km away / Ambasamudram - 16 km",
      road: "State Highway 40 from Tirunelveli via Cheranmahadevi to Papanasam"
    },
    safetyEquipment: [
      "Sturdy anti-slip trekking shoes",
      "Eco-friendly bamboo walking sticks",
      "Forest department lifeguard surveillance at designated bathing pools",
      "First aid post at KMTR checkpost"
    ],
    inclusions: [
      "KMTR forest checkpost entry clearance",
      "Waterfall viewpoint access",
      "Natural herbal bath in permitted river sections",
      "Papanasam nature interpretation trail"
    ],
    popularityScore: 91,
    featured: false,
  },
  {
    id: "rock-climbing-gingee-fort",
    name: "Rock Climbing & Bouldering at Gingee Fort",
    destination: "Gingee (Rajagiri & Krishnagiri), Viluppuram",
    state: "Tamil Nadu",
    country: "India",
    category: "Extreme Adventures",
    description: "Climb monolithic granite boulder towers and scale the impregnable 800-foot Rajagiri citadel dubbed the Troy of the East.",
    fullDescription: "Gingee Fort, praised by Chhatrapati Shivaji as the most impregnable fortress in India, is built atop three colossal granite hills: Rajagiri, Krishnagiri, and Chandrayandurg. Rising 800 feet above the surrounding plains of Viluppuram, the massive weathered granite boulders and rocky outcrops offer world-class bouldering problems and endurance scrambling. Trekkers and boulderers scale steep stone cut ramps, fortified boulder gaps, and wooden drawbridges to reach the summit.",
    image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Advanced",
    duration: "3–5 hrs (1,200 rock steps & scrambling)",
    estimatedPrice: "₹25 (ASI Entry) / Guided: ₹800 – ₹1,500",
    bestSeason: "Oct – Feb",
    altitude: "240m (800 ft granite peak)",
    coordinates: { lat: 12.2536, lng: 79.4181 },
    tags: ["Troy of the East", "Granite Bouldering", "Rajagiri Citadel", "ASI Heritage"],
    highlights: [
      "Scale the dramatic 800-foot vertical granite citadel of Rajagiri",
      "Cross the narrow hanging wooden bridge spanning a 60-foot canyon chasm",
      "Explore massive granite boulder formations, granaries, and the 7-storey Kalyana Mahal",
      "360-degree panoramic view of Viluppuram plains and Krishnagiri peak"
    ],
    howToReach: {
      airport: "Chennai International Airport (MAA) - 150 km away",
      railway: "Tindivanam Railway Station (TMV) - 27 km / Viluppuram - 40 km",
      road: "NH77 Tindivanam - Tiruvannamalai highway directly connects to Gingee"
    },
    safetyEquipment: [
      "Chalk bag & bouldering crash pad (for private boulder problems)",
      "Vibram-sole climbing/approach shoes with high grip",
      "Hydration backpack (minimum 2 liters recommended)",
      "Sun protection & safety headgear"
    ],
    inclusions: [
      "ASI archaeological fort complex admission",
      "Rajagiri and Krishnagiri hill trail access",
      "Historical citadel exploration",
      "Archaeological interpretive trail guide"
    ],
    popularityScore: 93,
    featured: true,
  },
  {
    id: "camping-kolli-hills",
    name: "Wild Camping in Kolli Hills",
    destination: "Kolli Hills (Seekuparai / Selur Nadu)",
    state: "Tamil Nadu",
    country: "India",
    category: "Mountain Adventures",
    description: "Camp under starry skies amidst silver oak forests, coffee estates, and cool mountain breezes at 1,300m elevation.",
    fullDescription: "Escape to the untouched wilderness of Kolli Hills for an authentic hill camping experience. Situated at 1,300 meters altitude away from commercial tourist rush, private campgrounds nestled in organic coffee and pepper estates offer weather-proof dome tents, nighttime campfires, acoustic music, and stargazing under pollution-free mountain skies. Mornings welcome campers with thick blanket fog, birdsong, and guided plantation walking trails.",
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Easy",
    duration: "Overnight (2 Days / 1 Night)",
    estimatedPrice: "₹1,800 – ₹3,000 per person",
    bestSeason: "Sep – Mar",
    altitude: "1,300m MSL",
    coordinates: { lat: 11.2333, lng: 78.3417 },
    tags: ["Stargazing", "Coffee Estate Camp", "Campfire", "Cloud Line"],
    highlights: [
      "Overnight dome tent camping inside organic coffee and pepper plantations",
      "Evening bonfire with traditional Kongu-style barbecue dinner",
      "Stargazing under crisp, unpolluted Western Ghats skies",
      "Morning sunrise walk to Seekuparai viewpoint overlooking deep gorges"
    ],
    howToReach: {
      airport: "Tiruchirappalli Airport (TRZ) - 95 km away",
      railway: "Salem Junction - 85 km / Namakkal - 45 km",
      road: "Ascend 70 hairpin bends via Semmedu to private estate camp zones"
    },
    safetyEquipment: [
      "Waterproof, wind-resistant double-layer dome tents",
      "Sub-zero rated sleeping bags and foam camping mattresses",
      "Perimeter solar fencing and 24/7 estate caretaker security",
      "Emergency first-aid and vehicle standby"
    ],
    inclusions: [
      "Dome tent accommodation with sleeping bags & pillows",
      "Evening campfire and tea/snacks",
      "Authentic South Indian dinner and breakfast",
      "Guided estate plantation and viewpoint trek"
    ],
    popularityScore: 90,
    featured: false,
  },
  {
    id: "surfing-kovalam-chennai",
    name: "Surfing at Kovalam (Covelong)",
    destination: "Covelong Beach, East Coast Road, Chennai",
    state: "Tamil Nadu",
    country: "India",
    category: "Water Adventures",
    description: "Catch consistent ocean swells and learn to ride waves at India's premier surfing village on the scenic East Coast Road.",
    fullDescription: "Kovalam (Covelong Point), located 35 km south of Chennai along the East Coast Road, is the surfing epicenter of Tamil Nadu and home to the annual Covelong Point Surf, Music & Yoga Festival. With natural sandbars and consistent beach breaks, certified schools like Surf Turf and Bay of Life provide safe, professional surf coaching for everyone from complete beginners to advanced wave riders. Warm tropical waters and gentle waves make it the ideal place to catch your first wave.",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Moderate",
    duration: "1.5 – 2 hrs (Instruction & water session)",
    estimatedPrice: "₹1,500 – ₹2,200",
    bestSeason: "May – Sep (High Swells) / Year-round beginners",
    altitude: "Sea level",
    coordinates: { lat: 12.7925, lng: 80.2528 },
    tags: ["Covelong Point", "Surf Turf", "East Coast Road", "ISA Certified"],
    highlights: [
      "Learn surfing at India's most famous surf fishing village",
      "Coached by ISA (International Surfing Association) certified surf instructors",
      "Consistent beach-break waves ideal for mastering pop-ups and wave trim",
      "Beachfront surf cafe, showers, board rentals, and ocean safety drills"
    ],
    howToReach: {
      airport: "Chennai International Airport (MAA) - 34 km away",
      railway: "Chennai Central (MAS) - 38 km / Chengalpattu - 32 km",
      road: "Drive down scenic ECR (East Coast Road) towards Mahabalipuram"
    },
    safetyEquipment: [
      "Soft-top beginner foam surfboards with safety leash",
      "UV-protective rashguards and zinc sun-block",
      "Ocean safety life buoys & trained surf lifesaver lifeguards",
      "Shallow water sandbank training area"
    ],
    inclusions: [
      "Surfboard and leash rental during the session",
      "30-minute dry beach instruction on wave mechanics and pop-ups",
      "60-minute in-water hands-on surf coaching",
      "Access to changing rooms, showers, and equipment lockers"
    ],
    popularityScore: 97,
    featured: true,
  },
  {
    id: "wildlife-safari-mudumalai",
    name: "Wildlife Safari in Mudumalai Tiger Reserve",
    destination: "Theppakadu, Mudumalai, Nilgiris",
    state: "Tamil Nadu",
    country: "India",
    category: "Extreme Adventures",
    description: "Jeep and van jungle safari tracking Royal Bengal tigers, wild Asian elephants, leopards, and Indian gaur in Nilgiri Biosphere.",
    fullDescription: "Mudumalai Tiger Reserve, nestled on the Nilgiri plateau border joining Bandipur and Wayanad, is one of South India's oldest and most bio-diverse tiger reserves. Operating from the Theppakadu reception hub, Tamil Nadu Forest Department safaris venture into deciduous teak forests, bamboo groves, and Moyar river valleys. Visitors frequently spot herds of wild elephants, majestic Indian gaur (bison), spotted deer, dholes (wild dogs), sloth bears, and elusive Royal Bengal tigers.",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Easy",
    duration: "2–3 hrs (45–60m safari drive)",
    estimatedPrice: "₹350 (Bus) / ₹3,000 – ₹4,200 (Forest Gypsy)",
    bestSeason: "Oct – May",
    altitude: "1,000m MSL",
    coordinates: { lat: 11.5833, lng: 76.5833 },
    tags: ["Project Tiger", "Asian Elephants", "Nilgiri Biosphere", "Forest Dept Safari"],
    highlights: [
      "Venture into core zones of Nilgiris UNESCO World Heritage Biosphere",
      "High probability sightings of Asian elephants, Indian gaur, and wild boar",
      "Track tiger pugmarks and alarm calls with trained forest department naturalists",
      "Visit the historic Theppakadu Elephant Camp (Asia's oldest captive elephant facility)"
    ],
    howToReach: {
      airport: "Coimbatore International Airport (CJB) - 130 km away / Mysore - 90 km",
      railway: "Udhagamandalam (Ooty) - 36 km / Mysore Junction - 90 km",
      road: "NH181 connecting Ooty to Mysore through Kalhatty ghats or Gudalur"
    },
    safetyEquipment: [
      "Heavy-duty government forest safari vans and open 4x4 gypsies",
      "Uniformed Tamil Nadu forest guard naturalist escort",
      "Strict core-area animal standoff safety protocols",
      "Emergency wireless radio transmission with checkposts"
    ],
    inclusions: [
      "Mudumalai Tiger Reserve entry permit ticket",
      "Forest department van or authorized 4x4 gypsy ride",
      "Naturalist guide commentary on Nilgiri flora and fauna",
      "Theppakadu elephant camp interpretive center access"
    ],
    popularityScore: 98,
    featured: true,
  },
  {
    id: "cave-exploring-sittanavasal",
    name: "Cave Exploring at Sittanavasal",
    destination: "Sittanavasal, Pudukkottai",
    state: "Tamil Nadu",
    country: "India",
    category: "Mountain Adventures",
    description: "Explore 2nd-century BC Jain cavern beds and rock-cut cave temple famous for vibrant 7th-century fresco-secco mural paintings.",
    fullDescription: "Sittanavasal is an archaeological wonder carved into a monolithic granite hill in Pudukkottai district. The site features the Arivar Koil, a 7th-century rock-cut cave temple renowned for its extraordinary fresco-secco ceiling murals depicting a lotus pond (Samavasarana) with dancing damsels, fish, ducks, and elephants, rendered using organic vegetable dyes. Trekkers also hike up the rock face to Ezhadippattam, a natural cavern containing 17 polished stone beds used by Jain monks since the 2nd century BC inscribed with ancient Tamil-Brahmi scripts.",
    image: "https://images.unsplash.com/photo-1599831104328-b141d6a4571a?q=80&w=1200&auto=format&fit=crop",
    fallbackImage: "https://images.unsplash.com/photo-1548625361-185871f302b5?q=80&w=1200&auto=format&fit=crop",
    difficulty: "Easy",
    duration: "2–3 hrs (Cave exploration & hill hike)",
    estimatedPrice: "₹25 (ASI entry ticket)",
    bestSeason: "Oct – Mar",
    altitude: "100m MSL",
    coordinates: { lat: 10.4578, lng: 78.7495 },
    tags: ["Jain Cave Temple", "Fresco Paintings", "Tamil-Brahmi Script", "ASI Monument"],
    highlights: [
      "Marvel at 7th-century rock-cut Jain cave murals rivaling Ajanta frescoes",
      "Hike up granite rock steps to Ezhadippattam cavern with 2,200-year-old stone beds",
      "Read ancient Tamil-Brahmi rock inscriptions by Jain ascetic Ilayar",
      "Quiet reflection inside the acoustically resonant stone-pillared sanctum"
    ],
    howToReach: {
      airport: "Tiruchirappalli International Airport (TRZ) - 48 km away",
      railway: "Pudukkottai Railway Station (PDKT) - 16 km away",
      road: "SH71 linking Pudukkottai with viralimalai / Trichy via Annavasal"
    },
    safetyEquipment: [
      "Handrails along steep granite incline towards Ezhadippattam",
      "Rubber-traction walking shoes for polished granite slopes",
      "ASI protective fiber barriers preserving ceiling murals",
      "Archaeological monument guard supervision"
    ],
    inclusions: [
      "ASI entrance ticket to Arivar Koil cave paintings sanctum",
      "Admission to Ezhadippattam cavern stone beds",
      "Archaeological interpretive display panels",
      "Access to adjacent tourist park and pond"
    ],
    popularityScore: 92,
    featured: false,
  },
];

