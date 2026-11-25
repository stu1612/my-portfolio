"use client";

import Link from "next/link";
import type { Ref } from "react";
import { isCurrent } from "./nav";
import { site } from "@/lib/site";
import { AvailabilityStatus } from "./availability-status";

type MenuOverlayProps = {
  id: string;
  ref: Ref<HTMLDialogElement>;
  pathname: string;
  /** Closes the dialog: called when a link is chosen or the X is pressed. */
  onRequestClose: () => void;
  /** The dialog's own close event (Escape, or after onRequestClose). */
  onClose: () => void;
};

// Hover and keyboard focus look identical on every link (Must rule).
const linkState =
  "focus-ring hover:underline focus-visible:underline decoration-1 underline-offset-4";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * Full-viewport menu. A native <dialog> opened with showModal(): the browser
 * traps focus, makes the page inert, closes on Escape and returns focus to the
 * menu button. Colours inherit the page's theme through the DOM.
 */
export function MenuOverlay({
  id,
  ref,
  pathname,
  onRequestClose,
  onClose,
}: MenuOverlayProps) {
  return (
    <dialog
      id={id}
      ref={ref}
      aria-label="Menu"
      onClose={onClose}
      className="bg-surface text-ink ease-out-soft fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none overflow-y-auto p-0 opacity-0 transition-[opacity,display,overlay] transition-discrete duration-(--duration-page) backdrop:bg-transparent open:opacity-100 motion-reduce:transition-none starting:open:opacity-0"
    >
      <div className="flex min-h-full flex-col">
        {/* Same layout as the navbar bar, so nothing jumps on open. */}
        <div className="border-hairline flex shrink-0 items-center justify-between gap-4 border-b px-4 py-2 min-[720px]:px-8">
          <Link
            href="/"
            onClick={onRequestClose}
            className="type-meta focus-ring hover:text-accent focus-visible:text-accent"
          >
            {site.name}
          </Link>
          <button
            type="button"
            onClick={onRequestClose}
            className="focus-ring relative -mr-2 flex size-12 shrink-0 cursor-pointer items-center justify-center"
          >
            <span className="sr-only">Close menu</span>
            <span aria-hidden className="relative block w-8">
              <span className="absolute block h-px w-full rotate-45 bg-current" />
              <span className="absolute block h-px w-full -rotate-45 bg-current" />
            </span>
          </button>
        </div>

        <nav
          aria-label="Primary"
          className="flex-1 px-4 py-12 min-[720px]:px-8"
        >
          <ul className="grid gap-x-8 gap-y-2 min-[720px]:grid-flow-col min-[720px]:grid-cols-2 min-[720px]:grid-rows-3">
            {site.nav.map((item) => {
              const current = isCurrent(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onRequestClose}
                    aria-current={current ? "page" : undefined}
                    className={`text-h1 type-heading ${linkState} ${
                      current ? "text-accent" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="grid shrink-0 gap-8 px-4 pb-12 min-[720px]:grid-cols-2 min-[720px]:px-8">
          <section aria-labelledby={`${id}-follow`}>
            <h2 id={`${id}-follow`} className="type-meta text-ink-muted">
              Follow
            </h2>
            <ul className="text-body mt-2 flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <a href={site.github} {...external} className={linkState}>
                  GitHub<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a href={site.linkedin} {...external} className={linkState}>
                  LinkedIn<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </section>

          <section aria-labelledby={`${id}-contact`}>
            <h2 id={`${id}-contact`} className="type-meta text-ink-muted">
              Contact
            </h2>
            <ul className="text-body mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <li>
                <a href={`mailto:${site.email}`} className={linkState}>
                  {site.email}
                </a>
              </li>
              <li>{site.locationLong}</li>
            </ul>
            <AvailabilityStatus className="mt-4 flex" />
          </section>
        </div>
      </div>
    </dialog>
  );
}
