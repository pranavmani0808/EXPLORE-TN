import { supabase } from "./supabase-client";
import { DistrictSpot, DistrictCategoryKey } from "./data/districts";

/**
 * Normalizes user-facing district slug into the Supabase table name
 * Example: 'the-nilgiris' -> 'places_nilgiris', 'chennai' -> 'places_chennai'
 */
export function getDistrictTableName(slug: string): string {
  const s = (slug || "").toLowerCase().trim();
  if (s.includes("chennai")) return "places_chennai";
  if (s.includes("coimbatore")) return "places_coimbatore";
  if (s.includes("dindigul") || s.includes("kodai")) return "places_dindigul";
  if (s.includes("nilgiri") || s.includes("ooty")) return "places_nilgiris";
  if (s.includes("kancheepuram") || s.includes("kanchipuram")) return "places_kancheepuram";
  if (s.includes("chengalpattu")) return "places_chengalpattu";
  if (s.includes("kanniyakumari") || s.includes("kanyakumari")) return "places_kanniyakumari";
  if (s.includes("tiruchirappalli") || s.includes("trichy")) return "places_tiruchirappalli";
  if (s.includes("tirunelveli")) return "places_tirunelveli";
  if (s.includes("tiruvannamalai")) return "places_tiruvannamalai";
  if (s.includes("thanjavur")) return "places_thanjavur";
  if (s.includes("madurai")) return "places_madurai";
  if (s.includes("salem")) return "places_salem";
  if (s.includes("erode")) return "places_erode";
  if (s.includes("tenkasi")) return "places_tenkasi";
  if (s.includes("theni")) return "places_theni";
  if (s.includes("thoothukudi") || s.includes("tuticorin")) return "places_thoothukudi";
  if (s.includes("tiruppur") || s.includes("tirupur")) return "places_tiruppur";
  if (s.includes("tirupathur") || s.includes("tirupattur") || s.includes("yelagiri")) return "places_tirupattur";
  if (s.includes("tiruvallur")) return "places_tiruvallur";
  if (s.includes("tiruvarur")) return "places_tiruvarur";
  if (s.includes("vellore")) return "places_vellore";
  if (s.includes("viluppuram") || s.includes("villupuram") || s.includes("auroville") || s.includes("gingee")) return "places_viluppuram";
  if (s.includes("virudhunagar")) return "places_virudhunagar";
  if (s.includes("ariyalur")) return "places_ariyalur";
  if (s.includes("cuddalore")) return "places_cuddalore";
  if (s.includes("dharmapuri")) return "places_dharmapuri";
  if (s.includes("kallakurichi")) return "places_kallakurichi";
  if (s.includes("karur")) return "places_karur";
  if (s.includes("krishnagiri")) return "places_krishnagiri";
  if (s.includes("mayiladuthurai")) return "places_mayiladuthurai";
  if (s.includes("nagapattinam")) return "places_nagapattinam";
  if (s.includes("namakkal")) return "places_namakkal";
  if (s.includes("perambalur")) return "places_perambalur";
  if (s.includes("pudukkottai")) return "places_pudukkottai";
  if (s.includes("ramanathapuram") || s.includes("rameswaram")) return "places_ramanathapuram";
  if (s.includes("ranipet")) return "places_ranipet";
  if (s.includes("sivaganga") || s.includes("chettinad")) return "places_sivaganga";
  return `places_${s.replace(/[^a-z0-9]/g, "")}`;
}

/**
 * Maps Supabase database category constraint value to front-end DistrictCategoryKey
 */
function mapDbCategoryToSpotCategory(cat: string): DistrictSpot["category"] {
  const c = (cat || "").toLowerCase();
  if (c === "temple") return "temples";
  if (c === "falls") return "falls";
  if (c === "hill" || c === "viewpoint") return "hills";
  if (c === "beach") return "beaches";
  if (c === "market") return "thrift-streets";
  if (c === "food") return "food-spots";
  return "tourist-spots";
}

/**
 * Converts a database row from places_<district> into a frontend DistrictSpot
 */
export function mapSupabaseRowToDistrictSpot(row: any): DistrictSpot {
  const category = mapDbCategoryToSpotCategory(row.category);
  return {
    id: row.slug || row.id,
    name: row.name,
    category,
    categoryLabel: row.sub_category || row.category || "Must-Visit Attraction",
    tagline: row.description?.slice(0, 100) || `${row.name} in Tamil Nadu`,
    description: row.description || "",
    latitude: Number(row.latitude) || 0,
    longitude: Number(row.longitude) || 0,
    image: row.image_url || "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    rating: Number(row.rating) || 4.7,
    reviewsCount: Number(row.review_count) || 500,
    address: row.address || "",
    timings: row.timings || "Open Daily: 6:00 AM – 6:00 PM",
    highlights: Array.isArray(row.tags) && row.tags.length > 0 ? row.tags : [row.category || "Heritage", "Scenic View"],
    mustTry: Array.isArray(row.tags) ? row.tags.filter((t: string) => !t.includes("_")) : undefined,
    verified: row.is_verified ?? true,
  };
}

/**
 * Fetches all places dynamically from the Supabase district table (e.g. places_chennai, places_dindigul)
 */
export async function fetchDistrictSpotsFromSupabase(districtSlug: string): Promise<DistrictSpot[]> {
  try {
    const tableName = getDistrictTableName(districtSlug);
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order("rating", { ascending: false });

    if (error) {
      console.warn(`[SupabasePlacesService] Error querying ${tableName}:`, error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(mapSupabaseRowToDistrictSpot);
  } catch (err: any) {
    console.warn(`[SupabasePlacesService] Exception querying district spots:`, err?.message);
    return [];
  }
}

/**
 * Fetches all places across all 38 districts dynamically from Supabase
 */
export async function fetchAllDistrictSpotsFromSupabase(): Promise<DistrictSpot[]> {
  const districtSlugs = [
    "ariyalur", "chengalpattu", "chennai", "coimbatore", "cuddalore",
    "dharmapuri", "dindigul", "erode", "kallakurichi", "kancheepuram",
    "kanniyakumari", "karur", "krishnagiri", "madurai", "mayiladuthurai",
    "nagapattinam", "namakkal", "the-nilgiris", "perambalur", "pudukkottai",
    "ramanathapuram", "ranipet", "salem", "sivaganga", "tenkasi",
    "thanjavur", "theni", "thoothukudi", "tiruchirappalli", "tirunelveli",
    "tirupathur", "tiruppur", "tiruvallur", "tiruvannamalai", "tiruvarur",
    "vellore", "viluppuram", "virudhunagar"
  ];

  try {
    const promises = districtSlugs.map((slug) => fetchDistrictSpotsFromSupabase(slug));
    const results = await Promise.all(promises);
    return results.flat();
  } catch (err) {
    console.warn("[SupabasePlacesService] Error in fetchAllDistrictSpotsFromSupabase:", err);
    return [];
  }
}

