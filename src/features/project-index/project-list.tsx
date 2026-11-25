"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Preview } from "./preview";
import { initialSelection, type IndexRow } from "./rows";

/**
 * Below this width the list is scroll-snapped and selects its centred row.
 * From 1024px it is a split index: hover or focus selects a row.
 */
const MOBILE_QUERY = "(max-width: 1023px)";

type RowState = "selected" | "dimmed" | "idle";

const rowState = (index: number, selected: number | null): RowState =>
  selected === null ? "idle" : index === selected ? "selected" : "dimmed";

export function ProjectList({ rows }: { rows: IndexRow[] }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const isMobile = useRef(true);
  const [selected, setSelected] = useState<number | null>(null);
  // Desktop: the last row selected, so the preview stays when the pointer
  // or focus leaves the list.
  const [lastShown, setLastShown] = useState<number | null>(null);

  // Mobile: the row crossing the scroller's centre line is selected. The
  // root margin shrinks the observed area to that line, so no scroll
  // listener is needed.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const media = window.matchMedia(MOBILE_QUERY);
    let observer: IntersectionObserver | undefined;

    const start = () => {
      observer?.disconnect();
      observer = undefined;
      isMobile.current = media.matches;
      if (!media.matches) {
        setSelected(null);
        return;
      }
      // Start with the first row centred, so the list rests on a snap point.
      // Skipped if the list was already scrolled (e.g. before hydration).
      const first = scroller.querySelector<HTMLElement>("[data-row]");
      if (first && scroller.scrollTop === 0) {
        scroller.scrollTop =
          first.offsetTop + first.offsetHeight / 2 - scroller.clientHeight / 2;
      }
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setSelected(Number((entry.target as HTMLElement).dataset.row));
            }
          }
        },
        { root: scroller, rootMargin: "-50% 0px -50% 0px", threshold: 0 },
      );
      scroller
        .querySelectorAll("[data-row]")
        .forEach((row) => observer!.observe(row));
    };

    start();
    media.addEventListener("change", start);
    return () => {
      media.removeEventListener("change", start);
      observer?.disconnect();
    };
  }, []);

  // Desktop selection: pointer and focus set the same state, so hover and
  // :focus-visible look identical by construction. Mobile ignores them (a
  // tap would otherwise fight the centre line).
  const select = (index: number) => {
    if (isMobile.current) return;
    setSelected(index);
    setLastShown(index);
  };
  const clear = () => {
    if (!isMobile.current) setSelected(null);
  };

  // The preview keeps showing a project while nothing is selected.
  const shown = selected ?? lastShown ?? initialSelection(rows) ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-12 lg:px-8 lg:py-12">
      <Preview
        rows={rows}
        shown={shown}
        className="lg:sticky lg:top-12 lg:order-2"
      />
      {/* Mobile: the wrapper is a size container so the scroller's padding can
          be half its own height (cqh), letting the first and last rows reach
          the centre. Desktop: a plain list in the left column. */}
      <div className="[container-type:size] relative min-h-0 flex-1 lg:[container-type:normal] lg:order-1">
        <ul
          ref={scrollerRef}
          aria-label="Case studies"
          data-index-list
          data-selected={selected ?? undefined}
          onPointerLeave={clear}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) clear();
          }}
          className="lg:border-hairline h-full snap-y snap-mandatory overflow-y-auto py-[50cqh] lg:h-auto lg:snap-none lg:overflow-visible lg:border-t lg:py-0"
        >
          {rows.map((row, index) => (
            <li
              key={row.slug}
              data-row={index}
              data-state={rowState(index, selected)}
              className="lg:border-hairline snap-center lg:border-b"
            >
              <Link
                href={row.href}
                // The /work pages arrive in plan 05: don't prefetch 404s.
                prefetch={false}
                onPointerEnter={() => select(index)}
                onFocus={() => select(index)}
                className="focus-ring flex flex-col gap-2 px-4 py-4 min-[720px]:px-8 lg:px-0 lg:py-6"
              >
                <span className="index-title type-display-index whitespace-nowrap">
                  {row.displayName}
                </span>
                <span className="flex items-center gap-4">
                  <span className="type-meta text-ink-muted">{row.info}</span>
                  <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      data-arrow
      viewBox="0 0 24 12"
      className="index-arrow text-ink h-3 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    >
      <path d="M0 6h22M17 1l5 5-5 5" />
    </svg>
  );
}
