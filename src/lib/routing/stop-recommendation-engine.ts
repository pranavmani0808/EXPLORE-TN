import { ExplorerPlace, CANONICAL_PLACES } from "@/lib/data/canonical-places";

export type RouteStopCategory =
  | "tea"
  | "breakfast"
  | "lunch"
  | "dinner"
  | "fuel"
  | "rest"
  | "hotel";

export type RouteStopCandidate = {
  placeId: string;
  name: string;
  category: RouteStopCategory;
  lat: number;
  lng: number;
  routeDistanceFromOriginKm: number;
  detourDistanceKm: number;
  estimatedArrivalTime: string;
  estimatedStopDurationMinutes: number;
  rating?: number;
  reviewsCount?: number;
  openingHours?: {
    openTime: string;
    closeTime: string;
    isOpen24Hours?: boolean;
  };
  routePositionPercent: number;
  reason: string;
  score: number;
  district: string;
  tagline: string;
  placeObject?: ExplorerPlace;
};

export type RouteRecommendationResult = {
  isLongJourney: boolean; // > 500 km
  journeyMode: "SHORT_TRIP" | "MEDIUM_TRIP" | "EXTENDED_TRIP" | "LONG_JOURNEY_MODE";
  totalDistanceKm: number;
  totalDurationMinutes: number;
  departureTime: string;
  expectedArrivalTime: string;
  recommendations: RouteStopCandidate[];
};

// Curated High-Quality Highway Rest, Dining & Fuel Catalog
const HIGHWAY_RECS_CATALOG = [
  // NH44 Chennai -> Tindivanam -> Villupuram -> Perambalur -> Trichy
  {
    id: "a2b-tindivanam-nh44",
    name: "A2B Adyar Ananda Bhavan — Tindivanam NH44",
    district: "Villupuram",
    latitude: 12.2274,
    longitude: 79.6468,
    category: "breakfast" as RouteStopCategory,
    tagline: "Famous South Indian pure veg breakfast & filter coffee highway stop",
    rating: 4.6,
    reviewsCount: 8500,
    openTime: "06:00",
    closeTime: "22:30",
    stopDurationMins: 30,
  },
  {
    id: "shell-tindivanam-fuel",
    name: "Shell Fuel Station & RestStop — Tindivanam",
    district: "Villupuram",
    latitude: 12.2350,
    longitude: 79.6490,
    category: "fuel" as RouteStopCategory,
    tagline: "Clean rest areas, EV fast charging, premium V-Power fuel & snacks",
    rating: 4.7,
    reviewsCount: 3200,
    openTime: "00:00",
    closeTime: "23:59",
    isOpen24Hours: true,
    stopDurationMins: 15,
  },
  {
    id: "sri-saravana-bhavan-ulundurpet",
    name: "Sri Saravana Bhavan — Ulundurpet Toll Plaza",
    district: "Kallakurichi",
    latitude: 11.6912,
    longitude: 79.2891,
    category: "lunch" as RouteStopCategory,
    tagline: "Premium vegetarian thali, meals & clean highway rest facilities",
    rating: 4.5,
    reviewsCount: 6400,
    openTime: "07:00",
    closeTime: "22:00",
    stopDurationMins: 45,
  },
  {
    id: "mr-palani-tea-perambalur",
    name: "Kumbakonam Degree Coffee — Perambalur NH44",
    district: "Perambalur",
    latitude: 11.2333,
    longitude: 78.8821,
    category: "tea" as RouteStopCategory,
    tagline: "Authentic Kumbakonam brass cup degree coffee & hot snacks",
    rating: 4.8,
    reviewsCount: 4100,
    openTime: "05:30",
    closeTime: "22:00",
    stopDurationMins: 20,
  },
  {
    id: "hari-bhavanam-trichy-bypass",
    name: "Hari Bhavanam — Trichy Bypass Highway Hub",
    district: "Tiruchirappalli",
    latitude: 10.7905,
    longitude: 78.7047,
    category: "lunch" as RouteStopCategory,
    tagline: "Iconic Kongu style non-veg feasts, biryani & spacious parking",
    rating: 4.6,
    reviewsCount: 9200,
    openTime: "11:00",
    closeTime: "23:00",
    stopDurationMins: 50,
  },

  // NH44 Dindigul -> Madurai -> Virudhunagar -> Tirunelveli -> Kanniyakumari
  {
    id: "thalappakatti-dindigul-nh44",
    name: "Dindigul Thalappakatti Restaurant — NH44 Junction",
    district: "Dindigul",
    latitude: 10.3624,
    longitude: 77.9695,
    category: "dinner" as RouteStopCategory,
    tagline: "World-famous Seeraga Samba mutton biryani & traditional sides",
    rating: 4.7,
    reviewsCount: 11400,
    openTime: "11:00",
    closeTime: "23:00",
    stopDurationMins: 45,
  },
  {
    id: "hp-autocare-dindigul",
    name: "HPCL Auto Care Centre & Rest Point — Dindigul Bypass",
    district: "Dindigul",
    latitude: 10.3411,
    longitude: 77.9522,
    category: "fuel" as RouteStopCategory,
    tagline: "24/7 Fuel station, tire pressure check, clean restrooms & coffee shop",
    rating: 4.5,
    reviewsCount: 2100,
    openTime: "00:00",
    closeTime: "23:59",
    isOpen24Hours: true,
    stopDurationMins: 15,
  },
  {
    id: "amavasai-hotel-virudhunagar",
    name: "Virudhunagar Amavasai Hotel — Highway Hub",
    district: "Virudhunagar",
    latitude: 9.5872,
    longitude: 77.9514,
    category: "lunch" as RouteStopCategory,
    tagline: "Authentic Virudhunagar Ennai Parotta & Chettinad curries",
    rating: 4.7,
    reviewsCount: 7800,
    openTime: "11:30",
    closeTime: "22:30",
    stopDurationMins: 40,
  },
  {
    id: "iruttu-kadai-halwa-tirunelveli-bypass",
    name: "Tirunelveli Halwa & Coffee Express — Highway Stop",
    district: "Tirunelveli",
    latitude: 8.7139,
    longitude: 77.7567,
    category: "tea" as RouteStopCategory,
    tagline: "Fresh wheat halwa, hot tea, filter coffee & evening snacks",
    rating: 4.8,
    reviewsCount: 5600,
    openTime: "06:00",
    closeTime: "22:00",
    stopDurationMins: 20,
  },
  {
    id: "hotel-grand-aryas-tirunelveli-nh44",
    name: "Hotel Grand Aryas — Tirunelveli NH44 Bypass",
    district: "Tirunelveli",
    latitude: 8.7280,
    longitude: 77.7210,
    category: "dinner" as RouteStopCategory,
    tagline: "Multicuisine family dining, spacious AC halls & lush garden lounge",
    rating: 4.6,
    reviewsCount: 4900,
    openTime: "07:00",
    closeTime: "23:00",
    stopDurationMins: 45,
  },
  {
    id: "hotel-heritage-kanniyakumari-stay",
    name: "Hotel Heritage Sea Resort — Kanniyakumari Highway",
    district: "Kanniyakumari",
    latitude: 8.0883,
    longitude: 77.5385,
    category: "hotel" as RouteStopCategory,
    tagline: "Comfortable overnight stay, ocean views & 24/7 check-in for long drivers",
    rating: 4.6,
    reviewsCount: 3800,
    openTime: "00:00",
    closeTime: "23:59",
    isOpen24Hours: true,
    stopDurationMins: 480,
  },

  // ECR Highway Corridor (Chennai -> Mahabalipuram -> Pondicherry)
  {
    id: "ecr-dhaba-mahabalipuram",
    name: "ECR Beachside Dhaba & Refreshment — Mahabalipuram",
    district: "Chengalpattu",
    latitude: 12.6269,
    longitude: 80.1927,
    category: "tea" as RouteStopCategory,
    tagline: "Fresh tender coconut, sea breeze coffee, fried seafood & snacks",
    rating: 4.6,
    reviewsCount: 5100,
    openTime: "06:00",
    closeTime: "22:00",
    stopDurationMins: 25,
  },

  // Western Ghats / Salem / Ooty Corridor
  {
    id: "salem-rr-biryani-nh44",
    name: "Salem RR Biryani & Grill — Salem Highway Junction",
    district: "Salem",
    latitude: 11.6643,
    longitude: 78.1460,
    category: "lunch" as RouteStopCategory,
    tagline: "Salem style mutton biryani, chicken 65 & highway family dining",
    rating: 4.5,
    reviewsCount: 6100,
    openTime: "11:00",
    closeTime: "23:00",
    stopDurationMins: 45,
  },
  {
    id: "coimbatore-annapoorna-nh",
    name: "Sree Annapoorna Sree Gowrishankar — Coimbatore NH",
    district: "Coimbatore",
    latitude: 11.0168,
    longitude: 76.9558,
    category: "breakfast" as RouteStopCategory,
    tagline: "World famous Coimbatore Sambar Idli, Ghee Roast & Filter Coffee",
    rating: 4.9,
    reviewsCount: 18200,
    openTime: "06:00",
    closeTime: "22:00",
    stopDurationMins: 35,
  },
];

// Haversine Distance in Kilometers
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Distance from point P to line segment AB in kilometers
function distanceToSegmentKm(pLat: number, pLng: number, aLat: number, aLng: number, bLat: number, bLng: number): number {
  const abDist = haversineKm(aLat, aLng, bLat, bLng);
  if (abDist < 0.001) return haversineKm(pLat, pLng, aLat, aLng);

  let t = ((pLat - aLat) * (bLat - aLat) + (pLng - aLng) * (bLng - aLng)) / ((bLat - aLat) ** 2 + (bLng - aLng) ** 2 + 1e-9);
  t = Math.max(0.0, Math.min(1.0, t));

  const projLat = aLat + t * (bLat - aLat);
  const projLng = aLng + t * (bLng - aLng);
  return haversineKm(pLat, pLng, projLat, projLng);
}

// Parse "06:00 AM" or "14:30" to total minutes from midnight
function parseTimeToMinutes(timeStr: str): number {
  try {
    const isPm = timeStr.toUpperCase().includes("PM");
    const isAm = timeStr.toUpperCase().includes("AM");
    const clean = timeStr.replace(/(AM|PM)/gi, "").trim();
    const parts = clean.split(":");
    let hrs = parseInt(parts[0], 10);
    const mins = parseInt(parts[1] || "0", 10);

    if (isPm && hrs < 12) hrs += 12;
    if (isAm && hrs === 12) hrs = 0;

    return hrs * 60 + mins;
  } catch {
    return 6 * 60;
  }
}

function formatMinutesToTime(totalMins: number): string {
  const minsInDay = ((totalMins % 1440) + 1440) % 1440;
  let hrs = Math.floor(minsInDay / 60);
  const mins = minsInDay % 60;
  const period = hrs >= 12 ? "PM" : "AM";
  hrs = hrs % 12;
  if (hrs === 0) hrs = 12;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} ${period}`;
}

export class RouteStopRecommendationEngine {
  static generateRecommendations(params: {
    routePolyline: number[][]; // [[lat, lng], ...]
    totalDistanceKm: number;
    totalDurationMinutes: number;
    departureTime?: string; // e.g. "06:00 AM"
    maxDetourKm?: number;
  }): RouteRecommendationResult {
    const {
      routePolyline,
      totalDistanceKm,
      totalDurationMinutes,
      departureTime = "06:00 AM",
      maxDetourKm = 5.0,
    } = params;

    const departureMins = parseTimeToMinutes(departureTime);

    // 1. Long-Trip Threshold Trigger & Journey Mode
    let isLongJourney = false;
    let journeyMode: "SHORT_TRIP" | "MEDIUM_TRIP" | "EXTENDED_TRIP" | "LONG_JOURNEY_MODE" = "SHORT_TRIP";

    if (totalDistanceKm < 150.0) {
      journeyMode = "SHORT_TRIP";
      isLongJourney = false;
    } else if (totalDistanceKm <= 300.0) {
      journeyMode = "MEDIUM_TRIP";
      isLongJourney = false;
    } else if (totalDistanceKm <= 500.0) {
      journeyMode = "EXTENDED_TRIP";
      isLongJourney = false;
    } else {
      journeyMode = "LONG_JOURNEY_MODE";
      isLongJourney = true;
    }

    if (!routePolyline || routePolyline.length < 2 || totalDistanceKm < 150.0) {
      return {
        isLongJourney,
        journeyMode,
        totalDistanceKm,
        totalDurationMinutes,
        departureTime,
        expectedArrivalTime: formatMinutesToTime(departureMins + totalDurationMinutes),
        recommendations: [],
      };
    }

    // Combine HIGHWAY_RECS_CATALOG and food/heritage items from CANONICAL_PLACES
    const candidatePool = [
      ...HIGHWAY_RECS_CATALOG,
      ...CANONICAL_PLACES.filter((p) => p.categories.includes("food") || p.categories.includes("tourist-places")).map((p) => ({
        id: p.id,
        name: p.canonicalName || p.name,
        district: p.district,
        latitude: p.latitude,
        longitude: p.longitude,
        category: (p.categories.includes("food") ? "lunch" : "tea") as RouteStopCategory,
        tagline: p.tagline,
        rating: p.rating || 4.5,
        reviewsCount: p.reviewsCount || 1200,
        openTime: "07:00",
        closeTime: "22:00",
        stopDurationMins: 35,
        isOpen24Hours: false,
      })),
    ];

    const candidates: RouteStopCandidate[] = [];
    const seenIds = new Set<string>();

    // 2. Route Corridor Distance & Segment Projection Analysis
    candidatePool.forEach((cand) => {
      if (seenIds.has(cand.id)) return;

      let minDetour = 999.0;
      let closestSegIdx = 0;

      for (let i = 0; i < routePolyline.length - 1; i++) {
        const segA = routePolyline[i];
        const segB = routePolyline[i + 1];
        const detour = distanceToSegmentKm(cand.latitude, cand.longitude, segA[0], segA[1], segB[0], segB[1]);
        if (detour < minDetour) {
          minDetour = detour;
          closestSegIdx = i;
        }
      }

      if (minDetour > maxDetourKm) return; // Discard places requiring > 5km detour

      seenIds.add(cand.id);

      const routePosPercent = (closestSegIdx / Math.max(1, routePolyline.length - 1)) * 100.0;
      const distFromOrigin = (routePosPercent / 100.0) * totalDistanceKm;
      const travelMinsToPoint = (routePosPercent / 100.0) * totalDurationMinutes;
      const arrivalMins = departureMins + travelMinsToPoint;
      const arrivalTimeStr = formatMinutesToTime(arrivalMins);

      const arrivalHour = ((arrivalMins % 1440) + 1440) % 1440 / 60.0;
      const cat = cand.category;

      // 3. Meal Timing & Travel-Time Compatibility Engine
      let mealCompatibilityScore = 0.0;
      let reason = "";

      if (cat === "breakfast") {
        if (arrivalHour >= 7.0 && arrivalHour <= 10.5) {
          mealCompatibilityScore = 35.0;
          reason = `Ideal Morning Breakfast Stop around ${arrivalTimeStr}`;
        } else if (arrivalHour >= 6.0 && arrivalHour <= 11.5) {
          mealCompatibilityScore = 20.0;
          reason = `Morning Refreshment & Breakfast around ${arrivalTimeStr}`;
        }
      } else if (cat === "lunch") {
        if (arrivalHour >= 12.0 && arrivalHour <= 15.0) {
          mealCompatibilityScore = 40.0;
          reason = `Recommended Midday Lunch Rest Stop around ${arrivalTimeStr}`;
        } else if (arrivalHour >= 11.5 && arrivalHour <= 16.0) {
          mealCompatibilityScore = 25.0;
          reason = `Afternoon Dining Opportunity around ${arrivalTimeStr}`;
        }
      } else if (cat === "dinner") {
        if (arrivalHour >= 19.0 && arrivalHour <= 22.0) {
          mealCompatibilityScore = 40.0;
          reason = `Recommended Evening Dinner Stop around ${arrivalTimeStr}`;
        } else if (arrivalHour >= 18.5 && arrivalHour <= 23.0) {
          mealCompatibilityScore = 20.0;
          reason = `Night Dining Break around ${arrivalTimeStr}`;
        }
      } else if (cat === "tea") {
        mealCompatibilityScore = 30.0;
        reason = `Refreshing Tea & Snack Break around ${arrivalTimeStr} (${Math.round(distFromOrigin)} km into journey)`;
      } else if (cat === "fuel") {
        if (distFromOrigin >= 150.0) {
          mealCompatibilityScore = 35.0;
          reason = `Highway Fuel & Rest Area (${Math.round(distFromOrigin)} km from origin)`;
        } else {
          mealCompatibilityScore = 15.0;
          reason = `Highway Fuel Station`;
        }
      } else if (cat === "hotel") {
        if (arrivalHour >= 21.0 || arrivalHour <= 4.0) {
          mealCompatibilityScore = 45.0;
          reason = `Recommended Overnight Stay — Expected arrival at ${arrivalTimeStr}`;
        } else {
          mealCompatibilityScore = 10.0;
          reason = `Overnight Lodge & Resort`;
        }
      }

      // Filter out invalid meal window matches for primary meals
      if (["breakfast", "lunch", "dinner"].includes(cat) && mealCompatibilityScore < 20.0) {
        return;
      }

      // 4. Place Quality Scoring Algorithm
      const detourScore = Math.max(0.0, (5.0 - minDetour) * 6.0); // 0 to 30 pts
      const ratingScore = (cand.rating || 4.5) * 5.0; // 0 to 25 pts
      const totalScore = detourScore + ratingScore + mealCompatibilityScore + 10.0;

      const canonicalMatch = CANONICAL_PLACES.find((p) => p.id === cand.id);

      candidates.push({
        placeId: cand.id,
        name: cand.name,
        category: cat,
        lat: cand.latitude,
        lng: cand.longitude,
        routeDistanceFromOriginKm: Math.round(distFromOrigin * 10) / 10,
        detourDistanceKm: Math.round(minDetour * 10) / 10,
        estimatedArrivalTime: arrivalTimeStr,
        estimatedStopDurationMinutes: cand.stopDurationMins || 30,
        rating: cand.rating,
        reviewsCount: cand.reviewsCount,
        openingHours: {
          openTime: cand.openTime,
          closeTime: cand.closeTime,
          isOpen24Hours: cand.isOpen24Hours || false,
        },
        routePositionPercent: Math.round(routePosPercent),
        reason,
        score: Math.round(totalScore * 10) / 10,
        district: cand.district,
        tagline: cand.tagline,
        placeObject: canonicalMatch || {
          id: cand.id,
          canonicalName: cand.name,
          name: cand.name,
          slug: cand.id,
          district: cand.district,
          state: "Tamil Nadu",
          country: "India",
          latitude: cand.latitude,
          longitude: cand.longitude,
          categories: ["food"],
          primaryCategory: "food",
          tagline: cand.tagline,
          description: cand.tagline,
          image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
          rating: cand.rating,
          reviewsCount: cand.reviewsCount,
          verified: true,
          tags: ["highway-stop", cat],
        },
      });
    });

    // Sort by position along the route timeline
    candidates.sort((a, b) => a.routeDistanceFromOriginKm - b.routeDistanceFromOriginKm);

    // Limit recommendations based on trip distance
    const maxRecs = journeyMode === "MEDIUM_TRIP" ? 2 : journeyMode === "EXTENDED_TRIP" ? 4 : 6;
    const finalRecommendations = candidates.slice(0, maxRecs);

    const expectedArrivalTime = formatMinutesToTime(departureMins + totalDurationMinutes);

    return {
      isLongJourney,
      journeyMode,
      totalDistanceKm,
      totalDurationMinutes,
      departureTime,
      expectedArrivalTime,
      recommendations: finalRecommendations,
    };
  }
}
