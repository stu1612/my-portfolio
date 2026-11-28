import { ArticleEnd } from "@/components/ui/article-end";
import { nextLabel } from "./facts";

type NextProjectProps = {
  next?: {
    url: string;
    client: string;
    stack: readonly string[];
    year: number;
  };
};

/** The case study ending: the next project (if any) and the way back. */
export function NextProject({ next }: NextProjectProps) {
  return (
    <ArticleEnd
      label="More work"
      next={
        next && {
          href: next.url,
          kicker: nextLabel(next),
          title: next.client,
        }
      }
      back={{ href: "/", label: "Index" }}
    />
  );
}
