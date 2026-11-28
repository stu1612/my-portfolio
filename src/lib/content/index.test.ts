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
      "sundet",
      "portfolio",
    ]);
    expect(studies[0]).toMatchObject({
      displayName: "PROBELL",
      url: "/work/probell",
    });
    expect(studies[0].readingMinutes).toBeGreaterThanOrEqual(1);
  });

  it("keeps the live site apart from the computed page url", () => {
    expect(getCaseStudy("probell")).toMatchObject({
      url: "/work/probell",
      liveUrl: "https://probellnutrition.com",
    });
  });

  it("finds a case study by slug, or returns undefined", () => {
    expect(getCaseStudy("probell")?.slug).toBe("probell");
    expect(getCaseStudy("nope")).toBeUndefined();
  });

  it("returns posts newest first, and finds one by slug", () => {
    const posts = getPosts();
    expect(posts.length).toBeGreaterThan(0);
    const dates = posts.map((post) => post.published);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(getPost(posts[0].slug)).toMatchObject({
      url: `/blog/${posts[0].slug}`,
    });
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
    // portfolio.mdx is still a draft; probell and sundet are published.
    expect(getCaseStudy("portfolio")).toBeUndefined();
    expect(getCaseStudy("probell")?.slug).toBe("probell");
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
