import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Click Destinations button in navbar
  const destBtn = page.locator('button:has-text("Destinations")').first();
  await destBtn.click();
  await page.waitForTimeout(1500);

  // Click Pause Scroll button
  const pauseBtn = page.locator('#pause-scroll-toggle-btn').first();
  await pauseBtn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tests/destinations-paused.png', fullPage: false });
  console.log('Pause scroll button clicked successfully, screenshot saved at tests/destinations-paused.png');
  await browser.close();
})();
