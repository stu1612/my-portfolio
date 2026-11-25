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

// Published case studies, in index order (content/case-studies).
const published = [
  { slug: "probell", name: "PROBELL" },
  { slug: "sundet", name: "SUNDET" },
];

const list = (page: Page) => page.locator("[data-index-list]:visible");
const rows = (page: Page) => list(page).locator("[data-row]");
const title = (row: ReturnType<typeof rows>) => row.locator(".index-title");

/** Scrolls a row to the centre of the list and waits for it to be selected. */
async function centre(page: Page, index: number) {
  const row = rows(page).nth(index);
  await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(row).toHaveAttribute("data-state", "selected");
  return row;
}

const dimmedOpacity = async (page: Page) =>
  page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--opacity-dimmed")
      .trim(),
  );

test.describe("project rows (mobile)", () => {
  for (const width of [375, 768]) {
    test.describe(`at ${width}px`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height: 812 });
        await page.goto("/");
      });

      test("lists the published case studies as links, in order", async ({
        page,
      }) => {
        await expect(page.getByRole("heading", { level: 1 })).toContainText(
          "Selected work",
        );
        await expect(rows(page)).toHaveCount(published.length);
        for (const [i, study] of published.entries()) {
          const link = rows(page).nth(i).getByRole("link");
          await expect(link).toHaveAttribute("href", `/work/${study.slug}`);
          await expect(title(rows(page).nth(i))).toHaveText(study.name);
          await expect(link.locator("[data-arrow]")).toHaveAttribute(
            "aria-hidden",
            "true",
          );
          await expect(link).toContainText(/\d{4}$/); // info ends with the year
        }
      });

      test("the first row starts centred and selected", async ({ page }) => {
        await expect(rows(page).first()).toHaveAttribute(
          "data-state",
          "selected",
        );
      });

      test("centring row 2 selects it, fills its title and dims the others", async ({
        page,
      }) => {
        const row = await centre(page, 1);
        // Let the 400ms colour fade finish.
        await page.waitForTimeout(500);
        const fill = await title(row).evaluate((el) => {
          const s = getComputedStyle(el);
          return { color: s.color, clip: s.backgroundClip };
        });
        expect(fill.color).toBe("rgba(0, 0, 0, 0)");
        // One value per background layer; every layer is clipped to the text.
        expect(fill.clip.split(", ").every((v) => v === "text")).toBe(true);

        const other = rows(page).first();
        await expect(other).toHaveAttribute("data-state", "dimmed");
        expect(
          Number(
            await title(other).evaluate((el) => getComputedStyle(el).opacity),
          ),
        ).toBe(Number(await dimmedOpacity(page)));
        expect(
          await other
            .locator(".type-meta")
            .evaluate((el) => getComputedStyle(el).opacity),
        ).toBe("1");
      });

      test("every title fits on one line", async ({ page }) => {
        for (const el of await rows(page).locator(".index-title").all()) {
          const fit = await el.evaluate((node) => {
            const s = getComputedStyle(node);
            return {
              height: node.getBoundingClientRect().height,
              lineHeight: parseFloat(s.lineHeight),
              overflow: node.scrollWidth - node.clientWidth,
              right: node.getBoundingClientRect().right,
            };
          });
          expect(fit.height).toBeLessThanOrEqual(fit.lineHeight * 1.2);
          expect(fit.overflow).toBeLessThanOrEqual(0);
          expect(fit.right).toBeLessThanOrEqual(width);
        }
      });

      test("the document doesn't scroll, and there is no horizontal scroll", async ({
        page,
      }) => {
        await centre(page, 1);
        const doc = await page.evaluate(() => ({
          scrollHeight: document.documentElement.scrollHeight,
          scrollWidth: document.documentElement.scrollWidth,
          innerHeight: window.innerHeight,
          innerWidth: window.innerWidth,
        }));
        expect(doc.scrollHeight).toBeLessThanOrEqual(doc.innerHeight);
        expect(doc.scrollWidth).toBeLessThanOrEqual(doc.innerWidth);
      });
    });
  }

  test("with reduced motion the selected arrow doesn't move", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const row = await centre(page, 1);
    expect(
      await row
        .locator("[data-arrow]")
        .evaluate((el) => getComputedStyle(el).transform),
    ).toBe("none");
  });

  test("without reduced motion the selected arrow nudges right", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const row = await centre(page, 1);
    await page.waitForTimeout(300);
    expect(
      await row
        .locator("[data-arrow]")
        .evaluate((el) => getComputedStyle(el).transform),
    ).toMatch(/^matrix\(1, 0, 0, 1, [1-9]/);
  });
});

const previewArea = (page: Page) => page.locator("[data-preview-area]:visible");
const preview = (page: Page, slug: string) =>
  previewArea(page).locator(`[data-preview="${slug}"]`);
const opacity = (el: ReturnType<typeof preview>) =>
  el.evaluate((node) => getComputedStyle(node).opacity);

test.describe("preview (mobile)", () => {
  for (const width of [375, 768]) {
    test.describe(`at ${width}px`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height: 812 });
        await page.goto("/");
      });

      test("shows only the selected project's screenshot", async ({ page }) => {
        await expect(preview(page, "probell")).toHaveAttribute(
          "data-shown",
          "true",
        );
        await centre(page, 1);
        await page.waitForTimeout(400); // 200ms cross-fade
        expect(await opacity(preview(page, "sundet"))).toBe("1");
        expect(await opacity(preview(page, "probell"))).toBe("0");
      });

      test("stays in place while the list scrolls", async ({ page }) => {
        const before = await previewArea(page).boundingBox();
        await centre(page, 1);
        expect(await previewArea(page).boundingBox()).toEqual(before);
      });

      test("the frame is 16:9 and inside the gutters", async ({ page }) => {
        const box = (await previewArea(page).boundingBox())!;
        expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
        expect(box.x).toBeGreaterThanOrEqual(16);
        expect(box.x + box.width).toBeLessThanOrEqual(width - 16);
      });

      test("every screenshot has alt text", async ({ page }) => {
        for (const study of published) {
          await expect(preview(page, study.slug)).toHaveAttribute("alt", /\S/);
        }
      });

      test("the shown screenshot is sharp (enough pixels for the screen)", async ({
        page,
      }) => {
        const img = preview(page, "probell");
        await expect(img).toHaveJSProperty("complete", true);
        const size = await img.evaluate((node) => ({
          natural: (node as HTMLImageElement).naturalWidth,
          rendered: node.getBoundingClientRect().width,
          dpr: window.devicePixelRatio,
        }));
        expect(size.natural).toBeGreaterThanOrEqual(size.rendered * size.dpr);
      });
    });
  }
});

test("axe: / with row 2 selected", async ({ page }) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await centre(page, 1);
  await page.waitForTimeout(500);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

/** Computed opacity and colour of every row's title and arrow. */
const rowStyles = (page: Page) =>
  list(page).evaluate((ul) =>
    [...ul.querySelectorAll("[data-row]")].map((row) => {
      const title = getComputedStyle(row.querySelector(".index-title")!);
      const arrow = getComputedStyle(row.querySelector("[data-arrow]")!);
      return {
        state: row.getAttribute("data-state"),
        titleOpacity: title.opacity,
        titleColor: title.color,
        arrowOpacity: arrow.opacity,
        arrowTransform: arrow.transform,
      };
    }),
  );

/** Tabs from the top of the page until the given row's link has focus. */
async function tabTo(page: Page, index: number) {
  const link = rows(page).nth(index).getByRole("link");
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    if (await link.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error(`Tab never reached row ${index}`);
}

test.describe("split index (desktop)", () => {
  for (const width of [1024, 1440]) {
    test.describe(`at ${width}px`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
      });

      test("at rest nothing is dimmed and the first preview shows, beside the list", async ({
        page,
      }) => {
        for (const style of await rowStyles(page)) {
          expect(style.state).toBe("idle");
          expect(style.titleOpacity).toBe("1");
        }
        await expect(preview(page, "probell")).toHaveAttribute(
          "data-shown",
          "true",
        );
        const listBox = (await list(page).boundingBox())!;
        const previewBox = (await previewArea(page).boundingBox())!;
        expect(previewBox.x).toBeGreaterThan(listBox.x + listBox.width);
        expect(previewBox.width / previewBox.height).toBeCloseTo(16 / 9, 1);
      });

      test("hovering a row and focusing it with Tab look identical", async ({
        page,
      }) => {
        await rows(page).nth(1).getByRole("link").hover();
        await expect(rows(page).nth(1)).toHaveAttribute(
          "data-state",
          "selected",
        );
        await page.waitForTimeout(500); // fades finish
        const hovered = await rowStyles(page);

        await page.goto("/");
        await page.mouse.move(0, 0);
        await tabTo(page, 1);
        await expect(rows(page).nth(1)).toHaveAttribute(
          "data-state",
          "selected",
        );
        await page.waitForTimeout(500);
        expect(await rowStyles(page)).toEqual(hovered);

        expect(hovered[1].titleColor).toBe("rgba(0, 0, 0, 0)");
        expect(Number(hovered[0].titleOpacity)).toBe(
          Number(await dimmedOpacity(page)),
        );
      });

      test("the hovered row's preview shows", async ({ page }) => {
        await rows(page).nth(1).getByRole("link").hover();
        await page.waitForTimeout(400);
        expect(await opacity(preview(page, "sundet"))).toBe("1");
        expect(await opacity(preview(page, "probell"))).toBe("0");
      });

      test("leaving the list clears the dimming and keeps the last preview", async ({
        page,
      }) => {
        await rows(page).nth(1).getByRole("link").hover();
        await expect(rows(page).nth(1)).toHaveAttribute(
          "data-state",
          "selected",
        );
        await page.mouse.move(width - 10, 890);
        await expect(rows(page).nth(1)).toHaveAttribute("data-state", "idle");
        await expect(preview(page, "sundet")).toHaveAttribute(
          "data-shown",
          "true",
        );
      });

      test("rows are separated by hairline rules", async ({ page }) => {
        const borders = await rows(page)
          .first()
          .evaluate((el) => getComputedStyle(el).borderBottomWidth);
        expect(borders).toBe("1px");
      });
    });
  }

  test("axe: / at 1440px with a row hovered", async ({ page }) => {
    const { default: AxeBuilder } = await import("@axe-core/playwright");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await rows(page).nth(1).getByRole("link").hover();
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

// The longest allowed name (9 characters, e.g. PORTFOLIO) fits one line at
// every width the index is designed for.
for (const width of [375, 768, 1024, 1440]) {
  test(`a 9-letter name fits one line at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const fit = await list(page)
      .locator(".index-title")
      .first()
      .evaluate((el) => {
        el.textContent = "PORTFOLIO";
        return {
          overflow: el.scrollWidth - el.clientWidth,
          right: el.getBoundingClientRect().right,
        };
      });
    expect(fit.overflow).toBeLessThanOrEqual(0);
    expect(fit.right).toBeLessThanOrEqual(width);
  });
}
