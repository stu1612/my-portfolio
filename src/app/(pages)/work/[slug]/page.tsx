import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyHeader } from "@/features/case-study/case-study-header";
import { Cover } from "@/features/case-study/cover";
import { NextProject } from "@/features/case-study/next-project";
import {
  EMPTY_SLUG,
  getCaseStudies,
  getCaseStudy,
  nextCaseStudy,
  staticSlugs,
} from "@/lib/content";
import { Mdx } from "@/lib/content/mdx/mdx";

// Never empty: with nothing published this is the reserved EMPTY_SLUG, whose
// page is notFound(), so the route still builds when every entry is a draft.
// Unlisted slugs render at request time: they show the not-found page with
// noindex, but keep HTTP 200 (Cache Components sends the shell first).
export function generateStaticParams() {
  return staticSlugs(getCaseStudies());
}

const find = (slug: string) =>
  slug === EMPTY_SLUG ? undefined : getCaseStudy(slug);

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const entry = find((await params).slug);
  if (!entry) return {};
  return {
    title: `${entry.client} · Stu Bolderson`,
    description: entry.summary,
  };
}

export default async function CaseStudyPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const entry = find(slug);
  if (!entry) notFound();
  const next = nextCaseStudy(getCaseStudies(), slug);

  return (
    <div className="px-4 min-[720px]:px-8">
      <CaseStudyHeader {...entry} />
      {entry.preview && <Cover {...entry.preview} />}
      <article className="article-flow">
        <Mdx code={entry.code} />
      </article>
      <NextProject next={next} />
    </div>
  );
}
