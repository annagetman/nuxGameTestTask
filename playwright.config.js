import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",

  // Test execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    [
      "html",
      {
        outputFolder: "playwright-report",
        open: "never",
      },
    ],
  ],

  use: {
    baseURL: "https://en.wikipedia.org",

    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    ...(!process.env.CI
      ? [
          {
            name: "setup",
            testMatch: /.*\.setup\.js/,
          },
        ]
      : []),

    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      ...(!process.env.CI ? { dependencies: ["setup"] } : {}),
    },
  ],
});
