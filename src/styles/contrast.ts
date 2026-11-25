/** WCAG 2.x relative luminance of a #rrggbb colour. */
export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) throw new Error(`Expected a #rrggbb colour, got "${hex}"`);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(match[1].slice(i, i + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #rrggbb colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * A #rrggbb foreground at `alpha` opacity over a #rrggbb background, blended
 * per sRGB channel the way the browser paints it. Returns #rrggbb.
 */
export function composite(fg: string, bg: string, alpha: number): string {
  if (alpha < 0 || alpha > 1)
    throw new Error(`Alpha must be 0–1, got ${alpha}`);
  const channels = (hex: string) => {
    const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
    if (!match) throw new Error(`Expected a #rrggbb colour, got "${hex}"`);
    return [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16));
  };
  const [f, b] = [channels(fg), channels(bg)];
  return `#${f
    .map((value, i) =>
      Math.round(value * alpha + b[i] * (1 - alpha))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
