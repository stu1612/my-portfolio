import { expect, test, type Page } from "@playwright/test";
import { lightRoutes } from "./routes";

const widths = [375, 768, 1440];

// tokens.css: --surface in each theme.
const DARK_SURFACE = "rgb(21, 19, 26)";
const LIGHT_SURFACE = "rgb(243, 238, 231)";

// With cacheComponents, Next keeps the previous route in the DOM (hidden) after
// a client navigation, so always target the visible shell.
const main = (page: Page) => page.locator("main:visible");
const shell = (page: Page) => main(page).locator("..");

const shellBackground = (page: Page) =>
  shell(page).evaluate((el) => getComputedStyle(el).backgroundColor);

test.describe("route-based themes", () => {
  test("the homepage is dark", async ({ page }) => {
    await page.goto("/");
    await expect(shell(page)).toHaveAttribute("data-theme", "dark");
    expect(await shellBackground(page)).toBe(DARK_SURFACE);
  });

  for (const route of lightRoutes) {
    test(`${route} is light`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('[data-theme="dark"]')).toHaveCount(0);
      expect(await shellBackground(page)).toBe(LIGHT_SURFACE);
    });
  }

  test("a client-side navigation from / to /about switches theme without a reload", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => {
      (window as unknown as { __noReload: boolean }).__noReload = true;
    });
    await page.evaluate(() => {
      const next = (
        window as unknown as { next: { router: { push(href: string): void } } }
      ).next;
      next.router.push("/about");
    });
    await expect(page).toHaveURL("/about");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("About");
    expect(await shellBackground(page)).toBe(LIGHT_SURFACE);
    expect(
      await page.evaluate(
        () => (window as unknown as { __noReload?: boolean }).__noReload,
      ),
    ).toBe(true);
  });
});

test.describe("page frame", () => {
  for (const width of widths) {
    test(`the homepage is a fixed frame at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");

      const doc = await page.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
      }));
      expect(doc.scrollHeight).toBeLessThanOrEqual(doc.innerHeight);

      const overflowY = await main(page).evaluate(
        (el) => getComputedStyle(el).overflowY,
      );
      expect(overflowY).toBe("auto");

      const footer = await page.locator("footer:visible").boundingBox();
      expect(footer).not.toBeNull();
      expect(footer!.y + footer!.height).toBeCloseTo(800, 0);
    });
  }

  test("the homepage scrolls inside <main> when content is tall", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 600 });
    await page.goto("/");
    await main(page).evaluate((main) => {
      const filler = document.createElement("div");
      filler.style.minHeight = "3000px"; // flex items with no content shrink to 0
      main.appendChild(filler);
    });

    const result = await page.evaluate(() => {
      const main = document.querySelector("main")!;
      main.scrollTop = 500;
      return {
        mainScrollTop: main.scrollTop,
        docScrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
      };
    });
    expect(result.mainScrollTop).toBe(500);
    expect(result.docScrollHeight).toBeLessThanOrEqual(result.innerHeight);

    const footer = await page.locator("footer:visible").boundingBox();
    expect(footer!.y + footer!.height).toBeCloseTo(600, 0);
  });

  test("other pages scroll the document, footer after the content", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 600 });
    await page.goto("/about");
    await main(page).evaluate((main) => {
      const filler = document.createElement("div");
      filler.style.minHeight = "3000px"; // flex items with no content shrink to 0
      main.appendChild(filler);
    });

    const overflowY = await main(page).evaluate(
      (el) => getComputedStyle(el).overflowY,
    );
    expect(overflowY).toBe("visible");

    const doc = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(doc.scrollHeight).toBeGreaterThan(doc.innerHeight);

    const mainBox = await main(page).boundingBox();
    const footerBox = await page.locator("footer:visible").boundingBox();
    expect(footerBox!.y).toBeGreaterThanOrEqual(
      mainBox!.y + mainBox!.height - 1,
    );
  });
});

test("the footer is the copyright line only", async ({ page }) => {
  await page.goto("/about");
  const footer = page.locator("footer:visible");
  await expect(footer).toHaveText("© 2026 Stu Bolderson");
  await expect(footer.getByRole("link")).toHaveCount(0);
});

test.describe("top bar", () => {
  const menuButton = (page: Page) =>
    page.locator("header:visible").getByRole("button", { name: "Menu" });

  test("shows the name and the live Lund time at 1440px", async ({ page }) => {
    // 13:05 UTC in January is 14:05 in Lund.
    await page.clock.setFixedTime(new Date("2026-01-15T13:05:00Z"));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");

    const header = page.locator("header:visible");
    await expect(
      header.getByRole("link", { name: "Stu Bolderson" }),
    ).toBeVisible();
    const status = header.getByTestId("availability");
    await expect(status).toBeVisible();
    await expect(status).toHaveText("Lund 14:05 · Open to work");
    // Shown uppercase, as the meta style requires.
    expect(await status.evaluate((el) => (el as HTMLElement).innerText)).toBe(
      "LUND 14:05 · OPEN TO WORK",
    );
  });

  test("the clock ticks over on the minute", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-01-15T13:05:30Z") });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");
    const status = page.locator("header:visible").getByTestId("availability");
    await expect(status).toContainText("14:05");
    await page.clock.runFor(31_000);
    await expect(status).toContainText("14:06");
  });

  test("the status is hidden at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    await expect(
      page.locator("header:visible").getByTestId("availability"),
    ).toBeHidden();
    await expect(menuButton(page)).toBeVisible();
  });

  for (const width of widths) {
    test(`no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const route of ["/", ...lightRoutes]) {
        await page.goto(route);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow, route).toBeLessThanOrEqual(0);
      }
    });
  }

  test("Tab reaches the skip link first, and it moves focus to <main>", async ({
    page,
  }) => {
    await page.goto("/about");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(main(page)).toBeFocused();
  });

  test("the menu button shows the focus ring on keyboard focus", async ({
    page,
  }) => {
    await page.goto("/about");
    const button = menuButton(page);
    await page.keyboard.press("Tab"); // skip link
    await page.keyboard.press("Tab"); // name
    await page.keyboard.press("Tab"); // menu button
    await expect(button).toBeFocused();
    const ring = await button.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        style: s.outlineStyle,
        width: s.outlineWidth,
        offset: s.outlineOffset,
        color: s.outlineColor,
      };
    });
    // tokens.css: light --accent is #a8431f.
    expect(ring).toEqual({
      style: "solid",
      width: "2px",
      offset: "3px",
      color: "rgb(168, 67, 31)",
    });
  });

  test("hover and keyboard focus give the menu lines the same scale", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" }); // no transition to wait for
    await page.goto("/about");
    const button = menuButton(page);
    const scales = () =>
      button
        .locator("[data-line]")
        .evaluateAll((lines) => lines.map((l) => getComputedStyle(l).scale));

    const resting = await scales();
    await button.hover();
    const hovered = await scales();
    await page.mouse.move(0, 400);
    expect(await scales()).toEqual(resting);

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    const focused = await scales();

    expect(resting).not.toEqual(hovered);
    expect(focused).toEqual(hovered);
  });
});
