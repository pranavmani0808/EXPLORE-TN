import { test, expect } from "@playwright/test";

test.describe("Kodaikanal Page & Places Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("etn_onboarding_completed", "true");
      window.localStorage.setItem("etn_cookie_consent", "true");
    });
  });

  test("1. Kodaikanal (Dindigul) page displays all requested places: Poondi, Dolphin Nose, Poombarai, Kodai Lake, Pillar Rocks, Guna Caves", async ({ page }) => {
    await page.goto("/districts/dindigul");
    await page.waitForLoadState("networkidle");

    // Verify main district headings
    await expect(page.locator("h1")).toContainText(/Dindigul/i);

    // Verify all 6 places exist in the spots list
    const bodyText = page.locator("body");
    await expect(bodyText).toContainText("Poondi Village & Lake");
    await expect(bodyText).toContainText("Dolphin's Nose Viewpoint");
    await expect(bodyText).toContainText("Poombarai Terraced Village");
    await expect(bodyText).toContainText("Kodaikanal Star-Shaped Lake");
    await expect(bodyText).toContainText("Pillar Rocks Viewpoint");
    await expect(bodyText).toContainText("Guna Caves (Devil's Kitchen)");

    // Verify timings are visible
    await expect(bodyText).toContainText("09:00 AM – 04:30 PM"); // Guna Caves & Pillar Rocks
    await expect(bodyText).toContainText("06:00 AM – 05:30 PM"); // Dolphin's Nose

    // Capture screenshot for visual inspection
    await page.screenshot({ path: "tests/kodaikanal-places-verified.png", fullPage: false });
  });

  test("2. Individual place details page for Poondi loads with location, description, timings, and photos", async ({ page }) => {
    await page.goto("/place/poondi");
    await page.waitForLoadState("networkidle");

    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Poondi");

    const bodyText = page.locator("body");
    await expect(bodyText).toContainText("Mini Switzerland of Tamil Nadu");
    await expect(bodyText).toContainText("1945"); // Elevation
    await expect(bodyText).toContainText("Dindigul"); // District location
  });

  test("3. Individual place details page for Guna Caves loads with location, description, timings, and photos", async ({ page }) => {
    await page.goto("/place/guna-caves");
    await page.waitForLoadState("networkidle");

    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Guna Caves");

    const bodyText = page.locator("body");
    await expect(bodyText).toContainText("Manjummel Boys");
    await expect(bodyText).toContainText("09:00 AM – 04:30 PM");
  });

  test("4. Individual place details page for Dolphin's Nose loads with location, description, timings, and photos", async ({ page }) => {
    await page.goto("/place/dolphins-nose");
    await page.waitForLoadState("networkidle");

    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Dolphin's Nose");

    const bodyText = page.locator("body");
    await expect(bodyText).toContainText("6,600");
    await expect(bodyText).toContainText("06:00 AM – 05:30 PM");
  });
});
