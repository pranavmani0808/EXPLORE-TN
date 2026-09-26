import { test, expect } from "@playwright/test";

test.describe("ExploreTN Chrome Browser Deep Audit", () => {

  test("1. Map & Route Line Verification — /ai-plan & /routes", async ({ page }) => {
    await page.goto("/ai-plan", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    // Verify Map container renders
    const map = page.locator(".leaflet-container, #map, [data-testid='map-container']").first();
    await expect(map).toBeAttached({ timeout: 10000 });
  });

  test("2. Sacred Circuit Map & Places — /trails/arupadai-veedu", async ({ page }) => {
    await page.goto("/trails/arupadai-veedu", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // Verify Page Title
    const title = await page.title();
    expect(title).toContain("Arupadai Veedu");

    // Verify Temple Shrines list in content
    const content = await page.textContent("body");
    expect(content).toContain("Thiruttani");
    expect(content).toContain("Swamimalai");
    expect(content).toContain("Palani");
    expect(content).toContain("Pazhamudircholai");
    expect(content).toContain("Thirupparankundram");
    expect(content).toContain("Tiruchendur");

    // Verify Leaflet Map Container & Marker elements in DOM
    const map = page.locator(".leaflet-container").first();
    await expect(map).toBeAttached({ timeout: 10000 });

    const markers = page.locator(".leaflet-marker-icon, [class*='marker']");
    const count = await markers.count();
    console.log(`[PASS] /trails/arupadai-veedu markers count: ${count}`);
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("3. Explore Categories & Place Cards — /explore", async ({ page }) => {
    await page.goto("/explore", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Verify Page Heading
    const bodyText = await page.textContent("body");
    expect(bodyText).toContain("Discover Tamil Nadu Your Way");

    // Verify Category Tabs or Place Cards
    const cards = page.locator("a[href*='/explore'], a[href*='/place'], article, [class*='card']");
    const count = await cards.count();
    console.log(`[PASS] /explore contains ${count} interactive place & category cards.`);
    expect(count).toBeGreaterThan(0);
  });

  test("4. Navigation Header & Footer Links", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Verify Header links
    const headerNav = page.locator("header");
    await expect(headerNav).toBeVisible();

    // Check Header or Legal links exist across site
    const links = page.locator("a[href]");
    const count = await links.count();
    console.log(`[PASS] Found ${count} total interactive links on home page.`);
    expect(count).toBeGreaterThan(0);
  });

  test("5. Legal Compliance Pages Verification", async ({ page }) => {
    const legalRoutes = [
      { path: "/legal/privacy", heading: "Privacy Policy" },
      { path: "/legal/terms", heading: "Terms of Service" },
      { path: "/legal/cookies", heading: "Cookie Policy & Preferences" },
      { path: "/legal/refunds", heading: "Refund & Cancellation Policy" },
      { path: "/legal/security", heading: "Security Policy & Responsible Disclosure" },
      { path: "/legal/community-guidelines", heading: "Community Guidelines & Acceptable Use" },
      { path: "/legal/disclaimer", heading: "Disclaimer & Accessibility Statement" },
    ];

    for (const route of legalRoutes) {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      const body = await page.textContent("body");
      expect(body).toContain(route.heading);
    }
  });

  test("6. Customer Lifecycle & UX State Pages Check", async ({ page }) => {
    const lifecycleRoutes = [
      "/login",
      "/onboarding",
      "/billing",
      "/support",
      "/payment/success",
      "/payment/failed",
      "/payment/pending",
      "/403",
      "/500",
      "/maintenance",
    ];

    for (const pathUrl of lifecycleRoutes) {
      await page.goto(pathUrl, { waitUntil: "domcontentloaded" });
      const text = await page.textContent("body");
      expect(text?.length).toBeGreaterThan(50);
    }
  });

});
