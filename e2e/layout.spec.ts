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
