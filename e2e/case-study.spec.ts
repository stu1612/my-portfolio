import { expect, test, type Locator, type Page } from "@playwright/test";

// With cacheComponents, Next can keep the previous route in the DOM (hidden),
// so always target the visible shell.
const main = (page: Page) => page.locator("main:visible");
const header = (page: Page) => main(page).locator("header");
const article = (page: Page) => main(page).locator("article");
const cover = (page: Page) => main(page).locator("img").first();
const moreWork = (page: Page) =>
  main(page).getByRole("navigation", { name: "More work" });

const box = async (locator: Locator) => (await locator.boundingBox())!;
const centre = (b: { x: number; width: number }) => b.x + b.width / 2;

test.describe("header", () => {
  test("one h1, the deck, the facts and the live site link", async ({
    page,
  }) => {
    await page.goto("/work/probell");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(header(page)).toContainText(
      "Case study · Probell Nutrition · 2026",
      { ignoreCase: true },
    );
    await expect(header(page)).toContainText(
      "A Swedish supplement brand launching in the US",
    );
    const facts = header(page).locator("dl");
    for (const label of ["Role", "Stack", "Year", "Read"]) {
      await expect(facts.locator("dt", { hasText: label })).toHaveCount(1);
    }
    await expect(facts).toContainText("Design and development (freelance)");
    await expect(facts).toContainText("Astro · Vercel · HubSpot · TypeScript");
    await expect(
      header(page).getByRole("link", { name: "Live site" }),
    ).toHaveAttribute("href", "https://probellnutrition.com");
  });

  test("no live site link without a liveUrl", async ({ page }) => {
    await page.goto("/work/sundet");
    await expect(
      header(page).getByRole("link", { name: "Live site" }),
    ).toHaveCount(0);
  });

  test("the cover has alt text", async ({ page }) => {
    await page.goto("/work/probell");
    await expect(cover(page)).toHaveAttribute(
      "alt",
      /Probell Nutrition homepage/,
    );
  });

  test("the page title names the client", async ({ page }) => {
    await page.goto("/work/probell");
    await expect(page).toHaveTitle("Probell Nutrition · Stu Bolderson");
  });
});

test.describe("layout at 1440px", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the reading column is centred and about 68ch wide", async ({
    page,
  }) => {
    await page.goto("/work/probell");
    const viewport = page.viewportSize()!;
    for (const part of [
      header(page),
      article(page).locator("> p").first(),
      moreWork(page),
    ]) {
      const b = await box(part);
      expect(b.width).toBeLessThanOrEqual(700);
      expect(Math.abs(centre(b) - viewport.width / 2)).toBeLessThanOrEqual(1);
    }
  });

  test("the cover breaks out wider than the column, on the same centre", async ({
    page,
  }) => {
    await page.goto("/work/probell");
    const column = await box(header(page));
    const wide = await box(main(page).locator("div:has(> img)").first());
    expect(wide.width).toBeGreaterThan(column.width);
    expect(wide.width).toBeLessThanOrEqual(1024);
    expect(Math.abs(centre(wide) - centre(column))).toBeLessThanOrEqual(1);
  });
});

test.describe("layout at 375px", () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test("no horizontal scroll", async ({ page }) => {
    await page.goto("/work/probell");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test("a long code line scrolls inside its frame, not the page", async ({
    page,
  }) => {
    await page.goto("/work/probell");
    // No case study has code yet, so append a frame with the same classes
    // the MDX `pre` component renders (components.test.tsx covers its markup).
    await article(page).evaluate((el) => {
      el.insertAdjacentHTML(
        "beforeend",
        `<div class="frame overflow-hidden"><pre tabindex="0" class="text-code focus-ring overflow-x-auto p-4 font-mono"><code>${"const value = 1; ".repeat(30)}</code></pre></div>`,
      );
    });
    const pre = article(page).locator("pre").last();
    const scrolls = await pre.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(scrolls).toBe(true);
    const pageOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(pageOverflow).toBe(false);
  });
});

test.describe("body", () => {
  test("the callouts render with their labels", async ({ page }) => {
    await page.goto("/work/probell");
    const callouts = article(page).locator("aside");
    await expect(callouts).toHaveCount(4);
    await expect(
      article(page).locator('aside[aria-label="Decision"]'),
    ).toHaveCount(2);
    await expect(
      article(page).locator('aside[aria-label="What went wrong"]'),
    ).toHaveCount(1);
    await expect(
      article(page).locator('aside[aria-label="AI note"]'),
    ).toHaveCount(1);
    await expect(callouts.first()).toContainText("Decision", {
      ignoreCase: true,
    });
  });

  test("sections start at h2", async ({ page }) => {
    await page.goto("/work/probell");
    await expect(article(page).locator("h1")).toHaveCount(0);
    await expect(article(page).locator("h2").first()).toHaveText("The problem");
  });
});

test.describe("ending", () => {
  test("the next project link follows index order and wraps", async ({
    page,
  }) => {
    await page.goto("/work/probell");
    const next = () =>
      moreWork(page)
        .getByRole("link")
        .filter({ hasText: /Next project/i });
    await expect(next()).toHaveAttribute("href", "/work/sundet");

    await page.goto("/work/sundet");
    await expect(next()).toHaveAttribute("href", "/work/probell");
  });

  test("← Index goes home", async ({ page }) => {
    await page.goto("/work/probell");
    await expect(
      moreWork(page).getByRole("link", { name: "Index" }),
    ).toHaveAttribute("href", "/");
  });
});

test.describe("hover and focus parity", () => {
  const targets: [string, (page: Page) => Locator][] = [
    [
      "next project",
      (page) =>
        moreWork(page)
          .getByRole("link")
          .filter({ hasText: /Next project/i }),
    ],
    ["← Index", (page) => moreWork(page).getByRole("link", { name: "Index" })],
    [
      "Live site",
      (page) => header(page).getByRole("link", { name: "Live site" }),
    ],
  ];

  for (const [name, target] of targets) {
    test(`${name}: hover and keyboard focus look the same`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" }); // no transitions
      await page.goto("/work/probell");
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

  test("the next project arrow nudges on hover, not under reduced motion", async ({
    page,
  }) => {
    await page.goto("/work/probell");
    const link = moreWork(page)
      .getByRole("link")
      .filter({ hasText: /Next project/i });
    const arrow = link.locator("[aria-hidden]");
    await link.hover();
    await expect
      .poll(() => arrow.evaluate((el) => getComputedStyle(el).translate))
      .not.toBe("none");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await link.hover();
    expect(await arrow.evaluate((el) => getComputedStyle(el).translate)).toBe(
      "none",
    );
  });
});

test.describe("unknown slugs", () => {
  // Cache Components sends the prerendered shell first, so a slug resolved at
  // request time keeps HTTP 200 (Stu accepted this, plan 05 step 4). The page
  // must still be the not-found page, and never indexed.
  for (const slug of ["nope", "_empty"]) {
    test(`/work/${slug} shows the not-found page with noindex`, async ({
      page,
    }) => {
      await page.goto(`/work/${slug}`);
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

test("every homepage row lands on a case study", async ({ page }) => {
  await page.goto("/");
  const hrefs = await main(page)
    .locator('a[href^="/work/"]')
    .evaluateAll((links) => links.map((a) => a.getAttribute("href")!));
  expect(hrefs.length).toBeGreaterThan(0);
  // The status alone can't tell (unknown slugs also answer 200), so check
  // that the case study itself rendered.
  for (const href of hrefs) {
    const response = await page.goto(href);
    expect(response?.status(), href).toBe(200);
    await expect(article(page), href).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 }), href).toHaveCount(1);
  }
});
