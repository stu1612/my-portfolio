import { describe, expect, it } from "vitest";
import { caseStudySchema, nowSchema, postSchema } from "./schemas";

const caseStudy = {
  title: "Rebuilding the booking flow",
  displayName: "PROBELL",
  summary: "Customers abandoned bookings because the form lost their input.",
  client: "Probell",
  role: "Frontend lead",
  year: 2025,
  stack: ["React", "TypeScript"],
  order: 1,
};

const post = {
  title: "Why I validate content at build time",
  description: "Bad content should never deploy.",
  published: "2026-11-24",
};

describe("caseStudySchema", () => {
  it("accepts valid frontmatter and fills defaults", () => {
    const parsed = caseStudySchema.parse(caseStudy);
    expect(parsed.draft).toBe(false);
    expect(parsed.preview).toBeUndefined();
  });

  it("accepts an optional preview image", () => {
    const parsed = caseStudySchema.parse({
      ...caseStudy,
      preview: { src: "/probell.png", alt: "The booking form" },
    });
    expect(parsed.preview?.alt).toBe("The booking form");
  });

  it("accepts an optional live site url", () => {
    const parsed = caseStudySchema.parse({
      ...caseStudy,
      url: "https://probellnutrition.com",
    });
    expect(parsed.url).toBe("https://probellnutrition.com");
    expect(caseStudySchema.parse(caseStudy).url).toBeUndefined();
  });

  it.each(["probellnutrition.com", "javascript:alert(1)", "ftp://x.com"])(
    "rejects url %s",
    (url) => {
      expect(caseStudySchema.safeParse({ ...caseStudy, url }).success).toBe(
        false,
      );
    },
  );

  it("rejects a missing required field", () => {
    const rest: Record<string, unknown> = { ...caseStudy };
    delete rest.summary;
    expect(caseStudySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects an unknown key (typo protection)", () => {
    expect(
      caseStudySchema.safeParse({ ...caseStudy, sumary: "x" }).success,
    ).toBe(false);
  });

  it("rejects a display name that is too long", () => {
    const result = caseStudySchema.safeParse({
      ...caseStudy,
      displayName: "ABCDEFGHIJ",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a 9-character display name (the longest that fits)", () => {
    expect(
      caseStudySchema.safeParse({ ...caseStudy, displayName: "PORTFOLIO" })
        .success,
    ).toBe(true);
  });

  it("rejects a lowercase display name", () => {
    expect(
      caseStudySchema.safeParse({ ...caseStudy, displayName: "Probell" })
        .success,
    ).toBe(false);
  });

  it("requires between 1 and 5 stack items", () => {
    expect(caseStudySchema.safeParse({ ...caseStudy, stack: [] }).success).toBe(
      false,
    );
    expect(
      caseStudySchema.safeParse({
        ...caseStudy,
        stack: ["a", "b", "c", "d", "e", "f"],
      }).success,
    ).toBe(false);
  });

  it("rejects a non-integer year", () => {
    expect(
      caseStudySchema.safeParse({ ...caseStudy, year: 2025.5 }).success,
    ).toBe(false);
  });
});

describe("postSchema", () => {
  it("accepts valid frontmatter and fills defaults", () => {
    const parsed = postSchema.parse(post);
    expect(parsed.tags).toEqual([]);
    expect(parsed.draft).toBe(false);
    expect(parsed.updated).toBeUndefined();
  });

  it("rejects a malformed date", () => {
    expect(
      postSchema.safeParse({ ...post, published: "24/11/2026" }).success,
    ).toBe(false);
    expect(
      postSchema.safeParse({ ...post, published: "2026-13-40" }).success,
    ).toBe(false);
  });

  it("rejects a description over 160 characters", () => {
    expect(
      postSchema.safeParse({ ...post, description: "x".repeat(161) }).success,
    ).toBe(false);
  });

  it("rejects an unknown key", () => {
    expect(postSchema.safeParse({ ...post, author: "Stu" }).success).toBe(
      false,
    );
  });
});

describe("nowSchema", () => {
  it("accepts an updated date", () => {
    expect(nowSchema.parse({ updated: "2026-11-24" }).draft).toBe(false);
  });

  it("rejects a missing or bad date", () => {
    expect(nowSchema.safeParse({}).success).toBe(false);
    expect(nowSchema.safeParse({ updated: "yesterday" }).success).toBe(false);
  });
});
