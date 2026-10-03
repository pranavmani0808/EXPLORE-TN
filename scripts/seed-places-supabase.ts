/**
 * Seed all places from ExploreTN local data into Supabase district tables.
 * 
 * Sources synced:
 * 1. CANONICAL_PLACES (src/lib/data/canonical-places.ts)
 * 2. TAMIL_NADU_DISTRICTS spots (src/lib/data/districts.ts)
 * 3. getAllKodaiPois (src/lib/data/kodaikanal-pois.ts)
 * 4. CHENNAI_EXPANDED_PLACES (src/lib/data/chennai-places.ts)
 * 5. COIMBATORE_REGIONAL_PLACES (src/lib/data/coimbatore-places.ts)
 * 6. TREKKING_NATURE_PLACES (src/lib/data/trekking-places.ts)
 */

import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { CANONICAL_PLACES } from "../src/lib/data/canonical-places";
import { TAMIL_NADU_DISTRICTS } from "../src/lib/data/districts";
import { getAllKodaiPois } from "../src/lib/data/kodaikanal-pois";
import { CHENNAI_EXPANDED_PLACES } from "../src/lib/data/chennai-places";
import { COIMBATORE_REGIONAL_PLACES } from "../src/lib/data/coimbatore-places";
import { TREKKING_NATURE_PLACES } from "../src/lib/data/trekking-places";

// 1. Read environment variables
const envContent = fs.readFileSync(".env", "utf8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && v) env[k.trim()] = v.join("=").trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Normalization helpers
function normalizeDistrict(raw: string): string {
  const s = (raw || "").toLowerCase().trim();
  if (s.includes("chennai")) return "chennai";
  if (s.includes("coimbatore")) return "coimbatore";
  if (s.includes("dindigul") || s.includes("kodai")) return "dindigul";
  if (s.includes("nilgiri") || s.includes("ooty")) return "nilgiris";
  if (s.includes("kancheepuram") || s.includes("kanchipuram")) return "kancheepuram";
  if (s.includes("chengalpattu")) return "chengalpattu";
  if (s.includes("kanniyakumari") || s.includes("kanyakumari")) return "kanniyakumari";
  if (s.includes("tiruchirappalli") || s.includes("trichy")) return "tiruchirappalli";
  if (s.includes("tirunelveli")) return "tirunelveli";
  if (s.includes("tiruvannamalai")) return "tiruvannamalai";
  if (s.includes("thanjavur")) return "thanjavur";
  if (s.includes("madurai")) return "madurai";
  if (s.includes("salem")) return "salem";
  if (s.includes("erode")) return "erode";
  if (s.includes("tenkasi")) return "tenkasi";
  if (s.includes("theni")) return "theni";
  if (s.includes("thoothukudi") || s.includes("tuticorin")) return "thoothukudi";
  if (s.includes("tiruppur") || s.includes("tirupur")) return "tiruppur";
  if (s.includes("tirupathur") || s.includes("tirupattur") || s.includes("yelagiri")) return "tirupattur";
  if (s.includes("tiruvallur")) return "tiruvallur";
  if (s.includes("tiruvarur")) return "tiruvarur";
  if (s.includes("vellore")) return "vellore";
  if (s.includes("viluppuram") || s.includes("villupuram") || s.includes("auroville") || s.includes("gingee")) return "viluppuram";
  if (s.includes("virudhunagar")) return "virudhunagar";
  if (s.includes("ariyalur")) return "ariyalur";
  if (s.includes("cuddalore")) return "cuddalore";
  if (s.includes("dharmapuri")) return "dharmapuri";
  if (s.includes("kallakurichi")) return "kallakurichi";
  if (s.includes("karur")) return "karur";
  if (s.includes("krishnagiri")) return "krishnagiri";
  if (s.includes("mayiladuthurai")) return "mayiladuthurai";
  if (s.includes("nagapattinam")) return "nagapattinam";
  if (s.includes("namakkal")) return "namakkal";
  if (s.includes("perambalur")) return "perambalur";
  if (s.includes("pudukkottai")) return "pudukkottai";
  if (s.includes("ramanathapuram") || s.includes("rameswaram")) return "ramanathapuram";
  if (s.includes("ranipet")) return "ranipet";
  if (s.includes("sivaganga") || s.includes("chettinad")) return "sivaganga";
  return "";
}

function mapCategory(catRaw: string, textContext: string = ""): string {
  const c = (catRaw || "").toLowerCase();
  const txt = textContext.toLowerCase();

  if (c.includes("temple") || c.includes("spiritual") || txt.includes("temple") || txt.includes("kovil") || txt.includes("church") || txt.includes("mosque")) return "temple";
  if (c.includes("beach") || c.includes("coastal") || txt.includes("beach") || txt.includes("pier")) return "beach";
  if (c.includes("waterfall") || c.includes("falls") || c.includes("cascade") || txt.includes("falls") || txt.includes("waterfall")) return "falls";
  if (c.includes("lake") || c.includes("dam") || c.includes("river") || txt.includes("lake") || txt.includes("reservoir") || txt.includes("backwaters")) return "lake";
  if (c.includes("cave") || txt.includes("cave")) return "cave";
  if (c.includes("fort") || txt.includes("fort")) return "fort";
  if (c.includes("museum") || txt.includes("museum") || txt.includes("memorial") || txt.includes("gallery")) return "museum";
  if (c.includes("wildlife") || c.includes("sanctuary") || c.includes("zoo") || txt.includes("sanctuary") || txt.includes("tiger reserve") || txt.includes("biosphere")) return "wildlife";
  if (c.includes("park") || c.includes("garden") || txt.includes("botanical") || txt.includes("park")) return "park";
  if (c.includes("viewpoint") || c.includes("sunrise") || c.includes("sunset") || txt.includes("viewpoint") || txt.includes("pillar rocks")) return "viewpoint";
  if (c.includes("trek") || c.includes("adventure") || c.includes("offroad") || c.includes("camp") || txt.includes("trek") || txt.includes("surfing") || txt.includes("climbing") || txt.includes("paragliding") || txt.includes("scuba")) return "adventure";
  if (c.includes("hill") || c.includes("mountain") || txt.includes("peak") || txt.includes("ghat") || txt.includes("hill station")) return "hill";
  if (c.includes("heritage") || txt.includes("unesco") || txt.includes("monument") || txt.includes("palace") || txt.includes("rock-cut")) return "heritage";
  if (c.includes("market") || c.includes("shopping") || c.includes("food") || txt.includes("bazaar") || txt.includes("market") || txt.includes("mess") || txt.includes("shopping")) return "market";
  return "other";
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface SupabasePlaceRecord {
  name: string;
  slug: string;
  category: string;
  sub_category?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  review_count?: number;
  entry_fee?: string;
  timings?: string;
  best_season?: string;
  tags?: string[];
  image_url?: string;
  is_verified?: boolean;
  is_featured?: boolean;
}

// 3. Aggregate all places grouped by district table
const placesByDistrict: Record<string, Map<string, SupabasePlaceRecord>> = {};

function addRecord(districtRaw: string, place: SupabasePlaceRecord) {
  const distKey = normalizeDistrict(districtRaw);
  if (!distKey) return;

  if (!placesByDistrict[distKey]) {
    placesByDistrict[distKey] = new Map();
  }

  const existing = placesByDistrict[distKey].get(place.slug);
  if (!existing) {
    placesByDistrict[distKey].set(place.slug, place);
  } else {
    // Merge richer fields
    placesByDistrict[distKey].set(place.slug, {
      ...existing,
      ...place,
      description: (place.description && place.description.length > (existing.description || "").length) ? place.description : existing.description,
      image_url: place.image_url || existing.image_url,
      rating: place.rating || existing.rating,
      review_count: place.review_count || existing.review_count,
      tags: Array.from(new Set([...(existing.tags || []), ...(place.tags || [])])),
    });
  }
}

// Process 1: Canonical Places
for (const p of CANONICAL_PLACES) {
  const category = mapCategory(p.primaryCategory || (p.categories && p.categories[0]) || "", `${p.name} ${p.description || ""} ${p.tagline || ""}`);
  addRecord(p.district, {
    name: p.canonicalName || p.name,
    slug: p.slug || generateSlug(p.canonicalName || p.name),
    category,
    sub_category: p.primaryCategory || undefined,
    description: p.description || p.tagline || "",
    latitude: p.latitude,
    longitude: p.longitude,
    rating: p.rating || 4.5,
    review_count: p.reviewsCount || 100,
    best_season: p.metadata?.bestTime || undefined,
    tags: p.tags || [],
    image_url: p.image || undefined,
    is_verified: p.verified ?? true,
    is_featured: (p.rating || 0) >= 4.8,
  });
}

// Process 2: Districts.ts spots
for (const d of Object.values(TAMIL_NADU_DISTRICTS)) {
  for (const s of (d.spots || [])) {
    const category = mapCategory(s.category, `${s.name} ${s.description || ""} ${s.tagline || ""}`);
    addRecord(d.name, {
      name: s.name,
      slug: generateSlug(s.name),
      category,
      sub_category: s.categoryLabel || s.category,
      description: s.description || s.tagline || "",
      address: s.address || undefined,
      latitude: s.latitude,
      longitude: s.longitude,
      rating: s.rating || 4.5,
      review_count: s.reviewsCount || 250,
      timings: s.timings || undefined,
      tags: s.highlights || [],
      image_url: s.image || undefined,
      is_verified: s.verified ?? true,
      is_featured: (s.rating || 0) >= 4.8,
    });
  }
}

// Process 3: Chennai Expanded Places
for (const p of Object.values(CHENNAI_EXPANDED_PLACES)) {
  const category = mapCategory(p.primaryCategory || (p.categories && p.categories[0]) || "", `${p.name} ${p.description || ""}`);
  addRecord(p.district || "Chennai", {
    name: p.canonicalName || p.name,
    slug: p.slug || generateSlug(p.canonicalName || p.name),
    category,
    sub_category: p.primaryCategory || undefined,
    description: p.description || p.tagline || "",
    latitude: p.latitude,
    longitude: p.longitude,
    rating: p.rating || 4.6,
    review_count: p.reviewsCount || 500,
    best_season: p.metadata?.bestTime || undefined,
    tags: p.tags || [],
    image_url: p.image || undefined,
    is_verified: p.verified ?? true,
    is_featured: (p.rating || 0) >= 4.8,
  });
}

// Process 4: Coimbatore Regional Places
for (const p of Object.values(COIMBATORE_REGIONAL_PLACES)) {
  const category = mapCategory(p.primaryCategory || (p.categories && p.categories[0]) || "", `${p.name} ${p.description || ""}`);
  addRecord(p.district || "Coimbatore", {
    name: p.canonicalName || p.name,
    slug: p.slug || generateSlug(p.canonicalName || p.name),
    category,
    sub_category: p.primaryCategory || undefined,
    description: p.description || p.tagline || "",
    latitude: p.latitude,
    longitude: p.longitude,
    rating: p.rating || 4.6,
    review_count: p.reviewsCount || 500,
    best_season: p.metadata?.bestTime || undefined,
    tags: p.tags || [],
    image_url: p.image || undefined,
    is_verified: p.verified ?? true,
    is_featured: (p.rating || 0) >= 4.8,
  });
}

// Process 5: Trekking Places
for (const p of Object.values(TREKKING_NATURE_PLACES)) {
  const category = mapCategory(p.primaryCategory || (p.categories && p.categories[0]) || "", `${p.name} ${p.description || ""}`);
  addRecord(p.district, {
    name: p.canonicalName || p.name,
    slug: p.slug || generateSlug(p.canonicalName || p.name),
    category,
    sub_category: p.primaryCategory || undefined,
    description: p.description || p.tagline || "",
    latitude: p.latitude,
    longitude: p.longitude,
    rating: p.rating || 4.7,
    review_count: p.reviewsCount || 350,
    best_season: p.metadata?.bestTime || undefined,
    tags: p.tags || [],
    image_url: p.image || undefined,
    is_verified: p.verified ?? true,
    is_featured: true,
  });
}

// Process 6: Kodaikanal POIs
for (const p of getAllKodaiPois()) {
  const category = mapCategory(p.category, `${p.name} ${p.description || ""}`);
  addRecord("Dindigul", {
    name: p.name,
    slug: p.slug || generateSlug(p.name),
    category,
    sub_category: p.subcategory || p.category,
    description: p.description || p.shortDescription || "",
    latitude: p.latitude,
    longitude: p.longitude,
    rating: (p.popularity ? Math.min(5, 3.5 + p.popularity * 0.15) : 4.6),
    review_count: 850,
    entry_fee: p.entryFee || undefined,
    timings: p.openingHours || undefined,
    best_season: p.bestTimeToVisit || undefined,
    tags: [p.category, p.subcategory, p.weather, p.roadCondition].filter(Boolean) as string[],
    image_url: (p.images && p.images[0]) || (p.gallery && p.gallery[0]) || undefined,
    is_verified: true,
    is_featured: p.popularity >= 8,
  });
}

// 4. Batch Upload to Supabase District Tables
async function syncAll() {
  console.log(`\n🚀 Starting upload to Supabase...`);
  const districtKeys = Object.keys(placesByDistrict).sort();
  let totalUploaded = 0;
  let totalErrors = 0;

  for (const dist of districtKeys) {
    const tableName = `places_${dist}`;
    const places = Array.from(placesByDistrict[dist].values());

    console.log(`\n📦 District: [${dist}] (${places.length} places) -> Table: [${tableName}]`);

    for (const place of places) {
      try {
        const { error } = await supabase
          .from(tableName)
          .upsert(place, { onConflict: "slug" });

        if (error) {
          console.error(`  ❌ Error syncing "${place.name}" (${place.slug}):`, error.message);
          totalErrors++;
        } else {
          totalUploaded++;
        }
      } catch (err: any) {
        console.error(`  ❌ Exception syncing "${place.name}":`, err?.message);
        totalErrors++;
      }
    }
  }

  console.log(`\n===========================================`);
  console.log(`✅ SYNC COMPLETE!`);
  console.log(`Total Places Upserted: ${totalUploaded}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`===========================================\n`);
}

syncAll().catch(console.error);
