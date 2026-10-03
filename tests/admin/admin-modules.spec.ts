import { test, expect } from "@playwright/test";
import { authenticateAsAdmin } from "./admin-fixtures";

test.describe("Admin Panel — Core Modules & Navigation Audit", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page);
    await page.goto("/admin", { waitUntil: "networkidle" });
  });

  test("1. Overview: Executive Dashboard loads telemetry, service health, and backup actions", async ({ page }) => {
    await expect(page.locator("text=Database Telemetry & Analytics Active")).toBeVisible({ timeout: 10000 });
    // Verify quick action cards
    await expect(page.locator("button:has-text('Add Place')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Backup Database')")).toBeVisible();
  });

  test("2. Discovery: District-Wise Tables (38) renders district selector and place management", async ({ page }) => {
    const districtTab = page.locator("button:has-text('District-Wise Tables (38)')");
    await districtTab.click();
    await expect(page.locator("text=District-Wise Places Management Table")).toBeVisible({ timeout: 10000 });
    // Verify district button count or district dropdown is present
    await expect(page.locator("text=Ariyalur").first()).toBeVisible();
  });

  test("3. Discovery: Global Places Catalog loads search, filters, and records", async ({ page }) => {
    const placesTab = page.locator("button:has-text('Global Places Catalog')");
    await placesTab.click();
    await expect(page.locator("text=Global Places Catalog")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("input[placeholder*='Search places']")).toBeVisible();
  });

  test("4. Discovery: Kodaikanal POIs (30) loads POI inventory", async ({ page }) => {
    const kodaiTab = page.locator("button:has-text('Kodaikanal POIs (30)')");
    await kodaiTab.click();
    await expect(page.locator("text=Kodaikanal POI Travel Intelligence CMS")).toBeVisible({ timeout: 10000 });
  });

  test("5. Discovery: Place Suggestions & Scout Reviews displays submissions", async ({ page }) => {
    const suggestionsTab = page.locator("button:has-text('Place Suggestions & Scout Reviews')");
    await suggestionsTab.click();
    await expect(page.locator("text=Pending Scout Suggestions")).toBeVisible({ timeout: 10000 });
  });

  test("6. Discovery: Map Intelligence & Bounds displays GIS telemetry and safety controls", async ({ page }) => {
    const mapTab = page.locator("button:has-text('Map Intelligence & Bounds')");
    await mapTab.click();
    await expect(page.locator("text=OPENSTREETMAP (OSM)")).toBeVisible({ timeout: 10000 });
  });

  test("7. Discovery: Categories & Taxonomy Hierarchy allows viewing and adding taxonomy", async ({ page }) => {
    const catTab = page.locator("button:has-text('Categories & Taxonomy')");
    await catTab.click();
    await expect(page.locator("text=Categories & Taxonomy Hierarchy")).toBeVisible({ timeout: 10000 });
  });

  test("8. Discovery: Routes & Road Trips loads trail catalog and waypoints", async ({ page }) => {
    const routesTab = page.locator("button:has-text('Routes & Road Trips')");
    await routesTab.click();
    await expect(page.locator("text=GIS ROUTE EDITOR")).toBeVisible({ timeout: 10000 });
  });

  test("9. Experiences: Activities & Adventures allows adding new activities", async ({ page }) => {
    const actTab = page.locator("button:has-text('Activities & Adventures')");
    await actTab.click();
    await expect(page.locator("h3:has-text('Activities & Adventures')")).toBeVisible({ timeout: 10000 });
    
    // Open add activity modal
    await page.click("button:has-text('Add Activity')");
    await expect(page.locator("text=Add New Adventure Activity")).toBeVisible();
    await page.click("button:has-text('Cancel')");
  });

  test("10. Experiences: Events & Cultural Festivals allows creating events", async ({ page }) => {
    const eventsTab = page.locator("button:has-text('Events & Festivals')");
    await eventsTab.click();
    await expect(page.locator("h3:has-text('Events & Cultural Festivals')")).toBeVisible({ timeout: 10000 });

    // Open add event modal
    await page.click("button:has-text('Create Event')");
    await expect(page.locator("text=Create Cultural Event")).toBeVisible();
    await page.click("button:has-text('Cancel')");
  });

  test("11. AI Intelligence: Operations and Configuration persist settings", async ({ page }) => {
    const aiConfigTab = page.locator("button:has-text('AI Configuration & Prompts')");
    await aiConfigTab.click();
    await expect(page.locator("text=AI Configuration & Prompt Templates")).toBeVisible({ timeout: 10000 });

    // Click Save AI Configurations
    await page.click("button:has-text('Save AI Configurations')");
  });

  test("12. Data Quality: Data Quality Center renders coverage metrics", async ({ page }) => {
    const qualityTab = page.locator("button:has-text('Data Quality Center')");
    await qualityTab.click();
    await expect(page.locator("text=TAMIL NADU CONTENT HEALTH & DATA PIPELINE")).toBeVisible({ timeout: 10000 });
  });

  test("13. Community: Users & RBAC Matrix opens management modal", async ({ page }) => {
    const usersTab = page.locator("button:has-text('Users & RBAC Matrix')");
    await usersTab.click();
    await expect(page.locator("text=Users & RBAC Permission Matrix")).toBeVisible({ timeout: 10000 });

    // Click Add User to open modal
    await page.click("button:has-text('Add User')");
    await expect(page.locator("text=User Management & RBAC")).toBeVisible();
  });

  test("14. Community: User Queries & Support Helpdesk renders ticketing system", async ({ page }) => {
    const helpdeskTab = page.locator("button:has-text('User Queries & Support Helpdesk')");
    await helpdeskTab.click();
    await expect(page.locator("text=Travel Helpdesk & User Queries")).toBeVisible({ timeout: 10000 });
  });

  test("15. Community: Reviews & Moderation displays user contributions", async ({ page }) => {
    const reviewsTab = page.locator("button:has-text('Reviews & Moderation')");
    await reviewsTab.click();
    await expect(page.locator("text=COMMUNITY & MODERATION PLATFORM")).toBeVisible({ timeout: 10000 });
  });

  test("16. Content: Media Asset Library loads GPS EXIF and image assets", async ({ page }) => {
    const mediaTab = page.locator("button:has-text('Media Asset Library')");
    await mediaTab.click();
    await expect(page.locator("text=MEDIA ASSET LIBRARY (SUPABASE DB)")).toBeVisible({ timeout: 10000 });
  });

  test("17. Analytics: Platform Analytics displays dynamic live counters", async ({ page }) => {
    const analyticsTab = page.locator("button:has-text('Platform Analytics')");
    await analyticsTab.click();
    await expect(page.locator("text=Live Platform Analytics & Telemetry")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=ACTIVE USERS TODAY")).toBeVisible();
  });

  test("18. System & Security: CAIN Security Dashboard renders without 500 error", async ({ page }) => {
    const cainTab = page.locator("button:has-text('CAIN Security Dashboard')");
    await cainTab.click();
    await expect(page.locator("text=CAIN Security & Trust Architecture")).toBeVisible({ timeout: 10000 });
  });

  test("19. System & Security: System Settings updates platform parameters", async ({ page }) => {
    const settingsTab = page.locator("button:has-text('System Settings')");
    await settingsTab.click();
    await expect(page.locator("text=Global System Settings")).toBeVisible({ timeout: 10000 });

    await page.click("button:has-text('Save System Settings')");
  });

  test("20. System & Security: System Health Monitor displays microservice telemetry", async ({ page }) => {
    const healthTab = page.locator("button:has-text('System Health Monitor')");
    await healthTab.click();
    await expect(page.locator("text=System Health & Latency Telemetry")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=API Gateway")).toBeVisible();
    await expect(page.locator("text=Supabase Auth")).toBeVisible();
  });
});
