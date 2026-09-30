import { StructuredTripRequest, TransportMode, TravelStyle } from "./types";
import { resolveDestination } from "./destination-resolver";

export function parseTripIntent(userPrompt: string): StructuredTripRequest {
  const prompt = userPrompt ? userPrompt.trim() : "";
  const lower = prompt.toLowerCase();

  // 1. Extract Origin
  let originName = "";
  let originExplicitlySet = false;

  if (lower.includes("from chennai") || lower.includes("starting from chennai")) { originName = "Chennai"; originExplicitlySet = true; }
  else if (lower.includes("from madurai") || lower.includes("starting from madurai")) { originName = "Madurai"; originExplicitlySet = true; }
  else if (lower.includes("from coimbatore") || lower.includes("starting from coimbatore")) { originName = "Coimbatore"; originExplicitlySet = true; }
  else if (lower.includes("from salem") || lower.includes("starting from salem")) { originName = "Salem"; originExplicitlySet = true; }
  else if (lower.includes("from trichy") || lower.includes("starting from trichy") || lower.includes("from tiruchirappalli")) { originName = "Tiruchirappalli"; originExplicitlySet = true; }
  else if (lower.includes("from ooty") || lower.includes("starting from ooty")) { originName = "Ooty"; originExplicitlySet = true; }
  else if (lower.includes("from kodaikanal") || lower.includes("starting from kodaikanal")) { originName = "Kodaikanal"; originExplicitlySet = true; }
  else if (lower.includes("from kanyakumari") || lower.includes("starting from kanyakumari")) { originName = "Kanyakumari"; originExplicitlySet = true; }

  // 2. Extract Destinations
  const destCandidates: string[] = [];
  
  // Multi-destination splitters (e.g., "Madurai -> Kodaikanal -> Munnar" or "Madurai to Kodaikanal")
  if (prompt.includes("→") || prompt.includes("->")) {
    const parts = prompt.split(/→|->/);
    parts.forEach(p => {
      const pClean = p.replace(/(plan|trip|for|days?|\d+)/gi, "").trim();
      if (pClean && pClean.length > 2) destCandidates.push(pClean);
    });
  } else if (lower.includes(" to ") && !lower.startsWith("plan a trip to")) {
    const parts = lower.split(" to ");
    parts.forEach((p, idx) => {
      if (idx > 0) {
        const pClean = p.replace(/(for|in|\d+|days?)/gi, "").trim();
        if (pClean && pClean.length > 2) destCandidates.push(pClean);
      }
    });
  }

  // Fallback single destination detection
  if (destCandidates.length === 0) {
    if (lower.includes("kodaikanal") || lower.includes("kodai") || lower.includes("கொடைக்கானல்")) destCandidates.push("Kodaikanal");
    else if (lower.includes("madurai") || lower.includes("மதுரை")) destCandidates.push("Madurai");
    else if (lower.includes("ooty") || lower.includes("nilgiris") || lower.includes("ஊட்டி")) destCandidates.push("Ooty");
    else if (lower.includes("thanjavur") || lower.includes("tanjore") || lower.includes("தஞ்சாவூர்")) destCandidates.push("Thanjavur");
    else if (lower.includes("kanyakumari") || lower.includes("கன்னியாகுமரி")) destCandidates.push("Kanyakumari");
    else if (lower.includes("theni") || lower.includes("தேனி")) destCandidates.push("Theni");
    else if (lower.includes("pondicherry") || lower.includes("pondy") || lower.includes("புதுச்சேரி")) destCandidates.push("Pondicherry");
    else if (lower.includes("mahabalipuram") || lower.includes("mamallapuram") || lower.includes("மகாபலிபுரம்")) destCandidates.push("Mahabalipuram");
    else if (lower.includes("valparai") || lower.includes("வால்பாறை")) destCandidates.push("Valparai");
    else if (lower.includes("yercaud") || lower.includes("ஏற்காடு")) destCandidates.push("Yercaud");
    else if (lower.includes("courtallam") || lower.includes("குற்றாலம்")) destCandidates.push("Courtallam");
    else if (lower.includes("thiruvannamalai") || lower.includes("திருவண்ணாமலை")) destCandidates.push("Thiruvannamalai");
    else if (lower.includes("kanchipuram") || lower.includes("காஞ்சிபுரம்")) destCandidates.push("Kanchipuram");
    else if (lower.includes("asgard")) destCandidates.push("Asgard City");
    else if (lower.includes("atlantis")) destCandidates.push("Atlantis");
    else if (lower.includes("chennai") || lower.includes("சென்னை")) destCandidates.push("Chennai");
  }

  // Default origin to destination city if no explicit "from [city]" was specified
  if (!originExplicitlySet) {
    if (destCandidates.length > 0) {
      originName = destCandidates[0];
    } else {
      originName = "Chennai";
    }
  }

  // 3. Extract Duration (Days)
  let days = 1;
  const dayMatch = lower.match(/(\d+)\s*days?/i) || lower.match(/(one|two|three|four|five|six|seven|eight|nine|ten|15|10|5|4|3|2|1)\s*days?/i);
  if (dayMatch) {
    const rawVal = dayMatch[1].toLowerCase();
    if (!isNaN(parseInt(rawVal, 10))) {
      days = parseInt(rawVal, 10);
    } else {
      const wordMap: Record<string, number> = {
        one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10
      };
      days = wordMap[rawVal] || 1;
    }
  } else if (lower.includes("weekend")) {
    days = 2;
  } else if (lower.includes("same day") || lower.includes("day trip") || lower.includes("1 day")) {
    days = 1;
  }

  // 4. Extract Budget
  let budgetAmount: number | undefined = undefined;
  let budgetStrict = false;
  let budgetTier: "budget" | "standard" | "premium" | "luxury" | "free" | undefined = undefined;

  const budgetMatch = lower.match(/₹\s*(-?\d+([.,]\d+)?)|rs\.?\s*(-?\d+([.,]\d+)?)|budget\s*(of|is)?\s*₹?\s*(-?\d+([.,]\d+)?)/i);
  if (budgetMatch) {
    const numStr = (budgetMatch[1] || budgetMatch[3] || budgetMatch[6] || "").replace(/,/g, "");
    if (numStr) {
      budgetAmount = parseFloat(numStr);
      budgetStrict = true;
    }
  }

  if (lower.includes("luxury") || lower.includes("5 star") || lower.includes("resort")) budgetTier = "luxury";
  else if (lower.includes("cheap") || lower.includes("low budget") || lower.includes("backpacker")) budgetTier = "budget";
  else if (lower.includes("free") || lower.includes("₹0")) { budgetTier = "free"; budgetAmount = 0; }

  // 5. Extract Travelers & Group Demographics
  let adults = 2;
  let children = 0;
  let elderly = 0;
  let solo = false;
  let femaleSolo = false;
  let groupSize = 2;
  let accessibilityRequired = false;

  if (lower.includes("solo") || lower.includes("1 traveler") || lower.includes("single")) {
    solo = true;
    adults = 1;
    groupSize = 1;
  }

  if (lower.includes("female") || lower.includes("solo female") || lower.includes("women safety")) {
    femaleSolo = true;
    solo = true;
    adults = 1;
  }

  if (lower.includes("couple") || lower.includes("romantic") || lower.includes("2 adults")) {
    adults = 2;
    groupSize = 2;
  }

  if (lower.includes("family") || lower.includes("children") || lower.includes("kids")) {
    children = 2;
    groupSize = adults + children;
  }

  if (lower.includes("elderly") || lower.includes("senior citizen") || lower.includes("parents")) {
    elderly = 2;
    groupSize = adults + elderly;
  }

  const groupMatch = lower.match(/(\d+)\s*travelers?|group of (\d+)/i);
  if (groupMatch) {
    groupSize = parseInt(groupMatch[1] || groupMatch[2], 10);
    adults = groupSize;
  }

  if (lower.includes("wheelchair") || lower.includes("accessible") || lower.includes("handicapped") || lower.includes("reduced walking")) {
    accessibilityRequired = true;
  }

  // 6. Extract Transport Mode & Preferences
  let mode: TransportMode = "car";
  let maxDrivingHoursPerDay: number | undefined = undefined;
  let avoidHighways = false;
  let avoidNightDriving = false;

  if (lower.includes("bike") || lower.includes("motorcycle") || lower.includes("riding")) mode = "bike";
  else if (lower.includes("bus") || lower.includes("tnstc") || lower.includes("public bus")) mode = "bus";
  else if (lower.includes("train") || lower.includes("pamban express")) mode = "train";
  else if (lower.includes("flight") || lower.includes("airport")) mode = "flight";

  if (lower.includes("max 2 hours") || lower.includes("2h driving")) maxDrivingHoursPerDay = 2;
  else if (lower.includes("6 hours per day") || lower.includes("6h/day")) maxDrivingHoursPerDay = 6;

  if (lower.includes("avoid highways") || lower.includes("country roads")) avoidHighways = true;
  if (lower.includes("avoid night driving") || lower.includes("no night driving")) avoidNightDriving = true;

  // 7. Extract Interests & Exclusions
  const interests: string[] = [];
  const avoid: string[] = [];

  if (lower.includes("beach") || lower.includes("coastal") || lower.includes("ocean")) interests.push("beaches");
  if (lower.includes("hill") || lower.includes("mountain") || lower.includes("viewpoint")) interests.push("hills");
  if (lower.includes("waterfall") || lower.includes("stream") || lower.includes("cascade")) interests.push("waterfalls");
  if (lower.includes("temple") || lower.includes("spiritual") || lower.includes("gopuram")) interests.push("temples");
  if (lower.includes("heritage") || lower.includes("fort") || lower.includes("palace") || lower.includes("history")) interests.push("heritage");
  if (lower.includes("food") || lower.includes("cuisine") || lower.includes("jigarthanda") || lower.includes("dosa")) interests.push("food");
  if (lower.includes("shopping") || lower.includes("saree") || lower.includes("silk")) interests.push("shopping");
  if (lower.includes("photo") || lower.includes("camera") || lower.includes("scenic")) interests.push("photography");
  if (lower.includes("nature") || lower.includes("wildlife") || lower.includes("safari")) interests.push("nature");
  if (lower.includes("adventure") || lower.includes("paragliding") || lower.includes("kayaking")) interests.push("adventure");
  if (lower.includes("relax") || lower.includes("peaceful") || lower.includes("wellness")) interests.push("relaxation");

  // EXCLUSIONS CHECK (e.g. "no trekking", "don't want trekking", "avoid trekking")
  if (lower.includes("no trekking") || lower.includes("avoid trekking") || lower.includes("don't want trekking") || lower.includes("without trekking")) {
    avoid.push("trekking");
  } else if (lower.includes("trekking") || lower.includes("trek")) {
    interests.push("trekking");
  }

  // Dietary Restrictions
  const dietaryRestrictions: string[] = [];
  if (lower.includes("pure veg") || lower.includes("vegetarian")) dietaryRestrictions.push("vegetarian");
  if (lower.includes("vegan")) dietaryRestrictions.push("vegan");

  // Travel Style
  let travelStyle: TravelStyle = "balanced";
  if (lower.includes("relax")) travelStyle = "relaxed";
  else if (lower.includes("luxury")) travelStyle = "luxury";
  else if (lower.includes("budget") || lower.includes("backpacker")) travelStyle = "budget";
  else if (lower.includes("scenic")) travelStyle = "scenic";
  else if (lower.includes("family")) travelStyle = "family";
  else if (lower.includes("adventure")) travelStyle = "adventure";

  return {
    origin: {
      name: originName,
      confidence: 0.95
    },
    destinations: destCandidates.map((d) => ({
      name: d,
      confidence: 0.95
    })),
    duration: {
      days: Math.max(1, days),
      exact: true
    },
    travelers: {
      adults,
      children,
      elderly,
      solo,
      groupSize,
      femaleSolo,
      accessibilityRequired
    },
    transport: {
      mode,
      preferences: [],
      maxDrivingHoursPerDay,
      avoidHighways,
      avoidNightDriving
    },
    budget: {
      amount: budgetAmount,
      currency: "INR",
      strict: budgetStrict,
      tier: budgetTier
    },
    interests,
    travelStyle,
    constraints: {
      avoid,
      mustVisit: [],
      mustInclude: [],
      accessibilityRequired,
      dietaryRestrictions
    },
    foodPreferences: dietaryRestrictions,
    accommodationPreferences: budgetTier ? [budgetTier] : [],
    safetyPreferences: femaleSolo ? ["female_safety"] : [],
    confidence: 0.95,
    rawPrompt: prompt
  };
}
