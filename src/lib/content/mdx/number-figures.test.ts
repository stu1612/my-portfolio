import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { compileBody } from "./compile";
import { loadMdx } from "./load";

// A stub Figure that prints the number it receives.
const Figure = ({ number }: { number?: string }) =>
  createElement("figure", { "data-number": number ?? "none" });

async function render(mdx: string) {
  const Content = await loadMdx(await compileBody(mdx));
  return renderToStaticMarkup(
    createElement(Content, { components: { Figure } }),
  );
}

describe("numberFigures", () => {
  it("numbers figures in document order", async () => {
    const html = await render(
      [
        '<Figure src="/a.jpg" alt="A" />',
        "## Section",
        "Text.",
        '<Figure src="/b.jpg" alt="B" />',
      ].join("\n\n"),
    );
    expect(html.match(/data-number="[^"]+"/g)).toEqual([
      'data-number="1"',
      'data-number="2"',
    ]);
  });

  it("overrides a hand-written number", async () => {
    const html = await render('<Figure src="/a.jpg" alt="A" number="9" />');
    expect(html).toContain('data-number="1"');
  });

  it("leaves other components alone", async () => {
    const Callout = () => createElement("aside", { "data-number": "none" });
    const Content = await loadMdx(
      await compileBody('<Callout type="decision">x</Callout>'),
    );
    const html = renderToStaticMarkup(
      createElement(Content, { components: { Callout } }),
    );
    expect(html).toContain('data-number="none"');
  });
});
