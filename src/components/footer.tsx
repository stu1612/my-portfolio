import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-hairline shrink-0 border-t px-4 py-4 min-[720px]:px-8">
      <p className="type-meta text-ink-muted">
        © {site.copyrightYear} {site.name}
      </p>
    </footer>
  );
}
