import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { HeaderPage } from "../pages/HeaderPage";

test.describe("Authentication", () => {
  test("Login with valid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const headerPage = new HeaderPage(page);
    const username = process.env.WIKI_USERNAME;
    const password = process.env.WIKI_PASSWORD;

    expect(username, "WIKI_USERNAME is missing").toBeTruthy();
    expect(password, "WIKI_PASSWORD is missing").toBeTruthy();

    await loginPage.open();
    await expect(page).toHaveURL(/Main_Page/);
    await expect(
      page.getByRole("heading", { name: "Welcome to Wikipedia" })
    ).toBeVisible();
    await loginPage.clickLogin();
    await loginPage.login(username, password);
    await expect(headerPage.loggedUserName).toHaveText(username);
    await expect(page).toHaveURL(/Main_Page/);
  });
});
