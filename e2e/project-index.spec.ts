import { expect, test, type Page } from "@playwright/test";
import { lightRoutes } from "./routes";

// With cacheComponents, Next can keep the previous route in the DOM (hidden),
// so always target the visible shell.
const main = (page: Page) => page.locator("main:visible");
const stage = (page: Page) => page.locator("[data-stage]:visible");

test.describe("stage", () => {
  test("the homepage has a decorative three-field gradient stage", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(stage(page)).toHaveCount(1);
    await expect(stage(page)).toHaveAttribute("aria-hidden", "true");
    const image = await stage(page).evaluate(
      (el) => getComputedStyle(el).backgroundImage,
    );
    expect(image.match(/radial-gradient/g)).toHaveLength(3);
  });

  test("the stage fills the frame, behind the bar and footer", async ({
    page,
  }) => {
    await page.goto("/");
    const viewport = page.viewportSize()!;
    const box = (await stage(page).boundingBox())!;
    expect(box).toMatchObject({ x: 0, y: 0, ...viewport });

    const shell = main(page).locator("..");
    for (const part of [
      shell.locator("> header"),
      shell.locator("> footer"),
      main(page),
    ]) {
      expect(
        await part.evaluate((el) => getComputedStyle(el).backgroundColor),
      ).toBe("rgba(0, 0, 0, 0)");
    }
  });

  for (const route of lightRoutes) {
    test(`${route} has no stage`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("[data-stage]")).toHaveCount(0);
    });
  }
});
