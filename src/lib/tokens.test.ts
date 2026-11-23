import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";
import { parseTokenThemes } from "./tokens";

const css = readFileSync(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
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
