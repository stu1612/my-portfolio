// <Figure src alt caption width height wide? /> for MDX. Images live in
// public/content/<slug>/. `number` is set at build time (number-figures.ts).
// `wide` breaks out of the reading column; the caption stays in it.
import Image from "next/image";

type FigureProps = {
  src: string;
  alt: string;
  caption?: string;
  width: number | string;
  height: number | string;
  wide?: boolean;
  number?: string;
};

export function Figure({
  src,
  alt,
  caption,
  width,
  height,
  wide = false,
  number,
}: FigureProps) {
  const w = Number(width);
  const h = Number(height);
  if (!src || !alt || !Number.isFinite(w) || !Number.isFinite(h)) {
    throw new Error(
      `<Figure> needs src, alt, width and height (got src="${src}", alt="${alt}", width="${width}", height="${height}").`,
    );
  }
  return (
    <figure data-wide={wide ? "" : undefined}>
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        sizes={
          wide
            ? "(min-width: 64rem) 64rem, 100vw"
            : "(min-width: 43.75rem) 43.75rem, 100vw"
        }
        className="border-hairline h-auto w-full rounded-md border"
      />
      {(caption || number) && (
        <figcaption
          className={`text-body-sm text-ink-muted mt-2 flex items-baseline gap-4 ${
            wide ? "max-w-measure mx-auto" : ""
          }`}
        >
          {number && <span className="type-meta shrink-0">Fig {number}</span>}
          {caption && <span>{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}
