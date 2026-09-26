import { test, expect } from "@playwright/test";
import { resolvePlace, KNOWN_DESTINATIONS } from "../src/lib/data/canonical-places";

test.describe("Virudhunagar Database & Map Resolution Test Suite", () => {

  test("1. Verify Virudhunagar client-side & typo resolution ('virudhunagr')", async () => {
    // Exact canonical lookup
    const canonical = KNOWN_DESTINATIONS["virudhunagar"];
    expect(canonical).toBeDefined();
    expect(canonical.district).toBe("Virudhunagar");
    expect(canonical.latitude).toBeCloseTo(9.5872, 2);
    expect(canonical.longitude).toBeCloseTo(77.9514, 2);

    // User typo lookup ('virudhunagr')
    const resolvedTypo = resolvePlace("virudhunagr");
    expect(resolvedTypo).not.toBeNull();
    expect(resolvedTypo?.district).toBe("Virudhunagar");
    expect(resolvedTypo?.latitude).toBeCloseTo(9.5872, 2);

    // Srivilliputhur lookup
    const resolvedAndal = resolvePlace("srivilliputhur");
    expect(resolvedAndal).not.toBeNull();
    expect(resolvedAndal?.district).toBe("Virudhunagar");
    expect(resolvedAndal?.latitude).toBeCloseTo(9.5097, 2);
  });

  test("2. Verify Virudhunagar appears in sidebar catalog and search on /routes", async ({ page }) => {
    await page.goto("/routes", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    // Check if Virudhunagar or Srivilliputhur is listed in sidebar catalog
    const sidebarContent = await sidebar.textContent();
    expect(sidebarContent).toContain("Virudhunagar");
    expect(sidebarContent).toContain("Srivilliputhur");

    // Type virudhunagr into destination / origin search
    const originInput = page.locator("input[placeholder*='origin' i], input[placeholder*='search' i], input[placeholder*='location' i], input[placeholder*='choose' i]").first();
    if (await originInput.isVisible()) {
      await originInput.fill("virudhunagr");
      await page.waitForTimeout(500);
      console.log("[PASS] Input filled with user query 'virudhunagr'");
    }
  });

});
