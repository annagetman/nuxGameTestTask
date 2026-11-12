import { test as setup, expect } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  await page.goto("/wiki/Special:UserLogin");
  
  await page.locator('input[name="wpName"]').fill(process.env.WIKI_USERNAME);
  await page.locator('input[name="wpPassword"]').fill(process.env.WIKI_PASSWORD);
  await page.locator("#wpLoginAttempt").click();

  const loggedInSpan = page.locator("#pt-userpage-2 span");
  const centralLoginButton = page.getByRole("button", { name: "Central login" });
  const sessionExpiredMsg = page.getByText("Authentication was successful but your session has expired");

  await expect(loggedInSpan.or(centralLoginButton).or(sessionExpiredMsg).first()).toBeVisible({ timeout: 15000 });

  if (await centralLoginButton.isVisible()) {
    await centralLoginButton.click();
  } else if (await sessionExpiredMsg.isVisible()) {
    const fallbackButton = page.locator("#wpLoginAttempt").or(centralLoginButton);
    if (await fallbackButton.isVisible()) {
      await fallbackButton.click();
    }
  }

  await expect(loggedInSpan).toBeVisible({ timeout: 15000 });

  await page.context().storageState({ path: "playwright/.auth/user.json" });
});