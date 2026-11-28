// Components available inside every MDX file: prose elements styled from
// tokens, plus Callout and Figure. Spacing between blocks comes from the
// article-flow utility on the wrapper, not from these elements.
import type { MDXComponents } from "mdx/types";
import {
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { Callout } from "./callout";
import { Figure } from "./figure";

const isExternal = (href?: string) => !!href && /^https?:\/\//.test(href);

function A({ href, children }: ComponentProps<"a">) {
  return (
    <a
      href={href}
      rel={isExternal(href) ? "noreferrer" : undefined}
      className="text-accent focus-ring underline underline-offset-3 hover:decoration-2 focus-visible:decoration-2"
    >
      {children}
    </a>
  );
}

// The code frame. codeMeta (build time) puts the fence's language and title on
// <pre>. MDX renders the inner <code> through `code` below, so its text is
// unwrapped here to keep inline-code styling off block code.
type PreProps = ComponentProps<"pre"> & {
  "data-lang"?: string;
  "data-title"?: string;
};

function Pre({ children, "data-lang": lang, "data-title": title }: PreProps) {
  const text: ReactNode = isValidElement(children)
    ? (children as ReactElement<{ children?: ReactNode }>).props.children
    : children;
  return (
    <div className="frame overflow-hidden">
      {(title || lang) && (
        <p className="type-meta text-ink-muted border-hairline flex justify-between gap-4 border-b px-4 py-2">
          <span className="min-w-0 truncate normal-case">{title}</span>
          {lang && <span className="shrink-0">{lang}</span>}
        </p>
      )}
      {/* Focusable so keyboard users can scroll long lines (axe:
          scrollable-region-focusable). */}
      <pre
        tabIndex={0}
        className="text-code focus-ring overflow-x-auto p-4 font-mono"
      >
        <code>{text}</code>
      </pre>
    </div>
  );
}

function Img({ src }: ComponentProps<"img">) {
  throw new Error(
    `Markdown images aren't supported (found "${String(src)}"). Use <Figure src alt caption width height /> instead.`,
  );
}

export const components: MDXComponents = {
  h2: (props) => (
    <h2 className="text-h2 type-heading font-extrabold" {...props} />
  ),
  h3: (props) => <h3 className="text-h3 type-heading" {...props} />,
  a: A,
  ul: (props) => <ul className="list-disc pl-6 [&>li+li]:mt-2" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 [&>li+li]:mt-2" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-ink border-l-2 pl-6" {...props} />
  ),
  hr: () => <hr className="border-hairline" />,
  code: (props) => (
    <code
      className="bg-surface-raised border-hairline text-code rounded-sm border px-1 font-mono"
      {...props}
    />
  ),
  pre: Pre,
  img: Img,
  Callout,
  Figure,
};
