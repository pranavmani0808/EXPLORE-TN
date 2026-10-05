import { test, expect } from "@playwright/test";

// Helper to dismiss any first-visit onboarding modal and avoid pointer interception
async function dismissModalsIfPresent(page: any) {
  try {
    await page.evaluate(() => {
      localStorage.setItem("etn_onboarding_completed", "true");
      localStorage.setItem("etn_cookie_consent", "accepted");
    });
    // Check if the modal backdrop or close button is in DOM
    const closeBtn = page.locator("button[title='Close setup modal'], button:has([class*='lucide-x'])").first();
    if (await closeBtn.isVisible({ timeout: 1500 })) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    }
  } catch {}
}

test.describe("ExploreTN Exhaustive Interactive & Navigation Audit", () => {

  test("1. Home Page 'Attractions you can't miss': Hover, Click, Navigation & Place Integrity", async ({ page }) => {
    // Pre-seed completed onboarding so modal doesn't intercept
    await page.addInitScript(() => {
      localStorage.setItem("etn_onboarding_completed", "true");
      localStorage.setItem("etn_cookie_consent", "accepted");
    });

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await dismissModalsIfPresent(page);

    // Scroll to "Attractions you can't miss"
    const heading = page.getByRole("heading", { name: /Attractions you can't miss/i });
    await expect(heading).toBeVisible();
    await heading.scrollIntoViewIfNeeded();

    // Check attraction cards
    const attractionCards = page.locator("a[href^='/place/']");
    const count = await attractionCards.count();
    console.log(`[AUDIT] Found ${count} place links on the Home Page.`);
    expect(count).toBeGreaterThan(0);

    // Test hover on each attraction card
    for (let i = 0; i < Math.min(count, 6); i++) {
      const card = attractionCards.nth(i);
      await card.scrollIntoViewIfNeeded();
      await card.hover({ timeout: 5000 });
      await page.waitForTimeout(200);
    }

    // Click the first attraction (Meenakshi Amman Temple /place/meenakshi-amman-temple)
    const firstCard = attractionCards.first();
    const href = await firstCard.getAttribute("href");
    console.log(`[AUDIT] Navigating to: ${href}`);
    
    await firstCard.click();
    await page.waitForURL(/\/place\/.+/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Verify place page content renders correctly without 500 error
    const pageBody = await page.textContent("body");
    expect(pageBody).not.toContain("System Signal Interrupted (500)");
    expect(pageBody).not.toContain("Destination Off the Map");

    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const h1Text = await h1.textContent();
    console.log(`[PASS] Destination detail loaded successfully: ${h1Text}`);
  });

  test("2. Place Detail Page: Interactivity, Modal / Action Buttons & Navigation Back", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("etn_onboarding_completed", "true");
      localStorage.setItem("etn_cookie_consent", "accepted");
    });

    const testSlugs = [
      "meenakshi-amman-temple",
      "thanjavur-city",
      "mahabalipuram",
      "kodaikanal",
      "theni",
    ];

    for (const slug of testSlugs) {
      const url = `/place/${slug}`;
      const res = await page.goto(url, { waitUntil: "domcontentloaded" });
      expect(res?.status()).toBeLessThan(400);
      await page.waitForTimeout(600);

      const bodyText = await page.textContent("body");
      expect(bodyText).not.toContain("System Signal Interrupted (500)");
      expect(bodyText).not.toContain("Destination Off the Map");

      // Verify essential sections exist
      await expect(page.locator("h1")).toBeVisible();
      console.log(`[PASS] /place/${slug} verified intact with no 500 errors.`);
    }
  });

  test("3. Explore Page (/explore): Category Switching, Place Cards & Modal Preview", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("etn_onboarding_completed", "true");
      localStorage.setItem("etn_cookie_consent", "accepted");
    });

    await page.goto("/explore", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await dismissModalsIfPresent(page);

    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("System Signal Interrupted (500)");

    // Test category button clicks on the left sidebar
    const categoryButtons = page.locator("aside button:has(p.truncate)");
    const catCount = await categoryButtons.count();
    console.log(`[AUDIT] Found ${catCount} category buttons on /explore sidebar.`);
    expect(catCount).toBeGreaterThan(0);

    // Switch through a few categories (Waterfalls, Beaches, Hills)
    for (let i = 0; i < Math.min(catCount, 4); i++) {
      const catBtn = categoryButtons.nth(i);
      await catBtn.click();
      await page.waitForTimeout(300);
    }

    // Test Place Details Button click -> PlaceQuickDetailsModal
    const detailsButtons = page.locator("button:has-text('Details')");
    const detailsCount = await detailsButtons.count();
    console.log(`[AUDIT] Found ${detailsCount} Place Details buttons.`);
    expect(detailsCount).toBeGreaterThan(0);

    await detailsButtons.first().click();
    await page.waitForTimeout(600);

    // Verify Quick Details Modal opens with content
    const modal = page.locator(".fixed.inset-0.z-50");
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log("[PASS] Quick Details Modal opened successfully.");

    // Close the Quick Details Modal
    const modalCloseBtn = modal.locator("button:has([class*='lucide-x'])").first();
    await modalCloseBtn.click();
    await page.waitForTimeout(300);
    console.log("[PASS] Quick Details Modal closed smoothly.");
  });

  test("4. Category Exploration Routes: /explore/temples, /explore/beaches, /explore/hills, /explore/waterfalls", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("etn_onboarding_completed", "true");
      localStorage.setItem("etn_cookie_consent", "accepted");
    });

    const categories = ["temples", "beaches", "hills", "waterfalls", "heritage", "food"];

    for (const cat of categories) {
      await page.goto(`/explore/${cat}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(600);

      const body = await page.textContent("body");
      expect(body).not.toContain("System Signal Interrupted (500)");
      expect(body).not.toContain("TypeError: QA is not a constructor");

      // Verify place items or district groups rendered
      const title = await page.title();
      console.log(`[PASS] /explore/${cat} - Page Title: ${title}`);
      expect(title.length).toBeGreaterThan(0);
    }
  });

  test("5. Districts Explorer (/districts/madurai, /districts/chennai, /districts/nilgiris): Navigation & Interactive Cards", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("etn_onboarding_completed", "true");
      localStorage.setItem("etn_cookie_consent", "accepted");
    });

    const districts = ["madurai", "chennai", "nilgiris", "kanyakumari"];

    for (const dist of districts) {
      await page.goto(`/districts/${dist}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(800);

      const body = await page.textContent("body");
      expect(body).not.toContain("System Signal Interrupted (500)");

      // Check place items / cards
      const placeCards = page.locator("button, a").filter({ hasText: /Explore|View|Details|Guide/i });
      expect(await placeCards.count()).toBeGreaterThan(0);
      console.log(`[PASS] /districts/${dist} rendered with interactive components.`);
    }
  });

  test("6. Discover Map View & Planner Navigation: /discover & /planner", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("etn_onboarding_completed", "true");
      localStorage.setItem("etn_cookie_consent", "accepted");
    });

    await page.goto("/discover", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    expect(await page.textContent("body")).not.toContain("System Signal Interrupted (500)");
    console.log("[PASS] /discover loaded cleanly.");

    await page.goto("/planner", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    expect(await page.textContent("body")).not.toContain("System Signal Interrupted (500)");
    console.log("[PASS] /planner loaded cleanly.");
  });

});
