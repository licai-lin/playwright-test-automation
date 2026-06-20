import { expect, test } from "@playwright/test";

test("reads environment variables from .env", async () => {
  expect(process.env.PLAYWRIGHT_SAMPLE_USERNAME).toBe("student");
});
