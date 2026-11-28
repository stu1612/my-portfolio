import { ArticleHeader } from "@/components/ui/article-header";
import { formatDate, postKicker } from "./format";

type PostHeaderProps = {
  title: string;
  description: string;
  published: string;
  updated?: string;
  tags: readonly string[];
  readingMinutes: number;
};

/** Kicker with date and read time, headline, deck, then tags and the updated date. */
export function PostHeader(props: PostHeaderProps) {
  const { title, description, updated, tags } = props;
  const hasMeta = tags.length > 0 || updated;
  return (
    <ArticleHeader kicker={postKicker(props)} title={title} deck={description}>
      {hasMeta && (
        <p className="type-meta text-ink-muted border-ink mt-4 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t pt-2">
          <span>{tags.join(" · ")}</span>
          {updated && (
            <span>
              Updated <time dateTime={updated}>{formatDate(updated)}</time>
            </span>
          )}
        </p>
      )}
    </ArticleHeader>
  );
}
