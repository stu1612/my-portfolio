import { defineCollection, defineConfig } from "@content-collections/core";
import { compile } from "@mdx-js/mdx";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "content/blog",
  include: "*.mdx",
  schema: z.object({ title: z.string(), content: z.string() }),
  transform: async (doc) => {
    const code = String(await compile(doc.content, { outputFormat: "function-body" }));
    return { ...doc, code };
  },
});

export default defineConfig({ content: [posts] });
