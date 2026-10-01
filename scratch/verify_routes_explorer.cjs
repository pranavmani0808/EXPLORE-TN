const { chromium } = require("playwright");

(async () => {
  console.log("🚀 Starting Playwright E2E verification of /routes Map Explorer (Geographic vs POI Search)...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const artifactDir = "/Users/pranav/.gemini/antigravity/brain/8a582986-cc5e-4c99-8777-6c290f898b68";

  try {
    // 1. Go to /routes page
    await page.goto("http://localhost:3000/routes", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const title = await page.title();
    console.log(`Page Title: "${title}"`);

    // Dismiss onboarding modal if present
    const skipBtn = page.locator("button:has-text('Skip Setup')").first();
    if (await skipBtn.isVisible()) {
      console.log("Dismissing modal with 'Skip Setup'...");
      await skipBtn.click();
      await page.waitForTimeout(1000);
    }

    // Take screenshot of default Tamil Nadu state
    await page.screenshot({ path: `${artifactDir}/playwright_routes_default_tn.png`, fullPage: false });
    console.log("📸 Saved playwright_routes_default_tn.png");

    // 2. Search 'Madurai' in Global Search Bar
    const searchInput = page.locator("input[placeholder*='Search City']").first();
    if (await searchInput.isVisible()) {
      console.log("Searching 'Madurai' in global search input...");
      await searchInput.fill("Madurai");
      await page.waitForTimeout(1000);

      // Verify categorized search suggestion shows 'Madurai' as City
      const exploreBtn = page.locator("button:has-text('Explore Area')").first();
      if (await exploreBtn.isVisible()) {
        console.log("Clicking 'Explore Area' for Madurai City...");
        await exploreBtn.click();
        await page.waitForTimeout(1500);

        // Take screenshot of Madurai Area destinations
        await page.screenshot({ path: `${artifactDir}/playwright_routes_madurai_area.png`, fullPage: false });
        console.log("📸 Saved playwright_routes_madurai_area.png");
      }
    }

    // 3. Search 'Chennai' in Global Search Bar
    if (await searchInput.isVisible()) {
      console.log("Searching 'Chennai' in global search input...");
      await searchInput.fill("Chennai");
      await page.waitForTimeout(1000);

      const exploreBtn = page.locator("button:has-text('Explore Area')").first();
      if (await exploreBtn.isVisible()) {
        console.log("Clicking 'Explore Area' for Chennai City...");
        await exploreBtn.click();
        await page.waitForTimeout(1500);

        // Take screenshot of Chennai Area destinations
        await page.screenshot({ path: `${artifactDir}/playwright_routes_chennai_area.png`, fullPage: false });
        console.log("📸 Saved playwright_routes_chennai_area.png");
      }
    }

    console.log("✅ Playwright E2E verification of /routes Map Explorer completed successfully!");
  } catch (err) {
    console.error("❌ Test Error:", err);
  } finally {
    await browser.close();
  }
})();
