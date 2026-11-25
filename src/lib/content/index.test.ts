import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadMdx } from "./mdx/load";
import {
  getCaseStudies,
  getCaseStudy,
  getNow,
  getPost,
  getPosts,
} from "./index";

afterEach(() => vi.unstubAllEnvs());

describe("content queries (outside production)", () => {
  it("returns the case studies in index order, with computed fields", () => {
    const studies = getCaseStudies();
    expect(studies.map((s) => s.slug)).toEqual([
      "probell",
      "team4q",
      "portfolio",
    ]);
    expect(studies[0]).toMatchObject({
      displayName: "PROBELL",
      url: "/work/probell",
    });
    expect(studies[0].readingMinutes).toBeGreaterThanOrEqual(1);
  });

  it("finds a case study by slug, or returns undefined", () => {
    expect(getCaseStudy("probell")?.slug).toBe("probell");
    expect(getCaseStudy("nope")).toBeUndefined();
  });

  it("returns no posts while none are written", () => {
    expect(getPosts()).toEqual([]);
    expect(getPost("nope")).toBeUndefined();
  });

  it("returns the single Now entry", () => {
    expect(getNow()).toMatchObject({ slug: "now", url: "/now" });
  });
});

describe("content queries (production)", () => {
  it("leaves drafts out", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(getCaseStudies().every((s) => !s.draft)).toBe(true);
    expect(getCaseStudy("probell")).toBeUndefined();
    expect(getNow()).toBeUndefined();
  });
});

describe("loadMdx", () => {
  it("renders a compiled body to HTML on the server", async () => {
    const now = getNow();
    expect(now).toBeDefined();
    const Content = await loadMdx(now!.code);
    const html = renderToStaticMarkup(createElement(Content));
    expect(html).toContain("what I am working on now");
  });
});
