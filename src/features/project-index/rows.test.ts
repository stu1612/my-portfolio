import { describe, expect, it } from "vitest";
import { initialSelection, toRows, type IndexEntry } from "./rows";

const entry = (overrides: Partial<IndexEntry> = {}): IndexEntry => ({
  slug: "probell",
  url: "/work/probell",
  displayName: "PROBELL",
  year: 2026,
  stack: ["Astro", "Vercel"],
  ...overrides,
});

describe("toRows", () => {
  it("keeps the order it is given (content is already sorted)", () => {
    const rows = toRows([
      entry({ slug: "a", displayName: "A" }),
      entry({ slug: "b", displayName: "B" }),
    ]);
    expect(rows.map((row) => row.slug)).toEqual(["a", "b"]);
  });

  it("links each row to its case study url", () => {
    expect(toRows([entry()])[0].href).toBe("/work/probell");
  });

  it("joins the stack and year with a middle dot", () => {
    expect(toRows([entry()])[0].info).toBe("Astro · Vercel · 2026");
  });

  it("shows only the first three stack items", () => {
    const [row] = toRows([
      entry({ stack: ["Astro", "Vercel", "HubSpot", "TypeScript", "Sass"] }),
    ]);
    expect(row.info).toBe("Astro · Vercel · HubSpot · 2026");
  });

  it("passes the preview through, and leaves it out when there is none", () => {
    const preview = { src: "/previews/probell.jpg", alt: "Probell homepage" };
    expect(toRows([entry({ preview })])[0].preview).toEqual(preview);
    expect(toRows([entry()])[0]).not.toHaveProperty("preview");
  });

  it("returns no rows for no entries", () => {
    expect(toRows([])).toEqual([]);
  });
});

describe("initialSelection", () => {
  it("selects the first row", () => {
    expect(initialSelection(toRows([entry(), entry()]))).toBe(0);
  });

  it("selects nothing when there are no rows", () => {
    expect(initialSelection([])).toBeNull();
  });
});
