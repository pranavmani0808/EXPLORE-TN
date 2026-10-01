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

export const SUPPORTED_ORIGINS: Record<string, TravelOriginCity> = {
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
      if (place.travelOrigins && place.travelOrigins.includes(originId)) return true;
      const dist = calculateHaversineKm(origin.latitude, origin.longitude, place.latitude, place.longitude);
      return dist <= 300;
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
