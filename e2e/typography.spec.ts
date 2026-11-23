import { expect, test } from "@playwright/test";

test.describe("typography on the placeholder page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
  });

  test("h1 is Archivo 800", async ({ page }) => {
    const style = await page
      .getByRole("heading", { level: 1 })
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { family: s.fontFamily, weight: s.fontWeight };
      });
    expect(style.family).toMatch(/^Archivo/);
    expect(style.weight).toBe("800");
  });

  test("body text is Archivo 400", async ({ page }) => {
    const style = await page
      .getByText("Full-stack developer, Copenhagen / Skåne")
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return { family: s.fontFamily, weight: s.fontWeight };
      });
    expect(style.family).toMatch(/^Archivo/);
    expect(style.weight).toBe("400");
  });

  test("meta line is tracked uppercase Plex Mono 500", async ({ page }) => {
    const style = await page.getByText("Site in progress").evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        family: s.fontFamily,
        weight: s.fontWeight,
        transform: s.textTransform,
        letterSpacing: s.letterSpacing,
      };
    });
    expect(style.family).toMatch(/^"?IBM Plex Mono/);
    expect(style.weight).toBe("500");
    expect(style.transform).toBe("uppercase");
    // 0.08em of 13px
    expect(parseFloat(style.letterSpacing)).toBeCloseTo(0.08 * 13, 1);
  });

  test("both families are loaded, not just their fallbacks", async ({
    page,
  }) => {
    const loaded = await page.evaluate(() => ({
      archivo800: document.fonts.check("800 1em Archivo"),
      archivo400: document.fonts.check("400 1em Archivo"),
      mono500: document.fonts.check("500 1em 'IBM Plex Mono'"),
    }));
    expect(loaded).toEqual({
      archivo800: true,
      archivo400: true,
      mono500: true,
    });
  });
});
