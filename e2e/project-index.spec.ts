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
