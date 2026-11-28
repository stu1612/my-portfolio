import Link from "next/link";
import { formatDate, rowMeta } from "./format";

export type PostRow = {
  url: string;
  title: string;
  description: string;
  published: string;
  readingMinutes: number;
  tags: readonly string[];
};

/**
 * Dated rows under hairlines (mockup A): the date above the title on phones,
 * in its own column from 720px. The whole row is the link.
 */
export function PostList({ posts }: { posts: readonly PostRow[] }) {
  if (posts.length === 0) {
    return (
      <p className="max-w-measure text-body text-ink-muted mx-auto">
        No posts yet.
      </p>
    );
  }

  return (
    <ol className="max-w-measure border-hairline mx-auto border-b">
      {posts.map((post) => (
        <li key={post.url} className="border-hairline border-t">
          <Link
            href={post.url}
            className="group focus-ring grid gap-2 py-6 min-[720px]:grid-cols-[var(--container-date)_minmax(0,1fr)] min-[720px]:items-baseline min-[720px]:gap-x-6"
          >
            <time
              dateTime={post.published}
              className="type-meta text-ink-muted"
            >
              {formatDate(post.published)}
            </time>
            <span className="grid gap-2">
              <span className="text-h3 type-heading group-hover:text-accent group-focus-visible:text-accent flex items-baseline justify-between gap-4">
                {post.title}
                <span
                  aria-hidden="true"
                  // Nudge only when motion is OK; reduced motion: no movement.
                  className="shrink-0 duration-(--duration-link) ease-(--ease-out-soft) motion-safe:transition-[translate] motion-safe:group-hover:translate-x-2 motion-safe:group-focus-visible:translate-x-2"
                >
                  →
                </span>
              </span>
              <span className="text-body-sm text-ink-muted">
                {post.description}
              </span>
              <span className="type-meta text-ink-muted">{rowMeta(post)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
