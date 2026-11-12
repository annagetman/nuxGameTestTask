export class HeaderPage {
  constructor(page) {
    this.page = page;
    this.loggedUserName = page.locator("#pt-userpage-2 span");
    this.userSettingsDropdown = page.locator(
      "#vector-user-links-dropdown-checkbox",
    );
  }

  async openUserMenu() {
    if (!(await this.userSettingsDropdown.isChecked())) {
      await this.userSettingsDropdown.check({ force: true });
    }
  }

  async openPreferences() {
    const preferencesLink = this.page.locator(
      "ul.vector-menu-content-list li#pt-preferences a",
    );

    if (!(await preferencesLink.isVisible())) {
      await this.openUserMenu();
    }

    const href = await preferencesLink.getAttribute("href");
    const stickyPreferencesLink = this.page.locator(
      `.vector-sticky-header-container a[href="${href}"]`,
    );

    if (href && await stickyPreferencesLink.isVisible()) {
      await stickyPreferencesLink.click();
    } else {
      await preferencesLink.click();
    }
  }
}