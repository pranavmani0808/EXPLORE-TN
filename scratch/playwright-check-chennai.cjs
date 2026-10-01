const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

async function main() {
  console.log('Starting Vite dev server on port 5173...');
  const server = spawn('npx', ['vite', 'dev', '--port', '5173'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });

  server.stdout.on('data', (data) => {
    // console.log(`[Dev Server] ${data}`);
  });
  server.stderr.on('data', (data) => {
    // console.error(`[Dev Server Error] ${data}`);
  });

  // Wait for dev server to start
  await new Promise((resolve) => setTimeout(resolve, 4000));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to http://localhost:5173/ ...');
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
    console.log('Page loaded successfully!');

    // Take screenshot of homepage
    const screenshotPath = path.join(__dirname, '..', 'playwright_chennai_spots_home.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot to ${screenshotPath}`);

  } catch (err) {
    console.error('Error during Playwright navigation:', err.message);
  } finally {
    await browser.close();
    server.kill();
    console.log('Test completed and dev server stopped.');
  }
}

main();
