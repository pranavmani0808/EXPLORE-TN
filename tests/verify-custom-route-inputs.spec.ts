import { test, expect } from "@playwright/test";

test("Verify custom start origin and end destination route inputs on /routes", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("etn_onboarding_completed", "true");
    localStorage.setItem("etn_cookie_consent", "accepted");
  });

  await page.goto("/routes", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Check that "Plan Custom Route" card is visible
  const planHeading = page.locator("span:has-text('Plan Custom Route')");
  await expect(planHeading).toBeVisible();

  // Test Start Origin Input
  const originInput = page.locator("input[placeholder*='Enter Start Origin']");
  await expect(originInput).toBeVisible();
  await originInput.fill("Chennai");
  await page.waitForTimeout(400);

  const originSuggestion = page.locator("div:has-text('+ Set Origin')").first();
  await expect(originSuggestion).toBeVisible();
  await originSuggestion.click();
  await page.waitForTimeout(500);

  // Test End Destination Input
  const destInput = page.locator("input[placeholder*='Enter End Destination']");
  await expect(destInput).toBeVisible();
  await destInput.fill("Madurai");
  await page.waitForTimeout(400);

  const destSuggestion = page.locator("div:has-text('+ Set Dest')").first();
  await expect(destSuggestion).toBeVisible();
  await destSuggestion.click();
  await page.waitForTimeout(1000);

  // Take screenshot of calculated custom route
  await page.screenshot({ path: "routes-custom-origin-dest-verified.png" });
  console.log("[PASS] Custom Start and End Origin verified and screenshot captured.");
});
