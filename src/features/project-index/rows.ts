// Pure view model for the homepage project index. No generated imports, so
// Vitest can test it; project-index.tsx feeds it from @/lib/content.

/** The case study fields the index needs (a subset of CaseStudy). */
export type IndexEntry = {
  slug: string;
  url: string;
  displayName: string;
  year: number;
  stack: readonly string[];
  preview?: { src: string; alt: string };
};

export type IndexRow = {
  slug: string;
  href: string;
  displayName: string;
  /** Stack (first three) then year, e.g. "Astro · Vercel · HubSpot · 2026". */
  info: string;
  preview?: { src: string; alt: string };
};

const MAX_STACK = 3;

export function toRows(entries: readonly IndexEntry[]): IndexRow[] {
  return entries.map((entry) => ({
    slug: entry.slug,
    href: entry.url,
    displayName: entry.displayName,
    info: [...entry.stack.slice(0, MAX_STACK), String(entry.year)].join(" · "),
    ...(entry.preview ? { preview: entry.preview } : {}),
  }));
}

/** The row selected before any input: the first, or none when empty. */
export function initialSelection(rows: readonly IndexRow[]): number | null {
  return rows.length > 0 ? 0 : null;
}
