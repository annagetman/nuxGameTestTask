import { test, expect } from "@playwright/test";
import { HeaderPage } from "../pages/HeaderPage";

test.describe("Authentication", () => {
  test("TC001 - User is logged in via storageState", async ({ page }) => {
    const headerPage = new HeaderPage(page);

    const username = process.env.WIKI_USERNAME;
    expect(username, "WIKI_USERNAME is missing").toBeTruthy();

    await page.goto("/wiki/Main_Page");

    await expect(page).toHaveURL(/Main_Page/);
    await expect(
      page.getByRole("heading", { name: "Welcome to Wikipedia" }),
    ).toBeVisible();

    await expect(headerPage.loggedUserName).toHaveText(username);
  });
});