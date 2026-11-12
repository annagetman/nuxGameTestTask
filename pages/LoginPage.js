
import { expect } from "@playwright/test";

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="wpName"]');
    this.passwordInput = page.locator('input[name="wpPassword"]');
    this.loginButton = page.locator("#wpLoginAttempt");
    this.sessionExpiredMessage = page.getByText(
      "Authentication was successful but your session has expired.",
      { exact: false }
    );
    this.loggedUserNameSpan = page.locator("#pt-userpage-2 span");
  }

  async open() {
    await this.page.goto("/wiki/Main_Page");
  }

  async clickLogin() {
    const invalidReturnUrlToken = this.page.getByText(
      "invalid returnUrlToken",
      { exact: true },
    );

    for (let attempt = 0; attempt < 2; attempt++) {
      await this.page.goto("/wiki/Special:UserLogin");

      if (await invalidReturnUrlToken.isVisible()) {
        continue;
      }

      await expect(this.usernameInput).toBeVisible({ timeout: 15000 });
      return;
    }

    throw new Error(
      "Wikipedia rejected the login redirect with invalid returnUrlToken after one retry.",
    );
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    const loginSuccess = this.loggedUserNameSpan;
    const loginRecovery = this.sessionExpiredMessage;

    await expect(loginSuccess.or(loginRecovery).first()).toBeVisible({
      timeout: 15000,
    });

    if (await this.sessionExpiredMessage.isVisible()) {
      await this.clickLogin();
    }

    await expect(this.loggedUserNameSpan).toHaveText(username, {
      timeout: 15000,
    });
  }
}