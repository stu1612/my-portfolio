import Image from "next/image";
import type { IndexRow } from "./rows";

/**
 * Screenshots of every project, stacked in one 16:9 frame. Only the shown
 * one is visible; switching cross-fades opacity, so no image reloads.
 * A row without a preview leaves the frame empty.
 */
export function Preview({
  rows,
  shown,
}: {
  rows: readonly IndexRow[];
  shown: number;
}) {
  return (
    <div
      data-preview-area
      className="border-hairline relative mx-4 mt-4 aspect-video max-w-[calc(35dvh*16/9)] shrink-0 overflow-hidden rounded-md border min-[720px]:mx-8"
    >
      {rows.map((row, index) =>
        row.preview ? (
          <Image
            key={row.slug}
            src={row.preview.src}
            alt={row.preview.alt}
            fill
            sizes="(min-width: 720px) calc(100vw - 4rem), calc(100vw - 2rem)"
            // All are needed straight away; the first is the likely LCP.
            {...(index === 0 ? { preload: true } : { loading: "eager" })}
            data-preview={row.slug}
            data-shown={index === shown}
            aria-hidden={index === shown ? undefined : true}
            // Left-anchored: a wider screenshot keeps its left edge, where
            // the headline usually is.
            className={`object-cover object-left transition-opacity duration-(--duration-dim) ease-(--ease-out-soft) ${
              index === shown ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null,
      )}
    </div>
  );
}
