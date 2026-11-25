import { ProjectIndex } from "@/features/project-index/project-index";

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="type-meta text-ink-muted px-4 pt-6 min-[720px]:px-8">
        Full-stack developer · Copenhagen / Skåne · Selected work
      </h1>
      <ProjectIndex />
    </div>
  );
}
