import { test, expect } from "@playwright/test";

test.describe("Scrollbar and Overlay Inspection", () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss first-visit onboarding modal and cookie consent
    await page.addInitScript(() => {
      window.localStorage.setItem("etn_onboarding_completed", "true");
      window.localStorage.setItem("etn_cookie_consent", "true");
    });
  });

  test("verify no scrollbar thumb or track overlays content on /routes", async ({ page }) => {
    // Navigate to /routes
    await page.goto("/routes");
    await page.waitForLoadState("networkidle");

    // The left panel should be visible
    const aside = page.locator("aside");
    await expect(aside).toBeVisible();

    // Verify places list
    const placesList = page.locator("#explorer-places-list");
    await expect(placesList).toBeVisible();

    // Scroll through the places list
    await placesList.evaluate((el) => {
      el.scrollTop = 200;
    });
    await page.waitForTimeout(400);

    // Evaluate computed styles for scrollbar-width and overflow behavior
    const styles = await placesList.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        scrollbarWidth: computed.scrollbarWidth,
        overflowY: computed.overflowY,
      };
    });

    expect(["thin", "none"]).toContain(styles.scrollbarWidth);

    // Capture screenshot of the destinations panel for visual verification
    await aside.screenshot({ path: "tests/routes-panel-no-scrollbar.png" });
  });

  test("verify no scrollbar thumb or overlay on /trails/arupadai-veedu", async ({ page }) => {
    await page.goto("/trails/arupadai-veedu");
    await page.waitForLoadState("networkidle");

    // Locate stops navigator list
    const stopsList = page.locator(".space-y-2.max-h-\\[480px\\]");
    await expect(stopsList).toBeVisible();

    // Scroll the stops list
    await stopsList.evaluate((el) => {
      el.scrollTop = 150;
    });
    await page.waitForTimeout(400);

    const stopsStyle = await stopsList.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        scrollbarWidth: computed.scrollbarWidth,
      };
    });

    expect(stopsStyle.scrollbarWidth).toBe("none");

    // Take screenshot of the route shrines navigator container
    const navigatorCard = page.locator(".lg\\:col-span-4").first();
    await navigatorCard.screenshot({ path: "tests/trails-navigator-no-scrollbar.png" });
  });
});
