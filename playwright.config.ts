import { defineConfig } from "@playwright/test";

/**
 * Visual regression tests. They screenshot the built site (dist/ by default) and compare
 * against the baselines in tests/visual/__screenshots__.
 *
 *   yarn build && yarn test:visual            # compare
 *   yarn test:visual --update-snapshots       # accept intended visual changes
 *
 * VISUAL_SITE_DIR points the tests at another build (e.g. an older release) instead.
 */
const PORT = 4322;
const siteDir = process.env.VISUAL_SITE_DIR ?? "dist";
const spa = process.env.VISUAL_SPA ? " --spa" : "";

export default defineConfig({
  testDir: "tests/visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  use: {
    baseURL: `http://localhost:${PORT}`,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: "light"
  },
  expect: {
    toHaveScreenshot: {
      // Pixel-exact by default: the point is to catch any visual change
      maxDiffPixels: 0,
      animations: "disabled",
      caret: "hide"
    }
  },
  projects: [
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1280, height: 800 } } },
    {
      name: "mobile",
      use: { browserName: "chromium", viewport: { width: 375, height: 812 }, hasTouch: true }
    }
  ],
  webServer: {
    command: `node tests/visual/server.mjs "${siteDir}" ${PORT}${spa}`,
    port: PORT,
    reuseExistingServer: false
  }
});
