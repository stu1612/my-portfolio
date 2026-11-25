import { expect, test, type Locator, type Page } from "@playwright/test";
import { lightRoutes } from "./routes";

const widths = [375, 768, 1440];

// tokens.css: --surface in each theme.
const DARK_SURFACE = "rgb(21, 19, 26)";
const LIGHT_SURFACE = "rgb(243, 238, 231)";

// With cacheComponents, Next keeps the previous route in the DOM (hidden) after
// a client navigation, so always target the visible shell.
const main = (page: Page) => page.locator("main:visible");
const shell = (page: Page) => main(page).locator("..");

// The availability line ("Lund 14:05 · Open to work") in a bar or the menu.
const availability = (scope: Locator) =>
  scope.locator("p", { hasText: "Open to work" });

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
    page
      .locator("header:visible")
      .getByRole("button", { name: "Menu", exact: true });

  test("shows the name and the live Lund time at 1440px", async ({ page }) => {
    // 13:05 UTC in January is 14:05 in Lund.
    await page.clock.setFixedTime(new Date("2026-01-15T13:05:00Z"));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");

    const header = page.locator("header:visible");
    await expect(
      header.getByRole("link", { name: "Stu Bolderson" }),
    ).toBeVisible();
    const status = availability(header);
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
    const status = availability(page.locator("header:visible"));
    await expect(status).toContainText("14:05");
    await page.clock.runFor(31_000);
    await expect(status).toContainText("14:06");
  });

  test("the status is hidden at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    await expect(availability(page.locator("header:visible"))).toBeHidden();
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

  // "/" is the fixed frame (only <main> scrolls); "/about" scrolls the document.
  for (const route of ["/", "/about"]) {
    test(`Tab reaches the skip link first on ${route}, and it moves focus to <main>`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: "Skip to content" });
      await expect(skip).toBeFocused();
      await expect(skip).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(main(page)).toBeFocused();
    });
  }

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

test.describe("full-screen menu", () => {
  const header = (page: Page) => page.locator("header:visible");
  const menuButton = (page: Page) =>
    header(page).getByRole("button", { name: "Menu", exact: true });
  const dialog = (page: Page) => page.getByRole("dialog", { name: "Menu" });

  for (const route of ["/", "/about"]) {
    for (const width of widths) {
      test(`covers the viewport on ${route} at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(route);
        await menuButton(page).click();
        await expect(dialog(page)).toBeVisible();
        await expect(page.locator("dialog[open]")).toHaveCount(1);
        const box = await dialog(page).boundingBox();
        expect(box).toEqual({ x: 0, y: 0, width, height: 800 });
      });
    }
  }

  test("follows the page theme", async ({ page }) => {
    await page.goto("/");
    await menuButton(page).click();
    expect(
      await dialog(page).evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe(DARK_SURFACE);

    await page.goto("/about");
    await menuButton(page).click();
    expect(
      await dialog(page).evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe(LIGHT_SURFACE);
  });

  test("lists the five links, follow links, email and status", async ({
    page,
  }) => {
    await page.clock.setFixedTime(new Date("2026-07-15T13:05:00Z"));
    await page.goto("/blog");
    await menuButton(page).click();
    const menu = dialog(page);

    const nav = menu.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link")).toHaveText([
      "Index",
      "About",
      "Blog",
      "Now",
      "Contact",
    ]);
    await expect(nav.locator('[aria-current="page"]')).toHaveText(["Blog"]);

    const github = menu.getByRole("link", { name: /GitHub/ });
    await expect(github).toHaveAttribute("href", "https://github.com/stu1612");
    await expect(github).toHaveAttribute("target", "_blank");
    await expect(github).toHaveAttribute("rel", "noopener noreferrer");
    const linkedin = menu.getByRole("link", { name: /LinkedIn/ });
    await expect(linkedin).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/stuartbolderson/",
    );
    await expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");
    await expect(
      menu.getByRole("link", { name: "boldersonstu@gmail.com" }),
    ).toHaveAttribute("href", "mailto:boldersonstu@gmail.com");

    await expect(availability(menu)).toHaveText("Lund 15:05 · Open to work");
  });

  test("aria-expanded follows the state; Escape closes and returns focus", async ({
    page,
  }) => {
    await page.goto("/about");
    const button = menuButton(page);
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(dialog(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test("the close button closes it", async ({ page }) => {
    await page.goto("/about");
    await menuButton(page).click();
    await dialog(page).getByRole("button", { name: "Close menu" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("keyboard focus never reaches the page behind", async ({ page }) => {
    await page.goto("/about");
    await menuButton(page).click();
    await expect(dialog(page)).toBeVisible();

    const focusIsInsideOrChrome = () =>
      page.evaluate(() => {
        const active = document.activeElement;
        // body/null means focus moved to the browser UI, which is allowed.
        if (!active || active === document.body) return true;
        return !!active.closest("dialog[open]");
      });

    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      expect(await focusIsInsideOrChrome(), `Tab ${i + 1}`).toBe(true);
    }
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Shift+Tab");
      expect(await focusIsInsideOrChrome(), `Shift+Tab ${i + 1}`).toBe(true);
    }
  });

  test("choosing a link navigates and closes the menu", async ({ page }) => {
    await page.goto("/");
    await menuButton(page).click();
    await dialog(page).getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL("/about");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("About");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    expect(await shellBackground(page)).toBe(LIGHT_SURFACE);
  });

  test("the page behind doesn't scroll while it is open", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 600 });
    await page.goto("/about");
    await main(page).evaluate((el) => {
      const filler = document.createElement("div");
      filler.style.minHeight = "3000px";
      el.appendChild(filler);
    });
    await menuButton(page).click();
    expect(
      await page.evaluate(() => getComputedStyle(document.body).overflow),
    ).toBe("hidden");
    await page.mouse.wheel(0, 1000);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("fades with reduced motion off, and is instant with it on", async ({
    page,
  }) => {
    await page.goto("/about");
    await menuButton(page).click();
    const duration = () =>
      dialog(page).evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          property: s.transitionProperty,
          duration: s.transitionDuration,
        };
      });
    const fading = await duration();
    expect(fading.property).toContain("opacity");
    expect(fading.duration).toContain("0.2s");

    // Instant: either no transitioned property or a zero duration.
    await page.emulateMedia({ reducedMotion: "reduce" });
    const reduced = await duration();
    expect(
      reduced.property === "none" || /^0s(, 0s)*$/.test(reduced.duration),
      JSON.stringify(reduced),
    ).toBe(true);
  });
});

test.describe("page transitions", () => {
  test("a client navigation starts a view transition", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const w = window as unknown as { __viewTransitions: number };
      w.__viewTransitions = 0;
      const original = document.startViewTransition.bind(document);
      document.startViewTransition = ((
        ...args: Parameters<typeof document.startViewTransition>
      ) => {
        w.__viewTransitions++;
        return original(...args);
      }) as typeof document.startViewTransition;
    });

    await page
      .locator("header:visible")
      .getByRole("button", { name: "Menu", exact: true })
      .click();
    await page.getByRole("dialog").getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL("/about");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("About");

    expect(
      await page.evaluate(
        () =>
          (window as unknown as { __viewTransitions: number })
            .__viewTransitions,
      ),
    ).toBeGreaterThan(0);
  });

  test("the cross-fade is opacity only and has a reduced-motion override", async ({
    page,
  }) => {
    await page.goto("/");
    const rules = await page.evaluate(() => {
      const found: string[] = [];
      const walk = (list: CSSRuleList, media = "") => {
        for (const rule of Array.from(list)) {
          if (rule instanceof CSSMediaRule) {
            walk(rule.cssRules, rule.conditionText);
          } else if (
            rule instanceof CSSStyleRule &&
            rule.selectorText.includes("::view-transition")
          ) {
            found.push(
              `${media}|${rule.selectorText}|${rule.style.cssText}|name=${rule.style.animationName}`,
            );
          }
        }
      };
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          walk(sheet.cssRules);
        } catch {
          // cross-origin sheet: not ours
        }
      }
      return found;
    });

    // The group's size/position morph is off.
    expect(
      rules.some(
        (r) =>
          r.startsWith("|") &&
          // Chrome serialises the selector as (*.page-fade).
          r.includes("::view-transition-group(") &&
          r.includes(".page-fade)") &&
          r.endsWith("|name=none"),
      ),
    ).toBe(true);
    // Reduced motion makes every part instant.
    expect(
      rules.some(
        (r) =>
          r.startsWith("(prefers-reduced-motion: reduce)") &&
          r.includes("::view-transition-new(*)") &&
          r.includes("animation-duration: 0s"),
      ),
    ).toBe(true);
  });
});
