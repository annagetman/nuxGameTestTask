import { test as setup, expect } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  const username = process.env.WIKI_USERNAME;
  const password = process.env.WIKI_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "WIKI_USERNAME or WIKI_PASSWORD is missing. Check your .env file or GitHub Secrets."
    );
  }

  await page.goto("/wiki/Special:UserLogin");

  await page.locator('input[name="wpName"]').fill(username);
  await page.locator('input[name="wpPassword"]').fill(password);
  await page.locator("#wpLoginAttempt").click();

  const loggedInSpan = page.locator("#pt-userpage-2 span");

  const centralLoginButton = page.getByRole("button", {
    name: "Central login",
  });

  const sessionExpiredMsg = page.getByText(
    "Authentication was successful but your session has expired"
  );

  const additionalVerificationMsg = page.getByText(
    "An additional verification step is required. Please submit the form again"
  );

  await expect(
    loggedInSpan
      .or(centralLoginButton)
      .or(sessionExpiredMsg)
      .or(additionalVerificationMsg)
      .first()
  ).toBeVisible({ timeout: 20000 });

  if (await additionalVerificationMsg.isVisible()) {
    await page.locator("#wpLoginAttempt").click();
  } else if (await centralLoginButton.isVisible()) {
    await centralLoginButton.click();
  } else if (await sessionExpiredMsg.isVisible()) {
    throw new Error(
      "Wikipedia authentication succeeded, but the session expired."
    );
  }

  // Confirm that the browser is authenticated.
  await expect(loggedInSpan).toBeVisible({ timeout: 20000 });

  await page.context().storageState({
    path: "playwright/.auth/user.json",
  });
});