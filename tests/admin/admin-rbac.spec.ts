import { test, expect } from "@playwright/test";
import { authenticateAsAdmin, authenticateAsExplorer } from "./admin-fixtures";

test.describe("Admin Panel — RBAC & Authentication Enforcement", () => {
  test("Redirects unauthenticated visitors away from /admin to /login", async ({ page }) => {
    // Navigate without auth session
    await page.goto("/admin");
    // Should be redirected to /login
    await page.waitForURL("**/login", { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });

  test("Redirects unauthorized non-admin explorers away from /admin to /login", async ({ page }) => {
    await authenticateAsExplorer(page);
    await page.goto("/admin");
    await page.waitForURL("**/login", { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });

  test("Allows authorized super_admin to access /admin and view Command Center header", async ({ page }) => {
    await authenticateAsAdmin(page);
    await page.goto("/admin", { waitUntil: "networkidle" });

    // Verify main admin header
    await expect(page.locator("text=EXPLORETN TRAVEL INTELLIGENCE CMS")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Geospatial Operations & Travel Intelligence Portal")).toBeVisible();
    await expect(page.locator("button:has-text('Refresh Telemetry')").first()).toBeVisible();
  });
});
