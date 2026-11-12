import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { HeaderPage } from "../pages/HeaderPage";
import { PreferencesPage } from "../pages/PreferencesPage";

test.describe("Wikipedia interface language", () => {
  test("TC002 - Authenticated user can change interface language", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const headerPage = new HeaderPage(page);
    const preferencesPage = new PreferencesPage(page);

    const username = process.env.WIKI_USERNAME;
    const password = process.env.WIKI_PASSWORD;

    expect(username, "WIKI_USERNAME is missing").toBeTruthy();
    expect(password, "WIKI_PASSWORD is missing").toBeTruthy();

    await loginPage.open();
    await loginPage.clickLogin();
    await loginPage.login(username, password);

    await expect(page).toHaveURL(/Main_Page/);

    await headerPage.openPreferences();
    await expect(page).toHaveURL(/Special:Preferences/);

    const currentLanguage = await preferencesPage.getCurrentLanguage();

    const targetLanguage = currentLanguage === "uk" ? "en" : "uk";
    const targetLanguageName =
      targetLanguage === "uk" ? "Українська" : "English";

    await preferencesPage.selectLanguage(targetLanguageName, targetLanguage);
    await preferencesPage.saveSettings();

    await preferencesPage.verifyLanguage(targetLanguage);
    await expect(page.locator("html")).toHaveAttribute("lang", targetLanguage);

    await page.goto("/wiki/Main_Page");

    const expectedHeading =
      targetLanguage === "uk" ? "Головна сторінка" : "Main Page";

    await expect(page.locator("#firstHeading")).toHaveText(expectedHeading);
  });
});
