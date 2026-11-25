import { test } from "@playwright/test";
import { routes } from "./routes";

const widths = [375, 768, 1440];
const reducedMotion = process.env.REDUCED_MOTION === "1";

test.use({ reducedMotion: reducedMotion ? "reduce" : "no-preference" });

for (const route of routes) {
  const slug = route === "/" ? "home" : route.slice(1).replace(/\//g, "-");

  for (const width of widths) {
    test(`screenshot: ${route} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await page.screenshot({
        path: `test-results/screenshots/${slug}-${width}${reducedMotion ? "-reduced" : ""}.png`,
        fullPage: true,
      });
    });

    test(`screenshot: ${route} at ${width}px, menu open`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await page
        .locator("header:visible")
        .getByRole("button", { name: "Menu", exact: true })
        .click();
      // Let the 200ms fade finish (instant under reduced motion).
      await page.waitForTimeout(400);
      await page.screenshot({
        path: `test-results/screenshots/${slug}-${width}-menu${reducedMotion ? "-reduced" : ""}.png`,
      });
    });
  }
}

// Project index (plan 04): row 2 centred on mobile.
for (const width of [375, 768]) {
  test(`screenshot: / at ${width}px, row 2 centred`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    await page.goto("/");
    const row = page.locator("[data-index-list]:visible [data-row]").nth(1);
    await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForFunction(
      (el) => el?.getAttribute("data-state") === "selected",
      await row.elementHandle(),
    );
    // Let the 400ms title fade and 200ms cross-fade finish.
    await page.waitForTimeout(600);
    await page.screenshot({
      path: `test-results/screenshots/home-${width}-row2${reducedMotion ? "-reduced" : ""}.png`,
    });
  });
}

// Project index (plan 04): split index at rest and with row 2 hovered.
for (const width of [1024, 1440]) {
  test(`screenshot: / at ${width}px, row 2 hovered`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const link = page
      .locator("[data-index-list]:visible [data-row]")
      .nth(1)
      .getByRole("link");
    await link.hover();
    // Let the 400ms title fade and 200ms cross-fade finish.
    await page.waitForTimeout(600);
    await page.screenshot({
      path: `test-results/screenshots/home-${width}-row2${reducedMotion ? "-reduced" : ""}.png`,
    });
  });

  test(`screenshot: / at ${width}px, at rest`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `test-results/screenshots/home-${width}-rest${reducedMotion ? "-reduced" : ""}.png`,
    });
  });
}
