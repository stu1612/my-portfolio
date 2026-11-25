import { describe, expect, it } from "vitest";
import { composite, contrastRatio, relativeLuminance } from "./contrast";

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
  });

  it("rejects anything but #rrggbb", () => {
    expect(() => relativeLuminance("#fff")).toThrow();
    expect(() => relativeLuminance("red")).toThrow();
  });
});

describe("contrastRatio", () => {
  it("is 21 for black on white, in either order", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
  });

  it("is 1 for identical colours", () => {
    expect(contrastRatio("#a8431f", "#a8431f")).toBe(1);
  });

  it("matches a known pair (#767676 on white is about 4.54)", () => {
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });
});

describe("composite", () => {
  it("blends black at half opacity over white to mid grey", () => {
    expect(composite("#000000", "#ffffff", 0.5)).toBe("#808080");
  });

  it("returns the foreground at alpha 1 and the background at alpha 0", () => {
    expect(composite("#a8431f", "#15131a", 1)).toBe("#a8431f");
    expect(composite("#a8431f", "#15131a", 0)).toBe("#15131a");
  });

  it("rejects an alpha outside 0–1", () => {
    expect(() => composite("#000000", "#ffffff", 1.5)).toThrow();
  });
});
