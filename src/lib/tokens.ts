export type TokenMap = Record<string, string>;

export type TokenThemes = { light: TokenMap; dark: TokenMap };

/** Custom properties with a #rrggbb value inside one CSS block. */
function hexProperties(block: string): TokenMap {
  const tokens: TokenMap = {};
  for (const [, name, value] of block.matchAll(
    /--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g,
  )) {
    tokens[name] = value;
  }
  return tokens;
}

function blockBody(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`No "${selector}" block in tokens CSS`);
  const end = css.indexOf("}", start);
  return css.slice(start, end);
}

/**
 * Reads the colour tokens from tokens.css. The dark theme overrides the light
 * values; stage tokens exist only in :root and are shared by both themes.
 */
export function parseTokenThemes(css: string): TokenThemes {
  const light = hexProperties(blockBody(css, ":root"));
  const dark = {
    ...light,
    ...hexProperties(blockBody(css, '[data-theme="dark"]')),
  };
  return { light, dark };
}
