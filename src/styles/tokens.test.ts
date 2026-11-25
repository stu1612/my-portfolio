import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { composite, contrastRatio } from "./contrast";
import { parseTokenThemes } from "./tokens";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");
const themes = parseTokenThemes(css);

const TEXT_AA = 4.5;
const UI_AA = 3;

// Borders used only as decoration, so they are exempt from the 3:1 UI rule.
// Form field borders need their own token that meets 3:1 (plan 06).
const decorative = ["hairline"];

const textOnSurfaces = ["ink", "ink-muted", "accent", "success", "error"];
const surfaces = ["surface", "surface-raised"];

describe.each(["light", "dark"] as const)("%s theme", (theme) => {
  const tokens = themes[theme];

  it("defines every token the tests use", () => {
    for (const name of [...textOnSurfaces, ...surfaces, ...decorative]) {
      expect(tokens[name], `--${name}`).toBeDefined();
    }
  });

  describe.each(surfaces)("on %s", (surface) => {
    it.each(textOnSurfaces)(`%s text is at least ${TEXT_AA}:1`, (name) => {
      const ratio = contrastRatio(tokens[name], tokens[surface]);
      expect(
        ratio,
        `${theme}: --${name} on --${surface} is ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(TEXT_AA);
    });
  });

  it(`focus ring (accent) on surface is at least ${UI_AA}:1`, () => {
    const ratio = contrastRatio(tokens["accent"], tokens["surface"]);
    expect(
      ratio,
      `${theme}: --accent on --surface is ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(UI_AA);
  });
});

describe("stage (flat colours; contrast over the gradient is a manual check)", () => {
  const dark = themes.dark;

  it.each(["glow-1", "glow-2", "glow-3", "ink", "ink-muted"])(
    `%s on stage-base is at least ${TEXT_AA}:1`,
    (name) => {
      const ratio = contrastRatio(dark[name], dark["stage-base"]);
      expect(
        ratio,
        `--${name} on --stage-base is ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(TEXT_AA);
    },
  );
});

describe("index stage: titles over the gradient fields", () => {
  const dark = themes.dark;
  const LARGE_AA = 3;
  const backgrounds = ["stage-base", "field-1", "field-2", "field-3"];

  const dimmed = Number(/--opacity-dimmed:\s*([0-9.]+)/.exec(css)?.[1]);

  describe.each(["glow-1", "glow-2", "glow-3"])(
    "%s (selected title fill)",
    (glow) => {
      it.each(backgrounds)(`on %s is at least ${LARGE_AA}:1`, (bg) => {
        const ratio = contrastRatio(dark[glow], dark[bg]);
        expect(
          ratio,
          `--${glow} on --${bg} is ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(LARGE_AA);
      });
    },
  );

  // The index info lines and heading are small mono text over the stage.
  it.each(["ink", "ink-muted"])(
    `%s is at least ${TEXT_AA}:1 on every stage field`,
    (name) => {
      for (const bg of backgrounds) {
        const ratio = contrastRatio(dark[name], dark[bg]);
        expect(
          ratio,
          `--${name} on --${bg} is ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(TEXT_AA);
      }
    },
  );

  it("defines --opacity-dimmed as a number between 0 and 1", () => {
    expect(dimmed).toBeGreaterThan(0);
    expect(dimmed).toBeLessThan(1);
  });

  it.each(backgrounds)(`dimmed ink on %s is at least ${LARGE_AA}:1`, (bg) => {
    const ratio = contrastRatio(
      composite(dark.ink, dark[bg], dimmed),
      dark[bg],
    );
    expect(
      ratio,
      `ink at ${dimmed} on --${bg} is ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(LARGE_AA);
  });

  it("--opacity-dimmed is the lowest passing step of 0.05 (dims as far as AA allows)", () => {
    const lower = Math.round((dimmed - 0.05) * 100) / 100;
    const worst = Math.min(
      ...backgrounds.map((bg) =>
        contrastRatio(composite(dark.ink, dark[bg], lower), dark[bg]),
      ),
    );
    expect(
      worst,
      `ink at ${lower} would still pass; lower the token`,
    ).toBeLessThan(LARGE_AA);
  });
});
