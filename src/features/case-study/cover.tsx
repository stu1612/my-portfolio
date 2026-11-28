import Image from "next/image";

/** The preview image at the wide measure, under the header. */
export function Cover({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="max-w-wide border-hairline relative mx-auto mb-16 aspect-video overflow-hidden rounded-md border">
      <Image
        src={src}
        alt={alt}
        fill
        preload
        sizes="(min-width: 64rem) 64rem, 100vw"
        // Same crop as the index preview: left-anchored, keeps the headline.
        className="object-cover object-left"
      />
    </div>
  );
}
