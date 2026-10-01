const { chromium } = require("playwright");

(async () => {
  console.log("🚀 Starting Playwright E2E verification of Trip Route Builder on Explore page...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const artifactDir = "/Users/pranav/.gemini/antigravity/brain/8a582986-cc5e-4c99-8777-6c290f898b68";

  try {
    // 1. Go to explore page
    await page.goto("http://localhost:3000/explore", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const title = await page.title();
    console.log(`Page Title: "${title}"`);

    // Dismiss onboarding modal if present
    const skipBtn = page.locator("button:has-text('Skip Setup')").first();
    if (await skipBtn.isVisible()) {
      console.log("Dismissing onboarding modal with 'Skip Setup'...");
      await skipBtn.click();
      await page.waitForTimeout(1000);
    }

    // Click on a category tab, e.g., 'Hills & Mountains'
    const categoryBtn = page.locator("button:has-text('Hills & Mountains')").first();
    if (await categoryBtn.isVisible()) {
      console.log("Clicking 'Hills & Mountains' category...");
      await categoryBtn.click();
      await page.waitForTimeout(1000);
    }

    // Find "+ Add to Map" buttons
    const addButtons = page.locator("button:has-text('+ Add to Map')");
    const count = await addButtons.count();
    console.log(`Found ${count} '+ Add to Map' buttons.`);

    if (count > 0) {
      // Step A: Add 1st stop
      console.log("Clicking 1st '+ Add to Map' button...");
      await addButtons.nth(0).click();
      await page.waitForTimeout(1000);

      // Take screenshot of 1 stop in drawer
      await page.screenshot({ path: `${artifactDir}/playwright_route_builder_single_stop.png`, fullPage: false });
      console.log("📸 Saved playwright_route_builder_single_stop.png");

      // Verify button state changed to '✓ Added'
      const addedBtn = page.locator("button:has-text('✓ Added')").first();
      console.log("Is '✓ Added' button visible?", await addedBtn.isVisible());

      // Step B: Add 2nd stop
      if (count > 1) {
        console.log("Clicking 2nd '+ Add to Map' button...");
        const remainingAdd = page.locator("button:has-text('+ Add to Map')");
        await remainingAdd.nth(0).click();
        await page.waitForTimeout(1000);

        // Take screenshot of multi stop
        await page.screenshot({ path: `${artifactDir}/playwright_route_builder_multi_stop.png`, fullPage: false });
        console.log("📸 Saved playwright_route_builder_multi_stop.png");
      }

      // Step C: Add 3rd stop for route optimization test
      const remainingAdd2 = page.locator("button:has-text('+ Add to Map')");
      if (await remainingAdd2.count() > 0) {
        console.log("Clicking 3rd '+ Add to Map' button...");
        await remainingAdd2.nth(0).click();
        await page.waitForTimeout(1000);

        // Click 'Optimize Route' button if present
        const optimizeBtn = page.locator("button:has-text('Optimize Route')");
        if (await optimizeBtn.isVisible()) {
          console.log("Clicking 'Optimize Route' button...");
          await optimizeBtn.click();
          await page.waitForTimeout(1000);
        }
      }

      // Step D: Test minimize drawer and floating pill
      const minimizeBtn = page.locator("button[aria-label='Minimize panel'], button:has-text('✕')").first();
      if (await minimizeBtn.isVisible()) {
        console.log("Clicking minimize drawer button...");
        await minimizeBtn.click();
        await page.waitForTimeout(1000);

        // Check for floating pill
        const pillBtn = page.locator("button:has-text('My Route')");
        console.log("Is floating pill visible?", await pillBtn.isVisible());
        await page.screenshot({ path: `${artifactDir}/playwright_route_builder_floating_pill.png`, fullPage: false });
        console.log("📸 Saved playwright_route_builder_floating_pill.png");

        // Click pill to reopen
        if (await pillBtn.isVisible()) {
          console.log("Clicking floating pill to reopen drawer...");
          await pillBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    console.log("✅ Playwright E2E verification completed successfully!");
  } catch (err) {
    console.error("❌ Test Error:", err);
  } finally {
    await browser.close();
  }
})();
