import { expect } from "@playwright/test";

export class PreferencesPage {
  constructor(page) {
    this.page = page;
    this.languageChanged = false;
    this.languageSearchInput = page.locator(
      ".mw-widgets-languageSelectWidget-vue-container input[role='combobox']",
    );
    this.saveButton = page.locator(
      'button[type="submit"].oo-ui-buttonElement-button',
    );
    this.languageSelect = page.locator("#mw-input-wplanguage");
  }

  async selectLanguage(languageName, languageCode) {
    if ((await this.languageSelect.inputValue()) === languageCode) {
      return;
    }

    this.languageChanged = true;
    await this.languageSearchInput.fill(languageName);

    const option = this.page.getByRole("option", {
      name: new RegExp(`^${languageCode}\\s*·`, "i"),
    });

    await expect(option).toBeVisible();
    await option.click({ force: true });
    await expect(this.languageSelect).toHaveValue(languageCode);
  }

  async saveSettings() {
    await expect(this.saveButton).toBeVisible();
    await expect(this.saveButton).toBeEnabled();
    await this.saveButton.click();
  }

  async verifyLanguage(languageCode) {
    await expect(this.languageSelect).toHaveValue(languageCode);
  }

  async getCurrentLanguage() {
    return await this.languageSelect.inputValue();
  }
  async verifyInterfaceLanguage(languageCode) {
    const searchInput = this.page.locator("#searchInput");

    const expectedPlaceholder =
      languageCode === "uk" ? "Пошук у Wikipedia" : "Search Wikipedia";

    await expect(searchInput).toHaveAttribute(
      "placeholder",
      expectedPlaceholder,
    );
  }
}
