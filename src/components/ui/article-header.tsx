import type { ReactNode } from "react";

type ArticleHeaderProps = {
  kicker: string;
  title: string;
  deck: string;
  /** What sits under the deck: case study facts, a post's tags line. */
  children?: ReactNode;
};

/** Kicker, headline and deck in the reading column. Shared by case studies and posts. */
export function ArticleHeader({
  kicker,
  title,
  deck,
  children,
}: ArticleHeaderProps) {
  return (
    <header className="max-w-measure mx-auto grid gap-6 pt-16 pb-12 min-[1024px]:pt-24">
      <p className="type-meta text-ink-muted">{kicker}</p>
      <h1 className="text-headline type-heading">{title}</h1>
      <p className="type-deck">{deck}</p>
      {children}
    </header>
  );
}
