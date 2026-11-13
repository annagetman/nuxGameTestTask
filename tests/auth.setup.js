import { test as setup, expect } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  const username = process.env.WIKI_USERNAME;
  const password = process.env.WIKI_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "WIKI_USERNAME or WIKI_PASSWORD is missing. Check your .env file or GitHub Secrets.",
    );
  }

  await page.goto("/wiki/Special:UserLogin");

  await page.locator('input[name="wpName"]').fill(username);
  await page.locator('input[name="wpPassword"]').fill(password);
  await page.locator("#wpLoginAttempt").click();

  const captcha = page.locator(
    'iframe[src*="recaptcha"], iframe[src*="hcaptcha"], .captcha',
  );

  const loggedInSpan = page.locator("#pt-userpage-2 span");

  const loginError = page.getByText(
    "The supplied credentials could not be authenticated",
    { exact: true },
  );

  await expect(loggedInSpan.or(captcha).or(loginError).first()).toBeVisible({
    timeout: 20000,
  });

  if (await captcha.isVisible()) {
    throw new Error(
      "Wikipedia displayed a CAPTCHA. Automated authentication cannot continue.",
    );
  }

  if (await loginError.isVisible()) {
    throw new Error(`Wikipedia login failed: ${await loginError.innerText()}`);
  }

  await expect(loggedInSpan).toBeVisible();

  await page.context().storageState({
    path: "playwright/.auth/user.json",
  });
});
