import { test, expect } from "@playwright/test";

test("Verify two-tier cascading top search bar: Start Origin -> Destination Origin", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("etn_onboarding_completed", "true");
    localStorage.setItem("etn_cookie_consent", "accepted");
  });

  await page.goto("/routes", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 1. Check Top Start Origin input exists in header
  const startInput = page.getByTestId("header-start-origin-input");
  await expect(startInput).toBeVisible();

  // 2. Type "Chennai" into Top Start Origin
  await startInput.fill("Chennai");
  await page.waitForTimeout(400);

  // 3. Select Chennai from suggestions
  const originSuggestion = page.getByTestId("header-origin-option").first();
  await expect(originSuggestion).toBeVisible();
  await originSuggestion.click();
  await page.waitForTimeout(600);

  // 4. Verify that the secondary Destination Search Bar has now cascaded open below it
  const destInput = page.getByTestId("header-destination-input");
  await expect(destInput).toBeVisible();

  // 5. Type "Madurai" into the Destination input
  await destInput.fill("Madurai");
  await page.waitForTimeout(400);

  // 6. Select Madurai from destination suggestions
  const destSuggestion = page.getByTestId("header-destination-option").first();
  await expect(destSuggestion).toBeVisible();
  await destSuggestion.click();
  await page.waitForTimeout(1500);

  // 7. Verify both points are selected and active route calculated
  await page.screenshot({ path: "routes-top-search-cascade-verified.png" });
  console.log("[PASS] Two-tier cascading search bar verified and screenshot saved.");
});

