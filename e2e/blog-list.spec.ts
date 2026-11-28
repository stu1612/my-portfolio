import { expect, test, type Page } from "@playwright/test";

// With cacheComponents, Next can keep the previous route in the DOM (hidden),
// so always target the visible shell.
const main = (page: Page) => page.locator("main:visible");
const rows = (page: Page) => main(page).locator("ol > li > a");

test.describe("blog list", () => {
  test("one h1, and the kicker counts the posts", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Blog");
    const count = await rows(page).count();
    expect(count).toBeGreaterThan(0);
    await expect(main(page).locator("header")).toContainText(
      `Blog · ${count} ${count === 1 ? "post" : "posts"}`,
      { ignoreCase: true },
    );
  });

  test("posts are newest first, each linking to its page with an ISO date", async ({
    page,
  }) => {
    await page.goto("/blog");
    const dates = await rows(page)
      .locator("time")
      .evaluateAll((els) => els.map((el) => el.getAttribute("datetime")!));
    expect(dates.length).toBeGreaterThan(1);
    expect(dates).toEqual([...dates].sort().reverse());
    await expect(rows(page).first()).toHaveAttribute(
      "href",
      "/blog/plans-and-an-agent",
    );
    await expect(rows(page).first().locator("time")).toHaveText("28 Nov 2026", {
      ignoreCase: true,
    });
  });

  test("each row shows its description and read time", async ({ page }) => {
    await page.goto("/blog");
    const first = rows(page).first();
    await expect(first).toContainText(
      "Every feature starts as a written plan I approve",
    );
    await expect(first).toContainText(/\d+ min · Agents · Process/i);
  });

  test("a row opens its post", async ({ page }) => {
    await page.goto("/blog");
    await rows(page).first().click();
    await expect(page).toHaveURL("/blog/plans-and-an-agent");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Building this site with plans and an agent",
    );
  });

  test("← Index goes home", async ({ page }) => {
    await page.goto("/blog");
    await expect(
      main(page).getByRole("link", { name: "Index" }),
    ).toHaveAttribute("href", "/");
  });
});

test.describe("date placement", () => {
  test("at 375px the date sits above the title", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/blog");
    const row = rows(page).first();
    const date = (await row.locator("time").boundingBox())!;
    const title = (await row.locator(".text-h3").boundingBox())!;
    expect(date.y + date.height).toBeLessThanOrEqual(title.y);
    expect(Math.abs(date.x - title.x)).toBeLessThanOrEqual(1);
  });

  for (const width of [768, 1440]) {
    test(`at ${width}px the date sits beside the title`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/blog");
      const row = rows(page).first();
      const date = (await row.locator("time").boundingBox())!;
      const title = (await row.locator(".text-h3").boundingBox())!;
      expect(date.x + date.width).toBeLessThan(title.x);
      expect(date.y).toBeLessThan(title.y + title.height);
    });
  }

  test("no horizontal scroll at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/blog");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});

test.describe("hover and focus parity", () => {
  const look = (page: Page) =>
    rows(page)
      .first()
      .evaluate((el) => ({
        title: getComputedStyle(el.querySelector(".text-h3")!).color,
        arrow: getComputedStyle(el.querySelector("[aria-hidden]")!).translate,
      }));

  test("a row looks the same on hover and keyboard focus", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" }); // no transitions
    await page.goto("/blog");
    const resting = await look(page);
    await rows(page).first().hover();
    const hovered = await look(page);
    await page.mouse.move(0, 0);

    // A key press first, so programmatic focus counts as keyboard focus.
    await page.keyboard.press("Shift");
    await rows(page).first().focus();
    const focused = await look(page);

    expect(hovered).not.toEqual(resting);
    expect(focused).toEqual(hovered);
  });

  test("the arrow nudges on hover, not under reduced motion", async ({
    page,
  }) => {
    await page.goto("/blog");
    const arrow = rows(page).first().locator("[aria-hidden]");
    await rows(page).first().hover();
    await expect
      .poll(() => arrow.evaluate((el) => getComputedStyle(el).translate))
      .not.toBe("none");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await rows(page).first().hover();
    expect(await arrow.evaluate((el) => getComputedStyle(el).translate)).toBe(
      "none",
    );
  });
});
