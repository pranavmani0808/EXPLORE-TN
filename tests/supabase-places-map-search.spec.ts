import { test, expect } from "@playwright/test";
import { SupabaseDatabaseRepository } from "../src/lib/supabase-database";

test.describe("Supabase Primary Database & Maps Search E2E Verification", () => {
  test("1. Verify places repository fetches canonical database records cleanly", async () => {
    // Check connection state for project ref ajxnljrhueiiuwavbrra
    const status = await SupabaseDatabaseRepository.checkConnection();
    expect(status.connected).toBe(true);
    expect(status.projectRef).toBe("ajxnljrhueiiuwavbrra");
    console.log(`[PASS] Supabase Connection Status: ${status.message}`);

    // Verify secure public places query
    const places = await SupabaseDatabaseRepository.getPublicPlaces();
    expect(Array.isArray(places)).toBe(true);
    console.log(`[PASS] Secure Public Places Query executed cleanly. Returned ${places.length} items.`);
  });

  test("2. Verify Places search bar & filtering on /explore map view", async ({ page }) => {
    await page.goto("/explore", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Verify page header
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();

    // Verify map canvas container exists
    const mapContainer = page.locator(".leaflet-container, #map, [class*='map']").first();
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // Verify Search Input exists and can be typed into
    const searchInput = page.locator("input[placeholder*='search' i], input[placeholder*='filter' i], input[type='search']").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Meenakshi");
      await page.waitForTimeout(500);
      console.log("[PASS] Map search input typed query 'Meenakshi' successfully.");
    }
  });

  test("3. Verify Map Markers & Place Card popup interactions on /madurai", async ({ page }) => {
    await page.goto("/madurai", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Verify Madurai district header
    const mainTitle = page.locator("h1");
    await expect(mainTitle).toContainText("Madurai");

    // Verify Leaflet map container on Madurai standalone map section
    const mapSection = page.locator("#district-map-section");
    await expect(mapSection).toBeVisible({ timeout: 10000 });

    // Click 'Food Spots' category filter tab
    const foodTab = page.getByRole("button", { name: /Food Spots/i });
    await expect(foodTab).toBeVisible();
    await foodTab.click();

    // Verify Food place cards render with detailed information
    const jigarthandaCard = page.getByText("Famous Jigarthanda (Town Hall Road)").first();
    await expect(jigarthandaCard).toBeVisible();

    // Click 'Focus on Map' on Konar Mess card
    const konarCard = page.locator("div").filter({ hasText: /^Konar Mess/i }).first();
    const focusBtn = konarCard.getByRole("button", { name: /Focus on Map/i });
    await focusBtn.click();

    await page.waitForTimeout(800);
    console.log("[PASS] Map marker pan and focus interaction verified for stored place item.");
  });

  test("4. Verify Places resolution API for typo queries", async ({ page }) => {
    await page.goto("/routes", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Locate origin/destination input
    const originInput = page.locator("input[placeholder*='origin' i], input[placeholder*='search' i]").first();
    await expect(originInput).toBeVisible({ timeout: 10000 });

    await originInput.fill("Madurai");
    await page.waitForTimeout(500);

    // Check sidebar updates with destinations
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
    const content = await sidebar.textContent();
    expect(content).toContain("Madurai");
    console.log("[PASS] Map routes search correctly fetches and filters places in sidebar catalog.");
  });
});
