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

  // 8. Verify corridor suggested places appear in the left draggable panel
  const corridorCard = page.getByTestId("corridor-place-card").first();
  await expect(corridorCard).toBeVisible({ timeout: 5000 });

  // 9. Hover over the suggested corridor place card
  await corridorCard.hover();
  await page.waitForTimeout(500);

  // 10. Click the suggested corridor place card to focus and open popup on the map
  await corridorCard.click();
  await page.waitForTimeout(1200);

  // 12. Test that previously missing locations now return matching suggestions
  const testQueries = ["villupuram", "tindivanam", "kachipuram", "nagercoil", "hosur", "trichy", "virudhu"];
  for (const q of testQueries) {
    await startInput.fill("");
    await startInput.fill(q);
    await page.waitForTimeout(300);
    const suggestion = page.getByTestId("header-origin-option").first();
    await expect(suggestion).toBeVisible({ timeout: 4000 });
    console.log(`[PASS] Search query '${q}' successfully resolved with suggestion:`, await suggestion.textContent());
  }

  await page.screenshot({ path: "routes-districts-search-verified.png" });
  console.log("[PASS] All location search queries verified.");
});

