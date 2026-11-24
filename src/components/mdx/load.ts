import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

/**
 * Turns the build-time compiled MDX string into a React component.
 * Runs on the server only: the string and the evaluator never reach the browser.
 */
export async function loadMdx(code: string) {
  const mod = await run(code, runtime);
  return mod.default;
}
