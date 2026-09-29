import { getHaversineKm } from "./poi-ranker";

export interface RouteLegInfo {
  distanceKm: number;
  durationMinutes: number;
  ghatSectionDetected: boolean;
  hairpinBendsInfo?: string;
  advisory?: string;
}

export function calculateRouteLeg(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  destinationName: string
): RouteLegInfo {
  const directKm = getHaversineKm(originLat, originLng, destLat, destLng);
  // Apply real road tortuosity factor (~1.25x for plains, ~1.45x for hills)
  const isHill = ["kodaikanal", "ooty", "valparai", "yercaud", "meghamalai", "kolli hills"].some((h) =>
    destinationName.toLowerCase().includes(h)
  );

  const roadFactor = isHill ? 1.42 : 1.22;
  const distanceKm = Math.round(directKm * roadFactor);

  // Average speed: ~55 km/h on highways, ~30 km/h on ghat roads
  const avgSpeed = isHill ? 32 : 55;
  const durationMinutes = Math.round((distanceKm / avgSpeed) * 60);

  let hairpinBendsInfo: string | undefined = undefined;
  let advisory: string | undefined = undefined;

  if (destinationName.toLowerCase().includes("kodaikanal")) {
    hairpinBendsInfo = "14 Hairpin Bends along Batlagundu-Kodai Ghat Road";
    advisory = "⛰️ Ghat section: Low visibility possible in fog. Recommend completing hill climb before 7:00 PM.";
  } else if (destinationName.toLowerCase().includes("valparai")) {
    hairpinBendsInfo = "70 Hairpin Bends along Pollachi-Valparai Pass";
    advisory = "🏍️ Famous 70 Hairpin Pass: Watch for wildlife crossing (elephants/Nilgiri tahr). Avoid night driving.";
  } else if (destinationName.toLowerCase().includes("ooty")) {
    hairpinBendsInfo = "36 Hairpin Bends along Kallatti Ghat Road";
    advisory = "⛰️ Steep incline: Shift to lower gears. Cold weather & mist early mornings.";
  } else if (destinationName.toLowerCase().includes("yercaud")) {
    hairpinBendsInfo = "20 Hairpin Bends along Salem-Yercaud Ghat";
    advisory = "🚗 Scenic mountain drive from Salem.";
  }

  return {
    distanceKm,
    durationMinutes,
    ghatSectionDetected: isHill,
    hairpinBendsInfo,
    advisory
  };
}
