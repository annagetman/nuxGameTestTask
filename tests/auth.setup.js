
import { test as setup, expect } from "@playwright/test";
import { getWikipediaVerificationCode } from "../helpers/gmailClient.js";

const AUTH_TIMEOUT = 30000;

async function waitForLoginState(page, ignoreState = null) {
  const loggedInSpan = page.locator("#pt-userpage-2 span");

  const loginError = page.getByText(
    "The supplied credentials could not be authenticated",
    { exact: true },
  );

  const additionalVerificationMsg = page.getByText(
    "An additional verification step is required. Please submit the form again",
    { exact: false },
  );

  const verificationCodeInput = page.locator(
    "#mw-emailauth-verification-code",
  );

  let detectedState = "pending";

  await expect
    .poll(
      async () => {
        if (await loggedInSpan.isVisible()) {
          detectedState = "success";
        } else if (await loginError.isVisible()) {
          detectedState = "error";
        } else if (await verificationCodeInput.isVisible()) {
          detectedState = "email-verification";
        } else if (await additionalVerificationMsg.isVisible()) {
          detectedState = "resubmit";
        } else {
          detectedState = "pending";
        }

        return detectedState === ignoreState ? "pending" : detectedState;
      },
      {
        timeout: AUTH_TIMEOUT,
        intervals: [500, 1000, 2000],
        message: "Waiting for Wikipedia login response",
      },
    )
    .not.toBe("pending");

  return detectedState;
}

setup("authenticate", async ({ page }) => {
  // Allow enough time for email verification.
  setup.setTimeout(210000);

  const username = process.env.WIKI_USERNAME;
  const password = process.env.WIKI_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "WIKI_USERNAME or WIKI_PASSWORD is missing. Check your .env file or GitHub Secrets.",
    );
  }

  const loginButton = page.locator("#wpLoginAttempt");
  const verificationCodeInput = page.locator(
    "#mw-emailauth-verification-code",
  );
  const loggedInSpan = page.locator("#pt-userpage-2 span");

  await page.goto("/wiki/Special:UserLogin");

  await page.locator('input[name="wpName"]').fill(username);
  await page.locator('input[name="wpPassword"]').fill(password);

  const loginStartedAt = new Date();

  await loginButton.click();

  let state = await waitForLoginState(page);

  let resubmitAttempts = 0;
  let verificationAttempts = 0;

  while (state !== "success") {
    if (state === "error") {
      throw new Error(
        "Wikipedia login failed: supplied credentials could not be authenticated.",
      );
    }

    if (state === "resubmit") {
      if (resubmitAttempts >= 2) {
        throw new Error(
          "Wikipedia login failed: additional verification was requested repeatedly.",
        );
      }

      resubmitAttempts++;

      await loginButton.click();
      state = await waitForLoginState(page, "resubmit");

      continue;
    }

    if (state === "email-verification") {
      if (verificationAttempts >= 1) {
        throw new Error(
          "Wikipedia login failed: email verification was requested again.",
        );
      }

      verificationAttempts++;

      const verificationCode = await getWikipediaVerificationCode({
        after: loginStartedAt,
        timeout: 90000,
      });

      await verificationCodeInput.fill(verificationCode);
      await loginButton.click();

      state = await waitForLoginState(page, "email-verification");

      continue;
    }

    throw new Error(`Unexpected Wikipedia login state: ${state}`);
  }

  await expect(loggedInSpan).toHaveText(username);

  await page.context().storageState({
    path: "playwright/.auth/user.json",
  });
});
