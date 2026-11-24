import { describe, expect, it } from "vitest";
import {
  assertSingle,
  isPublished,
  readingMinutes,
  slugFromPath,
  sortCaseStudies,
  sortPosts,
  urlFor,
} from "./derive";

const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");

describe("slugFromPath", () => {
  it("returns the file name without folder or extension", () => {
    expect(slugFromPath("probell")).toBe("probell");
    expect(slugFromPath("case-studies/probell.mdx")).toBe("probell");
    expect(slugFromPath("blog/my-post.mdx")).toBe("my-post");
  });
});

describe("urlFor", () => {
  it("maps each collection to its route", () => {
    expect(urlFor("caseStudies", "probell")).toBe("/work/probell");
    expect(urlFor("posts", "my-post")).toBe("/blog/my-post");
    expect(urlFor("now")).toBe("/now");
  });
});

describe("readingMinutes", () => {
  it("is at least 1 minute, even for an empty body", () => {
    expect(readingMinutes("")).toBe(1);
    expect(readingMinutes("   \n ")).toBe(1);
  });

  it("rounds up at 225 words a minute", () => {
    expect(readingMinutes(words(225))).toBe(1);
    expect(readingMinutes(words(226))).toBe(2);
    expect(readingMinutes(words(450))).toBe(2);
    expect(readingMinutes(words(451))).toBe(3);
  });
});

describe("isPublished", () => {
  it("hides drafts only in production", () => {
    expect(isPublished({ draft: true }, true)).toBe(false);
    expect(isPublished({ draft: true }, false)).toBe(true);
  });

  it("always shows non-drafts", () => {
    expect(isPublished({ draft: false }, true)).toBe(true);
    expect(isPublished({ draft: false }, false)).toBe(true);
  });
});

describe("sortPosts", () => {
  it("puts the newest first without mutating the input", () => {
    const input = [
      { slug: "a", published: "2025-01-10" },
      { slug: "c", published: "2026-03-01" },
      { slug: "b", published: "2025-12-31" },
    ];
    const sorted = sortPosts(input);
    expect(sorted.map((p) => p.slug)).toEqual(["c", "b", "a"]);
    expect(input.map((p) => p.slug)).toEqual(["a", "c", "b"]);
  });
});

describe("sortCaseStudies", () => {
  it("sorts by order ascending without mutating the input", () => {
    const input = [
      { slug: "x", order: 3 },
      { slug: "y", order: 1 },
      { slug: "z", order: 2 },
    ];
    expect(sortCaseStudies(input).map((c) => c.slug)).toEqual(["y", "z", "x"]);
    expect(input.map((c) => c.slug)).toEqual(["x", "y", "z"]);
  });
});

describe("assertSingle", () => {
  it("returns the only item", () => {
    expect(assertSingle(["only"], "now")).toBe("only");
  });

  it("throws, naming the collection, on zero or many", () => {
    expect(() => assertSingle([], "now")).toThrow(/now/);
    expect(() => assertSingle(["a", "b"], "now")).toThrow(/now/);
  });
});
