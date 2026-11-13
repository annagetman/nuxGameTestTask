import { test as setup, expect } from "@playwright/test";
import { getWikipediaVerificationCode } from "../helpers/gmailClient.js";

setup("authenticate", async ({ page }) => {
  const username = process.env.WIKI_USERNAME;
  const password = process.env.WIKI_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "WIKI_USERNAME or WIKI_PASSWORD is missing. Check your .env file or GitHub Secrets.",
    );
  }

  const captcha = page.locator(
    'iframe[src*="recaptcha"], iframe[src*="hcaptcha"], .captcha',
  );

  const loggedInSpan = page.locator("#pt-userpage-2 span");

  const loginError = page.getByText(
    "The supplied credentials could not be authenticated",
    { exact: true },
  );

  const additionalVerificationMsg = page.getByText(
    "An additional verification step is required. Please submit the form again",
  );

  const verificationCodeInput = page.locator('input[name="wpEmailAuthCode"]');

  await page.goto("/wiki/Special:UserLogin");

  await page.locator('input[name="wpName"]').fill(username);
  await page.locator('input[name="wpPassword"]').fill(password);

  // Record the time before starting authentication.
  const loginStartedAt = new Date();

  await page.locator("#wpLoginAttempt").click();

  await expect(
    loggedInSpan
      .or(captcha)
      .or(loginError)
      .or(additionalVerificationMsg)
      .or(verificationCodeInput)
      .first(),
  ).toBeVisible({ timeout: 30000 });

  if (await captcha.isVisible()) {
    throw new Error(
      "Wikipedia displayed a CAPTCHA. Automated authentication cannot continue.",
    );
  }

  if (await loginError.isVisible()) {
    throw new Error(`Wikipedia login failed: ${await loginError.innerText()}`);
  }

  // Wikipedia may require submitting the login form again.
  if (await additionalVerificationMsg.isVisible()) {
    await page.locator("#wpLoginAttempt").click();

    await expect(
      loggedInSpan.or(captcha).or(loginError).or(verificationCodeInput).first(),
    ).toBeVisible({ timeout: 30000 });
  }

  if (await captcha.isVisible()) {
    throw new Error(
      "Wikipedia displayed a CAPTCHA. Automated authentication cannot continue.",
    );
  }

  if (await loginError.isVisible()) {
    throw new Error(`Wikipedia login failed: ${await loginError.innerText()}`);
  }

  // Handle email verification if Wikipedia requests it.
  if (await verificationCodeInput.isVisible()) {
    const verificationCode = await getWikipediaVerificationCode({
      after: loginStartedAt,
      timeout: 90000,
    });

    await verificationCodeInput.fill(verificationCode);
    await verificationCodeInput.press("Enter");
  }

  // Confirm successful authentication.
  await expect(loggedInSpan).toBeVisible({ timeout: 30000 });

  await page.context().storageState({
    path: "playwright/.auth/user.json",
  });
});
