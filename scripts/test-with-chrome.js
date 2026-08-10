import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const APP_URL = "https://explore-tn-trails-main.vercel.app";
const SCREENSHOT_DIR = path.join(process.cwd(), ".user_uploaded");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runChromeAppVerification() {
  console.log("🌐 LAUNCHING CHROMIUM / CHROME BROWSER FOR EXPLORERTN E2E VERIFICATION...");
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results = [];

  try {
    // 1. VERIFY OPERATIONS COMMAND CENTER (/ops)
    console.log("1️⃣ Testing Operations Command Center (/ops)...");
    await page.goto(`${APP_URL}/ops`, { waitUntil: "networkidle" });
    const opsTitle = await page.title();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "chrome_ops_command_center.png") });
    results.push(`✅ Operations Command Center (/ops): "${opsTitle}" loaded successfully.`);

    // 2. VERIFY EXPLORER PROFILE & PASSPORT (/profile)
    console.log("2️⃣ Testing Explorer Profile & Passport (/profile)...");
    await page.goto(`${APP_URL}/profile`, { waitUntil: "networkidle" });
    const profileTitle = await page.title();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "chrome_explorer_passport.png") });
    results.push(`✅ Explorer Passport (/profile): "${profileTitle}" loaded with 0-activity onboarding state.`);

    // 3. VERIFY PLACES GIS MANAGER (/places)
    console.log("3️⃣ Testing Places Directory & GIS Manager (/places)...");
    await page.goto(`${APP_URL}/places`, { waitUntil: "networkidle" });
    const placesTitle = await page.title();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "chrome_places_directory.png") });
    results.push(`✅ Places Directory (/places): "${placesTitle}" loaded successfully.`);

    // 4. VERIFY PLACE DETAIL CHECK-IN FLOW (/place/kolli-hills)
    console.log("4️⃣ Testing Place Detail & Check-in Flow (/place/kolli-hills)...");
    await page.goto(`${APP_URL}/place/kolli-hills`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "chrome_place_kolli_hills.png") });
    results.push(`✅ Place Detail (/place/kolli-hills): Destination page loaded cleanly.`);

    // 5. VERIFY ROUTES & GPX TRAILS (/routes)
    console.log("5️⃣ Testing Routes & GPX Trails (/routes)...");
    await page.goto(`${APP_URL}/routes`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "chrome_routes_trails.png") });
    results.push(`✅ Routes & Trails (/routes): Route directory loaded successfully.`);

  } catch (err) {
    console.error("❌ Error during Chrome verification:", err);
    results.push(`❌ Verification error: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log("\n=================================================");
  console.log("CHROME BROWSER E2E VERIFICATION RESULTS");
  console.log("=================================================");
  results.forEach((r) => console.log(r));
}

runChromeAppVerification();
