import { getCaseStudies } from "@/lib/content";
import { ProjectList } from "./project-list";
import { toRows } from "./rows";

/** The homepage project index: published case studies in index order. */
export function ProjectIndex() {
  const rows = toRows(getCaseStudies());

  if (rows.length === 0) {
    return (
      <p className="type-meta text-ink-muted px-4 py-8 min-[720px]:px-8">
        Case studies soon
      </p>
    );
  }

  return <ProjectList rows={rows} />;
}
