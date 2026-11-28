// Pure helpers for content entries. No generated imports, so Vitest can test them.

export type Collection = "caseStudies" | "posts" | "now";

const WORDS_PER_MINUTE = 225;

/** "case-studies/probell.mdx" -> "probell". Slugs come from file names. */
export function slugFromPath(path: string): string {
  const file = path.split("/").pop() ?? path;
  return file.replace(/\.mdx?$/, "");
}

export function urlFor(collection: Collection, slug?: string): string {
  switch (collection) {
    case "caseStudies":
      return `/work/${slug}`;
    case "posts":
      return `/blog/${slug}`;
    case "now":
      return "/now";
  }
}

export function readingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** Drafts show in dev and are left out of production. */
export function isPublished(
  entry: { draft: boolean },
  isProduction: boolean,
): boolean {
  return !(isProduction && entry.draft);
}

/** Newest first. Dates are ISO strings, so string order is date order. */
export function sortPosts<T extends { published: string }>(
  posts: readonly T[],
): T[] {
  return [...posts].sort((a, b) => b.published.localeCompare(a.published));
}

export function sortCaseStudies<T extends { order: number }>(
  items: readonly T[],
): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/** For single-file collections (Now): exactly one file, or the build fails. */
export function assertSingle<T>(items: readonly T[], name: string): T {
  if (items.length !== 1) {
    throw new Error(
      `Expected exactly one "${name}" entry, found ${items.length}. Check content/ for a missing or duplicate file.`,
    );
  }
  return items[0];
}

/**
 * Reserved slug for a dynamic route with nothing published. Cache Components
 * rejects an empty generateStaticParams, so the route prerenders this one
 * slug and its page calls notFound().
 */
export const EMPTY_SLUG = "_empty";

/** generateStaticParams for a content route: one param per entry, never none. */
export function staticSlugs(
  entries: readonly { slug: string }[],
): { slug: string }[] {
  if (entries.length === 0) return [{ slug: EMPTY_SLUG }];
  return entries.map(({ slug }) => ({ slug }));
}

/** The entry after `slug`, wrapping to the first. Undefined if there is no other. */
export function nextCaseStudy<T extends { slug: string }>(
  entries: readonly T[],
  slug: string,
): T | undefined {
  const index = entries.findIndex((entry) => entry.slug === slug);
  if (index === -1 || entries.length < 2) return undefined;
  return entries[(index + 1) % entries.length];
}

/**
 * The post after `slug` in newest-first order: the next older one. Posts are a
 * timeline, so the oldest has none (no wrap, unlike nextCaseStudy).
 */
export function olderPost<T extends { slug: string }>(
  entries: readonly T[],
  slug: string,
): T | undefined {
  const index = entries.findIndex((entry) => entry.slug === slug);
  if (index === -1) return undefined;
  return entries[index + 1];
}
