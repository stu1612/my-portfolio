// Content Collections config: reads content/, validates frontmatter against
// src/lib/content/schemas.ts and compiles each MDX body at build time.
// Pages never import the generated data directly: use src/lib/content.
import { defineCollection, defineConfig } from "@content-collections/core";
import { compile } from "@mdx-js/mdx";
import { z } from "zod";
import {
  assertSingle,
  readingMinutes,
  slugFromPath,
  urlFor,
} from "./src/lib/content/derive";
import {
  caseStudySchema,
  nowSchema,
  postSchema,
} from "./src/lib/content/schemas";

// Plan 05 adds remark/rehype plugins here (callouts, code highlighting).
async function compileBody(body: string): Promise<string> {
  const file = await compile(body, { outputFormat: "function-body" });
  return String(file);
}

const caseStudies = defineCollection({
  name: "caseStudies",
  directory: "content/case-studies",
  include: "*.mdx",
  schema: caseStudySchema.extend({ content: z.string() }),
  transform: async ({ content, _meta, ...data }) => {
    const slug = slugFromPath(_meta.path);
    return {
      ...data,
      slug,
      url: urlFor("caseStudies", slug),
      readingMinutes: readingMinutes(content),
      code: await compileBody(content),
    };
  },
});

const posts = defineCollection({
  name: "posts",
  directory: "content/blog",
  include: "*.mdx",
  schema: postSchema.extend({ content: z.string() }),
  transform: async ({ content, _meta, ...data }) => {
    const slug = slugFromPath(_meta.path);
    return {
      ...data,
      slug,
      url: urlFor("posts", slug),
      readingMinutes: readingMinutes(content),
      code: await compileBody(content),
    };
  },
});

const now = defineCollection({
  name: "now",
  directory: "content",
  include: "now.mdx",
  schema: nowSchema.extend({ content: z.string() }),
  transform: async ({ content, ...data }) => ({
    ...data,
    slug: "now",
    url: urlFor("now"),
    readingMinutes: readingMinutes(content),
    code: await compileBody(content),
  }),
  // Exactly one Now file: a missing or duplicate file fails the build.
  onSuccess: (docs) => {
    assertSingle(docs, "now");
  },
});

export default defineConfig({ content: [caseStudies, posts, now] });
