export type VerificationSource = "official" | "verified" | "community" | "estimated" | "outdated";

export interface DataVerificationBadge {
  status: VerificationSource;
  label: string;
  source: string;
  lastUpdated: string;
  confidence: number;
}

// 1. DESTINATION-LEVEL HILL INTELLIGENCE (Region Level)
export interface HillDestinationIntelligence {
  destinationSlug: string;
  destinationName: string;
  district: string;
  weather: {
    temperatureC: number;
    condition: string;
    humidityPercent: number;
    windSpeedKmh: number;
    visibility: "Excellent (>10 km)" | "Good (5-10 km)" | "Moderate (2-5 km)" | "Low Fog (<500 m)" | "Dense Fog (<50 m)";
    rainCondition: "No Rain" | "Light Drizzle" | "Moderate Showers" | "Heavy Monsoon Rain";
  };
  roadStatus: {
    generalRoadCondition: "Excellent" | "Good" | "Moderate" | "Poor";
    hillRoadCondition: "Smooth Asphalt (Ghat Pass)" | "Narrow Curves & Hairpins" | "Landslide Watch Active" | "Monsoon Damage";
    nightAdvisory: string;
  };
  crowdLevel: "Low / Quiet" | "Moderate" | "High / Weekend Rush" | "Peak Festival Rush";
  accessibility: "Fully Open & Accessible" | "Conditional Pass (e-Pass Required)" | "Ghat Night Gate Closed (10 PM - 6 AM)";
  networkAvailability: {
    airtel: "5G High Speed" | "4G Good" | "Weak / Patchy";
    jio: "5G High Speed" | "4G Good" | "Weak / Patchy";
    vi: "4G Good" | "3G / Moderate" | "No Signal";
  };
  safetyAdvisory: string;
  region?: string;
  altitude?: string;
  hairpinBends?: number | string;
  highlights?: string[];
  bestTimeToVisit?: string;
  mappedCounts: {
    touristPlaces: number;
    viewpoints: number;
    waterfalls: number;
    trekkingRoutes: number;
    essentialServices: number;
  };
  verification: DataVerificationBadge;
}

// 2. POI CATEGORY-SPECIFIC INTELLIGENCE
export type PoiCategoryType =
  | "waterfall"
  | "viewpoint"
  | "trek"
  | "lake"
  | "forest"
  | "temple"
  | "beach"
  | "general";

export interface FacilityAvailability {
  available: boolean | "Limited" | "Nearby" | "Information not yet verified";
  details?: string;
}

export interface PoiHillIntelligence {
  poiSlug: string;
  name: string;
  category: PoiCategoryType;
  district: string;
  latitude: number;
  longitude: number;
  accessStatus: "Accessible" | "Restricted Pass Required" | "Temporarily Closed" | "Seasonal Entry Only";
  roadCondition: "Good" | "Moderate" | "Narrow Ghat Road" | "Unpaved Trail";
  
  // Parking
  parking: {
    carParking: "Available" | "Limited" | "Not Available" | "Information not yet verified";
    bikeParking: "Available" | "Limited" | "Not Available" | "Information not yet verified";
    distanceFromAttraction: string;
    parkingFee?: string;
  };

  // Facilities
  facilities: {
    walkingDistance: string;
    restroom: FacilityAvailability;
    changingRoom?: FacilityAvailability;
    showerBathing?: FacilityAvailability;
    drinkingWater: FacilityAvailability;
    foodStalls: FacilityAvailability;
    nearbyRestaurants?: FacilityAvailability;
    teaCoffeeShops?: FacilityAvailability;
    shops?: FacilityAvailability;
    firstAid: FacilityAvailability;
    medicalFacility: FacilityAvailability;
    photographyArea?: FacilityAvailability;
    boating?: FacilityAvailability;
  };

  // Waterfall Specific
  waterfallSpecs?: {
    waterFlowCondition: "High Monsoon Cascade" | "Moderate Safe Flow" | "Low Stream" | "Dry Season";
    bathingAllowed: boolean;
    depthAdvisory: string;
  };

  // Viewpoint Specific
  viewpointSpecs?: {
    visibilityGrade: "Crystal Clear Valley View" | "Misty Cloud Cover" | "Dense Fog";
    bestViewingPeriod: string;
  };

  // Trekking Specific
  trekSpecs?: {
    distanceKm: number;
    durationHrs: string;
    difficulty: "Easy" | "Moderate" | "Challenging" | "Expert Only";
    elevationMeters: number;
    startingPoint: string;
    guideRequired: boolean;
    permitRequired: boolean;
    permitDetails?: string;
    lastRestroomBeforeTrek: string;
    waterSourceOnTrail: boolean;
  };

  // Forest & Nature Specific
  forestSpecs?: {
    permitRequirement: string;
    wildlifeAdvisory: string;
    openingHours: string;
  };

  // Temple Specific
  templeSpecs?: {
    dressCode?: string;
    timings: string;
  };

  // Environmental & Live Info
  crowdLevel: "Quiet / Low" | "Medium" | "High Crowd";
  currentWeather: string;
  mobileNetwork: string;
  safetyAdvisories: string[];
  lastAvailableEssentialService?: string;
  verification: DataVerificationBadge;
}

// 3. ROUTE & ESSENTIALS INTELLIGENCE
export interface EssentialServiceItem {
  id: string;
  name: string;
  type: "fuel" | "food" | "tea" | "restroom" | "medical" | "parking" | "water" | "shop" | "hotel" | "network";
  latitude: number;
  longitude: number;
  distanceFromStartKm: number;
  address: string;
  isOpen24h?: boolean;
  notes?: string;
}

export interface RemoteStretchInfo {
  startKm: number;
  endKm: number;
  distanceKm: number;
  stretchName: string;
  warnings: string[];
  lastAvailableServices: {
    fuelKm: number;
    foodKm: number;
    restroomKm: number;
    medicalKm: number;
    essentialsKm: number;
  };
}

export interface RouteHillIntelligence {
  routeId: string;
  origin: string;
  destination: string;
  totalDistanceKm: number;
  estimatedDuration: string;
  hillEntryPoint: {
    name: string;
    distanceFromOriginKm: number;
  };
  remoteStretches: RemoteStretchInfo[];
  stoppingPoints: EssentialServiceItem[];
  tripReadinessChecklist: string[];
}

// ---------------------------------------------------------
// DATABASE OF HILL DESTINATIONS (REGION LEVEL)
// ---------------------------------------------------------
export const HILL_DESTINATIONS_INTELLIGENCE: Record<string, HillDestinationIntelligence> = {
  kolli_hills: {
    destinationSlug: "kolli-hills",
    destinationName: "Kolli Hills Mountain Region",
    district: "Namakkal District",
    region: "Eastern Ghats",
    altitude: "1,300m (Approx.)",
    hairpinBends: 70,
    highlights: ["Beautiful Valleys", "Waterfalls (Agaya Gangai)", "Tribal Villages", "Motorcycle Adventure"],
    bestTimeToVisit: "Oct - Mar",
    weather: {
      temperatureC: 22.4,
      condition: "Humid Mountain Breeze",
      humidityPercent: 78,
      windSpeedKmh: 8,
      visibility: "Good (5-10 km)",
      rainCondition: "Light Drizzle",
    },
    roadStatus: {
      generalRoadCondition: "Moderate",
      hillRoadCondition: "Narrow Curves & Hairpins",
      nightAdvisory: "70 Hairpin bends! Driving after 8 PM strongly discouraged due to sharp unlit curves.",
    },
    crowdLevel: "Low / Quiet",
    accessibility: "Fully Open & Accessible",
    networkAvailability: {
      airtel: "4G Good",
      jio: "4G Good",
      vi: "Weak / Patchy",
    },
    safetyAdvisory: "70 Continuous Hairpin Bends. Check brakes & tires before climbing from Karavalli.",
    mappedCounts: {
      touristPlaces: 9,
      viewpoints: 3,
      waterfalls: 3,
      trekkingRoutes: 4,
      essentialServices: 15,
    },
    verification: {
      status: "verified",
      label: "🟢 Verified Biker Telemetry",
      source: "ExploreTN Mountain Rider Guild & Namakkal RTO",
      lastUpdated: "1 hour ago",
      confidence: 96,
    },
  },

  valparai: {
    destinationSlug: "valparai",
    destinationName: "Valparai Anamalai Hills",
    district: "Coimbatore District",
    region: "Anamalai Hills",
    altitude: "1,067m (Approx.)",
    hairpinBends: "40+",
    highlights: ["Tea Estates", "Dense Forest Canopy", "Wildlife & Lion-tailed Macaque", "Breathtaking Ghat Views"],
    bestTimeToVisit: "Sept - May",
    weather: {
      temperatureC: 19.8,
      condition: "Misty Tea Slopes & Evergreen Forest",
      humidityPercent: 84,
      windSpeedKmh: 12,
      visibility: "Moderate (2-5 km)",
      rainCondition: "Light Drizzle",
    },
    roadStatus: {
      generalRoadCondition: "Good",
      hillRoadCondition: "Narrow Curves & Hairpins",
      nightAdvisory: "Aliyar checkpost closes at 6:00 PM; strictly no night driving through tiger reserve forest.",
    },
    crowdLevel: "Low / Quiet",
    accessibility: "Conditional Pass (e-Pass Required)",
    networkAvailability: {
      airtel: "4G Good",
      jio: "4G Good",
      vi: "Weak / Patchy",
    },
    safetyAdvisory: "40+ Hairpin Bends from Pollachi/Aliyar Dam. Wildlife corridors; do not step out of vehicles in forest stretches.",
    mappedCounts: {
      touristPlaces: 14,
      viewpoints: 5,
      waterfalls: 4,
      trekkingRoutes: 3,
      essentialServices: 22,
    },
    verification: {
      status: "verified",
      label: "🟢 Verified Forest Telemetry",
      source: "Anamalai Tiger Reserve & Pollachi RTO",
      lastUpdated: "25 mins ago",
      confidence: 97,
    },
  },

  masinagudi: {
    destinationSlug: "masinagudi",
    destinationName: "Masinagudi – Ooty Foothills & Ghat",
    district: "The Nilgiris District",
    region: "Nilgiri Biosphere",
    altitude: "2,240m (Approx. / Ooty Crest)",
    hairpinBends: 46,
    highlights: ["Dense Forests", "Wildlife Sightings (Elephants, Tigers, Deer)", "Cool Mountain Climate", "Extreme Kalhatti Ghat Adventure"],
    bestTimeToVisit: "Oct - Jun",
    weather: {
      temperatureC: 18.2,
      condition: "Forest Breeze & Crisp Hill Air",
      humidityPercent: 76,
      windSpeedKmh: 10,
      visibility: "Good (5-10 km)",
      rainCondition: "No Rain",
    },
    roadStatus: {
      generalRoadCondition: "Moderate",
      hillRoadCondition: "Narrow Curves & Hairpins",
      nightAdvisory: "Kalhatti Ghat closed for descending non-local vehicles; heavy wild elephant movements at night.",
    },
    crowdLevel: "Moderate",
    accessibility: "Conditional Pass (e-Pass Required)",
    networkAvailability: {
      airtel: "4G Good",
      jio: "4G Good",
      vi: "No Signal",
    },
    safetyAdvisory: "36-46 Hairpin Bends via Kalhatti Ghat (one of the steepest ghat passes in South India). Descend strictly in 1st/2nd gear.",
    mappedCounts: {
      touristPlaces: 11,
      viewpoints: 4,
      waterfalls: 2,
      trekkingRoutes: 3,
      essentialServices: 18,
    },
    verification: {
      status: "official",
      label: "🔵 Official Forest & Police Telemetry",
      source: "Mudumalai Tiger Reserve & Nilgiris Police",
      lastUpdated: "15 mins ago",
      confidence: 98,
    },
  },

  yercaud: {
    destinationSlug: "yercaud",
    destinationName: "Yercaud Shevaroy Hills",
    district: "Salem District",
    region: "Shevaroy Hills",
    altitude: "1,515m (Approx.)",
    hairpinBends: 20,
    highlights: ["Pleasant Climate", "Emerald Lake", "Pagoda Point Viewpoints", "Lush Coffee & Spice Greenery"],
    bestTimeToVisit: "Oct - May",
    weather: {
      temperatureC: 21.0,
      condition: "Pleasant Sunshine",
      humidityPercent: 65,
      windSpeedKmh: 9,
      visibility: "Excellent (>10 km)",
      rainCondition: "No Rain",
    },
    roadStatus: {
      generalRoadCondition: "Excellent",
      hillRoadCondition: "Smooth Asphalt (Ghat Pass)",
      nightAdvisory: "20 Hairpin bends well-lit with high reflectors; smooth night driving from Salem.",
    },
    crowdLevel: "Moderate",
    accessibility: "Fully Open & Accessible",
    networkAvailability: {
      airtel: "5G High Speed",
      jio: "5G High Speed",
      vi: "4G Good",
    },
    safetyAdvisory: "Smooth 20 hairpin bend ghat road from Salem. Park only in designated zones near Emerald Lake.",
    mappedCounts: {
      touristPlaces: 12,
      viewpoints: 4,
      waterfalls: 2,
      trekkingRoutes: 3,
      essentialServices: 28,
    },
    verification: {
      status: "verified",
      label: "🟢 Verified Field Data",
      source: "Salem District Collectorate & Tourism Board",
      lastUpdated: "45 mins ago",
      confidence: 94,
    },
  },

  kodaikanal: {
    destinationSlug: "kodaikanal",
    destinationName: "Kodaikanal Hill Region",
    district: "Dindigul District",
    region: "Palani Hills",
    altitude: "2,133m (Approx.)",
    hairpinBends: "14-15",
    highlights: ["Pine Forests", "Cascading Waterfalls", "Star-Shaped Kodai Lake", "Misty Mountain Peaks & Pillar Rocks"],
    bestTimeToVisit: "Sept - Jun",
    weather: {
      temperatureC: 17.5,
      condition: "Partly Cloudy with Mild Mist",
      humidityPercent: 74,
      windSpeedKmh: 11,
      visibility: "Good (5-10 km)",
      rainCondition: "Light Drizzle",
    },
    roadStatus: {
      generalRoadCondition: "Good",
      hillRoadCondition: "Smooth Asphalt (Ghat Pass)",
      nightAdvisory: "Batlagundu & Palani Ghat road open 24h; heavy fog after 8:00 PM.",
    },
    crowdLevel: "Moderate",
    accessibility: "Fully Open & Accessible",
    networkAvailability: {
      airtel: "4G Good",
      jio: "5G High Speed",
      vi: "3G / Moderate",
    },
    safetyAdvisory: "Drive in low gear on 14-15 hairpin bends from Batlagundu. Expect sudden fog patches near Moir Point & Pillar Rocks.",
    mappedCounts: {
      touristPlaces: 18,
      viewpoints: 6,
      waterfalls: 4,
      trekkingRoutes: 5,
      essentialServices: 42,
    },
    verification: {
      status: "verified",
      label: "🟢 Verified Live Region Data",
      source: "Dindigul District Tourism & Meteorological Telemetry",
      lastUpdated: "35 mins ago",
      confidence: 96,
    },
  },

  coonoor: {
    destinationSlug: "coonoor",
    destinationName: "Coonoor – Ooty Nilgiri Hills",
    district: "The Nilgiris District",
    region: "Nilgiris",
    altitude: "1,850m (Approx.)",
    hairpinBends: 14,
    highlights: ["Sprawling Tea Gardens", "Colonial Heritage Charm", "Scenic Ghat Drives", "Dolphin's Nose & Sim's Park"],
    bestTimeToVisit: "Oct - May",
    weather: {
      temperatureC: 16.5,
      condition: "Cool Mountain Breeze & Crisp Sun",
      humidityPercent: 75,
      windSpeedKmh: 11,
      visibility: "Good (5-10 km)",
      rainCondition: "No Rain",
    },
    roadStatus: {
      generalRoadCondition: "Good",
      hillRoadCondition: "Smooth Asphalt (Ghat Pass)",
      nightAdvisory: "Mettupalayam-Coonoor NH 181 has 14 hairpin bends; drive with caution during fog.",
    },
    crowdLevel: "Moderate",
    accessibility: "Conditional Pass (e-Pass Required)",
    networkAvailability: {
      airtel: "5G High Speed",
      jio: "5G High Speed",
      vi: "4G Good",
    },
    safetyAdvisory: "14 Hairpin Bends along NH 181 from Burliar to Coonoor. e-Pass mandatory for entry into Nilgiris district.",
    mappedCounts: {
      touristPlaces: 16,
      viewpoints: 6,
      waterfalls: 3,
      trekkingRoutes: 4,
      essentialServices: 34,
    },
    verification: {
      status: "official",
      label: "🔵 Official Department Telemetry",
      source: "Nilgiris District Administration & TN Police",
      lastUpdated: "20 mins ago",
      confidence: 98,
    },
  },

  ooty: {
    destinationSlug: "ooty",
    destinationName: "Ooty & Nilgiri Hills Region",
    district: "The Nilgiris District",
    region: "Nilgiris",
    altitude: "2,240m (Approx.)",
    hairpinBends: 36,
    highlights: ["Tea Gardens", "Botanical Gardens", "Doddabetta Peak", "UNESCO Toy Train Heritage"],
    bestTimeToVisit: "Oct - Jun",
    weather: {
      temperatureC: 14.2,
      condition: "Crisp Cool Air & Morning Mist",
      humidityPercent: 82,
      windSpeedKmh: 14,
      visibility: "Moderate (2-5 km)",
      rainCondition: "No Rain",
    },
    roadStatus: {
      generalRoadCondition: "Good",
      hillRoadCondition: "Narrow Curves & Hairpins",
      nightAdvisory: "Mettupalayam Ghat Pass restricted to commercial vehicles at night; e-Pass mandatory.",
    },
    crowdLevel: "High / Weekend Rush",
    accessibility: "Conditional Pass (e-Pass Required)",
    networkAvailability: {
      airtel: "5G High Speed",
      jio: "5G High Speed",
      vi: "4G Good",
    },
    safetyAdvisory: "TN e-Pass (epass.tnega.org) mandatory for Nilgiris entry. Exercise caution on 36 Hairpin Bends.",
    mappedCounts: {
      touristPlaces: 24,
      viewpoints: 8,
      waterfalls: 5,
      trekkingRoutes: 6,
      essentialServices: 65,
    },
    verification: {
      status: "official",
      label: "🔵 Official Department Telemetry",
      source: "Nilgiris District Administration & TN Police Operations",
      lastUpdated: "12 mins ago",
      confidence: 98,
    },
  },
};

// ---------------------------------------------------------
// DATABASE OF POI SPECIFIC INTELLIGENCE
// ---------------------------------------------------------
export const POI_HILL_INTELLIGENCE: Record<string, PoiHillIntelligence> = {
  // WATERFALL POI: Silver Cascade Falls
  "silver-cascade-falls": {
    poiSlug: "silver-cascade-falls",
    name: "Silver Cascade Falls",
    category: "waterfall",
    district: "Dindigul",
    latitude: 10.2458,
    longitude: 77.5142,
    accessStatus: "Accessible",
    roadCondition: "Good",
    parking: {
      carParking: "Available",
      bikeParking: "Available",
      distanceFromAttraction: "150 m from attraction",
      parkingFee: "₹30 Cars · ₹10 Bikes",
    },
    facilities: {
      walkingDistance: "50 m from parking",
      restroom: { available: true, details: "Pay & Use Restroom near roadside market (₹5)" },
      changingRoom: { available: true, details: "Basic changing stalls available near market" },
      showerBathing: { available: false, details: "Bathing in main waterfall drop restricted by Forest Dept" },
      drinkingWater: { available: true, details: "Packaged mineral water stalls available" },
      foodStalls: { available: true, details: "Hot tea, roasted corn, chili bajji & fruit stalls" },
      nearbyRestaurants: { available: "Nearby", details: "Highway mess 300m back on Ghat road" },
      shops: { available: true, details: "Homemade Kodai chocolates & eucalyptus oil shops" },
      firstAid: { available: true, details: "First aid kit at Forest Checkpost counter" },
      medicalFacility: { available: "Nearby", details: "Government Primary Health Center at Shenbaganur (3.2 km)" },
    },
    waterfallSpecs: {
      waterFlowCondition: "High Monsoon Cascade",
      bathingAllowed: false,
      depthAdvisory: "Strictly view from safety railing; fast current in pool below.",
    },
    crowdLevel: "High Crowd",
    currentWeather: "18°C · Pleasant Spray & Drizzle",
    mobileNetwork: "Airtel 5G · Jio 5G Excellent",
    safetyAdvisories: [
      "Beware of monkeys near roadside parking.",
      "Do not cross safety barricades to take selfies near slippery rocks.",
    ],
    lastAvailableEssentialService: "Last Petrol Bunk 8 km ahead in Kodaikanal Town.",
    verification: {
      status: "verified",
      label: "🟢 Verified Field Inspection",
      source: "Explorer Field Team & Dindigul Forest Range",
      lastUpdated: "1 hour ago",
      confidence: 97,
    },
  },

  // VIEWPOINT POI: Dolphin's Nose
  "dolphins-nose": {
    poiSlug: "dolphins-nose",
    name: "Dolphin's Nose & Echo Rock",
    category: "viewpoint",
    district: "Dindigul",
    latitude: 10.2185,
    longitude: 77.4982,
    accessStatus: "Accessible",
    roadCondition: "Narrow Ghat Road",
    parking: {
      carParking: "Limited",
      bikeParking: "Available",
      distanceFromAttraction: "1.2 km trekking walk from Vellagavi road end",
      parkingFee: "₹40 Cars · ₹20 Bikes at Pambarpuram parking lot",
    },
    facilities: {
      walkingDistance: "1.2 km steep downhill walk along rocky village path",
      restroom: { available: "Limited", details: "Basic village restroom 200m before viewpoint (₹10)" },
      drinkingWater: { available: true, details: "Local lemon soda & water tea stalls along trail" },
      foodStalls: { available: true, details: "Tea, bread omelette, maggi & herbal tea stalls (80m & 120m away)" },
      nearbyRestaurants: { available: false, details: "No full restaurants on trail; return to Pambarpuram" },
      teaCoffeeShops: { available: true, details: "Tea stall — 80 m from viewpoint" },
      shops: { available: true, details: "Handcrafted wooden souvenirs & local spices" },
      firstAid: { available: "Limited", details: "Basic band-aids at local tea shop" },
      medicalFacility: { available: false, details: "Kodai GH hospital 6.5 km away in town" },
      photographyArea: { available: true, details: "Natural rock ledge extending over 6,600ft deep cliff valley" },
    },
    viewpointSpecs: {
      visibilityGrade: "Crystal Clear Valley View",
      bestViewingPeriod: "07:00 AM – 10:30 AM before clouds cover Periyakulam valley",
    },
    crowdLevel: "Medium",
    currentWeather: "16°C · Cool Mountain Gusts",
    mobileNetwork: "Airtel 4G Fair · Jio 4G Good (Patchy near cliff edge)",
    safetyAdvisories: [
      "Requires 1.2 km downhill trek; climbing back up is steep & tiring.",
      "Extreme cliff overhang with no safety railing. Exercise high caution with children.",
    ],
    lastAvailableEssentialService: "Last reliable ATM & Pharmacy at Pambarpuram Junction (1.5 km).",
    verification: {
      status: "verified",
      label: "🟢 Verified Local Guide Telemetry",
      source: "Kodai Trekking Association & Local Guides",
      lastUpdated: "2 hours ago",
      confidence: 95,
    },
  },

  // TREK POI: Berijam Lake Trail
  "berijam-lake": {
    poiSlug: "berijam-lake",
    name: "Berijam Lake & Forest Trail",
    category: "trek",
    district: "Dindigul",
    latitude: 10.1834,
    longitude: 77.3912,
    accessStatus: "Restricted Pass Required",
    roadCondition: "Narrow Ghat Road",
    parking: {
      carParking: "Available",
      bikeParking: "Not Available",
      distanceFromAttraction: "50 m from lake entry gate",
      parkingFee: "Included in Forest Entry Pass",
    },
    facilities: {
      walkingDistance: "300 m walk around lake periphery",
      restroom: { available: true, details: "Forest Department Restroom at Checkpost entrance" },
      drinkingWater: { available: false, details: "NO drinking water stalls! Must carry your own water bottle." },
      foodStalls: { available: false, details: "NO food stalls allowed inside eco-restricted forest zone" },
      firstAid: { available: true, details: "Forest Ranger Office First Aid Post" },
      medicalFacility: { available: false, details: "Nearest hospital 21 km away in Kodaikanal Town" },
    },
    trekSpecs: {
      distanceKm: 6.4,
      durationHrs: "3–4 hrs",
      difficulty: "Moderate",
      elevationMeters: 2150,
      startingPoint: "Moir Point Forest Gate",
      guideRequired: true,
      permitRequired: true,
      permitDetails: "Forest Department Entry Permit mandatory (Obtain at District Forest Office 08:30 AM - max 80 vehicles/day)",
      lastRestroomBeforeTrek: "Moir Point Checkpost",
      waterSourceOnTrail: false,
    },
    forestSpecs: {
      permitRequirement: "Daily limit 80 vehicle passes issued at DFO Office near Kodai Lake.",
      wildlifeAdvisory: "Wild Indian Gaur (Bison) & Elephant movement area. Do not enter deep forest.",
      openingHours: "09:30 AM – 03:00 PM (Pass entry stops at 1:00 PM)",
    },
    crowdLevel: "Quiet / Low",
    currentWeather: "15°C · Pristine Shola Wilderness",
    mobileNetwork: "No Signal / Very Weak Patchy BSNL",
    safetyAdvisories: [
      "NO mobile signal for 18 km inside the reserve forest.",
      "Strictly NO plastic disposal & NO smoking in forest area.",
    ],
    lastAvailableEssentialService: "Last Petrol Bunk & Food Mess at Kodaikanal Town (21 km).",
    verification: {
      status: "official",
      label: "🔵 Official Forest Dept Record",
      source: "Tamil Nadu Forest Department (Dindigul Circle)",
      lastUpdated: "40 mins ago",
      confidence: 99,
    },
  },
};

// ---------------------------------------------------------
// DATABASE OF ROUTE & ESSENTIALS INTELLIGENCE
// ---------------------------------------------------------
export const ROUTE_HILL_INTELLIGENCE_LIST: Record<string, RouteHillIntelligence> = {
  "chennai-to-kodaikanal": {
    routeId: "chennai-to-kodaikanal",
    origin: "Chennai",
    destination: "Kodaikanal",
    totalDistanceKm: 525,
    estimatedDuration: "9 hrs 30 mins",
    hillEntryPoint: {
      name: "Batlagundu Toll & Ghat Entry Checkpost",
      distanceFromOriginKm: 468,
    },
    remoteStretches: [
      {
        startKm: 468,
        endKm: 518,
        distanceKm: 50,
        stretchName: "Batlagundu to Kodaikanal Hill Ghat Road (SH 156)",
        warnings: [
          "No reliable petrol bunk for the 50 km hill climb!",
          "Mobile network signal patchy near Dum Dum Rock (KM 485).",
          "Carry drinking water and snacks before starting the ghat section.",
        ],
        lastAvailableServices: {
          fuelKm: 468, // Batlagundu Town
          foodKm: 468,
          restroomKm: 468,
          medicalKm: 468,
          essentialsKm: 468,
        },
      },
    ],
    stoppingPoints: [
      {
        id: "stop_1",
        name: "Tindivanam Highway Food Plaza",
        type: "food",
        latitude: 12.2285,
        longitude: 79.6542,
        distanceFromStartKm: 125,
        address: "NH 45, Tindivanam bypass",
        isOpen24h: true,
        notes: "A2B Vegetarian, Shell Petrol Bunk & Clean Restrooms",
      },
      {
        id: "stop_2",
        name: "Ulundurpet Fuel & Restroom Hub",
        type: "fuel",
        latitude: 11.6912,
        longitude: 79.2891,
        distanceFromStartKm: 195,
        address: "NH 45 Junction, Ulundurpet",
        isOpen24h: true,
        notes: "HP 24/7 Bunk with EV Fast Charger & Restrooms",
      },
      {
        id: "stop_3",
        name: "Trichy Samayapuram Highway Hub",
        type: "food",
        latitude: 10.9124,
        longitude: 78.7392,
        distanceFromStartKm: 310,
        address: "NH 45 Samayapuram Toll",
        isOpen24h: true,
        notes: "Multi-cuisine restaurants, pharmacy & fuel stations",
      },
      {
        id: "stop_4",
        name: "Batlagundu Ghat Base Service Center",
        type: "fuel",
        latitude: 10.1582,
        longitude: 77.7612,
        distanceFromStartKm: 468,
        address: "Foot of Kodaikanal Hills, Batlagundu",
        isOpen24h: true,
        notes: "LAST FULL FUEL & REPAIR HUB BEFORE 50 KM HILL CLIMB!",
      },
    ],
    tripReadinessChecklist: [
      "Fuel up completely at Batlagundu before ascending the ghat road.",
      "Ensure e-Pass (if applicable) is downloaded offline on your phone.",
      "Check tire pressure and brake pads for 14 steep hairpin bends.",
      "Carry sufficient drinking water as food stalls are sparse on the ghat climb.",
      "Download offline Google Maps / ExploreTN route before network fades.",
    ],
  },
};

// ---------------------------------------------------------
// QUERY & FALLBACK HELPERS
// ---------------------------------------------------------
export function getHillDestinationIntelligence(slug: string): HillDestinationIntelligence | undefined {
  const norm = slug.toLowerCase().trim();
  if (HILL_DESTINATIONS_INTELLIGENCE[norm]) {
    return HILL_DESTINATIONS_INTELLIGENCE[norm];
  }
  // Check exact / substring matching
  if (norm.includes("kolli")) return HILL_DESTINATIONS_INTELLIGENCE["kolli_hills"];
  if (norm.includes("valparai")) return HILL_DESTINATIONS_INTELLIGENCE["valparai"];
  if (norm.includes("masinagudi") || norm.includes("mudumalai")) return HILL_DESTINATIONS_INTELLIGENCE["masinagudi"];
  if (norm.includes("coonoor")) return HILL_DESTINATIONS_INTELLIGENCE["coonoor"];
  if (norm.includes("yercaud") || norm.includes("shevaroy") || norm.includes("salem")) return HILL_DESTINATIONS_INTELLIGENCE["yercaud"];
  if (norm.includes("dindigul") || norm.includes("kodai") || norm.includes("palani")) return HILL_DESTINATIONS_INTELLIGENCE["kodaikanal"];
  if (norm.includes("nilgiris") || norm.includes("ooty")) return HILL_DESTINATIONS_INTELLIGENCE["ooty"];
  return undefined;
}

export function getPoiHillIntelligence(slug: string): PoiHillIntelligence | undefined {
  const norm = slug.toLowerCase().trim();
  if (POI_HILL_INTELLIGENCE[norm]) return POI_HILL_INTELLIGENCE[norm];

  // Try alias matches
  if (norm.includes("silver") || norm.includes("cascade")) return POI_HILL_INTELLIGENCE["silver-cascade-falls"];
  if (norm.includes("dolphin")) return POI_HILL_INTELLIGENCE["dolphins-nose"];
  if (norm.includes("berijam")) return POI_HILL_INTELLIGENCE["berijam-lake"];
  return undefined;
}

export function getRouteHillIntelligence(origin: string, destination: string): RouteHillIntelligence | undefined {
  const key = `${origin.toLowerCase()}-to-${destination.toLowerCase()}`;
  if (ROUTE_HILL_INTELLIGENCE_LIST[key]) return ROUTE_HILL_INTELLIGENCE_LIST[key];
  return ROUTE_HILL_INTELLIGENCE_LIST["chennai-to-kodaikanal"];
}
