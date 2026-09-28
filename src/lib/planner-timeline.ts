export interface TimelineItem {
  time: string;
  name: string;
  description: string;
}

export const DESTINATION_PROFILE_LOOKUP: Record<string, any> = {
  madurai: {
    destination: "Madurai",
    region: "Southern Tamil Nadu",
    destinationTypes: ["Heritage", "Temple", "Food", "Culture"],
    primaryTagline: "Cultural Capital of Tamil Nadu & Temple City of South India",
    interests: [
      { id: "temples", label: "Temples & Gopurams", icon: "🛕", categoryKey: "temple" },
      { id: "food", label: "Local Food & Eateries", icon: "🍛", categoryKey: "food" },
      { id: "heritage", label: "Forts & Palaces", icon: "🏛️", categoryKey: "heritage" },
      { id: "markets", label: "Markets & Handicrafts", icon: "🛍️", categoryKey: "shopping" },
      { id: "nature", label: "Hills & Viewpoints", icon: "🏔️", categoryKey: "mountain" },
    ]
  },
  kodaikanal: {
    destination: "Kodaikanal",
    region: "Palani Hills, Western Ghats",
    destinationTypes: ["Hill Station", "Waterfalls", "Lakes", "Trekking"],
    primaryTagline: "Princess of Hill Stations in Western Ghats",
    interests: [
      { id: "viewpoints", label: "Hills & Viewpoints", icon: "🏔️", categoryKey: "mountain" },
      { id: "waterfalls", label: "Waterfalls & Streams", icon: "💦", categoryKey: "waterfall" },
      { id: "lakes", label: "Lakes & Boating", icon: "🌊", categoryKey: "lake" },
      { id: "wildlife", label: "Wildlife & Sanctuaries", icon: "🦚", categoryKey: "wildlife" },
      { id: "food", label: "Hill Bakeries & Cafes", icon: "🍛", categoryKey: "food" },
    ]
  },
  theni: {
    destination: "Theni",
    region: "Western Ghats, Tamil Nadu",
    destinationTypes: ["Waterfalls", "Mountains", "Cardamom Estates"],
    primaryTagline: "Valley of Waterfalls and Meghamalai Cloud Peak",
    interests: [
      { id: "waterfalls", label: "Waterfalls & Streams", icon: "💦", categoryKey: "waterfall" },
      { id: "viewpoints", label: "Cloud Mountains & Tea Estates", icon: "🏔️", categoryKey: "mountain" },
      { id: "adventure", label: "Forest Treks & Spice Trails", icon: "🪂", categoryKey: "adventure" },
    ]
  },
  chennai: {
    destination: "Chennai",
    region: "Coromandel Coast, Tamil Nadu",
    destinationTypes: ["Coastal", "Heritage", "Temples", "Viewpoints"],
    primaryTagline: "Gateway to South India & Coastal Heritage Hub",
    interests: [
      { id: "viewpoints", label: "Hills & Viewpoints", icon: "🏔️", categoryKey: "mountain" },
      { id: "coastal", label: "Coastal & Beaches", icon: "🏖️", categoryKey: "beach" },
      { id: "temples", label: "Temples & Heritage", icon: "🛕", categoryKey: "temple" },
      { id: "food", label: "Local Food & Tiffin", icon: "☕", categoryKey: "food" },
    ]
  }
};

export function getDestinationProfile(destName: string) {
  const key = destName.toLowerCase();
  if (DESTINATION_PROFILE_LOOKUP[key]) {
    return DESTINATION_PROFILE_LOOKUP[key];
  }
  return {
    destination: destName,
    region: "Tamil Nadu",
    destinationTypes: ["Nature", "Heritage", "Sights"],
    primaryTagline: `Discover scenic sights and culture in ${destName}`,
    interests: [
      { id: "sights", label: "Top Sights & Attractions", icon: "🛕", categoryKey: "sights" },
      { id: "food", label: "Local Food & Dining", icon: "🍛", categoryKey: "food" },
      { id: "nature", label: "Nature & Viewpoints", icon: "🌿", categoryKey: "nature" },
      { id: "heritage", label: "Culture & Heritage", icon: "🏛️", categoryKey: "heritage" },
    ]
  };
}

export function generateItineraryTimeline({
  origin,
  destination,
  interestsStr,
  days,
}: {
  origin: string;
  destination: string;
  interestsStr: string;
  days: number;
}): TimelineItem[] {
  const isSameCity = origin.trim().toLowerCase() === destination.trim().toLowerCase();
  const destLower = destination.toLowerCase();
  const interestsLower = interestsStr.toLowerCase();

  const isHillsOrViewpoints =
    interestsLower.includes("hill") ||
    interestsLower.includes("viewpoint") ||
    interestsLower.includes("mountain") ||
    interestsLower.includes("escape") ||
    interestsLower.includes("peak");

  const isWaterfalls = interestsLower.includes("waterfall") || interestsLower.includes("cascade") || interestsLower.includes("stream");
  const isTemples = interestsLower.includes("temple") || interestsLower.includes("spiritual") || interestsLower.includes("heritage");
  const isCoastal = interestsLower.includes("coast") || interestsLower.includes("beach") || interestsLower.includes("ocean");

  // CHENNAI EXPEDITION
  if (destLower.includes("chennai")) {
    if (isHillsOrViewpoints) {
      return [
        { time: "06:30 AM", name: "Depart Central Chennai", description: "Scenic morning drive towards coastal elevation points and hill ridge lookouts." },
        { time: "08:00 AM", name: "St. Thomas Mount Hilltop Viewpoint", description: "360° panoramic lookout over Chennai city skyline, airport runway & Bay of Bengal." },
        { time: "11:00 AM", name: "Javadi Hills / Yelagiri Heights Viewpoint Pass", description: "Misty mountain hairpins, pine forest trails & valley outlooks." },
        { time: "02:00 PM", name: "Hillside Pavilion Lunch & Coffee", description: "Enjoy hot South Indian meals with a mountain valley backdrop." },
        { time: "04:30 PM", name: "Pallavaram Ridge Forest & Sunset Point", description: "Experience golden hour sunset views over the Western horizon." },
        { time: "07:30 PM", name: "Return Journey to Chennai", description: "Complete scenic viewpoint & hill pass circuit." }
      ];
    }
    if (isCoastal) {
      return [
        { time: "06:00 AM", name: "Marina Beach Sunrise Walk", description: "Early morning ocean sunrise along the world's 2nd longest natural beach." },
        { time: "09:30 AM", name: "Covelong (Kovalam) Beach & Surf Break", description: "Water sports, surfing viewpoint and seaside cafe breakfast." },
        { time: "01:00 PM", name: "Shore Temple & Mahabalipuram Reliefs", description: "7th-century UNESCO sea-carved monuments and coastal history." },
        { time: "04:30 PM", name: "Muttukadu Backwaters Sunset Point", description: "Scenic boating and estuary sunset view." },
        { time: "08:00 PM", name: "Return to Central Chennai", description: "Complete East Coast Road (ECR) ocean drive." }
      ];
    }
    if (isTemples) {
      return [
        { time: "06:30 AM", name: "Kapaleeshwarar Temple (Mylapore)", description: "Dravidian architectural masterpiece dedicated to Lord Shiva with ornate gopuram." },
        { time: "09:30 AM", name: "Parthasarathy Temple (Triplicane)", description: "8th-century Vaishnavite shrine known for detailed rock carvings." },
        { time: "01:00 PM", name: "Mylapore Heritage Food & Filter Coffee", description: "Authentic South Indian tiffin & heritage eateries." },
        { time: "04:00 PM", name: "Vadapalani Murugan Temple", description: "Vibrant pilgrimage center & sunset prayer halls." },
        { time: "07:30 PM", name: "Return to Base", description: "Complete Chennai temple heritage circuit." }
      ];
    }
    return [
      { time: "07:00 AM", name: "Start Exploration in Chennai", description: "Begin curated local city & regional viewpoint circuit." },
      { time: "09:30 AM", name: "San Thome Cathedral & Marina Promenade", description: "Historical heritage landmark overlooking the Bay of Bengal." },
      { time: "01:00 PM", name: "Local Dining & Specialty Food", description: "Sample famous Chennai tiffin & filter coffee." },
      { time: "04:30 PM", name: "Elliot's Beach (Besant Nagar) & Sunset Point", description: "Relaxing evening stroll at landmark coastal avenue." },
      { time: "08:00 PM", name: "Return to Base", description: "Complete 1-day Chennai city circuit." }
    ];
  }

  // KODAIKANAL
  if (destLower.includes("kodai")) {
    return [
      { time: days >= 2 ? "Day 1 - 07:00 AM" : "07:00 AM", name: isSameCity ? "Morning Mist in Kodaikanal" : `Arrive in Kodaikanal from ${origin}`, description: "Check into hill station & enjoy morning mountain mist." },
      { time: days >= 2 ? "Day 1 - 09:30 AM" : "09:30 AM", name: "Coaker's Walk & Cliff Viewpoint", description: "1-km mountain cliff edge trail overlooking Vaigai Dam valley." },
      { time: days >= 2 ? "Day 1 - 12:30 PM" : "12:30 PM", name: "Dolphin's Nose & Echo Rock", description: "Flat rock projecting over 6,600 ft precipice with panoramic views." },
      { time: days >= 2 ? "Day 1 - 03:30 PM" : "03:30 PM", name: "Pillar Rocks & Pine Forest Canopy", description: "122m giant granite pillars and towering pine woods." },
      { time: days >= 2 ? "Day 1 - 06:00 PM" : "06:00 PM", name: "Kodaikanal Star Lake Sunset", description: "Evening boat ride across 60-acre star-shaped lake." },
      ...(days >= 2 ? [
        { time: "Day 2 - 08:00 AM", name: "Silver Cascade Falls & Berijam Lake", description: "Cascading 180-ft waterfall and pristine forest reserve lake." },
        { time: "Day 2 - 01:00 PM", name: "Mannavanur Organic Sheep Farm & Lake", description: "Offbeat alpine village meadow and serene high-altitude lake." },
        { time: "Day 2 - 05:00 PM", name: isSameCity ? "Complete Kodaikanal Tour" : `Return Journey to ${origin}`, description: "Complete Kodaikanal mountain expedition." }
      ] : [])
    ];
  }

  // MADURAI
  if (destLower.includes("madurai")) {
    return [
      { time: days >= 2 ? "Day 1 - 07:00 AM" : "07:00 AM", name: isSameCity ? "Start Madurai Exploration" : `Arrive in Madurai from ${origin}`, description: "Begin exploration of Cultural Capital." },
      { time: days >= 2 ? "Day 1 - 09:30 AM" : "09:30 AM", name: "Meenakshi Amman Temple Circuit", description: "14 painted gopurams, Thousand Pillar Hall & Golden Lotus Tank." },
      { time: days >= 2 ? "Day 1 - 01:30 PM" : "01:30 PM", name: "Authentic Madurai Feast & Famous Jigarthanda", description: "Kari Dosa, traditional thali and legendary cold dessert." },
      { time: days >= 2 ? "Day 1 - 04:00 PM" : "04:00 PM", name: "Thirumalai Nayakkar Palace", description: "17th-century Indo-Saracenic royal palace." },
      { time: days >= 2 ? "Day 1 - 06:30 PM" : "06:30 PM", name: "Pudhumandapam Night Market", description: "Handicrafts, tailor bazaars & evening food walk." },
      ...(days >= 2 ? [
        { time: "Day 2 - 07:30 AM", name: "Alagar Koyil & Pazhamudircholai Hills", description: "Sacred temple in Solaimalai hills & 6th Abode of Lord Murugan." },
        { time: "Day 2 - 11:30 AM", name: "Samanar Hills Rock-Cut Caves", description: "2nd century BCE Jain monk rock caves with panoramic valley view." },
        { time: "Day 2 - 05:00 PM", name: isSameCity ? "Complete Madurai Expedition" : `Return Journey to ${origin}`, description: "Complete Madurai & nearby expedition." }
      ] : [])
    ];
  }

  // OOTY / NILGIRIS
  if (destLower.includes("ooty") || destLower.includes("nilgiri")) {
    return [
      { time: days >= 2 ? "Day 1 - 07:30 AM" : "07:30 AM", name: isSameCity ? "Start Ooty Mountain Trail" : `Arrive in Ooty from ${origin}`, description: "Check in to Queen of Hill Stations." },
      { time: days >= 2 ? "Day 1 - 09:30 AM" : "09:30 AM", name: "Doddabetta Peak Viewpoint (2,637m)", description: "Highest summit in Nilgiris with telescope house & valley panorama." },
      { time: days >= 2 ? "Day 1 - 01:00 PM" : "01:00 PM", name: "Coonoor Tea Estates & Heritage Railway", description: "Tour emerald tea slopes & ride UNESCO Nilgiri Toy Train." },
      { time: days >= 2 ? "Day 1 - 04:30 PM" : "04:30 PM", name: "Wenlock Downs & Pine Forest", description: "Rolling green grasslands & pine valley views." },
      ...(days >= 2 ? [
        { time: "Day 2 - 08:30 AM", name: "Pykara Lake & Waterfalls", description: "Pristine mountain lake, boat house and cascading falls." },
        { time: "Day 2 - 01:00 PM", name: "Ooty Botanical Gardens & Rose Garden", description: "55-acre terraced garden with rare flora." },
        { time: "Day 2 - 05:00 PM", name: isSameCity ? "Complete Nilgiri Exploration" : `Return Journey to ${origin}`, description: "Complete Nilgiri hill expedition." }
      ] : [])
    ];
  }

  // GENERAL FALLBACK
  if (days >= 2) {
    return [
      { time: "Day 1 - 06:00 AM", name: isSameCity ? `Start Exploration of ${destination}` : `Depart ${origin} for ${destination}`, description: `Scenic drive towards ${destination}.` },
      { time: "Day 1 - 10:30 AM", name: `${destination} ${isHillsOrViewpoints ? "Mountain Viewpoint Circuit" : isWaterfalls ? "Cascade Falls Circuit" : isTemples ? "Heritage Temple Trail" : "Main Sightseeing Circuit"}`, description: `Explore primary landmarks in ${destination}.` },
      { time: "Day 1 - 02:00 PM", name: "Local Dining & Refreshments", description: "Enjoy regional food specialties." },
      { time: "Day 1 - 04:30 PM", name: `${destination} Sunset Point & Lookout`, description: "Experience scenic golden hour vistas." },
      { time: "Day 2 - 08:00 AM", name: `${destination} Nature & Surrounding Circuit`, description: "Explore nearby viewpoints and natural spots." },
      { time: "Day 2 - 05:00 PM", name: isSameCity ? `Complete ${destination} Circuit` : `Return Journey to ${origin}`, description: `Complete ${days}-day expedition.` }
    ];
  }

  return [
    { time: "06:30 AM", name: isSameCity ? `Start from ${origin}` : `Depart ${origin}`, description: isSameCity ? `Begin local expedition across ${destination} viewpoints.` : `Begin drive towards ${destination}.` },
    { time: "09:30 AM", name: `${destination} ${isHillsOrViewpoints ? "Elevation Viewpoint Lookout" : "Breakfast & City Hub"}`, description: `Explore ${interestsStr} in ${destination}.` },
    { time: "01:00 PM", name: `${destination} ${isHillsOrViewpoints ? "Mountain Ridge & Trail Circuit" : isWaterfalls ? "Waterfalls Trail" : isTemples ? "Temple Heritage Site" : "Primary Sightseeing Stop"}`, description: `Top rated spots for ${interestsStr} in ${destination}.` },
    { time: "04:30 PM", name: `${destination} Sunset Point & Local Bazaars`, description: "Scenic sunset views and local refreshments." },
    { time: "08:30 PM", name: isSameCity ? `Complete Day Tour in ${destination}` : `Return to Base in ${origin}`, description: "Complete round-trip journey." }
  ];
}
