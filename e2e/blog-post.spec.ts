import { expect, test, type Locator, type Page } from "@playwright/test";

// The two seeded posts (plan 05b, Decision 6), newest first.
const NEWEST = "/blog/plans-and-an-agent";
const OLDEST = "/blog/content-that-fails-the-build";

// With cacheComponents, Next can keep the previous route in the DOM (hidden),
// so always target the visible shell.
const main = (page: Page) => page.locator("main:visible");
const header = (page: Page) => main(page).locator("header");
const article = (page: Page) => main(page).locator("article");
const morePosts = (page: Page) =>
  main(page).getByRole("navigation", { name: "More posts" });
const olderLink = (page: Page) =>
  morePosts(page)
    .getByRole("link")
    .filter({ hasText: /Older post/i });
const allPosts = (page: Page) =>
  morePosts(page).getByRole("link", { name: "All posts" });

const box = async (locator: Locator) => (await locator.boundingBox())!;
const centre = (b: { x: number; width: number }) => b.x + b.width / 2;

test.describe("header", () => {
  test("one h1, the kicker with date and read time, and the deck", async ({
    page,
  }) => {
    await page.goto(NEWEST);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Building this site with plans and an agent",
    );
    await expect(header(page)).toContainText(
      /Blog · 28 Nov 2026 · \d+ min read/i,
    );
    await expect(header(page)).toContainText(
      "Every feature starts as a written plan I approve",
    );
  });

  test("the tags line, and Updated only when the post has it", async ({
    page,
  }) => {
    await page.goto(NEWEST);
    await expect(header(page)).toContainText("Agents · Process", {
      ignoreCase: true,
    });
    await expect(header(page)).not.toContainText("Updated", {
      ignoreCase: true,
    });

    await page.goto(OLDEST);
    await expect(header(page)).toContainText("Next.js · MDX", {
      ignoreCase: true,
    });
    await expect(header(page)).toContainText("Updated 28 Nov 2026", {
      ignoreCase: true,
    });
  });

  test("dates carry the ISO date for machines", async ({ page }) => {
    await page.goto(OLDEST);
    await expect(header(page).locator("time")).toHaveAttribute(
      "datetime",
      "2026-11-28",
    );
    await page.goto(NEWEST);
    await expect(morePosts(page).locator("time")).toHaveAttribute(
      "datetime",
      "2026-11-24",
    );
  });

  test("the page title is the post title", async ({ page }) => {
    await page.goto(NEWEST);
    await expect(page).toHaveTitle(
      "Building this site with plans and an agent · Stu Bolderson",
    );
  });

  test("the Menu marks Blog as the current page", async ({ page }) => {
    await page.goto(NEWEST);
    await page
      .locator("header:visible")
      .getByRole("button", { name: "Menu", exact: true })
      .click();
    const nav = page
      .getByRole("dialog", { name: "Menu" })
      .getByRole("navigation", { name: "Primary" });
    await expect(nav.locator('[aria-current="page"]')).toHaveText(["Blog"]);
  });
});

test.describe("body", () => {
  test("sections start at h2, with the code frame and its filename", async ({
    page,
  }) => {
    await page.goto(NEWEST);
    await expect(article(page).locator("h1")).toHaveCount(0);
    await expect(article(page).locator("h2").first()).toHaveText("The setup");
    await expect(article(page)).toContainText("prompts/05b-blog.md");
    await expect(article(page).locator("pre")).toHaveCount(1);
  });
});

test.describe("layout at 1440px", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the reading column is centred and no wider than the case study column", async ({
    page,
  }) => {
    await page.goto(NEWEST);
    const viewport = page.viewportSize()!;
    for (const part of [
      header(page),
      article(page).locator("> p").first(),
      morePosts(page),
    ]) {
      const b = await box(part);
      expect(b.width).toBeLessThanOrEqual(700);
      expect(Math.abs(centre(b) - viewport.width / 2)).toBeLessThanOrEqual(1);
    }
  });
});

test.describe("layout at 375px", () => {
  test.use({ viewport: { width: 375, height: 800 } });

  for (const route of [NEWEST, OLDEST]) {
    test(`${route}: no horizontal scroll`, async ({ page }) => {
      await page.goto(route);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    });
  }
});

test.describe("ending", () => {
  test("the newest post links to the next older one", async ({ page }) => {
    await page.goto(NEWEST);
    await expect(olderLink(page)).toHaveAttribute("href", OLDEST);
    await expect(olderLink(page)).toContainText("Older post · 24 Nov 2026", {
      ignoreCase: true,
    });
    await expect(olderLink(page)).toContainText(
      "Content that fails the build, not the page",
    );
  });

  test("the oldest post has only ← All posts, which goes to /blog", async ({
    page,
  }) => {
    await page.goto(OLDEST);
    await expect(olderLink(page)).toHaveCount(0);
    await expect(morePosts(page).getByRole("link")).toHaveCount(1);
    await expect(allPosts(page)).toHaveAttribute("href", "/blog");
  });
});

test.describe("hover and focus parity", () => {
  const targets: [string, (page: Page) => Locator][] = [
    ["older post", olderLink],
    ["← All posts", allPosts],
  ];

  for (const [name, target] of targets) {
    test(`${name}: hover and keyboard focus look the same`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" }); // no transitions
      await page.goto(NEWEST);
      const link = target(page);
      const look = () =>
        link.evaluate((el) => {
          const arrow = el.querySelector("[aria-hidden]");
          return {
            color: getComputedStyle(el).color,
            arrow: arrow ? getComputedStyle(arrow).translate : null,
          };
        });

      const resting = await look();
      await link.hover();
      const hovered = await look();
      await page.mouse.move(0, 0);

      // A key press first, so programmatic focus counts as keyboard focus.
      await page.keyboard.press("Shift");
      await link.focus();
      const focused = await look();

      expect(hovered).not.toEqual(resting);
      expect(focused).toEqual(hovered);
    });
  }
});

test.describe("unknown slugs", () => {
  // As /work/<slug> (plan 05): the not-found page with noindex, HTTP 200
  // under Cache Components.
  for (const slug of ["nope", "_empty"]) {
    test(`/blog/${slug} shows the not-found page with noindex`, async ({
      page,
    }) => {
      await page.goto(`/blog/${slug}`);
      await expect(
        page.getByText("This page could not be found."),
      ).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
      await expect(main(page).locator("article")).toHaveCount(0);
    });
  }
});
