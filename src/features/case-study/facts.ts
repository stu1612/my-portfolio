// Pure view model for the case study page header and ending. No generated
// imports, so Vitest can test it; the page feeds it from @/lib/content.

/** The case study fields the header and ending need (a subset of CaseStudy). */
export type CaseStudyFields = {
  client: string;
  role: string;
  year: number;
  stack: readonly string[];
  readingMinutes: number;
};

export type Fact = { label: string; value: string };

/** ROLE, STACK, YEAR, READ, in the order the header shows them. */
export function toFacts(entry: CaseStudyFields): Fact[] {
  return [
    { label: "Role", value: entry.role },
    { label: "Stack", value: entry.stack.join(" · ") },
    { label: "Year", value: String(entry.year) },
    { label: "Read", value: `${entry.readingMinutes} min` },
  ];
}

/** The kicker above the headline: "Case study · Probell Nutrition · 2026". */
export function kicker(
  entry: Pick<CaseStudyFields, "client" | "year">,
): string {
  return ["Case study", entry.client, String(entry.year)].join(" · ");
}

const MAX_STACK = 3;

/** The label over the next project: "Next project · Astro · TypeScript · 2026". */
export function nextLabel(
  entry: Pick<CaseStudyFields, "stack" | "year">,
): string {
  return [
    "Next project",
    ...entry.stack.slice(0, MAX_STACK),
    String(entry.year),
  ].join(" · ");
}
