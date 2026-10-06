import { ExplorerPlace, CANONICAL_PLACES } from "./canonical-places";

export interface TravelOriginCity {
  id: string;
  name: string;
  canonicalName: string;
  state: string;
  latitude: number;
  longitude: number;
  tagline: string;
  popularRegions: string[];
}

import { TAMIL_NADU_DISTRICTS } from "./districts";

export const PRIMARY_HUB_ORIGINS: Record<string, TravelOriginCity> = {
  coimbatore: {
    id: "coimbatore",
    name: "Coimbatore",
    canonicalName: "Coimbatore City & Region",
    state: "Tamil Nadu",
    latitude: 11.0168,
    longitude: 76.9558,
    tagline: "Manchester of South India & Gateway to Nilgiris & Anamalai Ghats",
    popularRegions: [
      "Pollachi & Anamalai Region",
      "Coimbatore Outskirts & Western Surroundings",
      "Nilgiris",
      "Erode & Sathyamangalam Region",
      "Palakkad & Neighboring Kerala",
      "Munnar & Western Ghats",
      "Rajapalayam & Southern Tamil Nadu"
    ]
  },
  chennai: {
    id: "chennai",
    name: "Chennai",
    canonicalName: "Chennai Metropolitan Region",
    state: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    tagline: "Cultural Gateway of South India & Coromandel Coast",
    popularRegions: [
      "Central Chennai Heritage",
      "South Chennai Coastal",
      "ECR Coastal Corridor",
      "North & West Chennai"
    ]
  },
  madurai: {
    id: "madurai",
    name: "Madurai",
    canonicalName: "Madurai Cultural Region",
    state: "Tamil Nadu",
    latitude: 9.9252,
    longitude: 78.1198,
    tagline: "Thoonga Nagaram & Gateway to Southern Heritage & Western Ghats",
    popularRegions: [
      "Madurai Heritage & City",
      "Kodaikanal & Palani Hills",
      "Theni & Megamalai",
      "Rajapalayam & Western Ghats"
    ]
  },
  trichy: {
    id: "trichy",
    name: "Tiruchirappalli",
    canonicalName: "Tiruchirappalli Region",
    state: "Tamil Nadu",
    latitude: 10.7905,
    longitude: 78.7047,
    tagline: "Heart of Tamil Nadu & Cauvery Delta Gateway",
    popularRegions: [
      "Cauvery Delta",
      "Pudukkottai & Chettinad",
      "Pachaimalai & Kolli Hills"
    ]
  },
  salem: {
    id: "salem",
    name: "Salem",
    canonicalName: "Salem & Shevaroy Region",
    state: "Tamil Nadu",
    latitude: 11.6643,
    longitude: 78.1460,
    tagline: "Mango City & Gateway to Shevaroy & Kolli Hills",
    popularRegions: [
      "Shevaroy & Yercaud Hills",
      "Kolli Hills",
      "Mettur Reservoir & Cauvery"
    ]
  }
};

/**
 * Compiles all available origin places across Tamil Nadu:
 * 1. Primary flagship travel hubs
 * 2. All 38 Tamil Nadu districts
 * 3. All individual canonical destinations, hill stations, and heritage towns
 */
function buildAllSupportedOrigins(): Record<string, TravelOriginCity> {
  const result: Record<string, TravelOriginCity> = { ...PRIMARY_HUB_ORIGINS };

  // 1. Add all 38 districts as origin hubs
  for (const [key, d] of Object.entries(TAMIL_NADU_DISTRICTS)) {
    const normKey = key.toLowerCase();
    if (!result[normKey]) {
      const cleanName = d.name.replace(/ District/i, "").trim();
      result[normKey] = {
        id: normKey,
        name: cleanName,
        canonicalName: `${cleanName} District & Region`,
        state: "Tamil Nadu",
        latitude: d.centerCoords[0],
        longitude: d.centerCoords[1],
        tagline: d.tagline || `Gateway to ${cleanName} & Surrounding Tamil Nadu Trails`,
        popularRegions: [d.name]
      };
    }
  }

  // 2. Add all canonical destinations as origin start places
  for (const p of CANONICAL_PLACES) {
    if (p.latitude && p.longitude && p.name) {
      const slug = (p.slug || p.id).toLowerCase();
      if (!result[slug]) {
        result[slug] = {
          id: slug,
          name: p.name,
          canonicalName: p.canonicalName || p.name,
          state: "Tamil Nadu",
          latitude: p.latitude,
          longitude: p.longitude,
          tagline: p.tagline || `Travel routes starting from ${p.name}`,
          popularRegions: [p.district]
        };
      }
    }
  }

  return result;
}

export const SUPPORTED_ORIGINS: Record<string, TravelOriginCity> = buildAllSupportedOrigins();

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 */
export function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Retrieves all places associated with a specific origin city, dynamically computing real-world distances
 */
export function getPlacesForOrigin(
  originId: string,
  placesList: ExplorerPlace[] = CANONICAL_PLACES
): ExplorerPlace[] {
  const origin = SUPPORTED_ORIGINS[originId] || SUPPORTED_ORIGINS.coimbatore;
  
  return placesList
    .filter((place) => {
      // Don't show place itself as a destination to its own origin
      if (place.slug?.toLowerCase() === originId || place.id?.toLowerCase() === originId) return false;
      if (place.travelOrigins && place.travelOrigins.includes(originId)) return true;
      const dist = calculateHaversineKm(origin.latitude, origin.longitude, place.latitude, place.longitude);
      // Accessible distance within Tamil Nadu travel range
      return dist <= 380;
    })
    .map((place) => {
      const dist = calculateHaversineKm(origin.latitude, origin.longitude, place.latitude, place.longitude);
      const drivingKm = Math.round(dist * 1.22);
      const estHours = Math.round((drivingKm / 45) * 10) / 10;

      const isCoimbatore = originId === "coimbatore";
      const isChennai = originId === "chennai";

      const staticKm = isCoimbatore ? place.distanceFromCoimbatoreKm : isChennai ? place.distanceFromChennaiKm : undefined;
      const staticHrs = isCoimbatore ? place.durationFromCoimbatoreHours : isChennai ? place.durationFromChennaiHours : undefined;

      const finalKm = staticKm || drivingKm;
      const finalHrs = staticHrs || estHours;

      return {
        ...place,
        distanceFromOrigin: {
          ...place.distanceFromOrigin,
          [originId]: {
            km: finalKm,
            durationHours: finalHrs,
            durationText: `${finalHrs} hrs`
          }
        }
      };
    });
}
