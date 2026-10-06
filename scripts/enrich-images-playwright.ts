import { chromium } from "playwright";
import fs from "fs";
import path from "path";

// Curated high quality high-resolution Unsplash themes based on place category
const CATEGORY_THEME_FALLBACKS: Record<string, string[]> = {
  temples: [
    "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80", // South Indian temple gopuram
    "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80", // Dravidian architecture
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80", // Ancient stone temple
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80", // Temple towers
  ],
  hills: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", // Misty mountain valley
    "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80", // Western Ghats tea hills
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80", // Pine forest hills
  ],
  waterfalls: [
    "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80", // Cascading waterfall
    "https://images.unsplash.com/photo-1508873696983-2df5703bc398?auto=format&fit=crop&w=1200&q=80", // Forest waterfall
  ],
  beaches: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Tropical coastline
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80", // Kanyakumari / Coromandel sunset
  ],
  heritage: [
    "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80", // Ancient stone fort
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80", // Heritage palace
  ],
  food: [
    "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1200&q=80", // South Indian meal on banana leaf
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80", // Dosa & chutneys
  ],
  shopping: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80", // Colorful street market
    "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1200&q=80", // Bazaar
  ],
  dams: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", // Reservoir lake
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80", // Water reservoir
  ],
};

function getCategoryFallback(cat: string): string {
  const c = (cat || "").toLowerCase();
  for (const [key, list] of Object.entries(CATEGORY_THEME_FALLBACKS)) {
    if (c.includes(key)) {
      return list[Math.floor(Math.random() * list.length)];
    }
  }
  return "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80";
}

async function fetchWikiImage(query: string, page: any): Promise<string | null> {
  try {
    // 1. Direct query via Wikipedia API
    const cleanQ = query.replace(/\(.*?\)/g, "").trim();
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(cleanQ)}&prop=pageimages&format=json&pithumbsize=1000`;
    const apiRes = await fetch(apiUrl);
    const data = await apiRes.json();
    const pages = data.query?.pages || {};
    for (const k of Object.keys(pages)) {
      if (pages[k].thumbnail?.source) {
        return pages[k].thumbnail.source;
      }
    }

    // 2. Playwright search fallback
    const searchUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(cleanQ + " Tamil Nadu")}`;
    await page.goto(searchUrl, { timeout: 12000, waitUntil: "domcontentloaded" });
    const firstArticle = await page.$eval(".mw-search-result-heading a", (a: any) => a.href).catch(() => null);
    if (firstArticle) {
      await page.goto(firstArticle, { timeout: 12000, waitUntil: "domcontentloaded" });
      const img = await page.$eval(".infobox img, .thumbimage, figure img", (el: any) => el.src).catch(() => null);
      if (img && img.startsWith("http")) {
        // Upgrade thumbnail resolution if possible
        if (img.includes("/thumb/")) {
          return img.replace(/\/thumb\//, "/").replace(/\/[^/]+$/, "");
        }
        return img;
      }
    }
  } catch (err) {
    // ignore and return null
  }
  return null;
}

export async function runImageEnrichment() {
  console.log("Launching Playwright for Image Enrichment...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  });

  const { CANONICAL_PLACES } = await import("../src/lib/data/canonical-places");
  const { TAMIL_NADU_DISTRICTS } = await import("../src/lib/data/districts");
  const { TN_MASTER_PLACES } = await import("../src/lib/data/tn-master-places");

  const placeMap: Record<string, string> = {};

  // Gather unique names needing images
  const namesToFetch = new Set<string>();

  const isPlaceholder = (img?: string) => !img || img.trim() === "" || img.includes("photo-1582510003544-4d00b7f74220");

  CANONICAL_PLACES.forEach((p) => {
    if (isPlaceholder(p.image)) namesToFetch.add(p.name || p.canonicalName);
  });

  for (const [_, d] of Object.entries(TAMIL_NADU_DISTRICTS)) {
    for (const s of d.spots) {
      if (isPlaceholder(s.image)) namesToFetch.add(s.name);
    }
  }

  for (const [_, p] of Object.entries(TN_MASTER_PLACES)) {
    if (isPlaceholder(p.image)) namesToFetch.add(p.name);
  }

  console.log(`Found ${namesToFetch.size} unique places needing real image.`);

  let count = 0;
  for (const name of namesToFetch) {
    count++;
    process.stdout.write(`[${count}/${namesToFetch.size}] Fetching image for "${name}"... `);
    const wikiImg = await fetchWikiImage(name, page);
    if (wikiImg) {
      placeMap[name] = wikiImg;
      console.log(`✓ Wikimedia: ${wikiImg.slice(0, 50)}...`);
    } else {
      console.log(`✗ No wiki image, will assign high-res category themed photo`);
    }
  }

  await browser.close();

  // Save the mapping cache
  fs.writeFileSync("./scripts/resolved-images.json", JSON.stringify(placeMap, null, 2));
  console.log(`Saved ${Object.keys(placeMap).length} resolved images to scripts/resolved-images.json`);
}

runImageEnrichment().catch(console.error);
