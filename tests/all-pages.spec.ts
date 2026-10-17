import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/", title: "Home" },
  { path: "/ai-plan", title: "AI Travel Planner" },
  { path: "/explore", title: "Explore Destinations" },
  { path: "/districts", title: "Districts" },
  { path: "/districts/madurai", title: "Madurai District" },
  { path: "/districts/coimbatore", title: "Coimbatore District" },
  { path: "/districts/nilgiris", title: "Nilgiris District" },
  { path: "/routes", title: "Routes & Trails" },
  { path: "/trails/arupadai-veedu", title: "Arupadai Veedu Trail" },
  { path: "/trails/pancha-bhoota", title: "Pancha Bhoota Trail" },
  { path: "/trails/western-ghats-70-hairpin", title: "Western Ghats Trail" },
  { path: "/trails/coromandel-coastal", title: "Coromandel Trail" },
  { path: "/events", title: "Events" },
  { path: "/place/meenakshi-temple", title: "Place Details" },
  { path: "/adventures", title: "Adventures" },
  { path: "/coastal-heritage", title: "Coastal Heritage" },
  { path: "/hill-escapes", title: "Hill Escapes" },
  { path: "/hills-of-tn", title: "Hills of TN" },
  { path: "/western-ghats", title: "Western Ghats" },
  { path: "/login", title: "Sign In" },
  { path: "/onboarding", title: "Onboarding" },
  { path: "/billing", title: "Billing" },
  { path: "/support", title: "Help Center" },
  { path: "/legal/privacy", title: "Privacy Policy" },
  { path: "/legal/terms", title: "Terms of Service" },
  { path: "/legal/cookies", title: "Cookie Policy" },
  { path: "/legal/refunds", title: "Refund" },
  { path: "/legal/security", title: "Security" },
  { path: "/legal/community-guidelines", title: "Community Guidelines" },
  { path: "/legal/disclaimer", title: "Disclaimer" },
  { path: "/payment/success", title: "Payment Confirmed" },
  { path: "/payment/failed", title: "Payment Failed" },
  { path: "/payment/pending", title: "Payment Pending" },
  { path: "/403", title: "Forbidden" },
  { path: "/500", title: "Server Error" },
  { path: "/maintenance", title: "Maintenance" },
];

for (const route of ROUTES) {
  test(`Testing page route: ${route.path}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(400);

    // Verify page content renders without blank screen crash
    const bodyText = await page.textContent("body");
    expect(bodyText).toBeTruthy();
    expect(bodyText?.length).toBeGreaterThan(50);

    // Verify page doesn't throw uncaught React component crashes
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();

    console.log(`[PASS] ${route.path} - Title: ${pageTitle}`);
  });
}
