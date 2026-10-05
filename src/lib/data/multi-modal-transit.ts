import { CANONICAL_PLACES, ExplorerPlace } from "./canonical-places";
import { haversineKm } from "../geo-radius";

export type TransitModeType = "car" | "flight" | "train" | "bus";

export interface TransitStep {
  mode: "flight" | "train" | "bus" | "taxi" | "metro" | "walk";
  title: string;
  from: string;
  to: string;
  durationText: string;
  durationMinutes: number;
  costEstimate: string;
  details: string;
  operatorOrCode?: string;
  frequencyText?: string;
}

export interface MultiModalOption {
  id: string;
  mode: TransitModeType;
  title: string;
  badge?: "BEST" | "CHEAPEST" | "FASTEST" | "SCENIC";
  totalDurationText: string;
  totalDurationMinutes: number;
  totalCostEstimate: string;
  distanceKm: number;
  co2Savings?: string;
  summary: string;
  steps: TransitStep[];
  routePolyline?: Array<[number, number]>;
  flightArc?: {
    from: [number, number];
    to: [number, number];
  };
}

export interface CorridorPlace extends ExplorerPlace {
  detourKm: number;
  enRouteOrder: number;
  highwayNear: string;
}

export interface MultiModalJourneyResult {
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  options: MultiModalOption[];
  corridorPlaces: CorridorPlace[];
}

// Major Tamil Nadu Airports
const TN_AIRPORTS: Record<string, { code: string; name: string; lat: number; lng: number; city: string }> = {
  chennai: { code: "MAA", name: "Chennai International Airport", lat: 12.9941, lng: 80.1709, city: "Chennai" },
  coimbatore: { code: "CJB", name: "Coimbatore International Airport", lat: 11.0299, lng: 77.0434, city: "Coimbatore" },
  madurai: { code: "IXM", name: "Madurai Airport", lat: 9.8345, lng: 78.0934, city: "Madurai" },
  trichy: { code: "TRZ", name: "Tiruchirappalli International Airport", lat: 10.7654, lng: 78.7097, city: "Tiruchirappalli" },
  tuticorin: { code: "TCR", name: "Thoothukudi Airport", lat: 8.7231, lng: 78.0264, city: "Thoothukudi" },
  salem: { code: "SXV", name: "Salem Airport", lat: 11.7828, lng: 78.0644, city: "Salem" },
};

// Major Tamil Nadu Railway Hubs
const TN_STATIONS: Record<string, { code: string; name: string; lat: number; lng: number; city: string }> = {
  chennai: { code: "MAS", name: "Puratchi Thalaivar Dr. M.G.R. Central (MAS)", lat: 13.0827, lng: 80.2757, city: "Chennai" },
  coimbatore: { code: "CBE", name: "Coimbatore Main Junction (CBE)", lat: 10.9976, lng: 76.9634, city: "Coimbatore" },
  mettupalayam: { code: "MTP", name: "Mettupalayam Railway Station (MTP)", lat: 11.3005, lng: 76.9534, city: "Mettupalayam" },
  madurai: { code: "MDU", name: "Madurai Junction (MDU)", lat: 9.9179, lng: 78.1118, city: "Madurai" },
  trichy: { code: "TPJ", name: "Tiruchirappalli Junction (TPJ)", lat: 10.7937, lng: 78.6865, city: "Tiruchirappalli" },
  salem: { code: "SA", name: "Salem Junction (SA)", lat: 11.6738, lng: 78.1206, city: "Salem" },
  erode: { code: "ED", name: "Erode Junction (ED)", lat: 11.3364, lng: 77.7274, city: "Erode" },
  tirunelveli: { code: "TEN", name: "Tirunelveli Junction (TEN)", lat: 8.7303, lng: 77.7121, city: "Tirunelveli" },
  kanyakumari: { code: "CAPE", name: "Kanyakumari Terminus (CAPE)", lat: 8.0828, lng: 77.5511, city: "Kanyakumari" },
  rameswaram: { code: "RMM", name: "Rameswaram Railway Station (RMM)", lat: 9.2881, lng: 79.3129, city: "Rameswaram" },
  dindigul: { code: "DG", name: "Dindigul Junction (DG)", lat: 10.3624, lng: 77.9695, city: "Dindigul" },
};

// Known Well-Traveled Tamil Nadu Bus Terminals
const TN_BUS_HUBS: Record<string, { name: string; lat: number; lng: number }> = {
  chennai: { name: "Chennai Kilambakkam (KCBT) / Koyambedu (CMBT)", lat: 12.8732, lng: 80.0815 },
  coimbatore: { name: "Gandhipuram Central Bus Stand", lat: 11.0183, lng: 76.9644 },
  ooty: { name: "Ooty Central Bus Stand (Nilgiris)", lat: 11.4064, lng: 76.6953 },
  madurai: { name: "Mattuthavani Integrated Bus Terminus (MIBT)", lat: 9.9482, lng: 78.1574 },
  trichy: { name: "Central Bus Stand Tiruchirappalli", lat: 10.7954, lng: 78.6862 },
  salem: { name: "Salem New Bus Stand", lat: 11.6664, lng: 78.1360 },
  kodaikanal: { name: "Kodaikanal Bus Stand", lat: 10.2381, lng: 77.4892 },
  rameswaram: { name: "Rameswaram Bus Stand", lat: 9.2882, lng: 79.3128 },
  kanyakumari: { name: "Kanyakumari Bus Stand", lat: 8.0883, lng: 77.5385 },
};

function findNearestAirport(lat: number, lng: number) {
  let nearest = TN_AIRPORTS.chennai;
  let minDist = Infinity;
  for (const ap of Object.values(TN_AIRPORTS)) {
    const d = haversineKm(lat, lng, ap.lat, ap.lng);
    if (d < minDist) {
      minDist = d;
      nearest = ap;
    }
  }
  return { airport: nearest, distanceKm: Math.round(minDist) };
}

function findNearestStation(lat: number, lng: number) {
  let nearest = TN_STATIONS.chennai;
  let minDist = Infinity;
  for (const st of Object.values(TN_STATIONS)) {
    const d = haversineKm(lat, lng, st.lat, st.lng);
    if (d < minDist) {
      minDist = d;
      nearest = st;
    }
  }
  return { station: nearest, distanceKm: Math.round(minDist) };
}

/**
 * Find canonical places that lie along the travel corridor between origin and destination.
 */
export function getCorridorPlaces(
  origLat: number, origLng: number,
  destLat: number, destLng: number,
  maxDetourKm: number = 38
): CorridorPlace[] {
  const totalStraightKm = haversineKm(origLat, origLng, destLat, destLng);
  if (totalStraightKm <= 5) return [];

  // Line segment vector from origin to destination
  const dx = destLng - origLng;
  const dy = destLat - origLat;
  const lenSq = dx * dx + dy * dy;

  const results: CorridorPlace[] = [];

  for (const place of CANONICAL_PLACES) {
    // Project place onto segment
    const px = place.longitude - origLng;
    const py = place.latitude - origLat;
    const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, (px * dx + py * dy) / lenSq));

    // Exclude points too close to origin or destination ends
    if (t < 0.05 || t > 0.95) continue;

    // Projected point on straight corridor
    const projLng = origLng + t * dx;
    const projLat = origLat + t * dy;

    // Perpendicular detour distance from direct corridor
    const detourKm = Math.round(haversineKm(place.latitude, place.longitude, projLat, projLng) * 10) / 10;

    if (detourKm <= maxDetourKm) {
      results.push({
        ...place,
        detourKm,
        enRouteOrder: Math.round(t * 100),
        highwayNear: place.district + " Corridor",
      });
    }
  }

  // Sort sequentially from origin to destination
  return results.sort((a, b) => a.enRouteOrder - b.enRouteOrder).slice(0, 16);
}

/**
 * Generate multi-modal transit options (Car, Flight+Taxi, Train+Taxi, Bus) for any TN route.
 */
export function generateMultiModalJourney(
  origin: { name: string; lat: number; lng: number },
  destination: { name: string; lat: number; lng: number }
): MultiModalJourneyResult {
  const straightDistKm = Math.round(haversineKm(origin.lat, origin.lng, destination.lat, destination.lng));
  const roadDistKm = Math.round(straightDistKm * 1.26);

  // 1. CAR / DRIVE OPTION
  const driveMinutes = Math.round((roadDistKm / 65) * 60) + 30; // avg 65 km/h + 30m break
  const driveHours = Math.floor(driveMinutes / 60);
  const driveMins = driveMinutes % 60;
  const fuelCost = Math.round((roadDistKm / 14) * 102); // 14 km/L @ 102/L
  const tollCost = Math.round((roadDistKm / 100) * 110);

  const carOption: MultiModalOption = {
    id: "mode-car",
    mode: "car",
    title: `Drive (${roadDistKm} km)`,
    badge: "SCENIC",
    totalDurationText: `${driveHours}h ${driveMins > 0 ? `${driveMins}m` : ""}`,
    totalDurationMinutes: driveMinutes,
    totalCostEstimate: `₹${fuelCost + tollCost}–₹${fuelCost + tollCost + 1200}`,
    distanceKm: roadDistKm,
    summary: `Direct road transit along National & State Highways with scenic stops.`,
    steps: [
      {
        mode: "taxi",
        title: `Drive from ${origin.name} to ${destination.name}`,
        from: origin.name,
        to: destination.name,
        durationText: `${driveHours}h ${driveMins}m`,
        durationMinutes: driveMinutes,
        costEstimate: `₹${fuelCost} (Fuel) + ₹${tollCost} (Tolls)`,
        details: `Via NH44 / NH544 arterial corridor. Estimated 32L fuel consumption with 1 toll plaza checkpoint per 60 km.`,
      },
    ],
  };

  // 2. BUS OPTION
  const busMinutes = Math.round((roadDistKm / 52) * 60) + 45; // SETC/Private sleeper
  const busHours = Math.floor(busMinutes / 60);
  const busMins = busMinutes % 60;
  const busFareMin = Math.round(roadDistKm * 2.2);
  const busFareMax = Math.round(roadDistKm * 3.8);

  const busOption: MultiModalOption = {
    id: "mode-bus",
    mode: "bus",
    title: `Bus (${busHours}h ${busMins}m)`,
    badge: "CHEAPEST",
    totalDurationText: `${busHours}h ${busMins}m`,
    totalDurationMinutes: busMinutes,
    totalCostEstimate: `₹${busFareMin}–₹${busFareMax}`,
    distanceKm: roadDistKm,
    co2Savings: "65% less CO₂ vs private car",
    summary: `Daily express & AC Sleeper services connecting ${origin.name} to ${destination.name}.`,
    steps: [
      {
        mode: "bus",
        title: `Inter-District Highway Express / Sleeper Bus`,
        from: `${origin.name} Central Bus Hub`,
        to: `${destination.name} Terminus`,
        durationText: `${busHours}h ${busMins}m`,
        durationMinutes: busMinutes,
        costEstimate: `₹${busFareMin}–₹${busFareMax}`,
        details: `Direct overnight & daytime departures operated by SETC / TNSTC & leading private operators.`,
        frequencyText: "Every 30–60 minutes (Peak evening 18:00–22:30)",
      },
    ],
  };

  // 3. TRAIN + TAXI OPTION
  const nearStationDest = findNearestStation(destination.lat, destination.lng);
  const nearStationOrig = findNearestStation(origin.lat, origin.lng);

  const trainDistKm = Math.round(haversineKm(nearStationOrig.station.lat, nearStationOrig.station.lng, nearStationDest.station.lat, nearStationDest.station.lng) * 1.2);
  const trainSpeedKmh = 72; // Avg express train speed
  const trainRunMins = Math.round((trainDistKm / trainSpeedKmh) * 60);
  const trainTaxiMins = Math.round((nearStationDest.distanceKm / 40) * 60);
  const totalTrainMins = trainRunMins + trainTaxiMins + 45; // 45m buffer
  const trainHours = Math.floor(totalTrainMins / 60);
  const trainMins = totalTrainMins % 60;

  const trainFareMin = Math.round(300 + (trainDistKm * 0.9));
  const trainFareMax = Math.round(900 + (trainDistKm * 2.2));
  const taxiFare = Math.round(nearStationDest.distanceKm * 22 + 250);

  const trainOption: MultiModalOption = {
    id: "mode-train",
    mode: "train",
    title: nearStationDest.distanceKm > 10 ? `Train + Taxi (${trainHours}h ${trainMins}m)` : `Express Train (${trainHours}h ${trainMins}m)`,
    badge: straightDistKm > 300 ? "BEST" : undefined,
    totalDurationText: `${trainHours}h ${trainMins}m`,
    totalDurationMinutes: totalTrainMins,
    totalCostEstimate: `₹${trainFareMin + (nearStationDest.distanceKm > 10 ? taxiFare : 50)}–₹${trainFareMax + taxiFare}`,
    distanceKm: trainDistKm + nearStationDest.distanceKm,
    co2Savings: "80% less CO₂ than driving",
    summary: `Southern Railway corridor via ${nearStationDest.station.name}.`,
    steps: [
      {
        mode: "train",
        title: `Southern Railway Express / Vande Bharat`,
        from: nearStationOrig.station.name,
        to: nearStationDest.station.name,
        durationText: `${Math.floor(trainRunMins / 60)}h ${trainRunMins % 60}m`,
        durationMinutes: trainRunMins,
        costEstimate: `₹${trainFareMin}–₹${trainFareMax}`,
        details: `Direct rail connection. Sleeper (SL), 3rd AC (3A), and 2nd AC (2A) coaches available.`,
        operatorOrCode: "Southern Railway (SR)",
        frequencyText: "Daily express trains & weekly superfasts",
      },
    ],
  };

  if (nearStationDest.distanceKm > 10) {
    trainOption.steps.push({
      mode: "taxi",
      title: `Taxi / On-Demand Cab to ${destination.name}`,
      from: nearStationDest.station.name,
      to: destination.name,
      durationText: `${Math.floor(trainTaxiMins / 60)}h ${trainTaxiMins % 60}m`,
      durationMinutes: trainTaxiMins,
      costEstimate: `₹${taxiFare}–₹${taxiFare + 500}`,
      details: `${nearStationDest.distanceKm} km local taxi transfer up to the destination. Pre-paid taxi booth available at railway station.`,
    });
  }

  // 4. FLIGHT OPTION (Meaningful when straight-line > 240 km)
  const nearAirportDest = findNearestAirport(destination.lat, destination.lng);
  const nearAirportOrig = findNearestAirport(origin.lat, origin.lng);

  const options: MultiModalOption[] = [carOption, trainOption, busOption];

  if (straightDistKm >= 220 && nearAirportOrig.airport.code !== nearAirportDest.airport.code) {
    const flightAirMinutes = Math.min(85, Math.max(50, Math.round((straightDistKm / 450) * 60)));
    const destAirportTransferMins = Math.round((nearAirportDest.distanceKm / 42) * 60);
    const totalFlightMinutes = 90 + flightAirMinutes + destAirportTransferMins; // 90 min check-in & boarding
    const fHours = Math.floor(totalFlightMinutes / 60);
    const fMins = totalFlightMinutes % 60;

    const flightTicketMin = 3500;
    const flightTicketMax = 9500;
    const flightTaxiMin = Math.round(nearAirportDest.distanceKm * 24 + 300);

    const flightOption: MultiModalOption = {
      id: "mode-flight",
      mode: "flight",
      title: `Fly to ${nearAirportDest.airport.name.split(" ")[0]} + Taxi`,
      badge: "FASTEST",
      totalDurationText: `${fHours}h ${fMins}m`,
      totalDurationMinutes: totalFlightMinutes,
      totalCostEstimate: `₹${flightTicketMin + flightTaxiMin}–₹${flightTicketMax + flightTaxiMin + 1500}`,
      distanceKm: straightDistKm,
      summary: `Domestic flight to ${nearAirportDest.airport.code} followed by ${nearAirportDest.distanceKm} km taxi transfer.`,
      flightArc: {
        from: [nearAirportOrig.airport.lat, nearAirportOrig.airport.lng],
        to: [nearAirportDest.airport.lat, nearAirportDest.airport.lng],
      },
      steps: [
        {
          mode: "flight",
          title: `Flight: ${nearAirportOrig.airport.code} ➔ ${nearAirportDest.airport.code}`,
          from: nearAirportOrig.airport.name,
          to: nearAirportDest.airport.name,
          durationText: `${flightAirMinutes}m flight (${Math.floor(totalFlightMinutes / 60)}h total journey)`,
          durationMinutes: flightAirMinutes,
          costEstimate: `₹${flightTicketMin}–₹${flightTicketMax}`,
          details: `Direct/connecting domestic service operated by IndiGo or Air India. Includes check-in and security buffer.`,
          operatorOrCode: `${nearAirportOrig.airport.code}-${nearAirportDest.airport.code}`,
          frequencyText: "Daily regular scheduled flights",
        },
        {
          mode: "taxi",
          title: `Airport Taxi to ${destination.name}`,
          from: nearAirportDest.airport.name,
          to: destination.name,
          durationText: `${Math.floor(destAirportTransferMins / 60)}h ${destAirportTransferMins % 60}m`,
          durationMinutes: destAirportTransferMins,
          costEstimate: `₹${flightTaxiMin}–₹${flightTaxiMin + 800}`,
          details: `${nearAirportDest.distanceKm} km on-demand cab transfer from airport arrival terminal directly to your destination.`,
        },
      ],
    };

    options.unshift(flightOption);
  }

  // En-route corridor places
  const corridorPlaces = getCorridorPlaces(origin.lat, origin.lng, destination.lat, destination.lng);

  return {
    origin,
    destination,
    options,
    corridorPlaces,
  };
}

export const getMultiModalJourney = generateMultiModalJourney;
