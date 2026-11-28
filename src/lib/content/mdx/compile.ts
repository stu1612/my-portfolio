// The build-time MDX compile, shared by content-collections.ts and the tests,
// so tests exercise the exact pipeline the site builds with.
import { compile } from "@mdx-js/mdx";
import { codeMeta } from "./code-meta";
import { numberFigures } from "./number-figures";

/** MDX body -> function-body JavaScript string, evaluated later by loadMdx. */
export async function compileBody(body: string): Promise<string> {
  const file = await compile(body, {
    outputFormat: "function-body",
    // Seam for later plugins (e.g. highlighting, decided in the blog plan).
    rehypePlugins: [codeMeta, numberFigures],
  });
  return String(file);
}
