# 01 · Typography and fonts

Status: approved

<!-- One value only: draft → approved (Stu) → built (agent, all agent-run checks pass) → verified (Stu, human checks pass).
     The plan-gate hook reads this line: app code is blocked until it says approved. -->

**Fixed rules for this plan: only Stu sets `approved` and `verified`. The agent sets `draft` and `built`.**

## Goal

Every page renders in Archivo (body and headings, with the width and weight axes live) and IBM Plex Mono (labels, metadata, code), self-hosted by `next/font`. Each role in the type scale in `tokens.css` carries its own weight, width, case and tracking, so later plans write `text-h1` or `text-meta` and get the right look.

## Brief

Typography and fonts: Archivo + IBM Plex Mono wired to the type scale

- Image: none. Values come from `tokens.css` and the Must rules in `docs/design-system.md`.

## Decisions for you

1. **Where the full role styling lives. Recommended:** put weight and tracking in the scale tokens (`--text-h1--font-weight` and so on, which Tailwind v4 reads). Add a few small `@utility` classes in `tokens.css` only for roles that need more than size and weight: `type-display-index` (900, `font-stretch: 125%`, uppercase) and `type-meta` (mono, 500, uppercase, 0.08em). Alternative: a separate `typography.css`. That breaks "no other global CSS", so I don't recommend it.
2. **How we prove it looks right. Recommended:** a temporary specimen route, `/type-specimen`. It shows every role in both themes, so I can screenshot it at 375, 768 and 1440px and run computed-style checks in Playwright. The last step deletes the route again. Alternative: check only the placeholder homepage, which shows just two or three roles and can't show the width axis at 125%. Deleting files needs your approval, and approving this plan covers that one route.
3. **Latin subset only. Recommended: yes.** It covers Danish and Swedish letters (å ä ö æ ø). It leaves out latin-ext, vietnamese and cyrillic, which the site doesn't use. Adding more later is one line.
4. **Font weights loaded. Recommended:** Archivo as a full variable font with the `wdth` axis, and Plex Mono at static 400 and 500 only, because those are the only mono weights in the scale. Plan 08's Lighthouse budget will show whether Archivo's width axis is worth its size. If it isn't, plan 08 can cut it, but then the 125% index caps would need a different approach.
5. **No new dependencies or services.** `next/font/google` is part of Next, and the two fonts are already in AGENTS.md.

## What I need to understand

**Concepts and docs**

- `next/font/google` downloads the fonts at build time and serves them from your own domain. Visitors make no request to Google: https://nextjs.org/docs/app/api-reference/components/font
- `axes: ["wdth"]` adds the width axis, because the loader includes only weight by default. `weight` stays at its default `"variable"`. I checked the installed `font-data.json`: Archivo has `wdth` 62–125 and `wght` 100–900, and IBM Plex Mono is static only (400/500 are valid).
- The `variable` option sets a CSS variable (`--font-archivo`) on `<html>`. Tailwind's `--font-sans` points at it, so every `font-sans` utility uses the loaded font. Next also generates a size-adjusted fallback font, which keeps layout shift near zero while Archivo loads.
- `font-stretch: 125%` selects a width on the variable font's `wdth` axis. It only works if the font file contains that axis, which is why `axes` matters.
- Tailwind v4 reads `--text-*--line-height`, `--text-*--font-weight` and `--text-*--letter-spacing` from `@theme`: https://tailwindcss.com/docs/font-size

**Questions you should be able to answer**

- Why `next/font` instead of a `<link>` to Google Fonts? It self-hosts at build, with no third-party request, no layout shift from late swaps, and it's better for privacy and performance.
- Why a variable font? One file gives every weight and width, so index caps at 900/125% and body at 400 cost one download instead of several.
- Why does the design system forbid animating `font-stretch`? It forces layout and text reflow on every frame.

**Spike (first step):** build once with `axes: ["wdth"]`, then check in the browser that `font-stretch: 125%` visibly widens the glyphs and note the woff2 sizes. If the axis doesn't take effect, stop and report before going further.

## Implementation notes

Model: Sonnet — a typical, well-specified feature. It needs some care with Tailwind v4 theme keys but has no novel UI or state.

**Files**

- `src/app/layout.tsx`:
  - Import `Archivo` and `IBM_Plex_Mono` from `next/font/google`.
  - Archivo: `subsets: ["latin"]`, `axes: ["wdth"]`, `display: "swap"`, `variable: "--font-archivo"`.
  - Plex Mono: `subsets: ["latin"]`, `weight: ["400", "500"]`, `display: "swap"`, `variable: "--font-plex-mono"`.
  - Add both `.variable` class names to `<html>`.
- `src/styles/tokens.css`:
  - Move `--font-sans` and `--font-mono` into an `@theme inline` block so they reference the Next variables: `var(--font-archivo), system-ui, sans-serif` and `var(--font-plex-mono), ui-monospace, monospace`. Plain `@theme` would resolve them too early, because the variables are defined on `<html>`.
  - Add `--text-*--font-weight` and `--text-*--letter-spacing` where the scale comments already name them: hero 800, h1 800, h2 700, h3 700, body and body-sm 400, meta 500 at 0.08em, code 400, display-index 900.
  - Add `@utility type-display-index` and `@utility type-meta` as in Decision 1. Heading roles also get `text-wrap: balance` (the Suggested rule), through a small `type-heading` utility or inside the heading scale entries, whichever Tailwind accepts.
  - If a `--text-*--font-weight` key doesn't take effect in Tailwind 4.3.3, fall back to one `@utility type-<role>` per role and say so in the report.
- `src/app/page.tsx`: switch the placeholder to the new role utilities (`type-meta` replaces the hand-written mono/uppercase/tracking string).
- `src/app/type-specimen/page.tsx` (temporary, Decision 2): every role in the scale, with sample text and its token name, in a light block and a `data-theme="dark"` block. Includes an "ÅÄÖÆØ" line and a 125% index-caps line.
- `e2e/routes.ts`: add `/type-specimen` while it exists, and remove it in the last step.
- `e2e/typography.spec.ts`: computed-style checks on the specimen:
  - the `h1` role resolves to a font family starting with Archivo, weight 800;
  - the index-caps sample has `font-stretch: 125%` and weight 900;
  - a meta sample is Plex Mono, 500, uppercase;
  - `document.fonts.check()` is true for both families (proves the files loaded, not just the fallback).
- `src/lib/type-scale.test.ts`: a Vitest check that reads `tokens.css` and asserts every role in the scale has a size, line height and weight (`parseTokenBlocks` doesn't cover `@theme`, so this adds a small parser or a regex helper). It catches a role added without a weight.

**Must rules this plan touches:** Archivo for everything people read, mono only for labels, metadata and code, and no raw font values outside `tokens.css`. The `next/font` family names in `layout.tsx` are the loader config, not styling, and AGENTS.md already names them.

## Out of scope

- Navbar, footer and layout shell: plan 02.
- Prose styling for MDX (measure, heading rhythm, code blocks): plan 05. This plan leaves the roles it will use.
- The homepage's dark theme and the index rows: plans 02 and 04.
- Font file size budgets: plan 08 (Lighthouse CI).
- Trimming the width axis if it turns out too heavy: plan 08.

## Steps

### 1. Load the fonts (spike)

In `layout.tsx` load both fonts as above and attach the variables. In `tokens.css` point `--font-sans` and `--font-mono` at them with `@theme inline`. Run `npm run build` and check in `npm run dev` that the placeholder renders in Archivo and Plex Mono (the "Site in progress" line). Then, in the browser console, confirm that `document.fonts.check('900 1em Archivo')` is true and that setting `font-stretch: 125%` on the `h1` visibly widens it. Write the woff2 sizes in the commit message body. Check: typecheck and lint pass, build passes. Commit: `feat(fonts): load Archivo and IBM Plex Mono via next/font`.

### 2. Type scale roles

Add the weight and tracking keys and the two `@utility` classes to `tokens.css` as in the notes. Update the placeholder page to use them. Add `src/lib/type-scale.test.ts`. Check: `npm test` passes, and a deliberate temporary removal of one weight makes the new test fail (then restore it). Commit: `feat(type): bind weight, width and tracking to the type scale`.

### 3. Specimen route and browser checks

Create `/type-specimen`, add it to `e2e/routes.ts`, and write `e2e/typography.spec.ts`. Check: `npm run test:e2e` passes, including the axe scan on both themes, and `npm run screenshots` produces the specimen at 375, 768 and 1440px. Look at the screenshots and list any role that overflows or wraps wrongly at 375px (`display-hero` at 5rem and `display-index` are the likely ones). Report them as findings and don't change the scale without asking. Commit: `test(type): specimen route and computed-style checks`.

### 4. Remove the specimen

Delete `src/app/type-specimen/` and its entry in `e2e/routes.ts`. Keep the screenshots from step 3 in the report. Change `e2e/typography.spec.ts` to check the placeholder page instead (the `h1` is Archivo 800 and the meta line is Plex Mono 500 uppercase, with fonts loaded), and drop the checks that need the specimen. Check: typecheck, lint, unit tests and e2e pass. Commit: `chore(type): remove the temporary specimen route`.

## Verification

- **Agent-run:** typecheck, lint, unit tests, e2e and axe. Screenshots of the specimen at 375 / 768 / 1440px, compared with the Must rules in `docs/design-system.md` (no design image exists), with differences listed.
- **Stu:** open the dev server or the Vercel preview and look at the placeholder in a real browser. Check that Archivo is clearly not the system font, that the Plex Mono line reads as a label, and that nothing jumps when the page loads. View the specimen screenshots from the report, and say whether the index caps at 125% width feel right.

## AGENTS.md updates

None. If the spike shows the width axis is much too heavy, I'll propose a change to the Fonts line in "Who owns what" in a later plan, and I won't edit it silently.

## Result

Filled at close-out: what changed from the plan and why, test files changed (if any), and checks still pending for Stu.
