import Link from "next/link";
import type { ReactNode } from "react";

type ArticleEndProps = {
  /** Accessible name of the nav: "More work", "More posts". */
  label: string;
  next?: { href: string; kicker: ReactNode; title: string };
  back: { href: string; label: string };
};

/** The ending: an ink rule, the next article (if any) and the way back. */
export function ArticleEnd({ label, next, back }: ArticleEndProps) {
  return (
    <nav
      aria-label={label}
      className="max-w-measure border-ink mx-auto mt-24 grid gap-8 border-t pt-8 pb-16"
    >
      {next && (
        <Link
          href={next.href}
          className="group focus-ring hover:text-accent focus-visible:text-accent grid gap-2"
        >
          <span className="type-meta text-ink-muted">{next.kicker}</span>
          {/* The arrow follows the last word, so long titles keep it close. */}
          <span className="text-h2 type-heading font-extrabold">
            {next.title}
            <span
              aria-hidden="true"
              // inline-block: translate has no effect on inline boxes.
              // Nudge only when motion is OK; reduced motion: no movement.
              className="ml-4 inline-block duration-(--duration-link) ease-(--ease-out-soft) motion-safe:transition-[translate] motion-safe:group-hover:translate-x-2 motion-safe:group-focus-visible:translate-x-2"
            >
              →
            </span>
          </span>
        </Link>
      )}
      <Link
        href={back.href}
        className="type-meta focus-ring hover:text-accent focus-visible:text-accent inline-flex items-center gap-2 justify-self-start"
      >
        <span aria-hidden="true">←</span> {back.label}
      </Link>
    </nav>
  );
}
