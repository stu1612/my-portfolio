import { components } from "./components";
import { loadMdx } from "./load";

/** Renders a compiled MDX body (the `code` field of a content entry). */
export async function Mdx({ code }: { code: string }) {
  const Content = await loadMdx(code);
  return <Content components={components} />;
}
