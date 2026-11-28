// <Callout type="decision | wrong | ai"> for case studies. Variants differ by
// label and icon, never colour (design system: Callout Must).
import type { ReactNode } from "react";

const variants = {
  decision: {
    label: "Decision",
    icon: <path d="M8 15V7M8 7 3 2M8 7l5-5M3 2v4M3 2h4M13 2v4M13 2H9" />,
  },
  wrong: {
    label: "What went wrong",
    icon: (
      <>
        <path d="M8 1.5 15 14H1L8 1.5Z" />
        <path d="M8 6v4M8 11.5v1" />
      </>
    ),
  },
  ai: {
    label: "AI note",
    icon: (
      <path d="M8 1v4M8 11v4M1 8h4M11 8h4M3.5 3.5l2 2M10.5 10.5l2 2M12.5 3.5l-2 2M5.5 10.5l-2 2" />
    ),
  },
} as const;

export type CalloutType = keyof typeof variants;

export function Callout({
  type,
  children,
}: {
  type: CalloutType;
  children: ReactNode;
}) {
  const variant = variants[type];
  // A typo in MDX fails the build instead of rendering an unlabelled box.
  if (!variant) {
    throw new Error(
      `Unknown <Callout type="${type}">. Use ${Object.keys(variants).join(", ")}.`,
    );
  }
  return (
    <aside
      aria-label={variant.label}
      className="frame text-body-sm px-6 pt-4 pb-6"
    >
      <p className="type-meta text-ink-muted mb-2 flex items-center gap-2">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className="size-4 shrink-0"
        >
          {variant.icon}
        </svg>
        {variant.label}
      </p>
      <div className="[&>*+*]:mt-2">{children}</div>
    </aside>
  );
}
