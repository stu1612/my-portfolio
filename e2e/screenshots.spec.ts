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
