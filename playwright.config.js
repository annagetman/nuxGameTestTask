
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  // Test execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // HTML Report
  reporter: [
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never',
    }],
  ],

  // Shared settings
  use: {
    baseURL: 'https://en.wikipedia.org',

    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Browser configuration
  projects: [
    // 1. Проєкт-залежність для логіну
    { 
      name: "setup", 
      testMatch: /.*\.setup\.js/ 
    },

    // 2. Основні тести, які запускаються ПІСЛЯ setup і використовують готову сесію
    {
      name: "chromium",
      use: { 
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json", // Шлях до збереженої сесії
      },
      dependencies: ["setup"], // Запускати тільки після успішного setup
    },
  ],
});
