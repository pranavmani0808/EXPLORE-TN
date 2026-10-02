import { test, expect } from "@playwright/test";

test.describe("E2E Verification: Plan Route flow to Trails & Routes map with origin prompt", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("etn_onboarding_completed", "true");
      window.localStorage.setItem("etn_cookie_consent", "true");
    });
  });

  test("1. Navbar CTA links to /routes as 'Plan Route'", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const navPlanRouteBtn = page.getByTestId("desktop-plan-route-btn");
    await expect(navPlanRouteBtn).toBeVisible();
    await expect(navPlanRouteBtn).toContainText("Plan Route");

    await navPlanRouteBtn.click();
    await page.waitForURL("**/routes");
    expect(page.url()).toContain("/routes");
  });

  test("2. Home hero CTA 'Plan Route' navigates directly to /routes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const heroPlanRoute = page.locator('a[href="/routes"]:has-text("Plan Route")').first();
    await expect(heroPlanRoute).toBeVisible();
    await heroPlanRoute.click();

    await page.waitForURL("**/routes");
    expect(page.url()).toContain("/routes");
  });

  test("3. Explore page header button links to /routes as 'Plan Route'", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    const headerPlanRoute = page.locator('header a[href="/routes"]:has-text("Plan Route")');
    await expect(headerPlanRoute).toBeVisible();
    await headerPlanRoute.click();

    await page.waitForURL("**/routes");
    expect(page.url()).toContain("/routes");
  });

  test("4. Explore category page -> Add to route -> 'Plan Route' opens /routes with destination and prompts for origin", async ({ page }) => {
    await page.goto("/explore?category=temples");
    await page.waitForLoadState("networkidle");

    // Click '+ Add to Map' on first card
    const firstAddBtn = page.locator('button:has-text("+ Add to Map")').first();
    await expect(firstAddBtn).toBeVisible();
    await firstAddBtn.click();

    // The TripRouteBuilderPanel appears with 'Plan Route' CTA
    const planRouteCTA = page.getByTestId("panel-plan-route-btn");
    await expect(planRouteCTA).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/routes/),
      planRouteCTA.click(),
    ]);
    expect(page.url()).toContain("/routes");

    // Verify the Origin prompt appears asking where the user is starting from
    const promptTitle = page.getByText("Where are you starting your trip from?");
    await expect(promptTitle).toBeVisible();

    // Verify origin search input and quick preset buttons exist
    const originInput = page.getByPlaceholder("Type starting city, district or POI...");
    await expect(originInput).toBeVisible();

    const chennaiChip = page.getByRole("button", { name: "+ Chennai" });
    await expect(chennaiChip).toBeVisible();

    // Click Chennai chip to set origin
    await chennaiChip.click();

    // The prompt overlay should close once origin is selected
    await expect(promptTitle).not.toBeVisible();

    // Route summary should now show calculated travel metrics or origin stop
    await expect(page.locator("body")).toContainText("Chennai");

    // Capture screenshot
    await page.screenshot({ path: "tests/plan-route-destination-origin.png" });
  });

  test("5. Direct navigation to /routes?destination=palani-murugan-temple immediately opens origin prompt", async ({ page }) => {
    await page.goto("/routes?destination=palani-murugan-temple");
    await page.waitForLoadState("networkidle");

    // Check prompt card
    const promptTitle = page.getByText("Where are you starting your trip from?");
    await expect(promptTitle).toBeVisible();

    // Destination badge in prompt header
    await expect(page.locator("body")).toContainText("Palani Murugan Temple");

    // Type in origin search input
    const originInput = page.getByPlaceholder("Type starting city, district or POI...");
    await originInput.fill("Madurai");

    // Click Madurai from live suggestions
    const maduraiOption = page.locator('div:has-text("Madurai") >> text="+ Set Origin"').first();
    await expect(maduraiOption).toBeVisible();
    await maduraiOption.click();

    // Prompt closes, route is calculated
    await expect(promptTitle).not.toBeVisible();

    // Capture screenshot
    await page.screenshot({ path: "tests/routes-direct-destination-madurai.png" });
  });

  test("6. Trails Arupadai Veedu CTA navigates to /routes with destination", async ({ page }) => {
    await page.goto("/trails/arupadai-veedu");
    await page.waitForLoadState("networkidle");

    // Hero CTA button says "Plan Route on Map"
    const heroBtn = page.getByRole("button", { name: "Plan Route on Map" }).first();
    await expect(heroBtn).toBeVisible();
    await heroBtn.click();

    await page.waitForURL(/\/routes\?destination=/);
    expect(page.url()).toContain("/routes?destination=");

    // Origin prompt is visible
    const promptTitle = page.getByText("Where are you starting your trip from?");
    await expect(promptTitle).toBeVisible();
  });
});
