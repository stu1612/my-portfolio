import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { compileBody } from "./compile";
import { components } from "./components";
import { loadMdx } from "./load";

async function render(mdx: string) {
  const Content = await loadMdx(await compileBody(mdx));
  return renderToStaticMarkup(<Content components={components} />);
}

describe("Callout", () => {
  it.each([
    ["decision", "Decision"],
    ["wrong", "What went wrong"],
    ["ai", "AI note"],
  ])(
    "%s renders its label, an aria-hidden icon and the body",
    async (type, label) => {
      const html = await render(`<Callout type="${type}">Body text.</Callout>`);
      expect(html).toContain(`<aside aria-label="${label}"`);
      expect(html).toMatch(
        new RegExp(`<svg[^>]*aria-hidden="true"[^>]*>.*</svg>${label}</p>`),
      );
      expect(html).toContain("Body text.");
    },
  );

  it("throws on an unknown type", async () => {
    await expect(render('<Callout type="note">Body</Callout>')).rejects.toThrow(
      /Unknown <Callout type="note">/,
    );
  });
});

describe("Figure", () => {
  const figure = (extra = "") =>
    `<Figure src="/content/probell/a.jpg" alt="The homepage" caption="At launch." width="1600" height="900"${extra} />`;

  it("numbers figures FIG 1 and FIG 2 in order", async () => {
    const html = await render(`${figure()}\n\nText.\n\n${figure()}`);
    expect(html.match(/Fig \d/g)).toEqual(["Fig 1", "Fig 2"]);
    expect(html).toContain('alt="The homepage"');
    expect(html).toContain("<figcaption");
    expect(html).toContain("At launch.");
  });

  it("marks wide figures so they break out of the column", async () => {
    expect(await render(figure(" wide"))).toContain("<figure data-wide");
    expect(await render(figure())).not.toContain("data-wide");
  });

  it("throws without width and height", async () => {
    await expect(render('<Figure src="/a.jpg" alt="A" />')).rejects.toThrow(
      /<Figure> needs src, alt, width and height/,
    );
  });
});

describe("prose", () => {
  it("rejects Markdown images and points to <Figure>", async () => {
    await expect(render("![A tub](/tub.jpg)")).rejects.toThrow(
      /Markdown images aren't supported .*<Figure/,
    );
  });

  it("frames code with the filename and language", async () => {
    const html = await render(
      '```astro title="src/Hero.astro"\n<Image />\n```',
    );
    expect(html).toContain("src/Hero.astro</span>");
    expect(html).toContain("astro</span>");
    expect(html).toContain('<pre tabindex="0"');
    expect(html).toContain("<code>&lt;Image /&gt;\n</code>");
  });

  it("keeps inline-code styling off block code", async () => {
    const html = await render("Use `src/` here.\n\n```\nplain\n```");
    expect(html).toMatch(
      /<code class="[^"]*bg-surface-raised[^"]*">src\/<\/code>/,
    );
    expect(html).toContain("<code>plain\n</code>");
  });

  it("marks external links noreferrer, internal links not", async () => {
    const html = await render("[Live](https://example.com) and [home](/).");
    expect(html).toMatch(/<a href="https:\/\/example.com" rel="noreferrer"/);
    expect(html).toMatch(/<a href="\/" class=/);
  });
});

describe("content files", () => {
  const dir = join(process.cwd(), "content");
  const files = readdirSync(dir, { recursive: true, encoding: "utf8" }).filter(
    (f) => f.endsWith(".mdx"),
  );

  it.each(files)("%s starts sections at ## (the page owns the h1)", (file) => {
    const body = readFileSync(join(dir, file), "utf8")
      .split(/^---$/m)
      .slice(2)
      .join("---");
    expect(body).not.toMatch(/^# /m);
  });
});
