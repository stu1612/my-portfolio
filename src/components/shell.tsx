import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

type ShellProps = {
  /** Set by the route group: (home) is dark, (pages) is light. */
  theme: "dark" | "light";
  /**
   * Homepage only: a fixed 100dvh frame. The bar and footer stay pinned and
   * only <main> scrolls. Other pages scroll the document.
   */
  frame?: boolean;
  children: ReactNode;
};

export const mainId = (theme: ShellProps["theme"]) => `main-${theme}`;

export function Shell({ theme, frame = false, children }: ShellProps) {
  return (
    <div
      // Light is the :root default, so only dark needs the attribute.
      data-theme={theme === "dark" ? "dark" : undefined}
      className={`bg-surface text-ink relative flex flex-col ${
        frame ? "h-dvh overflow-hidden" : "min-h-dvh"
      }`}
    >
      <a
        href={`#${mainId(theme)}`}
        className="type-meta bg-surface focus-ring sr-only z-10 p-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main
        // One id per group: after a client navigation Next keeps the previous
        // route's shell in the DOM (hidden), so a shared id would be duplicated
        // and the skip link could target the hidden one.
        id={mainId(theme)}
        tabIndex={-1}
        className={`flex flex-col outline-none ${
          frame ? "min-h-0 flex-1 overflow-y-auto" : "flex-1"
        }`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
