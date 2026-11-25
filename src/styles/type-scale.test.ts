import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseTypeScale } from "./tokens";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");
const scale = parseTypeScale(css);

const roles = [
  "display-index",
  "display-hero",
  "h1",
  "h2",
  "h3",
  "body",
  "body-sm",
  "meta",
  "code",
];

describe("type scale", () => {
  it("defines every role in the design system", () => {
    expect(Object.keys(scale).sort()).toEqual([...roles].sort());
  });

  it.each(roles)("%s has a size, line height and weight", (role) => {
    expect(scale[role]).toEqual(
      expect.arrayContaining(["size", "line-height", "font-weight"]),
    );
  });

  it("tracks meta text", () => {
    expect(scale.meta).toContain("letter-spacing");
  });
});
