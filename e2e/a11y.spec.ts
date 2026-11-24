import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { routes } from "./routes";

for (const route of routes) {
  test(`axe: ${route}`, async ({ page }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

// The full-screen menu, open, in both themes.
for (const route of ["/", "/about"]) {
  test(`axe: ${route} with the menu open`, async ({ page }) => {
    await page.goto(route);
    await page
      .locator("header:visible")
      .getByRole("button", { name: "Menu", exact: true })
      .click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
