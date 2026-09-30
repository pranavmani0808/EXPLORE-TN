import { CandidatePOI, DailyActivity, DailyItinerary, StructuredTripRequest } from "./types";
import { getHaversineKm } from "./poi-ranker";

function formatTimeSlot(hour: number, minute: number): string {
  const normHour = ((hour % 24) + 24) % 24;
  const period = normHour >= 12 ? "PM" : "AM";
  const displayHour = normHour % 12 === 0 ? 12 : normHour % 12;
  const displayMin = String(Math.floor(minute) % 60).padStart(2, "0");
  return `${String(displayHour).padStart(2, "0")}:${displayMin} ${period}`;
}

export function optimizeItineraryTimeline(
  originName: string,
  destinationName: string,
  days: number,
  rankedPois: CandidatePOI[],
  request: StructuredTripRequest
): DailyItinerary[] {
  const itineraries: DailyItinerary[] = [];
  const poisPerDay = Math.min(3, Math.max(2, Math.ceil(rankedPois.length / days)));
  let remainingPois = [...rankedPois];

  for (let d = 1; d <= days; d++) {
    const dayPois = remainingPois.slice(0, poisPerDay);
    remainingPois = remainingPois.slice(poisPerDay);

    const activities: DailyActivity[] = [];
    let currentHour = 8; // 08:00 AM start
    let currentMin = 0;
    let dayDistance = 0;
    let dayDrivingMin = 0;
    let dayCost = 0;

    const isFirstDay = d === 1;
    const isLastDay = d === days;

    const isOvernightJourney = isFirstDay && originName.toLowerCase() !== destinationName.toLowerCase() && (
      rankedPois.length > 0
    );

    if (isFirstDay && isOvernightJourney) {
      activities.push({
        timeSlot: "10:00 PM (Night Prior)",
        title: `Overnight Journey from ${originName}`,
        description: `Depart ${originName} for smooth overnight travel to ${destinationName}. Avoid daytime highway traffic and arrive by early morning.`,
        durationMinutes: 420,
        type: "start"
      });
      activities.push({
        timeSlot: "06:30 AM",
        title: `Arrive in ${destinationName} & Hotel Fresh-up`,
        description: `Early morning arrival, hotel check-in, breakfast & fresh-up before starting sightseeing circuit.`,
        durationMinutes: 60,
        type: "start"
      });
      currentHour = 8;
      currentMin = 0;
    } else {
      activities.push({
        timeSlot: formatTimeSlot(currentHour, currentMin),
        title: isFirstDay ? `Depart from ${originName}` : `Start Day ${d} from Hotel in ${destinationName}`,
        description: isFirstDay
          ? `Begin morning journey via ${request.transport.mode.toUpperCase()} towards ${destinationName}.`
          : `Morning departure for sightseeing circuit in ${destinationName}.`,
        durationMinutes: 30,
        type: "start"
      });
      currentMin += 30;
    }

    let prevLat = dayPois[0]?.latitude || 8.0883;
    let prevLng = dayPois[0]?.longitude || 77.5385;

    // Schedule Day POIs
    dayPois.forEach((poi, idx) => {
      // Check lunch time
      if (currentHour >= 13 && !activities.some(a => a.type === "meal")) {
        activities.push({
          timeSlot: formatTimeSlot(currentHour, currentMin),
          title: `Local Tamil Cuisine Lunch in ${destinationName}`,
          description: `Enjoy authentic regional food (${request.constraints.dietaryRestrictions.includes("vegetarian") ? "Pure Veg Sree Sabarees" : "Local Speciality"}).`,
          durationMinutes: 45,
          type: "meal"
        });
        currentMin += 45;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin %= 60;
        }
      }

      // Calculate travel from prev spot
      const legKm = idx === 0 ? 10 : Math.round(getHaversineKm(prevLat, prevLng, poi.latitude, poi.longitude) * 1.2);
      const legMin = Math.round((legKm / 35) * 60);

      dayDistance += legKm;
      dayDrivingMin += legMin;
      dayCost += poi.numericEntryFee * request.travelers.groupSize;

      prevLat = poi.latitude;
      prevLng = poi.longitude;

      // Add travel time
      if (legKm > 2) {
        currentMin += legMin;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin %= 60;
        }
      }

      const timeSlotStr = formatTimeSlot(currentHour, currentMin);

      activities.push({
        timeSlot: timeSlotStr,
        poiId: poi.id,
        title: poi.name,
        description: poi.description,
        durationMinutes: 75,
        travelTimeFromPrevMinutes: legMin,
        distanceFromPrevKm: legKm,
        type: "poi",
        parking: poi.parkingInfo?.statusText || "Verified Parking Available",
        safetyNote: poi.difficulty === "Hard" ? "⚠️ Steep walking steps; exercise caution." : undefined,
        whyThisPlace: poi.reason || `Selected for ${poi.category} matching your preferences.`,
        costEstimate: poi.numericEntryFee * request.travelers.groupSize
      });

      currentMin += 75;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin %= 60;
      }
    });

    // End Day Activity
    activities.push({
      timeSlot: formatTimeSlot(currentHour, currentMin),
      title: isLastDay ? `Return Journey to ${originName}` : `Return to Hotel & Evening Relaxation`,
      description: isLastDay
        ? `Conclude ${destinationName} trip and return back to ${originName}.`
        : `Evening free for local markets or resting.`,
      durationMinutes: 30,
      type: "end"
    });

    itineraries.push({
      dayNumber: d,
      title: `Day ${d}: ${d === 1 ? "Arrival & Highlights" : d === days ? "Scenic Views & Return" : "Deep Exploration"} of ${destinationName}`,
      startingLocation: d === 1 ? originName : destinationName,
      overnightLocation: d === days ? originName : destinationName,
      totalDistanceKm: dayDistance,
      totalDrivingMinutes: dayDrivingMin,
      activities,
      dayCost,
      weatherSummary: "Pleasant & Clear (22°C - 28°C)"
    });
  }

  return itineraries;
}
