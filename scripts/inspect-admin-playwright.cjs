const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = '/Users/pranav/.gemini/antigravity/brain/8a582986-cc5e-4c99-8777-6c290f898b68';

async function run() {
  console.log('Launching Playwright Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // Pre-set super admin in localStorage BEFORE page script runs
  await context.addInitScript(() => {
    localStorage.setItem('etn_auth_user', JSON.stringify({
      id: 'usr-1',
      name: 'Pranav Admin',
      email: 'pranav.admin@exploretn.com',
      role: 'super_admin',
      status: 'ACTIVE'
    }));
  });

  const page = await context.newPage();

  console.log('Navigating to Admin Dashboard (https://explore-tn-ochre.vercel.app/admin)...');
  await page.goto('https://explore-tn-ochre.vercel.app/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const screenshotPath = path.join(ARTIFACTS_DIR, 'playwright_admin_overview.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Saved screenshot: ${screenshotPath}`);

  // Extract page text for executive dashboard
  const overviewText = await page.innerText('body');
  console.log('--- EXECUTIVE DASHBOARD TEXT SUMMARY ---');
  console.log(overviewText.slice(0, 1500));

  // Find all sidebar navigation buttons
  const sections = [
    { text: 'Executive Dashboard', id: 'dashboard' },
    { text: 'Places Management', id: 'places' },
    { text: 'Place Suggestions & Scout Reviews', id: 'place_suggestions' },
    { text: 'Map Intelligence & Bounds', id: 'map_bounds' },
    { text: 'Categories & Taxonomy', id: 'categories' },
    { text: 'Routes & Road Trips', id: 'routes' },
    { text: 'Hotels & Resorts', id: 'hotels' },
    { text: 'Activities & Adventures', id: 'activities' },
    { text: 'Events & Festivals', id: 'events' },
    { text: 'AI Planner Operations', id: 'ai_planner' },
    { text: 'AI Configuration & Prompts', id: 'ai_config' },
    { text: 'Crawler Pipeline', id: 'crawler' },
    { text: 'Data Quality Center', id: 'data_quality' },
    { text: 'Users & RBAC Matrix', id: 'users_rbac' },
    { text: 'User Queries & Support Helpdesk', id: 'user_queries' },
    { text: 'Reviews & Moderation', id: 'moderation' },
    { text: 'Media Asset Library', id: 'media' },
    { text: 'Articles & Travel Guides', id: 'cms' }
  ];

  const findings = [];

  for (const sec of sections) {
    console.log(`Checking section: ${sec.text}...`);
    try {
      const btn = page.locator(`button:has-text("${sec.text}")`).first();
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(1200);

        const secShotPath = path.join(ARTIFACTS_DIR, `playwright_admin_${sec.id}.png`);
        await page.screenshot({ path: secShotPath });
        
        const secText = await page.innerText('body');
        findings.push({
          section: sec.text,
          id: sec.id,
          screenshot: secShotPath,
          sampleText: secText.slice(0, 800).replace(/\s+/g, ' ')
        });
        console.log(`  ✓ Navigated and captured ${sec.text}`);
      } else {
        console.log(`  ⚠ Button not visible for ${sec.text}`);
      }
    } catch (err) {
      console.warn(`Could not navigate to section ${sec.text}:`, err.message);
    }
  }

  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'admin_playwright_findings.json'), JSON.stringify(findings, null, 2));
  console.log('Playwright inspection complete! Check findings.json.');

  await browser.close();
}

run().catch((err) => {
  console.error('Playwright script error:', err);
  process.exit(1);
});
