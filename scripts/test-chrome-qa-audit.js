import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const APP_URL = "https://explore-tn-trails-main.vercel.app";
const SCREENSHOT_DIR = path.join(process.cwd(), ".user_uploaded");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runComprehensiveQAExecution() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const applicationErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      applicationErrors.push(msg.text());
    }
  });

  try {
    await page.goto(`${APP_URL}/`, { waitUntil: "networkidle" });
    await page.goto(`${APP_URL}/explore`, { waitUntil: "networkidle" });
    await page.goto(`${APP_URL}/place/kolli-hills`, { waitUntil: "networkidle" });
    await page.goto(`${APP_URL}/profile`, { waitUntil: "networkidle" });
    await page.goto(`${APP_URL}/ops`, { waitUntil: "networkidle" });
  } finally {
    await browser.close();
  }

  console.log("=========================================");
  console.log("EXACT APPLICATION CONSOLE ERROR LOGS:");
  console.log("=========================================");
  applicationErrors.forEach((err, idx) => {
    console.log(`${idx + 1}. ${err}`);
  });
}

runComprehensiveQAExecution();
