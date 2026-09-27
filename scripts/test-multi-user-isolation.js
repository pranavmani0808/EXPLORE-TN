import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function runMultiUserIsolationTest() {
  console.log("🚀 Starting Playwright Multi-User Data Isolation Verification...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
  const artifactDir = "/Users/pranav/.gemini/antigravity/brain/8a582986-cc5e-4c99-8777-6c290f898b68";

  // --- STEP 1: USER A (User Alpha) ---
  console.log("\n👤 [1/4] Simulating User A (user_a@exploretn.com)...");
  
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await page.evaluate(() => {
    const userA = {
      id: "usr_alpha_101",
      name: "User Alpha",
      email: "user_a@exploretn.com",
      role: "explorer",
      status: "active",
      rank: "Level 1 Novice",
      districtCount: 1,
    };
    localStorage.setItem("etn_auth_user", JSON.stringify(userA));
    localStorage.setItem("etn_onboarding_completed", "true");
    
    // User A Saved Places & Routes
    const userAPlaces = [
      { id: "p1", name: "Meenakshi Amman Temple", category: "Temples", district: "Madurai", savedAt: new Date().toISOString() }
    ];
    const userARoutes = [
      { id: "r1", title: "Madurai Nayak Heritage Trail", district: "Madurai", date: "Oct 10, 2026", stops: 5, status: "Upcoming", savedAt: new Date().toISOString() }
    ];
    localStorage.setItem("etn_saved_places_usr_alpha_101", JSON.stringify(userAPlaces));
    localStorage.setItem("etn_saved_routes_usr_alpha_101", JSON.stringify(userARoutes));
  });

  await page.goto(`${baseUrl}/settings?tab=collections`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const userAContent = await page.content();
  const userAHasMeenakshi = userAContent.includes("Meenakshi Amman Temple");
  console.log(`  ✓ User A Dashboard shows User A's saved place 'Meenakshi Amman Temple': ${userAHasMeenakshi}`);

  await page.screenshot({ path: path.join(artifactDir, "playwright_user_a_dashboard.png") });

  // --- STEP 2: SWITCH TO USER B (User Beta) ---
  console.log("\n👤 [2/4] Switching to User B (user_b@exploretn.com)...");

  await page.evaluate(() => {
    const userB = {
      id: "usr_beta_202",
      name: "User Beta",
      email: "user_b@exploretn.com",
      role: "explorer",
      status: "active",
      rank: "Level 1 Novice",
      districtCount: 0,
    };
    localStorage.setItem("etn_auth_user", JSON.stringify(userB));
    localStorage.setItem("etn_onboarding_completed", "true");
  });

  await page.goto(`${baseUrl}/settings?tab=collections`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const userBInitialContent = await page.content();
  const userBHasUserAPlace = userBInitialContent.includes("Meenakshi Amman Temple");
  const userBShowsEmptyState = userBInitialContent.includes("No saved places or collections yet");

  console.log(`  ✓ User A's place 'Meenakshi Amman Temple' is NOT visible to User B: ${!userBHasUserAPlace}`);
  console.log(`  ✓ User B Dashboard starts clean with empty state: ${userBShowsEmptyState}`);

  await page.screenshot({ path: path.join(artifactDir, "playwright_user_b_isolated_empty.png") });

  // --- STEP 3: USER B SAVES DIFFERENT PLACE ---
  console.log("\n👤 [3/4] User B saves 'Ooty Botanical Garden'...");

  await page.evaluate(() => {
    const userBPlaces = [
      { id: "p2", name: "Ooty Botanical Garden", category: "Hill Stations", district: "Nilgiris", savedAt: new Date().toISOString() }
    ];
    localStorage.setItem("etn_saved_places_usr_beta_202", JSON.stringify(userBPlaces));
  });

  await page.goto(`${baseUrl}/settings?tab=collections`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const userBUpdatedContent = await page.content();
  const userBHasOoty = userBUpdatedContent.includes("Ooty Botanical Garden");
  console.log(`  ✓ User B Dashboard shows User B's saved place 'Ooty Botanical Garden': ${userBHasOoty}`);

  await page.screenshot({ path: path.join(artifactDir, "playwright_user_b_dashboard.png") });

  // --- STEP 4: SWITCH BACK TO USER A ---
  console.log("\n👤 [4/4] Switching back to User A to verify 100% isolation...");

  await page.evaluate(() => {
    const userA = {
      id: "usr_alpha_101",
      name: "User Alpha",
      email: "user_a@exploretn.com",
      role: "explorer",
      status: "active",
    };
    localStorage.setItem("etn_auth_user", JSON.stringify(userA));
  });

  await page.goto(`${baseUrl}/settings?tab=collections`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const userAFinalContent = await page.content();
  const userAStillHasMeenakshi = userAFinalContent.includes("Meenakshi Amman Temple");
  const userAHasUserBPlace = userAFinalContent.includes("Ooty Botanical Garden");

  console.log(`  ✓ User A still sees 'Meenakshi Amman Temple': ${userAStillHasMeenakshi}`);
  console.log(`  ✓ User B's place 'Ooty Botanical Garden' is NOT visible in User A's dashboard: ${!userAHasUserBPlace}`);

  await page.screenshot({ path: path.join(artifactDir, "playwright_user_a_switchback.png") });

  await browser.close();

  const isIsolated = userAHasMeenakshi && !userBHasUserAPlace && userBHasOoty && userAStillHasMeenakshi && !userAHasUserBPlace;

  console.log("\n==================================================");
  if (isIsolated) {
    console.log("🎉 SUCCESS: Multi-User Data Isolation Verified 100%!");
  } else {
    console.error("❌ FAILURE: Data leakage detected between User A and User B!");
    process.exit(1);
  }
}

runMultiUserIsolationTest().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
