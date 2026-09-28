export const CATEGORY_LABEL_MAP: Record<string, string> = {
  all: "All",
  spiritual: "Spiritual",
  temples: "Temples & Shrines",
  "heritage-temples": "Heritage & Temples",
  "tourist-spots": "Tourist Spots",
  "tourist-places": "Tourist Places",
  waterfalls: "Waterfalls",
  falls: "Waterfalls",
  hills: "Hill Escapes",
  "hill-escapes": "Hill Escapes",
  mountains: "Mountains & Peaks",
  beaches: "Coastal & Beaches",
  coastal: "Coastal Journeys",
  food: "Culinary Trails",
  "food-spots": "Culinary Spots",
  culinary: "Culinary Trails",
  "thrift-streets": "Thrift Streets",
  offroad: "Off-road & Scenic",
  camping: "Camping & Outdoors",
  photography: "Photography",
  sunrise: "Sunrise Points",
  sunset: "Sunset Views",
  hidden: "Hidden Gems",
  treks: "Trekking Trails",
  trekking: "Forest & Wildlife",
  wildlife: "Forest & Wildlife",
  dams: "Dams & Reservoirs",
  rivers: "Rivers & Lakes",
  museums: "Museums & Culture",
  heritage: "Heritage Sites",
};

export const CATEGORY_LABEL_MAP_TA: Record<string, string> = {
  all: "அனைத்தும்",
  spiritual: "ஆன்மீகம்",
  temples: "கோவில்கள்",
  "heritage-temples": "பாரம்பரியம் & கோவில்கள்",
  "tourist-spots": "சுற்றுலா தலங்கள்",
  "tourist-places": "சுற்றுலா இடங்கள்",
  waterfalls: "நீர்வீழ்ச்சிகள்",
  falls: "நீர்வீழ்ச்சிகள்",
  hills: "மலை ஓய்விடங்கள்",
  "hill-escapes": "மலை ஓய்விடங்கள்",
  mountains: "மலைகள் & சிகரங்கள்",
  beaches: "கடற்கரைகள்",
  coastal: "கடற்கரை பயணங்கள்",
  food: "உணவுப் பாதைகள்",
  "food-spots": "உணவு மையங்கள்",
  culinary: "உணவுப் பாதைகள்",
  "thrift-streets": "சந்தை வீதிகள்",
  offroad: "இயற்கைப் பாதைகள்",
  camping: "முகாம் & வெளிப்புறம்",
  photography: "புகைப்படம்",
  sunrise: "சூரியோதய முனைகள்",
  sunset: "சூரிய அஸ்தமனக் காட்சிகள்",
  hidden: "மறைக்கப்பட்ட இடங்கள்",
  treks: "மலைப்பயணங்கள்",
  trekking: "காடு & வனவிலங்குகள்",
  wildlife: "காடு & வனவிலங்குகள்",
  dams: "அணைகள் & நீர்த்தேக்கங்கள்",
  rivers: "ஆறுகள் & ஏரிகள்",
  museums: "அருங்காட்சியகங்கள்",
  heritage: "பாரம்பரிய இடங்கள்",
};

/**
 * Returns a human-readable display label for a category or tag slug.
 * Supports English and Tamil fallback.
 */
export function getCategoryLabel(slug?: string, lang?: "en" | "ta"): string {
  if (!slug) return "";
  const key = slug.toLowerCase().trim();
  if (lang === "ta" && CATEGORY_LABEL_MAP_TA[key]) {
    return CATEGORY_LABEL_MAP_TA[key];
  }
  if (CATEGORY_LABEL_MAP[key]) {
    return CATEGORY_LABEL_MAP[key];
  }
  return slug
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
