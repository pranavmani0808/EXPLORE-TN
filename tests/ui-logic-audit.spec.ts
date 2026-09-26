import { test, expect } from "@playwright/test";

test.describe("ExploreTN UI Alignment & Logic Audit", () => {
  const routesToTest = [
    { path: "/", name: "Home Page" },
    { path: "/madurai", name: "Madurai District Explorer" },
    { path: "/routes", name: "Ghat & Highway Routes" },
    { path: "/explore", name: "Interactive Map Explorer" },
    { path: "/login", name: "Auth Gateway" },
    { path: "/admin", name: "Admin CMS Portal" }
  ];

  for (const route of routesToTest) {
    test(`Audit ${route.name} (${route.path}) for UI alignment & console errors`, async ({ page }) => {
      const consoleLogs: string[] = [];
      const pageErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error" || msg.type() === "warning") {
          consoleLogs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
        }
      });

      page.on("pageerror", (err) => {
        pageErrors.push(err.message);
      });

      await page.goto(route.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Check Navbar alignment
      const navbar = page.locator("header, nav").first();
      if (await navbar.isVisible()) {
        const navBox = await navbar.boundingBox();
        console.log(`[Navbar Audit] ${route.name}: width=${navBox?.width}, height=${navBox?.height}, y=${navBox?.y}`);
        expect(navBox?.height).toBeGreaterThan(0);
      }

      // Check Main Heading (h1) alignment & overflow
      const h1Heading = page.locator("h1").first();
      if (await h1Heading.isVisible()) {
        const h1Box = await h1Heading.boundingBox();
        const text = await h1Heading.textContent();
        console.log(`[H1 Audit] ${route.name}: text="${text?.slice(0, 30).trim()}...", width=${h1Box?.width}, height=${h1Box?.height}`);
        expect(h1Box?.width).toBeGreaterThan(0);
      }

      // Check Paragraph (p) elements and horizontal overflow
      const pElements = page.locator("p");
      const pCount = await pElements.count();
      console.log(`[Paragraph Audit] ${route.name}: Found ${pCount} paragraph blocks.`);

      // Check horizontal page scroll / layout overflow
      const bodyWidth = await page.evaluate(() => document.body.clientWidth);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollWidth > bodyWidth + 5) {
        console.warn(`[LAYOUT OVERFLOW WARNING] ${route.name}: scrollWidth (${scrollWidth}px) exceeds bodyWidth (${bodyWidth}px)`);
      }

      // Log errors if any
      if (pageErrors.length > 0) {
        console.error(`[PAGE ERRORS] ${route.name}:`, pageErrors);
      }
    });
  }
});
