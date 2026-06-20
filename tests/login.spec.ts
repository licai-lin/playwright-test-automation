import test, { expect } from "@playwright/test";

test("Authentication Page Test", async ({ page }) => {
  console.log("Basic UI test");
  const username = process.env.PLAYWRIGHT_USERNAME ?? "student";
  const password = process.env.PLAYWRIGHT_PASSWORD ?? "Password123";

  //1. Navigate to the practice site
  await page.goto("https://practicetestautomation.com/practice-test-login/");

  // 2. Fill the credentials using ID and Name selectors
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(password);

  // 3. Click the submit button
  await page.getByRole("button", { name: "Submit" }).click();

  // 4. Assert that the URL changed and a logout element is visible
  await expect(page).toHaveURL(/.*logged-in-successfully/);
  await expect(page.getByRole("link", { name: "Log out" })).toBeVisible();
});

test("Get Page Title", async ({ page }) => {
  await page.goto("http://google.com");
  await expect(page).toHaveTitle("Google");
});
