// Temporary (plan 01): shows every type role in both themes for screenshots
// and computed-style checks. Removed in the last step of the plan.
const roles = [
  {
    role: "display-index",
    className: "type-display-index",
    sample: "Portfolio",
  },
  {
    role: "display-hero",
    className: "text-display-hero",
    sample: "Stu Bolderson",
  },
  {
    role: "h1",
    className: "text-h1 type-heading",
    sample: "Full-stack developer",
  },
  {
    role: "h2",
    className: "text-h2 type-heading",
    sample: "Problem-first case studies",
  },
  { role: "h3", className: "text-h3 type-heading", sample: "What went wrong" },
  {
    role: "body",
    className: "text-body",
    sample: "Copenhagen, Skåne: ÅÄÖ æøå. Body text is Archivo 400, never mono.",
  },
  {
    role: "body-sm",
    className: "text-body-sm",
    sample: "Smaller body text for captions and callouts, still Archivo 400.",
  },
  { role: "meta", className: "type-meta", sample: "Lund 14:30 · Open to work" },
  {
    role: "code",
    className: "text-code font-mono",
    sample: "const stage = 'dark';",
  },
] as const;

function Specimen({ theme }: { theme: "light" | "dark" }) {
  return (
    <section
      data-theme={theme === "dark" ? "dark" : undefined}
      data-testid={`specimen-${theme}`}
      className="bg-surface text-ink flex flex-col gap-8 px-6 py-12"
    >
      <p className="type-meta text-ink-muted">{theme} theme</p>
      {roles.map(({ role, className, sample }) => (
        <div key={role} className="flex flex-col gap-2">
          <p className="type-meta text-ink-muted">{role}</p>
          <p data-role={role} className={className}>
            {sample}
          </p>
        </div>
      ))}
    </section>
  );
}

export default function TypeSpecimen() {
  return (
    <main className="flex flex-1 flex-col">
      <h1 className="sr-only">Type specimen</h1>
      <Specimen theme="light" />
      <Specimen theme="dark" />
    </main>
  );
}
