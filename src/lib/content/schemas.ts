// Frontmatter schemas for every content collection. Pure Zod, no generated
// imports, so Vitest can test them and content-collections.ts can reuse them.
// Strict objects: an unknown key (a typo) fails the build instead of passing.
import { z } from "zod";

const isoDate = z.iso.date();
const draft = z.boolean().default(false);

export const caseStudySchema = z.strictObject({
  title: z.string().min(1),
  // Short caps name shown on the homepage index (design system: must fit one
  // line). 9 characters is what fits at 375px (PORTFOLIO, plan 04).
  displayName: z
    .string()
    .max(9)
    .regex(/^[A-Z0-9 ]+$/, "Use capitals, digits and spaces only"),
  // The problem, in one sentence.
  summary: z.string().min(1),
  client: z.string().min(1),
  role: z.string().min(1),
  year: z.number().int(),
  stack: z.array(z.string().min(1)).min(1).max(5),
  // Position on the homepage index, ascending.
  order: z.number().int(),
  preview: z
    .strictObject({ src: z.string().min(1), alt: z.string().min(1) })
    .optional(),
  // The live site, shown as LIVE SITE on the case study page (plan 05).
  // Not `url`: that is the computed page path (/work/<slug>).
  liveUrl: z.url({ protocol: /^https?$/ }).optional(),
  draft,
});

export const postSchema = z.strictObject({
  title: z.string().min(1),
  // Also used as the meta description.
  description: z.string().min(1).max(160),
  published: isoDate,
  updated: isoDate.optional(),
  tags: z.array(z.string().min(1)).default([]),
  draft,
});

export const nowSchema = z.strictObject({
  updated: isoDate,
  draft,
});

export type CaseStudyFrontmatter = z.infer<typeof caseStudySchema>;
export type PostFrontmatter = z.infer<typeof postSchema>;
export type NowFrontmatter = z.infer<typeof nowSchema>;
