// Rehype step: numbers each <Figure> in document order (number="1", "2", …),
// so captions read FIG 1, FIG 2 without the author counting.
import type { Root, RootContent } from "hast";
import type {
  MdxJsxFlowElementHast,
  MdxJsxTextElementHast,
} from "mdast-util-mdx-jsx";

type JsxElement = MdxJsxFlowElementHast | MdxJsxTextElementHast;

function isFigure(node: RootContent): node is JsxElement {
  return (
    (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
    node.name === "Figure"
  );
}

export function numberFigures() {
  return (tree: Root) => {
    let count = 0;
    const visit = (node: Root | RootContent) => {
      if (!("children" in node)) return;
      for (const child of node.children) {
        if (isFigure(child)) {
          count += 1;
          child.attributes = [
            ...child.attributes.filter(
              (a) => !(a.type === "mdxJsxAttribute" && a.name === "number"),
            ),
            { type: "mdxJsxAttribute", name: "number", value: String(count) },
          ];
        }
        visit(child);
      }
    };
    visit(tree);
  };
}
