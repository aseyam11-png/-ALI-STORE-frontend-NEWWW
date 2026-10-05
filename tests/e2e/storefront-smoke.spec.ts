import { expect, test } from "@playwright/test";

test.describe("ALI STORE storefront", () => {
  test("loads the public homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ALI STORE/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("does not expose an unhandled client error on first load", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/");
    expect(consoleErrors).toEqual([]);
  });
});
