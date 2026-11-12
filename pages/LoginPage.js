export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="wpName"]');
    this.passwordInput = page.locator('input[name="wpPassword"]');
    this.loginButton = page.locator("#wpLoginAttempt");
    this.sessionExpiredMessage = page.getByText(
      "Authentication was successful but your session has expired.",
      { exact: false },
    );
    this.additionalVerificationMessage = page.getByText(
      "An additional verification step is required. Please submit the form again.",
      { exact: false },
    );
    this.loggedUserNameSpan = page.locator("#pt-userpage-2 span");
  }

  async open() {
    await this.page.goto("/wiki/Main_Page");
  }

  async clickLogin() {
    await this.page.goto("/wiki/Special:UserLogin");
    await expect(this.usernameInput).toBeVisible();
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    const loginSuccess = this.loggedUserNameSpan;
    const loginRecovery = this.sessionExpiredMessage;
    const additionalVerification = this.additionalVerificationMessage;

    await expect(
      loginSuccess.or(loginRecovery).or(additionalVerification).first(),
    ).toBeVisible({
      timeout: 15000,
    });

    if (await this.sessionExpiredMessage.isVisible()) {
      await this.clickLogin();
    }

    if (await this.additionalVerificationMessage.isVisible()) {
      await this.loginButton.click();
    }

    await expect(this.loggedUserNameSpan).toHaveText(username, {
      timeout: 15000,
    });
  }
}
