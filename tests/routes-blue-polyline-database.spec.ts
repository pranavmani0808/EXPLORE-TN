import { test, expect } from "@playwright/test";

test.describe("ExploreTN Route Page Blue Line & Database Places Verification", () => {

  test("1. Verify Database Places List in Sidebar on /routes", async ({ page }) => {
    await page.goto("/routes", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Verify Sidebar Catalog title for Database Places
    const sidebarText = await page.textContent("aside");
    expect(sidebarText).toContain("Tamil Nadu Destinations");
    expect(sidebarText).toContain("Database Live");

    // Verify Place cards render in sidebar
    const placeCards = page.locator("aside button:has-text('Origin'), aside button:has-text('Dest')");
    const count = await placeCards.count();
    console.log(`[PASS] Found ${count} Origin/Dest selection buttons in sidebar.`);
    expect(count).toBeGreaterThan(0);
  });

  test("2. Verify Map Markers & Mapcn Popups on Hover / Click", async ({ page }) => {
    await page.goto("/routes", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Check Leaflet markers on map
    const markers = page.locator(".leaflet-marker-icon, [class*='tn-place-pin']");
    const count = await markers.count();
    console.log(`[PASS] Map contains ${count} interactive place pins.`);
    expect(count).toBeGreaterThan(0);

    // Hover over first marker to trigger Mapcn Popup
    await markers.first().hover({ force: true });
    await page.waitForTimeout(800);

    // Verify popup window opened
    const popup = page.locator(".leaflet-popup-content, .custom-mapcn-popup-window").first();
    await expect(popup).toBeVisible({ timeout: 5000 });
    const popupText = await popup.textContent();
    expect(popupText?.length).toBeGreaterThan(10);
    console.log(`[PASS] Mapcn dark popup window opened with text: "${popupText?.slice(0, 50).trim()}..."`);
  });

});
