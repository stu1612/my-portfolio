// Temporary content for sections whose real pages arrive in later plans
// (About: 07, Blog and Now: 03, Contact: 06). Replace, don't extend.

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4 px-4 py-24 min-[720px]:px-8">
      <h1 className="text-h1 type-heading">{title}</h1>
      <p className="type-meta text-ink-muted">Coming soon</p>
    </div>
  );
}
