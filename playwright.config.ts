import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Look for test files inside the tests folder. */
  testDir: "./tests",

  /* Give each test up to 30 seconds to finish before Playwright stops it. */
  timeout: 30 * 1000,

  /* Run tests in files in parallel */
  fullyParallel: true,

  /*
   * CI/CD usage:
   * Most CI tools set CI=true automatically when tests run in the pipeline.
   * Playwright uses process.env.CI below to make test runs stricter and more stable in CI.
   */

  /*
   * In CI/CD, fail the build if test.only is committed by mistake.
   * This prevents the pipeline from passing when only one focused test ran.
   */
  forbidOnly: !!process.env.CI,

  /*
   * In CI/CD, retry failed tests 2 times to reduce failures caused by temporary network
   * or browser timing issues. Locally, retries stay off so failures appear immediately.
   */
  retries: process.env.CI ? 2 : 0,

  /*
   * In CI/CD, use 1 worker to run tests more predictably on shared/limited machines.
   * Locally, Playwright can choose the default worker count for faster feedback.
   */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /*
     * headless = true: Run tests in the background without opening a browser window.
     * headless = false: Open a visible browser window so you can watch and debug the test steps.
     */
    headless: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
