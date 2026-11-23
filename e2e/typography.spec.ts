import { expect, test, type Page } from "@playwright/test";

type Style = {
  family: string;
  weight: string;
  stretch: string;
  transform: string;
  letterSpacing: string;
};

async function styleOf(page: Page, theme: string, role: string) {
  return page
    .locator(`[data-testid="specimen-${theme}"] [data-role="${role}"]`)
    .evaluate((el): Style => {
      const s = getComputedStyle(el);
      return {
        family: s.fontFamily,
        weight: s.fontWeight,
        stretch: s.fontStretch,
        transform: s.textTransform,
        letterSpacing: s.letterSpacing,
      };
    });
}

test.describe("type specimen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/type-specimen");
    await page.evaluate(() => document.fonts.ready);
  });

  for (const theme of ["light", "dark"]) {
    test(`headings are Archivo, weight per role (${theme})`, async ({
      page,
    }) => {
      for (const [role, weight] of [
        ["display-hero", "800"],
        ["h1", "800"],
        ["h2", "700"],
        ["h3", "700"],
        ["body", "400"],
        ["body-sm", "400"],
      ]) {
        const style = await styleOf(page, theme, role);
        expect(style.family, role).toMatch(/^Archivo/);
        expect(style.weight, role).toBe(weight);
      }
    });

    test(`index caps are 900 at 125% width (${theme})`, async ({ page }) => {
      const style = await styleOf(page, theme, "display-index");
      expect(style.family).toMatch(/^Archivo/);
      expect(style.weight).toBe("900");
      expect(style.stretch).toBe("125%");
      expect(style.transform).toBe("uppercase");
    });

    test(`meta is tracked uppercase Plex Mono 500 (${theme})`, async ({
      page,
    }) => {
      const style = await styleOf(page, theme, "meta");
      expect(style.family).toMatch(/^"?IBM Plex Mono/);
      expect(style.weight).toBe("500");
      expect(style.transform).toBe("uppercase");
      // 0.08em of 13px
      expect(parseFloat(style.letterSpacing)).toBeCloseTo(0.08 * 13, 1);
    });

    test(`code is Plex Mono 400 (${theme})`, async ({ page }) => {
      const style = await styleOf(page, theme, "code");
      expect(style.family).toMatch(/^"?IBM Plex Mono/);
      expect(style.weight).toBe("400");
    });
  }

  test("both families are loaded, not just their fallbacks", async ({
    page,
  }) => {
    const loaded = await page.evaluate(() => ({
      archivo900: document.fonts.check("900 1em Archivo"),
      archivo400: document.fonts.check("400 1em Archivo"),
      mono400: document.fonts.check("400 1em 'IBM Plex Mono'"),
      mono500: document.fonts.check("500 1em 'IBM Plex Mono'"),
    }));
    expect(loaded).toEqual({
      archivo900: true,
      archivo400: true,
      mono400: true,
      mono500: true,
    });
  });

  test("the width axis changes glyph width", async ({ page }) => {
    const widths = await page
      .locator('[data-testid="specimen-light"] [data-role="body"]')
      .evaluate((el) => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.style.cssText =
          "position:absolute;white-space:nowrap;font-weight:900";
        el.parentElement!.appendChild(clone);
        const measure = (stretch: string) => {
          clone.style.fontStretch = stretch;
          return clone.getBoundingClientRect().width;
        };
        const result = {
          narrow: measure("62%"),
          normal: measure("100%"),
          wide: measure("125%"),
        };
        clone.remove();
        return result;
      });
    expect(widths.narrow).toBeLessThan(widths.normal);
    expect(widths.normal).toBeLessThan(widths.wide);
  });
});
