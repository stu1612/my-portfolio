import { notFound } from "next/navigation";
import {
  EMPTY_SLUG,
  getCaseStudies,
  getCaseStudy,
  staticSlugs,
} from "@/lib/content";

export function generateStaticParams() {
  return staticSlugs(getCaseStudies());
}

export default async function CaseStudyPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const entry = slug === EMPTY_SLUG ? undefined : getCaseStudy(slug);
  if (!entry) notFound();
  return <h1>{entry.title}</h1>;
}
