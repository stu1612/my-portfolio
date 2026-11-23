import { describe, expect, it } from "vitest";
import { isCurrent } from "./nav";
import { site } from "./site";

describe("isCurrent", () => {
  it("marks the index only on /", () => {
    expect(isCurrent("/", "/")).toBe(true);
    expect(isCurrent("/about", "/")).toBe(false);
    expect(isCurrent("/blog/post", "/")).toBe(false);
  });

  it("marks a section on its own page and on child pages", () => {
    expect(isCurrent("/blog", "/blog")).toBe(true);
    expect(isCurrent("/blog/foo", "/blog")).toBe(true);
  });

  it("does not match a different route that shares a prefix", () => {
    expect(isCurrent("/blogroll", "/blog")).toBe(false);
    expect(isCurrent("/now", "/blog")).toBe(false);
  });

  it("marks exactly one nav item on each section page", () => {
    for (const item of site.nav) {
      const current = site.nav.filter((other) =>
        isCurrent(item.href, other.href),
      );
      expect(current).toEqual([item]);
    }
  });
});
