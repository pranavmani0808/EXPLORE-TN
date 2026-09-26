import { test, expect } from "@playwright/test";

test.describe("ExploreTN Animation & Scroll Performance Audit", () => {
  const routesToTest = [
    { name: "Ariyalur District Page", path: "/districts/ariyalur" },
    { name: "Madurai District Page", path: "/districts/madurai" },
    { name: "Explore Map Page", path: "/explore" },
    { name: "Home Page", path: "/" },
  ];

  for (const route of routesToTest) {
    test(`Measure scroll FPS & animation smoothness on ${route.name}`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Inject FPS & Frame Duration Performance Tracker
      const metrics = await page.evaluate(async () => {
        return new Promise<{ totalFrames: number; slowFrames: number; maxFrameTime: number; longTasksCount: number }>((resolve) => {
          let totalFrames = 0;
          let slowFrames = 0; // Frames taking > 24ms (~<40 FPS)
          let maxFrameTime = 0;
          let longTasksCount = 0;

          // Track Long Tasks via PerformanceObserver
          try {
            const observer = new PerformanceObserver((list) => {
              longTasksCount += list.getEntries().length;
            });
            observer.observe({ entryTypes: ["longtask"] });
          } catch (e) {
            // Ignore if observer not supported
          }

          let lastTime = performance.now();
          let isScrolling = true;

          function checkFrame(now: number) {
            const delta = now - lastTime;
            lastTime = now;
            totalFrames++;
            if (delta > 24) {
              slowFrames++;
            }
            if (delta > maxFrameTime) {
              maxFrameTime = delta;
            }

            if (isScrolling) {
              requestAnimationFrame(checkFrame);
            }
          }

          requestAnimationFrame(checkFrame);

          // Perform smooth scroll down and up
          const totalScrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
          const scrollStep = 80;
          let currentScroll = 0;

          const interval = setInterval(() => {
            currentScroll += scrollStep;
            window.scrollTo(0, currentScroll);

            if (currentScroll >= totalScrollHeight - window.innerHeight) {
              clearInterval(interval);

              // Scroll back up rapidly
              const upInterval = setInterval(() => {
                currentScroll -= scrollStep * 2;
                window.scrollTo(0, currentScroll);

                if (currentScroll <= 0) {
                  clearInterval(upInterval);
                  window.scrollTo(0, 0);
                  isScrolling = false;

                  setTimeout(() => {
                    resolve({
                      totalFrames,
                      slowFrames,
                      maxFrameTime: Math.round(maxFrameTime),
                      longTasksCount,
                    });
                  }, 200);
                }
              }, 16);
            }
          }, 16);
        });
      });

      console.log(`[PERF METRICS] ${route.name}:`);
      console.log(`  - Total Frames Measured: ${metrics.totalFrames}`);
      console.log(`  - Slow Frames (>24ms / <40fps): ${metrics.slowFrames} (${((metrics.slowFrames / metrics.totalFrames) * 100).toFixed(1)}%)`);
      console.log(`  - Max Frame Duration: ${metrics.maxFrameTime}ms`);
      console.log(`  - Long Tasks (>50ms JS locks): ${metrics.longTasksCount}`);

      // Expect slow frames to be less than 25% of total frames during intense scrolling
      const slowFrameRatio = metrics.slowFrames / metrics.totalFrames;
      expect(slowFrameRatio).toBeLessThan(0.25);
    });
  }
});
