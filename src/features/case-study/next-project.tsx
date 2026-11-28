import Link from "next/link";
import { nextLabel } from "./facts";

type NextProjectProps = {
  next?: {
    url: string;
    client: string;
    stack: readonly string[];
    year: number;
  };
};

/** The ending: an ink rule, the next project (if any) and the way back. */
export function NextProject({ next }: NextProjectProps) {
  return (
    <nav
      aria-label="More work"
      className="max-w-measure border-ink mx-auto mt-24 grid gap-8 border-t pt-8 pb-16"
    >
      {next && (
        <Link
          href={next.url}
          className="group focus-ring hover:text-accent focus-visible:text-accent grid gap-2"
        >
          <span className="type-meta text-ink-muted">{nextLabel(next)}</span>
          <span className="text-h2 flex items-baseline gap-4 font-extrabold">
            {next.client}
            <span
              aria-hidden="true"
              // Nudge only when motion is OK; reduced motion: no movement.
              className="duration-(--duration-link) ease-(--ease-out-soft) motion-safe:transition-[translate] motion-safe:group-hover:translate-x-2 motion-safe:group-focus-visible:translate-x-2"
            >
              →
            </span>
          </span>
        </Link>
      )}
      <Link
        href="/"
        className="type-meta focus-ring hover:text-accent focus-visible:text-accent inline-flex items-center gap-2 justify-self-start"
      >
        <span aria-hidden="true">←</span> Index
      </Link>
    </nav>
  );
}
