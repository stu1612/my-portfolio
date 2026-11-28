import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { compileBody } from "./compile";
import { loadMdx } from "./load";

async function render(mdx: string) {
  const Content = await loadMdx(await compileBody(mdx));
  return renderToStaticMarkup(createElement(Content));
}

describe("codeMeta", () => {
  it("copies the fence language and title onto <pre>", async () => {
    const html = await render('```ts title="a.ts"\nconst a = 1;\n```');
    expect(html).toContain('<pre data-lang="ts" data-title="a.ts">');
    expect(html).toContain("const a = 1;");
  });

  it("keeps a title with spaces and other meta", async () => {
    const html = await render(
      '```astro showLineNumbers title="src/My Hero.astro"\nx\n```',
    );
    expect(html).toContain('data-title="src/My Hero.astro"');
    expect(html).toContain('data-lang="astro"');
  });

  it("sets only the language when there is no title", async () => {
    const html = await render("```bash\nnpm test\n```");
    expect(html).toContain('<pre data-lang="bash">');
    expect(html).not.toContain("data-title");
  });

  it("sets neither attribute on a bare fence", async () => {
    const html = await render("```\nplain\n```");
    expect(html).toContain("<pre><code>plain");
    expect(html).not.toMatch(/data-(lang|title)/);
  });
});
