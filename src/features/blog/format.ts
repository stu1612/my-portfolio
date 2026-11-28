// Pure labels for the blog list and post pages. No generated imports, so
// Vitest can test them; the pages feed them from @/lib/content.

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/**
 * "2026-11-28" -> "28 Nov 2026". Content dates are plain YYYY-MM-DD strings,
 * so this reads their parts: new Date() would parse UTC midnight and show the
 * day before in zones west of UTC.
 */
export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined;
  if (!match || !month)
    throw new Error(`Expected a YYYY-MM-DD date, got "${iso}".`);
  return `${Number(match[3])} ${month} ${match[1]}`;
}

/** The kicker above a post's headline: "Blog · 28 Nov 2026 · 6 min read". */
export function postKicker(post: {
  published: string;
  readingMinutes: number;
}): string {
  return `Blog · ${formatDate(post.published)} · ${post.readingMinutes} min read`;
}

/** The kicker above the list's headline: "Blog · 5 posts". */
export function listKicker(count: number): string {
  return `Blog · ${count} ${count === 1 ? "post" : "posts"}`;
}

/** The meta line under a list row: "6 min · Agents · Process". */
export function rowMeta(post: {
  readingMinutes: number;
  tags: readonly string[];
}): string {
  return [`${post.readingMinutes} min`, ...post.tags].join(" · ");
}

/** The label over the older-post link: "Older post · 10 Nov 2026". */
export function olderLabel(published: string): string {
  return `Older post · ${formatDate(published)}`;
}
