import { ExploreTNEvent, FestivalCalendarMonth } from "../types/events";

export const SAMPLE_ORGANIZERS = {
  tnTravelClub: {
    id: "org-tn-travel-club",
    name: "Tamil Nadu Travel Club",
    slug: "tn-travel-club",
    logo: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&auto=format&fit=crop&q=80",
    description: "Pioneering eco-conscious group expeditions, mountain treks, and solo-traveler friendly weekend escapes across Tamil Nadu since 2018.",
    verified: true,
    website: "https://exploretn.com/clubs/tn-travel",
    instagram: "@tntravelclub",
    phone: "+91 94432 01822",
    email: "trips@tntravelclub.in",
    rating: 4.9,
    totalEventsHosted: 64,
  },
  chennaiIndieCollective: {
    id: "org-chennai-indie",
    name: "Madras Music Collective",
    slug: "madras-music-collective",
    logo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80",
    description: "Curators of independent acoustics, Carnatic fusion, and soulful live open-air performance gigs in Chennai & Pondicherry.",
    verified: true,
    website: "https://madrasmusic.org",
    email: "live@madrasmusic.org",
    rating: 4.8,
    totalEventsHosted: 42,
  },
  tnAthleticsFed: {
    id: "org-tn-athletics",
    name: "Tamil Nadu Running & Athletics League",
    slug: "tn-athletics-league",
    logo: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&auto=format&fit=crop&q=80",
    description: "Promoting fitness, eco-runs, and marathon athletics along Tamil Nadu's coastal roads and hill trails.",
    verified: true,
    phone: "+91 44 2836 1120",
    email: "marathon@tnrunning.org",
    rating: 4.9,
    totalEventsHosted: 35,
  },
  maduraiHeritageTrust: {
    id: "org-madurai-heritage",
    name: "Madurai Cultural & Heritage Foundation",
    slug: "madurai-heritage-foundation",
    logo: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=200&auto=format&fit=crop&q=80",
    description: "Custodians of Sangam heritage, traditional temple festival documentations, and authentic Vaigai culture walks.",
    verified: true,
    website: "https://maduraiheritage.org",
    email: "curator@maduraiheritage.org",
    rating: 5.0,
    totalEventsHosted: 80,
  },
  cleanMarinaGreen: {
    id: "org-coastal-cleanup",
    name: "Coastal Green Guardians",
    slug: "coastal-green-guardians",
    logo: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=200&auto=format&fit=crop&q=80",
    description: "Grassroots civic initiative mobilizing volunteers for coastal preservation, Olive Ridley turtle hatch walks, and mangrove cleanups.",
    verified: true,
    email: "contact@greenguardians.tn",
    rating: 4.9,
    totalEventsHosted: 58,
  },
  southTnCulturalCouncil: {
    id: "org-south-tn-culture",
    name: "South Tamil Nadu Heritage & Diocesan Guild",
    slug: "south-tn-guild",
    logo: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=200&auto=format&fit=crop&q=80",
    description: "Preserving southern coastal cultural expressions, historic church architecture, and Christmas festive lighting routes across Kanyakumari.",
    verified: true,
    rating: 4.8,
    totalEventsHosted: 28,
  },
  kodaiPhotographyGuild: {
    id: "org-kodai-photo-guild",
    name: "Western Ghats Shola Photographers",
    slug: "shola-photo-guild",
    logo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop&q=80",
    description: "Specialized landscape, mist photography, and wildlife birding walks through Kodaikanal and Nilgiris high-altitude shola plateaus.",
    verified: true,
    rating: 4.9,
    totalEventsHosted: 39,
  }
};

export const EXPLORE_TN_EVENTS: ExploreTNEvent[] = [
  // 1. Group Trip: Kodaikanal Weekend Escape
  {
    id: "evt-kodai-weekend-trip",
    slug: "kodaikanal-weekend-escape",
    title: "Kodaikanal Weekend Escape",
    shortDescription: "An all-inclusive group road expedition from Chennai for solo travelers & friends to explore mist viewpoints, pine forests, and campfire nights.",
    fullDescription: "Escape the plains on this curated 2-day group journey to the Princess of Hill Stations. Perfect for solo explorers wishing to meet like-minded travelers. We journey together via scenic ghat routes, explore hidden pine woods, row across serene waters, and share stories around a plantation bonfire.",
    category: "trips",
    categoryLabel: "Group Trip",
    categoryIcon: "🧳",
    accessType: "GROUP_TRIP",
    status: "APPROVED",
    startDate: "2026-11-15",
    endDate: "2026-11-16",
    timeText: "05:30 AM Departure (Saturday)",
    locationName: "Kodaikanal Hill Station",
    district: "Dindigul",
    districtSlug: "dindigul",
    destinationPlaceSlug: "kodaikanal",
    latitude: 10.2381,
    longitude: 77.4892,
    address: "Assembly Point: Koyambedu Metro Station, Chennai (Drop: Kodaikanal)",
    isFree: false,
    priceDisplay: "₹3,499/person",
    priceNumber: 3499,
    currency: "INR",
    totalCapacity: 25,
    availableSeats: 7,
    attendeesCount: 18,
    coverImage: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=1200&auto=format&fit=crop&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80"
    ],
    organizer: SAMPLE_ORGANIZERS.tnTravelClub,
    isExploreTnVerified: true,
    groupTrip: {
      startingPoint: "Chennai",
      destination: "Kodaikanal",
      routeSummary: "Chennai → Dindigul → Batlagundu Ghats → Kodaikanal → Chennai",
      duration: "2 Days / 1 Night",
      totalSeats: 25,
      joinedCount: 18,
      inclusions: [
        "AC Tempo Traveller transit from Chennai & back",
        "1 Night stay in heritage hill cottage (twin/triple sharing)",
        "2 Breakfasts, 1 Campfire Dinner & Hot Chai stops",
        "Entry permits to Pine Forest, Guna Caves & Lake boating",
        "Experienced ExploreTN certified trip leader & first-aid kit"
      ],
      exclusions: [
        "Lunches during highway transit",
        "Personal horse riding or cycling rentals around the lake",
        "Items not explicitly mentioned in inclusions"
      ],
      accommodation: "Colonial-style wooden hill cottage with valley views & private lawn",
      transportation: "Pushback AC 26-seater Tempo Traveller with hill-certified chauffeur",
      mealsIncluded: "Authentic Chettinad dinner by campfire, South Indian breakfast buffet",
      meetingPoint: "Koyambedu CMBT Metro Gate 2, Chennai @ 05:00 AM",
      cancellationPolicy: "100% refund up to 7 days before trip; 50% refund up to 48 hours before departure.",
      itinerary: [
        {
          day: 1,
          title: "Scenic Ghat Climb & Pine Forest Sholas",
          description: "Early morning highway cruise via Trichy-Dindigul bypass. Ascend the lush Batlagundu ghat with valley photo-ops. Check in to the estate, enjoy hot piping tea, and embark on a pine forest nature stroll followed by sunset at Coaker's Walk. Night campfire with music.",
          highlights: ["Dum Dum Falls Ghat View", "Pine Forest Mist Trail", "Campfire Acoustic Session"]
        },
        {
          day: 2,
          title: "Lake Boating, Pillar Rocks & Return Journey",
          description: "Sunrise mist walk around Upper Lake View. Traditional breakfast followed by pedal boating on Kodai Lake and artisanal chocolate sampling. Depart down the hills by 3:00 PM, reaching Chennai by midnight.",
          highlights: ["Morning Mist Lake Row", "Homemade Chocolate Tasting", "Sunset Highway Cruise"]
        }
      ]
    },
    tags: ["Group Trip", "Solo Travelers", "Hill Station", "Campfire", "Weekend Escape", "Kodaikanal"],
    featured: true
  },

  // 2. Tamil Nadu Festival: Madurai Chithirai Festival
  {
    id: "evt-madurai-chithirai",
    slug: "madurai-chithirai-festival",
    title: "Madurai Chithirai Festival (சித்திரை திருவிழா)",
    shortDescription: "The world-famous month-long celestial festival uniting the Meenakshi Sundareswarar Thirukalyanam and Lord Kallazhagar's grand Vaigai river entry.",
    fullDescription: "The Chithirai Festival of Madurai is Tamil Nadu's grandest cultural and spiritual spectacle, drawing over a million pilgrims and international travelers. Spanning the Tamil month of Chithirai, it commemorates two historic traditions: the divine coronation & wedding of Goddess Meenakshi in the heart of the ancient temple city, and Lord Kallazhagar riding a golden stallion into the sacred Vaigai river. The city transforms into an electric sea of vibrant silk umbrellas, traditional tharai-thappattai drumbeats, free community buttermilk pandals, and ancient Sangam festivities.",
    category: "festivals",
    categoryLabel: "Tamil Nadu Festival",
    categoryIcon: "🪔",
    accessType: "FREE",
    status: "APPROVED",
    startDate: "2026-04-28",
    endDate: "2026-05-10",
    timeText: "All-Day Festivities & Morning Rituals",
    isAllDay: true,
    locationName: "Arulmigu Meenakshi Amman Temple & Vaigai River Bed",
    district: "Madurai",
    districtSlug: "madurai",
    destinationPlaceSlug: "meenakshi-temple",
    latitude: 9.9195,
    longitude: 78.1193,
    address: "Meenakshi Amman Temple, Masi Streets & Goripalayam Vaigai Bridge, Madurai 625001",
    isFree: true,
    priceDisplay: "Free Public Cultural Celebration",
    coverImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=1000&auto=format&fit=crop&q=80"
    ],
    organizer: SAMPLE_ORGANIZERS.maduraiHeritageTrust,
    isExploreTnVerified: true,
    festival: {
      festivalName: "Madurai Chithirai Peruvizha",
      typicalMonth: "April – May (Tamil month of Chithirai)",
      typicalSeason: "Summer / Vaikasi",
      annualRecurring: true,
      dateStatus: "APPROXIMATE_MONTH",
      history: "Celebrated for centuries, the festival achieved its present iconic unification under King Thirumalai Nayak in the 17th century, harmonizing the Shaivite and Vaishnavite celebrations to unite all Tamil communities.",
      culturalSignificance: "Symbolizes civic harmony, maternal divinity, ancient Tamil temple architecture, and living Sangam cultural memory.",
      religiousContext: "Celestial wedding of Goddess Meenakshi with Lord Sundareswarar, followed by Lord Kallazhagar's procession to the Vaigai river.",
      majorActivities: [
        "KodiYetram (Temple Flag Hoisting ceremony on Day 1)",
        "Pattabhishekam (Coronation of Goddess Meenakshi as Queen of Madurai)",
        "Thirukalyanam (Grand Celestial Divine Wedding inside the Temple)",
        "Ther Thiruvizha (Mammoth 80-foot Wooden Chariot Procession around Masi Streets)",
        "Alagar Aatril Iranguthal (Grand dawn entry into river Vaigai at Goripalayam)"
      ],
      importantDatesDescription: "Processions span 12 primary days; the Thirukalyanam and River Entry are the most spectacular peak dates.",
      processionsAndRituals: [
        "Lord Kallazhagar riding on a jewel-encrusted Golden Horse (Thanga Kuthirai)",
        "Devotees spraying scented holy water using traditional leather bags (Thol Bag)",
        "Traditional folk arts: Karagattam, Thappattam, and Oyilattam along procession paths"
      ],
      bestPlacesToExperience: [
        "North Masi Street for the Chariot Car (Ther) Festival",
        "Albert Victor / Goripalayam Bridge for the sunrise Vaigai River Entry",
        "Alagar Kovil foothills for the departure ceremony"
      ],
      travelTips: [
        "Book accommodations in Madurai at least 4-6 weeks in advance as hotels fill up completely.",
        "Wear breathable cotton clothes and comfortable footwear; expect dense festive crowds.",
        "Stay hydrated at the free community neer-moru (spiced buttermilk) pandals set up along all streets.",
        "Combine your visit with evening street food trails at Simmakkal & West Masi Street."
      ],
      officialSource: "HR&CE Dept, Government of Tamil Nadu & Madurai Heritage Trust"
    },
    tags: ["Temple Festival", "Cultural Heritage", "Madurai", "Vaigai", "Chithirai", "Free Event"],
    featured: true
  },

  // 3. Local Music & Concert: Chennai Indie Music Night
  {
    id: "evt-chennai-indie-night",
    slug: "chennai-indie-music-night",
    title: "Chennai Indie Music Night",
    shortDescription: "An electric open-air live concert spotlighting contemporary Tamil independent singer-songwriters, synth-pop, and fusion bands.",
    fullDescription: "Immerse yourself in Chennai's thriving independent music culture. Featuring 4 acclaimed indie acts blending Tamil lyrical poetry with modern indie-rock, acoustic folk, and electronic beats. Enjoy food trucks serving hot local dosas and craft coffee under the stars.",
    category: "music",
    categoryLabel: "Music & Concert",
    categoryIcon: "🎵",
    accessType: "TICKET_REQUIRED",
    status: "APPROVED",
    startDate: "2026-11-22",
    timeText: "06:00 PM – 10:30 PM",
    locationName: "Open Air Amphitheatre, Kalakshetra Grounds",
    district: "Chennai",
    districtSlug: "chennai",
    destinationPlaceSlug: "besant-nagar-beach",
    latitude: 12.9866,
    longitude: 80.2592,
    address: "Kalakshetra Foundation, Thiruvanmiyur, Chennai 600041",
    isFree: false,
    priceDisplay: "From ₹499",
    priceNumber: 499,
    currency: "INR",
    totalCapacity: 600,
    availableSeats: 140,
    attendeesCount: 460,
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80"
    ],
    organizer: SAMPLE_ORGANIZERS.chennaiIndieCollective,
    isExploreTnVerified: true,
    tags: ["Indie Music", "Concert", "Chennai", "Live Band", "Nightlife"],
    featured: true
  },

  // 4. Sports & Marathon: Chennai Green Run 2026
  {
    id: "evt-chennai-green-run",
    slug: "chennai-green-run-2026",
    title: "Chennai Green Run 2026",
    shortDescription: "Annual dawn coastline marathon along the iconic Marina & Santhome promenade promoting ocean conservation and clean air.",
    fullDescription: "Lace up your running shoes for Tamil Nadu's favorite sea-breeze marathon. Run alongside thousands of fitness enthusiasts as dawn breaks over the Bay of Bengal. Features certified chip timing, hydration stations every kilometer, finisher medals, and a tree-planting pledge for each participant.",
    category: "sports",
    categoryLabel: "Sports & Marathon",
    categoryIcon: "🏃",
    accessType: "REGISTRATION_REQUIRED",
    status: "APPROVED",
    startDate: "2026-11-29",
    timeText: "05:00 AM Flag-Off",
    locationName: "Marina Beach Promenade",
    district: "Chennai",
    districtSlug: "chennai",
    destinationPlaceSlug: "marina-beach",
    latitude: 13.0500,
    longitude: 80.2824,
    address: "Opposite Presidency College, Kamarajar Salai, Chennai 600005",
    isFree: false,
    priceDisplay: "From ₹350 (Kit & Medal)",
    priceNumber: 350,
    currency: "INR",
    totalCapacity: 2500,
    availableSeats: 480,
    attendeesCount: 2020,
    coverImage: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&auto=format&fit=crop&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&auto=format&fit=crop&q=80"
    ],
    organizer: SAMPLE_ORGANIZERS.tnAthleticsFed,
    isExploreTnVerified: true,
    tags: ["Marathon", "Running", "Fitness", "Marina Beach", "5K", "10K", "21K"],
    featured: true
  },

  // 5. Seasonal Celebration: Christmas in South Tamil Nadu (Nagercoil & Kanyakumari)
  {
    id: "evt-christmas-south-tn",
    slug: "christmas-south-tamil-nadu",
    title: "Christmas in South Tamil Nadu (Nagercoil & Kanyakumari)",
    shortDescription: "Destination seasonal travel experience: fairy-lit cathedral streets, midnight carols, plum cakes, and coastal festive cheer.",
    fullDescription: "From early November through the New Year, southern Tamil Nadu — encompassing Nagercoil, Kanyakumari, Marthandam, and Colachel — transforms into one of India's most enchanting Christmas travel destinations. Centuries-old gothic churches glow with elaborate lighting installations, towering illuminated stars hang from every doorway, street bazaars brim with traditional plum cakes, and sea-breeze carol walks welcome travelers.",
    category: "seasonal",
    categoryLabel: "Seasonal Celebrations",
    categoryIcon: "🎄",
    accessType: "FREE",
    status: "APPROVED",
    startDate: "2026-11-25",
    endDate: "2026-12-31",
    timeText: "Evening Lighting & Midnight Services",
    isAllDay: true,
    locationName: "Nagercoil, Kanyakumari, Marthandam & Colachel",
    district: "Kanniyakumari",
    districtSlug: "kanniyakumari",
    destinationPlaceSlug: "kanyakumari",
    latitude: 8.1833,
    longitude: 77.4119,
    address: "St. Xavier's Cathedral (Kottar) & coastal towns across Kanniyakumari District",
    isFree: true,
    priceDisplay: "Free Public Travel Experience",
    coverImage: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=1200&auto=format&fit=crop&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512474932049-78ac69eedec9?w=1000&auto=format&fit=crop&q=80"
    ],
    organizer: SAMPLE_ORGANIZERS.southTnCulturalCouncil,
    isExploreTnVerified: true,
    seasonal: {
      seasonLabel: "November – December (Advent & Christmas Season)",
      regionCovered: "Nagercoil, Kanyakumari, Marthandam, Colachel, Kottar",
      festiveStreetsAndChurches: [
        "St. Xavier's Cathedral, Kottar (historic 1600s cathedral with midnight carols)",
        "Our Lady of Ransom Church, Kanyakumari (illuminated seaside gothic spire)",
        "Assisi Cathedral, Nagercoil town center light displays",
        "Marthandam Star Bazaar & illuminated avenues"
      ],
      localFoodHighlights: [
        "Authentic wood-fired southern plum cakes and grape wine",
        "Banana chips & spicy Nanjil-style seafood delicacies",
        "Fresh filter coffee and evening festive snacks along Vadasery"
      ],
      culturalPrograms: [
        "Choral musical nights featuring classical Tamil & English hymns",
        "Community nativity crib exhibitions in every residential precinct",
        "Year-end seaside candle processions along coastal Colachel"
      ],
      travelRecommendations: [
        "Base yourself in Nagercoil or Kanyakumari town for easy evening access to illuminated churches.",
        "Visit during early evening (6:00 PM - 9:30 PM) when all light installations are switched on.",
        "Take a scenic day drive to Padmanabhapuram Palace, Mathur Aqueduct, and sunset at Kanyakumari Cape."
      ]
    },
    tags: ["Christmas", "Seasonal Experience", "Kanyakumari", "Nagercoil", "Heritage Churches", "Winter Travel"],
    featured: true
  },

  // 6. Environment & Community: Marina Beach Sunrise Eco-Cleanup
  {
    id: "evt-marina-cleanup",
    slug: "marina-beach-sunrise-cleanup",
    title: "Marina Beach Sunrise Eco-Cleanup",
    shortDescription: "Volunteer community ocean initiative to restore Chennai's coastline, protect marine life, and promote zero-plastic habits.",
    fullDescription: "Join fellow ocean lovers for an inspiring dawn cleanup walk along Marina Beach. All eco-friendly gloves, jute collection bags, and safety gear are provided. We segregate recyclables, learn about coastal turtle nesting habitats, and finish with complimentary tender coconut water and a group photo.",
    category: "environment",
    categoryLabel: "Environment & Community",
    categoryIcon: "🌱",
    accessType: "FREE",
    status: "APPROVED",
    startDate: "2026-11-21",
    timeText: "06:00 AM – 08:00 AM",
    locationName: "Marina Beach (Near Gandhi Statue)",
    district: "Chennai",
    districtSlug: "chennai",
    destinationPlaceSlug: "marina-beach",
    latitude: 13.0489,
    longitude: 80.2818,
    address: "Gandhi Statue Promenade, Marina Beach, Chennai 600004",
    isFree: true,
    priceDisplay: "Free Volunteer Community Event",
    totalCapacity: 150,
    availableSeats: 58,
    attendeesCount: 92,
    coverImage: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&auto=format&fit=crop&q=80",
    organizer: SAMPLE_ORGANIZERS.cleanMarinaGreen,
    isExploreTnVerified: true,
    tags: ["Beach Cleanup", "Eco Friendly", "Volunteer", "Marina Beach", "Free"],
    featured: false
  },

  // 7. Photography & Workshop: Kodaikanal Mist & Shola Photography Walk
  {
    id: "evt-kodai-photo-walk",
    slug: "kodaikanal-mist-photography-walk",
    title: "Kodaikanal Mist & Shola Photography Walk",
    shortDescription: "Hands-on guided sunrise landscape photography workshop through ancient shola cloud forests and rolling pine valleys.",
    fullDescription: "A specialized 4-hour photography masterclass led by wildlife and landscape mentors. Master long exposures on waterfalls, capture ethereal fog rolling through eucalyptus groves, and discover framing techniques for high-altitude Western Ghats vistas. Open to DSLR, mirrorless, and smartphone photographers.",
    category: "photography",
    categoryLabel: "Photography Workshop",
    categoryIcon: "📸",
    accessType: "REGISTRATION_REQUIRED",
    status: "APPROVED",
    startDate: "2026-11-28",
    timeText: "06:00 AM – 10:30 AM",
    locationName: "Pillars Rock & Berijam Forest Fringe",
    district: "Dindigul",
    districtSlug: "dindigul",
    destinationPlaceSlug: "kodaikanal",
    latitude: 10.2185,
    longitude: 77.4665,
    address: "Pillar Rocks Road, Kodaikanal 624101",
    isFree: false,
    priceDisplay: "₹850 (Includes Guide & Permits)",
    priceNumber: 850,
    currency: "INR",
    totalCapacity: 20,
    availableSeats: 6,
    attendeesCount: 14,
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
    organizer: SAMPLE_ORGANIZERS.kodaiPhotographyGuild,
    isExploreTnVerified: true,
    tags: ["Photography", "Workshop", "Kodaikanal", "Landscape", "Mist Walk"],
    featured: false
  },

  // 8. Group Trip: Kolli Hills 70 Hairpin Ghat Bike & Road Meet
  {
    id: "evt-kolli-hairpin-trip",
    slug: "kolli-hills-70-hairpin-expedition",
    title: "Kolli Hills 70 Hairpin Ghat Expedition",
    shortDescription: "A legendary 2-day road & moto trip tackling the 70 hairpin bends of the Mountain of Death, waterfalls, and pepper estate camping.",
    fullDescription: "Calling adventure drivers and moto-tourers! Experience Tamil Nadu's most exhilarating mountain road: 70 continuous hairpin curves climbing 1,300 meters into the unspoiled Kolli Hills. Visit the 300-foot Agaya Gangai waterfall, camp under crystal clear starlit skies in a remote pepper plantation, and taste authentic country-chicken curry.",
    category: "auto",
    categoryLabel: "Auto & Travel Meet",
    categoryIcon: "🏍️",
    accessType: "GROUP_TRIP",
    status: "APPROVED",
    startDate: "2026-12-05",
    endDate: "2026-12-06",
    timeText: "06:30 AM Starting from Salem Hub",
    locationName: "Kolli Hills Plateau & Ghat Pass",
    district: "Namakkal",
    districtSlug: "namakkal",
    destinationPlaceSlug: "kolli-hills-70-hairpin-pass",
    latitude: 11.2333,
    longitude: 78.3333,
    address: "Start: Salem Junction / Namakkal Ghat Entrance (Drop: Semmedu, Kolli Hills)",
    isFree: false,
    priceDisplay: "₹2,899/person",
    priceNumber: 2899,
    currency: "INR",
    totalCapacity: 20,
    availableSeats: 5,
    attendeesCount: 15,
    coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80",
    organizer: SAMPLE_ORGANIZERS.tnTravelClub,
    isExploreTnVerified: true,
    groupTrip: {
      startingPoint: "Salem / Namakkal",
      destination: "Kolli Hills",
      routeSummary: "Salem → Rasipuram → Kalappanaickenpatti → 70 Hairpins → Semmedu",
      duration: "2 Days / 1 Night",
      totalSeats: 20,
      joinedCount: 15,
      inclusions: [
        "Dome tent camping accommodation at Seekuparai estate",
        "Lead pilot vehicle & technical support mechanic",
        "BBQ dinner, plantation breakfast, and guided trek to Agaya Gangai steps",
        "Commemorative '70 Hairpin Conqueror' badge and sticker"
      ],
      exclusions: [
        "Fuel for personal motorcycle or vehicle",
        "Personal riding protective jacket and helmet (mandatory)",
        "Incidental snacks"
      ],
      accommodation: "Weatherproof dome tents in private organic coffee estate with clean washrooms",
      transportation: "Self-ride motorcycle / car caravan with support backup vehicle",
      mealsIncluded: "Campfire pepper chicken curry, herbal soup & traditional breakfast",
      meetingPoint: "Salem New Bus Stand NH-44 Hub @ 06:30 AM",
      cancellationPolicy: "Full refund 5 days prior; 50% refund 48 hours prior.",
      itinerary: [
        {
          day: 1,
          title: "The 70 Hairpin Ascent & Sunset Viewpoint",
          description: "Meet the caravan at Salem, safety briefing, and navigate bends 1 to 70 with designated photography halts at Hairpin 35 and 55. Arrive at Semmedu plateau for lunch, visit Seekuparai viewpoint, and enjoy campsite stargazing.",
          highlights: ["70 Numbered Hairpins", "Hairpin 35 Valley Drop", "Estate Campfire"]
        },
        {
          day: 2,
          title: "Agaya Gangai Trek & Arapaleeswarar Temple",
          description: "Morning descent down the 1,000 stone steps to Agaya Gangai waterfall. Re-energize with local herbal soup, visit the 1,000-year-old temple, and descend the ghats by late afternoon.",
          highlights: ["Agaya Gangai Waterfall", "Ancient Arapaleeswarar Temple", "Safe Mountain Descent"]
        }
      ]
    },
    tags: ["Kolli Hills", "70 Hairpins", "Bike Trip", "Ghat Road", "Camping", "Group Trip"],
    featured: true
  },

  // 9. Tamil Nadu Festival: Thiruvannamalai Karthigai Deepam
  {
    id: "evt-karthigai-deepam",
    slug: "thiruvannamalai-karthigai-deepam",
    title: "Thiruvannamalai Maha Karthigai Deepam",
    shortDescription: "The monumental beacon festival where a colossal sacred flame is lit atop the 2,668-foot holy Annamalai hill.",
    fullDescription: "One of the most awe-inspiring spiritual spectacles of South India, Karthigai Deepam represents the Cosmic Fire element (Agni Sthalam). On the full moon evening, a giant copper cauldron filled with tons of pure ghee and camphor is ignited atop Mount Arunachala. The immense holy flame is visible for over 30 kilometers across the plains, while millions of pilgrims undertake the sacred 14-kilometer barefoot Girivalam walk around the mountain.",
    category: "festivals",
    categoryLabel: "Tamil Nadu Festival",
    categoryIcon: "🪔",
    accessType: "FREE",
    status: "APPROVED",
    startDate: "2026-11-24",
    endDate: "2026-11-26",
    timeText: "Dusk Flame Lighting @ 06:00 PM",
    isAllDay: true,
    locationName: "Arulmigu Arunachaleswarar Temple & Mount Arunachala",
    district: "Tiruvannamalai",
    districtSlug: "tiruvannamalai",
    destinationPlaceSlug: "arunachaleswarar-temple",
    latitude: 12.2319,
    longitude: 79.0677,
    address: "Arunachaleswarar Temple & Girivalam Path, Tiruvannamalai 606601",
    isFree: true,
    priceDisplay: "Free Public Cultural Celebration",
    coverImage: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=1200&auto=format&fit=crop&q=80",
    organizer: SAMPLE_ORGANIZERS.maduraiHeritageTrust,
    isExploreTnVerified: true,
    festival: {
      festivalName: "Maha Karthigai Deepam Festival",
      typicalMonth: "November – December (Tamil month of Karthigai)",
      typicalSeason: "Early Winter / Karthigai",
      annualRecurring: true,
      dateStatus: "APPROXIMATE_MONTH",
      history: "Celebrated for more than 2,000 years, documented in ancient Sangam literature like Ahananuru and the works of Saiva saints (Thevaram).",
      culturalSignificance: "Celebration of light conquering darkness, ego surrender, and the primordial cosmic pillar of fire.",
      religiousContext: "Lord Shiva manifesting as Arunachala, the fiery mountain of wisdom.",
      majorActivities: [
        "Bharani Deepam dawn lighting inside the sanctum sanctorum",
        "Maha Deepam evening flame lighting atop the 2,668ft mountain peak",
        "14-kilometer barefoot circumambulation (Girivalam) around Arunachala hill",
        "Temple chariot processions carrying the Panchamurthis through the temple car streets"
      ],
      bestPlacesToExperience: [
        "Temple East Raja Gopuram courtyard for the simultaneous Deepam sighting",
        "Girivalam path (near Surya Lingam or Kubera Lingam) for clear mountain views",
        "Quiet hill overlooks during the evening dusk"
      ],
      travelTips: [
        "Arrive two days prior or use public transport, as district traffic is regulated 10km away on the main Deepam day.",
        "Ensure comfortable slip-on footwear if walking the 14km Girivalam barefoot.",
        "Respect temple photography guidelines and queue procedures."
      ],
      officialSource: "Arunachaleswarar Devasthanam & HR&CE Department"
    },
    tags: ["Karthigai Deepam", "Tiruvannamalai", "Girivalam", "Festival", "Temple Heritage"],
    featured: true
  },

  // 10. Food & Culinary: Madurai 24/7 Street Food Trail
  {
    id: "evt-madurai-food-trail",
    slug: "madurai-street-food-trail",
    title: "Madurai Midnight Food & Jigarthanda Trail",
    shortDescription: "Curated walking food tour through the bustling night bazaars tasting Bun Parotta, Kari Dosa, and authentic Famous Jigarthanda.",
    fullDescription: "Madurai is the City That Never Sleeps (Thoonga Nagaram). Join an intimate food lovers' walk exploring heritage street stalls operating past midnight. Savor hot flaky Bun Parottas layered with spicy salna, crispy mutton Kari Dosas, sweet melt-in-mouth Halwa, and the legendary almond gum drink Famous Jigarthanda.",
    category: "food",
    categoryLabel: "Food & Culinary",
    categoryIcon: "🍴",
    accessType: "PAID",
    status: "APPROVED",
    startDate: "2026-11-20",
    timeText: "08:30 PM – 11:30 PM",
    locationName: "Town Hall Road & Simmakkal Street Market",
    district: "Madurai",
    districtSlug: "madurai",
    destinationPlaceSlug: "madurai",
    latitude: 9.9195,
    longitude: 78.1193,
    address: "Starting Point: Opposite Madurai Railway Junction Clock Tower",
    isFree: false,
    priceDisplay: "₹699 (Includes All 7 Food Tastings)",
    priceNumber: 699,
    currency: "INR",
    totalCapacity: 15,
    availableSeats: 4,
    attendeesCount: 11,
    coverImage: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&auto=format&fit=crop&q=80",
    organizer: SAMPLE_ORGANIZERS.maduraiHeritageTrust,
    isExploreTnVerified: true,
    tags: ["Food Tour", "Madurai", "Street Food", "Jigarthanda", "Kari Dosa", "Bun Parotta"],
    featured: false
  }
];

export const FESTIVAL_CALENDAR_MONTHS: FestivalCalendarMonth[] = [
  {
    monthIndex: 1,
    monthName: "January",
    tamilMonth: "Thai (தை)",
    seasonName: "Harvest Season & Winter Cool",
    description: "The season of thanksgiving to nature and sun. Streets glow with intricate rice-flour Kolams and bubbling sweet Pongal pots.",
    featuredFestivals: ["Pongal Harvest Festival", "Alanganallur Jallikattu", "Thiruvaiyaru Thyagaraja Aradhana", "Mamallapuram Dance Festival"]
  },
  {
    monthIndex: 2,
    monthName: "February",
    tamilMonth: "Maasi (மாசி)",
    seasonName: "Pleasant Temple Festival Season",
    description: "Holy river dips and village temple processions under mild pleasant weather across Kaveri delta and southern districts.",
    featuredFestivals: ["Maasi Magam Coastal Dips", "Papanasam Temple Teppam", "Kumbakonam Mahamaham Tank Rituals"]
  },
  {
    monthIndex: 3,
    monthName: "March",
    tamilMonth: "Panguni (பங்குனி)",
    seasonName: "Spring & Celestial Weddings",
    description: "The full moon of Panguni marks divine temple celestial weddings across all major Shiva and Murugan abodes.",
    featuredFestivals: ["Panguni Uthiram Celebrations", "Mylapore Kapaleeshwarar Arupathumoovar", "Thiruchendur Temple Fest"]
  },
  {
    monthIndex: 4,
    monthName: "April",
    tamilMonth: "Chithirai (சித்திரை)",
    seasonName: "Tamil New Year & Grand Feasts",
    description: "The onset of the Tamil New Year (Puthandu). Mango pachadi and the grandest city celebrations in Madurai.",
    featuredFestivals: ["Tamil New Year (Puthandu)", "Madurai Chithirai Peruvizha", "Chariot Car Fest of Tiruvarur"]
  },
  {
    monthIndex: 5,
    monthName: "May",
    tamilMonth: "Vaikasi (வைகாசி)",
    seasonName: "Hill Station Escapes & Summer Fairs",
    description: "When the plains heat up, hill stations come alive with flower shows, fruit festivals, and Murugan Visakam celebrations.",
    featuredFestivals: ["Ooty Botanical Flower Show", "Kodaikanal Summer Festival & Boat Pageant", "Vaikasi Visakam in Tiruchendur"]
  },
  {
    monthIndex: 6,
    monthName: "June",
    tamilMonth: "Aani (ஆனி)",
    seasonName: "Monsoon Arrival & Temple Chariots",
    description: "Chidambaram Nataraja Temple witnesses cosmic dance abhishekam while the Southwest monsoon refreshes the Ghats.",
    featuredFestivals: ["Aani Thirumanjanam in Chidambaram", "Srivilliputhur Andal Chariot Car Festival"]
  },
  {
    monthIndex: 7,
    monthName: "July",
    tamilMonth: "Aadi (ஆடி)",
    seasonName: "Aadi Monsoon Rivers & Goddess Worship",
    description: "Aadi honors water, monsoons, and Mother Nature. River banks brim with offerings and Amman temples distribute sacred Kool.",
    featuredFestivals: ["Aadi Perukku along Kaveri River", "Aadi Pooram Festivities", "Courtallam Monsoon Waterfalls Fete"]
  },
  {
    monthIndex: 8,
    monthName: "August",
    tamilMonth: "Aavani (ஆவணி)",
    seasonName: "Early Harvest & Krishna Jayanthi",
    description: "Cultural dances, Avani Moolam celebrations in Madurai, and traditional pottery making in rural hamlets.",
    featuredFestivals: ["Aavani Moolam Festival in Madurai", "Gokulashtami Village Feasts", "Velankanni Feast Flag Hoisting"]
  },
  {
    monthIndex: 9,
    monthName: "September",
    tamilMonth: "Purattasi (புரட்டாசி)",
    seasonName: "Autumn & Sacred Saturdays",
    description: "Devotees observe vegetarian fasting honoring Lord Vishnu, while coastal Velankanni celebrates its grand annual feast.",
    featuredFestivals: ["Velankanni Basilica Annual Feast", "Purattasi Saturdays in Srirangam", "Vinayagar Chaturthi Celebrations"]
  },
  {
    monthIndex: 10,
    monthName: "October",
    tamilMonth: "Aippasi (ஐப்பசி)",
    seasonName: "Navarathri & Golu Displays",
    description: "Homes showcase 9-tier doll arrangements (Golu). Classical music concerts echo across temple mandapams.",
    featuredFestivals: ["Navarathri & Saraswathi Pooja Golu", "Kulasekharapatnam Dussehra Carnival", "Thanjavur Annabhishekam"]
  },
  {
    monthIndex: 11,
    monthName: "November",
    tamilMonth: "Karthigai (கார்த்திகை)",
    seasonName: "Festival of Lights & Deepam",
    description: "Every Tamil doorstep glows with clay oil lamps. Mount Arunachala lights the celestial Maha Deepam flame.",
    featuredFestivals: ["Deepavali Celebrations", "Thiruvannamalai Maha Karthigai Deepam", "Karthigai Vilakkidu in Chettinad"]
  },
  {
    monthIndex: 12,
    monthName: "December",
    tamilMonth: "Margazhi (மார்கழி)",
    seasonName: "Music Season & Christmas Lights",
    description: "World-renowned Madras Music Season fills sabhas with Carnatic music, while southern coastal towns celebrate Christmas in grand style.",
    featuredFestivals: ["Madras Margazhi Music & Dance Festival", "Vaikunta Ekadasi in Srirangam", "Christmas in Nagercoil & Kanyakumari"]
  }
];

export function getEventsList(): ExploreTNEvent[] {
  if (typeof window === "undefined") return EXPLORE_TN_EVENTS;
  try {
    const raw = localStorage.getItem("etn_custom_events");
    if (raw) {
      const custom: ExploreTNEvent[] = JSON.parse(raw);
      return [...custom, ...EXPLORE_TN_EVENTS];
    }
  } catch {}
  return EXPLORE_TN_EVENTS;
}

export function getEventBySlug(slug: string): ExploreTNEvent | undefined {
  const all = getEventsList();
  return all.find((e) => e.slug === slug || e.id === slug);
}

export function getEventsForDistrict(districtNameOrSlug: string): ExploreTNEvent[] {
  const norm = districtNameOrSlug.toLowerCase().trim();
  const all = getEventsList();
  return all.filter((e) => 
    e.district.toLowerCase() === norm || 
    (e.districtSlug && e.districtSlug.toLowerCase() === norm)
  );
}

export function getEventsForPlaceSlug(placeSlug: string): ExploreTNEvent[] {
  const norm = placeSlug.toLowerCase().trim();
  const all = getEventsList();
  return all.filter((e) => 
    e.destinationPlaceSlug?.toLowerCase() === norm ||
    e.districtSlug?.toLowerCase() === norm
  );
}
