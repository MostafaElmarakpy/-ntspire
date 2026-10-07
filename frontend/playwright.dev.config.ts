import { defineConfig } from "@playwright/test";

const port = 3101;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.dev.spec.ts",
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
  },
  webServer: {
    command: `node scripts/start-playwright-dev-server.mjs ${port}`,
    url: `http://127.0.0.1:${port}/en`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { browserName: "chromium", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
