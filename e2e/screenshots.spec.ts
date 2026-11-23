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
  }
}
