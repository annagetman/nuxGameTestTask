
import { test, expect } from "@playwright/test";
import { HeaderPage } from "../pages/HeaderPage";
import { PreferencesPage } from "../pages/PreferencesPage";

const LANGUAGES = {
  en: {
    code: "en",
    name: "English",
  },
  uk: {
    code: "uk",
    name: "Українська",
  },
};

test.describe("Wikipedia interface language", () => {
  test("TC001 - Authenticated user can change interface language", async ({
    page,
  }) => {
    const headerPage = new HeaderPage(page);
    const preferencesPage = new PreferencesPage(page);

    let targetLanguage;

    await test.step("Open Wikipedia as an authenticated user", async () => {
      await page.goto("/wiki/Main_Page");
      await expect(page).toHaveURL(/Main_Page/);
    });

    await test.step("Open Preferences and check the current language", async () => {
      await headerPage.openPreferences();
      await expect(page).toHaveURL(/Special:Preferences/);
    });

    await test.step("Select a language different from the current one", async () => {
      const currentLanguage = await preferencesPage.getCurrentLanguage();

      targetLanguage =
        currentLanguage === LANGUAGES.uk.code
          ? LANGUAGES.en
          : LANGUAGES.uk;

      await preferencesPage.selectLanguage(
        targetLanguage.name,
        targetLanguage.code
      );
    });

    await test.step("Save language settings", async () => {
      await preferencesPage.saveSettings();
    });

    await test.step("Verify the selected language", async () => {
      await preferencesPage.verifyLanguage(targetLanguage.code);
    });

    await test.step("Verify the language is applied on the main page", async () => {
      await page.goto("/wiki/Main_Page");
      await preferencesPage.verifyInterfaceLanguage(targetLanguage.code);
    });

    await test.step("Verify the language setting persists", async () => {
      await headerPage.openPreferences();
      await preferencesPage.verifyLanguage(targetLanguage.code);
    });
  });
});
