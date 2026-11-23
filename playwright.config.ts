import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// Local machines use the installed Chrome (Playwright's bundled Chromium does
// not support every macOS version). CI uses the bundled Chromium.
const browser = {
  ...devices["Desktop Chrome"],
  ...(process.env.CI ? {} : { channel: "chrome" }),
};

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "e2e", use: browser, testIgnore: /screenshots/ },
    { name: "screenshots", use: browser, testMatch: /screenshots\.spec\.ts/ },
  ],
});
