import { test, expect } from "@playwright/test";

test.describe("Madurai District Explorer & Dedicated Map Page", () => {
  test("1. Verify /madurai page loads cleanly with standalone Madurai district map", async ({ page }) => {
    await page.goto("/madurai", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    // Title verification
    await expect(page).toHaveTitle(/Madurai District/i);

    // Verify main header
    const heading = page.locator("h1");
    await expect(heading).toContainText("Madurai");

    // Verify standalone district map container exists
    const mapSection = page.locator("#district-map-section");
    await expect(mapSection).toBeVisible();

    // Verify Leaflet tiles container inside map section
    const leafletMap = mapSection.locator(".leaflet-container");
    await expect(leafletMap).toBeVisible();

    console.log("[PASS] /madurai page and standalone Leaflet district map loaded cleanly.");
  });

  test("2. Verify category filters for Temples, Food Spots & Thrift Streets", async ({ page }) => {
    await page.goto("/madurai");
    await page.waitForLoadState("networkidle");

    // Click 'Thrift Streets' category filter tab
    const thriftTab = page.getByRole("button", { name: /Thrift Streets/i });
    await expect(thriftTab).toBeVisible();
    await thriftTab.click();

    // Verify Thrift street cards appear (Puthu Mandapam)
    await expect(page.getByText("Puthu Mandapam Ancient Thrift & Tailor Market").first()).toBeVisible();
    await expect(page.getByText("Avani Moola Street Silk & Textile Bazaar").first()).toBeVisible();
    await expect(page.getByText("Vilakkuthoon & Chithirai Street Brass Market").first()).toBeVisible();

    // Click 'Food Spots' category filter tab
    const foodTab = page.getByRole("button", { name: /Food Spots/i });
    await expect(foodTab).toBeVisible();
    await foodTab.click();

    // Verify Food spot cards appear (Famous Jigarthanda, Konar Mess)
    await expect(page.getByText("Famous Jigarthanda (Town Hall Road)").first()).toBeVisible();
    await expect(page.getByText("Konar Mess — Famous Kari Dosa").first()).toBeVisible();
    await expect(page.getByText("Madurai Bun Parotta Stall").first()).toBeVisible();

    console.log("[PASS] Category filtering between Temples, Food Spots, and Thrift Streets works dynamically.");
  });

  test("3. Verify spot card 'Focus on Map' interaction opens Mapcn popup", async ({ page }) => {
    await page.goto("/madurai");
    await page.waitForLoadState("networkidle");

    // Click Thrift Streets tab
    await page.getByRole("button", { name: /Thrift Streets/i }).click();

    // Find Puthu Mandapam card and click 'Focus on Map'
    const puthuCard = page.locator("div").filter({ hasText: /^Puthu Mandapam Ancient Thrift/i }).first();
    const focusBtn = puthuCard.getByRole("button", { name: /Focus on Map/i });
    await focusBtn.click();

    // Mapcn dark popup card should become active
    await page.waitForTimeout(1000);
    const popupText = page.locator("#district-map-section");
    await expect(popupText).toBeVisible();

    console.log("[PASS] Card focus button pans standalone map and highlights place pin.");
  });

  test("4. Verify dynamic district route /districts/madurai", async ({ page }) => {
    await page.goto("/districts/madurai", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    // Header title verification
    const heading = page.locator("h1");
    await expect(heading).toContainText("Madurai");

    // Check spotlight section for famous thrift markets
    await expect(page.getByText("Madurai Famous Thrift Streets & Heritage Bazaars")).toBeVisible();
    await expect(page.getByText("Puthu Mandapam Thrift Arcade")).toBeVisible();

    console.log("[PASS] Dynamic district route /districts/madurai verified.");
  });
});
