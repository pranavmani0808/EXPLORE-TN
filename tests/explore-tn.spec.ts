import { test, expect } from '@playwright/test';

test.describe('Explore TN Website Tests (explore-tn-ochre.vercel.app)', () => {
  const baseURL = 'https://explore-tn-ochre.vercel.app';

  test.beforeEach(async ({ page }) => {
    // Dismiss first-visit onboarding modal by pre-seeding localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem('etn_onboarding_completed', 'true');
      window.localStorage.setItem('etn_cookie_consent', 'true');
    });

    await page.goto(baseURL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');
  });

  // TC_HP_001: Page Load and Initial Display
  test('TC_HP_001: should load the home page successfully without errors', async ({ page }) => {
    await expect(page).toHaveURL(new RegExp(baseURL.replace('https://', 'https?://')));
    
    // Check main headline
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText(/Explore Tamil Nadu/i);
  });

  // TC_HP_002: Main Header and Footer Visible
  test('TC_HP_002: should display header and footer sections correctly', async ({ page }) => {
    // Header check
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    await expect(header.locator('text=ExploreTN').first()).toBeVisible();

    // Footer check
    const footer = page.locator('footer').first();
    await expect(footer).toBeAttached();
    await expect(footer).toContainText(/ExploreTN/i);
    await expect(footer).toContainText(/Tamil Nadu/i);
  });

  // TC_HP_003: Hero Section Elements
  test('TC_HP_003: should display hero section elements (title, CTA, subtitle) correctly', async ({ page }) => {
    // Hero headline and subtitle
    await expect(page.locator('h1').first()).toContainText('Explore Tamil Nadu');
    await expect(page.locator('text=Beyond the usual.').first()).toBeVisible();
    
    // Call-to-action buttons in Hero
    const planTripCta = page.locator('a[href="/planner"]').filter({ hasText: 'Plan My Trip' }).first();
    await expect(planTripCta).toBeVisible();

    const browsePlacesCta = page.locator('a[href="/explore"]').filter({ hasText: 'Browse places' }).first();
    await expect(browsePlacesCta).toBeVisible();
  });

  // TC_NAV_001: Navigation to Destinations / Places page
  test('TC_NAV_001: should navigate to Destinations/Places page via navigation link', async ({ page }) => {
    const placesLink = page.locator('nav a[href="/explore"]').first();
    if (await placesLink.isVisible()) {
      await placesLink.click();
      await expect(page).toHaveURL(/.*\/explore/);
    } else {
      const browsePlaces = page.locator('a[href="/explore"]').filter({ hasText: 'Browse places' }).first();
      await browsePlaces.click();
      await expect(page).toHaveURL(/.*\/explore/);
    }
  });

  // TC_NAV_002: Navigation to Guides / Community page
  test('TC_NAV_002: should navigate to Travel Guides / Community section', async ({ page }) => {
    const guidesLink = page.locator('nav a[href="/community"]').first();
    if (await guidesLink.isVisible()) {
      await guidesLink.click();
      await expect(page).toHaveURL(/.*\/community/);
    } else {
      const footerGuides = page.locator('footer a[href="/community"]').first();
      await footerGuides.click({ force: true });
      await expect(page).toHaveURL(/.*\/community/);
    }
  });

  // TC_NAV_003: Return to home page by clicking website logo
  test('TC_NAV_003: should return to home page when clicking brand logo', async ({ page }) => {
    await page.goto(`${baseURL}/explore`, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*\/explore/);

    const logo = page.locator('header a[href="/"]').first();
    await logo.click();

    await expect(page).toHaveURL(new RegExp(`${baseURL.replace('https://', 'https?://')}/?$`));
    await expect(page.locator('h1').first()).toBeVisible();
  });

  // TC_NAV_004: Footer legal links navigation (Privacy / Terms)
  test('TC_NAV_004: should navigate to Privacy Policy page via footer link', async ({ page }) => {
    const privacyLink = page.locator('footer a[href="/legal/privacy"]').first();
    await expect(privacyLink).toBeAttached();
    await privacyLink.click({ force: true });

    await expect(page).toHaveURL(/.*\/legal\/privacy/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  // TC_CONT_001: Destination cards display and interaction
  test('TC_CONT_001: should display featured destination cards and navigate on card click', async ({ page }) => {
    const cards = page.locator('article');
    await expect(cards.first()).toBeAttached();
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    const firstCardLink = cards.first().locator('a[href*="/place/"]').first();
    const destinationHref = await firstCardLink.getAttribute('href');
    
    // Navigate via destination card link
    await Promise.all([
      page.waitForURL(new RegExp(destinationHref!)),
      firstCardLink.click(),
    ]);

    await expect(page).toHaveURL(new RegExp(destinationHref!));
  });

  // TC_CONT_002: Hero CTA 'Plan My Trip' functionality
  test('TC_CONT_002: should navigate to Planner via Hero CTA button', async ({ page }) => {
    const planBtn = page.locator('main section').first().locator('a[href="/planner"]').first();
    await expect(planBtn).toBeVisible();
    
    await Promise.all([
      page.waitForURL(/.*\/planner/),
      planBtn.click(),
    ]);

    await expect(page).toHaveURL(/.*\/planner/);
  });

  // TC_RESP_001: Responsive header navigation on mobile
  test('TC_RESP_001: should collapse navigation and reveal mobile menu on mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
    await page.goto(baseURL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');

    // On mobile viewports, verify either the mobile bottom bar or header menu button
    const mobileBottomBar = page.locator('nav[aria-label="Mobile Bottom Bar"]').first();
    const hamburgerBtn = page.locator('button[aria-label="Open menu"]').first();

    const isBottomBarVisible = await mobileBottomBar.isVisible();
    const isHamburgerVisible = await hamburgerBtn.isVisible();

    expect(isBottomBarVisible || isHamburgerVisible).toBeTruthy();

    if (isBottomBarVisible) {
      await expect(mobileBottomBar.locator('a[href="/explore"]').first()).toBeVisible();
      await expect(mobileBottomBar.locator('a[href="/planner"]').first()).toBeVisible();
    }
  });

  // TC_RESP_002: Responsive layout adapting cleanly on mobile
  test('TC_RESP_002: should adapt content layout cleanly on mobile screen width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(baseURL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');

    // Hero title should still be visible and readable
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // Verify interest categories are attached
    const categoriesSection = page.locator('text=Explore by Interest');
    await expect(categoriesSection).toBeAttached();

    // Verify no unexpected horizontal page overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // allowing minor subpixel leeway
  });
});
