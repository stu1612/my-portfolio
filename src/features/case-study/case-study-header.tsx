import { ArticleHeader } from "@/components/ui/article-header";
import { kicker, toFacts, type CaseStudyFields } from "./facts";

type HeaderProps = CaseStudyFields & {
  title: string;
  summary: string;
  liveUrl?: string;
};

/** Kicker, headline, deck, facts under ink rules, and the live site link. */
export function CaseStudyHeader(props: HeaderProps) {
  return (
    <ArticleHeader
      kicker={kicker(props)}
      title={props.title}
      deck={props.summary}
    >
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 min-[720px]:grid-cols-[1.4fr_1.6fr_0.6fr_0.6fr]">
        {toFacts(props).map(({ label, value }) => (
          <div key={label} className="border-ink grid gap-1 border-t pt-2">
            <dt className="type-meta text-ink-muted">{label}</dt>
            <dd className="text-body-sm">{value}</dd>
          </div>
        ))}
      </dl>
      {props.liveUrl && (
        <p>
          <a
            href={props.liveUrl}
            rel="noreferrer"
            className="type-meta focus-ring hover:text-accent focus-visible:text-accent inline-flex items-center gap-2"
          >
            Live site <span aria-hidden="true">↗</span>
          </a>
        </p>
      )}
    </ArticleHeader>
  );
}
