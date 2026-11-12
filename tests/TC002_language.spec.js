import { test, expect } from "@playwright/test";
import { HeaderPage } from "../pages/HeaderPage";
import { PreferencesPage } from "../pages/PreferencesPage";

test.describe("Wikipedia interface language", () => {
  test("TC002 - Authenticated user can change interface language", async ({
    page,
  }) => {
    const headerPage = new HeaderPage(page);
    const preferencesPage = new PreferencesPage(page);

    await page.goto("/wiki/Main_Page");
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
    await page.goto("/wiki/Main_Page");
    await preferencesPage.verifyInterfaceLanguage(targetLanguage);

    await headerPage.openPreferences();
    await preferencesPage.verifyLanguage(targetLanguage);
  });
});