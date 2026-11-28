// Rehype step: copies a code fence's language and title onto its <pre>, so the
// code frame can show a filename bar without parsing anything at render time.
//
//   ```astro title="src/components/Hero.astro"
//
// becomes <pre data-lang="astro" data-title="src/components/Hero.astro">.
// mdast-util-to-hast keeps the fence meta on the <code> element as data.meta.
import type { Element, Root, RootContent } from "hast";

const TITLE = /(?:^|\s)title="([^"]*)"/;

function languageOf(code: Element): string | undefined {
  const className = code.properties.className;
  const classes = Array.isArray(className) ? className : [];
  for (const name of classes) {
    if (typeof name === "string" && name.startsWith("language-")) {
      return name.slice("language-".length);
    }
  }
  return undefined;
}

function titleOf(code: Element): string | undefined {
  const meta = (code.data as { meta?: unknown } | undefined)?.meta;
  if (typeof meta !== "string") return undefined;
  return TITLE.exec(meta)?.[1] || undefined;
}

function visit(node: Root | RootContent) {
  if (!("children" in node)) return;
  for (const child of node.children) {
    if (child.type === "element" && child.tagName === "pre") {
      const code = child.children.find(
        (c): c is Element => c.type === "element" && c.tagName === "code",
      );
      if (code) {
        const lang = languageOf(code);
        const title = titleOf(code);
        if (lang) child.properties.dataLang = lang;
        if (title) child.properties.dataTitle = title;
      }
    }
    visit(child);
  }
}

export function codeMeta() {
  return (tree: Root) => {
    visit(tree);
  };
}
