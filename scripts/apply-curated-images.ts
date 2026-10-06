import fs from "fs";
import { getCuratedPlaceImage } from "../src/lib/data/curated-place-images";

// 1. Enrich CANONICAL_PLACES in src/lib/data/canonical-places.ts
const canonPath = "./src/lib/data/canonical-places.ts";
let canonContent = fs.readFileSync(canonPath, "utf-8");

// 2. Enrich TAMIL_NADU_DISTRICTS in src/lib/data/districts.ts
const distPath = "./src/lib/data/districts.ts";
let distContent = fs.readFileSync(distPath, "utf-8");

// Load the resolved images from playwright
const playwrightCache = JSON.parse(fs.readFileSync("./scripts/resolved-images.json", "utf-8"));

console.log("Applying Playwright & curated images to places...");

let updatedInCanon = 0;
canonContent = canonContent.replace(/image:\s*"(https:\/\/images\.unsplash\.com\/photo-1582510003544-4d00b7f74220[^"]*)"/g, (match, url, offset) => {
  // Look backwards for name: "..."
  const prefix = canonContent.slice(Math.max(0, offset - 600), offset);
  const nameMatch = prefix.match(/name:\s*"([^"]+)"/) || prefix.match(/canonicalName:\s*"([^"]+)"/);
  const catMatch = prefix.match(/primaryCategory:\s*"([^"]+)"/) || prefix.match(/category:\s*"([^"]+)"/);
  
  if (nameMatch) {
    const placeName = nameMatch[1];
    const cat = catMatch ? catMatch[1] : undefined;
    const newImg = playwrightCache[placeName] || getCuratedPlaceImage(placeName, cat);
    if (newImg && !newImg.includes("photo-1582510003544-4d00b7f74220")) {
      updatedInCanon++;
      return `image: "${newImg}"`;
    }
  }
  return match;
});

let updatedInDist = 0;
distContent = distContent.replace(/image:\s*"(https:\/\/images\.unsplash\.com\/photo-1582510003544-4d00b7f74220[^"]*)"/g, (match, url, offset) => {
  const prefix = distContent.slice(Math.max(0, offset - 600), offset);
  const nameMatch = prefix.match(/name:\s*"([^"]+)"/);
  const catMatch = prefix.match(/category:\s*"([^"]+)"/);
  
  if (nameMatch) {
    const placeName = nameMatch[1];
    const cat = catMatch ? catMatch[1] : undefined;
    const newImg = playwrightCache[placeName] || getCuratedPlaceImage(placeName, cat);
    if (newImg && !newImg.includes("photo-1582510003544-4d00b7f74220")) {
      updatedInDist++;
      return `image: "${newImg}"`;
    }
  }
  return match;
});

fs.writeFileSync(canonPath, canonContent, "utf-8");
fs.writeFileSync(distPath, distContent, "utf-8");

console.log(`Updated ${updatedInCanon} places in canonical-places.ts`);
console.log(`Updated ${updatedInDist} spots in districts.ts`);
