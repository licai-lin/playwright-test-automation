# AI-Assisted Playwright Testing Guide

This guide explains a modern workflow for using Codex or another AI coding assistant to help write Playwright `.spec.ts` test files.

## Overview

Many teams now use AI to create the first draft of automated tests. The tester or developer gives the AI the page, feature, or function to test, and the AI reads the project code before creating or updating Playwright test files.

The common workflow is:

1. Ask Codex to inspect the project or a specific page.
2. Ask Codex to create a `.spec.ts` file for that feature.
3. Review the generated tests.
4. Run the tests with Playwright.
5. Ask Codex to help fix failures or improve weak assertions.

The tester is still responsible for checking that the tests are meaningful, stable, and aligned with real user behavior.

## Example Command

After Codex writes the test file, run:

```bash
npx playwright test
```

To run one specific test file:

```bash
npx playwright test tests/login.spec.ts
```

## Good Prompt Example

Use a clear prompt that describes the target feature and expected coverage:

```text
Read this project and create Playwright tests for the login page.
Use role-based selectors where possible.
Cover successful login, invalid password, missing required fields, and navigation after login.
Add the tests under tests/login.spec.ts.
Then tell me how to run them.
```

## What Codex Can Help With

Codex can help with:

- Creating new `.spec.ts` test files.
- Adding test cases for pages, forms, buttons, and user flows.
- Improving selectors.
- Adding assertions.
- Debugging failing tests.
- Refactoring duplicated test setup.
- Explaining Playwright syntax.

## What The Tester Should Review

Always review generated tests before trusting them.

Check these points:

- The test covers real user behavior.
- The assertions verify business results, not only that elements exist.
- Selectors are stable and readable.
- The test is not too dependent on layout or styling.
- Negative cases and edge cases are included.
- Test data is safe and repeatable.
- The test file follows the existing project style.

## Selector Recommendation

Prefer user-facing selectors when possible:

```ts
await page.getByRole('button', { name: 'Submit' }).click();
```

CSS selectors are also common when the element has a stable ID:

```ts
await page.locator('#submit').click();
```

XPath selectors work, but they are usually less preferred in Playwright unless there is a specific reason:

```ts
await page.locator('//*[@id="submit"]').click();
```

## Recommended Workflow

1. Start with one feature or page.
2. Ask Codex to write a focused `.spec.ts` file.
3. Run the test locally.
4. Review failures carefully.
5. Ask Codex to fix the test only after checking whether the failure is caused by the test or the application.
6. Repeat for the next feature.

## Example Test Structure

```ts
import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('allows a user to log in with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log in' }).click();

    // Check that the current URL contains "dashboard".
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

## Key Point

AI can speed up test creation, but it should not replace test thinking. A strong tester uses Codex to move faster while still deciding what should be tested, what risk matters, and whether the test truly proves the feature works.
