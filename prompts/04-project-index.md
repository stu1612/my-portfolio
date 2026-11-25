# 04 · Project index

Status: built

<!-- One value only: draft → approved (Stu) → built (agent, all agent-run checks pass) → verified (Stu, human checks pass).
     The plan-gate hook reads this line: app code is blocked until it says approved. -->

**Fixed rules for this plan: only Stu sets `approved` and `verified`. The agent sets `draft` and `built`.**

## Goal

A visitor lands on the dark homepage and sees the case studies as large extended-caps rows over a gradient stage. Selecting a row dims the others, fades its title into the gradient and shows a sharp screenshot of the project. On a phone, selecting means scrolling the row to the centre; on desktop, it means hover or focus. Each row links to its case study. The build is mobile-first, and Stu signs off on a real phone before any desktop work starts.

## Brief

Project index: dark gradient stage, rows, title fade, preview images, mobile behaviour

Follow-up: "before we begin, would you rather start focusing on mibile designs first where we can check and verify before moving to desktop. i have attached two images in desings for the placeholder, portfolio will come later"

- Images: Stu supplied them pre-cropped (browser chrome removed) as `public/previews/probell.jpg` (1740×852) and `public/previews/sundet.jpg` (1740×980). Intent: **preview content**, not a layout reference. The uncropped originals are not kept.
- Follow-up: "team4q or basket should be called sundet. replace all references for team4q."
- There is no layout reference, so the design-system ProjectIndex rules are the spec.

## Decisions for you

1. **Build order. Recommended: mobile first, with a stop for Stu.** Steps 1–5 build the stage, rows, snapped list and preview at 375 and 768px. Step 5 ends the build session with screenshots, and Stu checks it on a real phone. Desktop (steps 6–7) only starts when Stu replies. Mobile is where the unknowns are (scroll snap, the centre-line observer, iOS and the gradient text). Desktop adds hover and a second column on the same markup.
2. **Which projects show. Decided:** PROBELL and SUNDET are published (`draft: false`). SUNDET is the old TEAM4Q stub, renamed in a prep commit (`team4q.mdx` becomes `sundet.mdx`, `displayName: SUNDET`, and every reference outside past plans is updated). PORTFOLIO stays a draft, so it's hidden in production, and it appears automatically once Stu publishes it. Before step 3, Stu fills in `year` and `stack` (the fields the index shows) for SUNDET. Bodies stay TODO; no `/work/<slug>` page exists until plan 05.
3. **Row links before plan 05. Recommended: real hrefs (`/work/<slug>`)**, which 404 until plan 05. `main` doesn't change until Stu merges. Alternative: render rows as non-links until 05.
4. **Dimming vs contrast (raising a Must conflict).** Plain `ink` at 35% opacity over `stage-base` is about 3.2:1, and over the ember field it's under 3:1. **Recommended:** dim only the title and arrow, to the lowest opacity that keeps the titles at 3:1 (large text) over the brightest field. A unit test computes this value and stores it as a token, so expect about 50–60%. The mono info line never dims. Alternative: keep 35% and accept an AA failure while a row is selected.
5. **Preview crop. Decided:** Stu supplied JPGs with the browser chrome removed. `sundet.jpg` is 16:9. `probell.jpg` is wider (about 2.04:1), so in the 16:9 box `object-fit: cover` trims about 110px from each side, which clips the start of "WHEY 100". Stu re-exports it at 1740×980 before step 4. If that hasn't happened, the build uses `object-position: left center` and flags it.
6. **Mobile preview position. Recommended:** a fixed 16:9 area at the top of `<main>`, under the navbar, with the snapped list scrolling below it. Alternative: pinned at the bottom above the footer.
7. **Homepage heading. Recommended:** a visible mono `meta` line above the rows, "FULL-STACK DEVELOPER · COPENHAGEN / SKÅNE · SELECTED WORK", marked up as the page `<h1>`. Alternative: rows only, with a visually hidden `<h1>`.
8. **Stage extent. Recommended: behind the whole homepage frame** (bar, main and footer), through a small `stage` slot on `Shell`. Alternative: behind `<main>` only.
9. **Desktop. Decided at the step 5 stop:** a split index (list left, preview right) from 1024px, with titles at `clamp(…, 6.5vw, 6.5rem)` from 1024px only (mobile keeps `9vw`). The info line stays below the title, and 1px `hairline` rules separate the desktop rows. For long names, the mobile minimum drops from 3rem to 2.75rem and `displayName` is limited to 9 characters (a schema change Stu approved), so PORTFOLIO fits at 375px. The original recommendation: At `9vw`, PORTFOLIO-length titles leave no room for a preview beside the list at 1024px. Recommended: side by side from 1024px, with `--text-display-index` changed to about `clamp(3rem, 6.5vw, 6.5rem)` (step 6 measures it). At rest nothing is dimmed and the first preview shows. When the pointer leaves the list, the dimming clears and the last preview stays.

## What I need to understand

- **CSS scroll snap** (`scroll-snap-type: y mandatory` on the scroller, `scroll-snap-align: center` on rows) makes the list settle with one row centred. [MDN](https://developer.mozilla.org/docs/Web/CSS/CSS_scroll_snap)
- **`IntersectionObserver` with `rootMargin: "-50% 0px -50% 0px"`** shrinks the observed area to a line through the middle of the scroller. The row crossing that line is the selected one, with no scroll listeners. [MDN](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API)
- **`background-clip: text`** paints a background only inside the glyphs. With `color` transparent, the gradient shows through the letters. [MDN](https://developer.mozilla.org/docs/Web/CSS/background-clip)
- **`background-attachment: fixed`** sizes the background to the viewport, so the gradient in the letters lines up with the stage. iOS Safari ignores it, so on iPhones the fill uses the glow tints but isn't pixel-aligned with the stage. That's part of Stu's phone check at step 5. [MDN](https://developer.mozilla.org/docs/Web/CSS/background-attachment)
- **`next/image` in Next 16:** `priority` is deprecated in favour of `preload`. `fill` with `sizes` gives a full `srcset`. Local JPGs are served as WebP/AVIF. [Next.js docs](https://nextjs.org/docs/app/api-reference/components/image)
- **Questions you should be able to answer:** Why build mobile first here? Why one piece of selection state with two inputs (scroll position on mobile, pointer or focus on desktop)? How did you reconcile the 35% dimming with WCAG? Why do the previews cross-fade with `opacity` rather than swapping `src`? Why is only the title `color` allowed to animate?

## Implementation notes

Model: Opus. This is novel, motion-heavy UI with several design-system Musts that interact (contrast against a gradient, dimming, fit-to-one-line), and it needs judgement at each check.

**Files**

The first feature folder, `src/features/project-index/`:

- `rows.ts`: pure logic. `toRows(caseStudies)` maps entries to `{ slug, href, displayName, info, preview }`. `info` is the first three stack items, then the year, joined with " · " (e.g. `ASTRO · VERCEL · HUBSPOT · 2026`), and `href` comes from `urlFor("caseStudies", slug)`. Also `initialSelection(rows)`, which returns `0` or `null` when there are no rows. Tested in `rows.test.ts`.
- `project-index.tsx`: a server component. It calls `getCaseStudies()` and `toRows()`, then renders `<ProjectList rows>`, or a single `meta` line, "CASE STUDIES SOON", when there are no rows.
- `project-list.tsx`: a `"use client"` component with one `selected: number | null` state.
  - Mobile (steps 3–5): an `IntersectionObserver` on the list scroller sets it, while `matchMedia("(max-width: 1023px)")` matches.
  - Desktop (step 6): `onPointerEnter`/`onFocus` set it. `onPointerLeave` on the list clears it, while a separate `shown` index keeps the preview.
  - The list gets `data-selected` and each row gets `data-state="selected | dimmed | idle"`. All styling hangs off those attributes, so hover and focus are identical by construction.
- `preview.tsx`: every preview stacked in one 16:9 box (`radius-md`, 1px `hairline`), each a `next/image` with `fill`, `sizes="(min-width: 1024px) 35vw, 100vw"` and `loading="eager"`. The one shown has opacity 1 and the rest 0, cross-fading with `opacity` only. The first gets `preload`. A missing preview leaves the frame empty.
- `stage.tsx`: an `aria-hidden` absolute layer with three radial gradients (`field-1` to `field-3`) over `stage-base`, plus grain (`--stage-grain`, an SVG `feTurbulence` data URI, at `--stage-grain-opacity: 0.06`). It's static.
- `src/app/(home)/page.tsx`: renders the `<h1>` meta line and `<ProjectIndex />`.
- `src/components/shell.tsx`: an optional `stage?: ReactNode` prop rendered behind the frame. When it's set, the frame's `bg-surface` is dropped. The menu overlay stays opaque.
- `public/previews/<slug>.jpg`: supplied by Stu. `next/image` serves WebP/AVIF from them.

**Mobile layout (below 1024px):** `<main>` holds a column with the preview area (`shrink-0`, 16:9, gutter 4 at 375px and 8 from 720px) and the list scroller (`min-h-0 flex-1 overflow-y-auto`, snap). The scroller's block padding is `calc(50% - <half a row>)`, so the first and last rows can reach the centre. The document never scrolls (the frame Must).

**Tokens** (`tokens.css`; design-system values, not Musts):

- `--duration-dim: 200ms` and `--duration-title: 400ms`
- `--opacity-dimmed`: from the step 1 test
- `--stage-grain` and `--stage-grain-opacity`
- `--stage-field-1` to `--stage-field-3`: each a whole `radial-gradient(...)` value
- `--text-display-index`: changed only in step 6, if approved at the stop

**Title fade:** the title always has the glow gradient as `background-image` (same positions as the stage, filled with `glow-1` to `glow-3`), `background-clip: text` and `background-attachment: fixed`. At rest `color: var(--ink)`. When selected, `color: transparent` over `--duration-title` with `--ease-out-soft`. Under `@supports not (background-clip: text)`, the selected title stays `ink`.

**Contrast helper:** `composite(fg, bg, alpha)` in `src/styles/contrast.ts` (sRGB blend, returns `#rrggbb`).

**Reduced motion:** opacity and colour fades stay, since fades are allowed. The arrow's `translateX` on selection is removed. Scroll snap stays.

**Fallbacks**

- If the centre-line observer misses short rows, use thresholds `[0, 1]` and, in the callback, pick the row whose centre is nearest the scroller's middle. No scroll listener.
- If `preload` warns about multiple LCP candidates, drop it and keep `loading="eager"`.

## Out of scope

- `/work/<slug>` pages: plan 05.
- The PORTFOLIO preview and content: later. It stays a draft.
- Cursor-following preview: roadmap "Later". The fixed preview box is the seam.
- Case study bodies, and schema changes.
- Any page other than `/`.

## Steps

### 0. Prep: rename TEAM4Q to SUNDET (done before step 1, at Stu's request)

Run `git mv content/case-studies/team4q.mdx content/case-studies/sundet.mdx` and set `displayName: SUNDET`. Update `src/lib/content/index.test.ts` (the expected slug list) and the rows line in `docs/design-system.md`. Past plans (`prompts/03-*.md`) are history and stay as they are. Check: typecheck, lint, unit tests. Commit: `refactor(content): rename team4q case study to sundet`.

### 1. Tokens and pure logic

Add `composite()` to `contrast.ts` with tests (black at 0.5 over white gives `#808080`; alpha 1 returns the foreground and alpha 0 the background). In `tokens.test.ts`, add:

- each `glow-*` on each `field-*` is at least 3:1
- `ink` composited at `--opacity-dimmed` over `stage-base` and every `field-*` is at least 3:1

Pick the lowest passing value, in steps of 0.05. Add the motion and stage tokens. Write `rows.ts` and `rows.test.ts`: order, `info` with more than three stack items and with fewer, `href`, empty input, `initialSelection`. Check: typecheck, lint, unit tests. Commit: `feat(index): stage tokens, dimming contrast and row model`.

### 2. Stage

Add `stage.tsx` and the `stage` slot on `Shell`, and use them in `(home)/layout.tsx`. In a new `e2e/project-index.spec.ts`:

- the stage exists on `/` only
- it has `aria-hidden="true"`
- its computed `background-image` has three `radial-gradient`s
- the bar and footer are transparent on `/`
- the light-route checks still pass

Check: typecheck, lint, unit tests, e2e and axe. Commit: `feat(index): dark gradient stage behind the homepage frame`.

### 3. Rows and the snapped mobile list

Pre-check: Decision 2's frontmatter is done, and `npm run build` shows two published case studies. If it doesn't, stop and ask Stu. Add `project-index.tsx`, `project-list.tsx` (the observer only), the `<h1>`, and the dimming and title fade styles. In e2e at 375 and 768px:

- rows appear in `order`, each a link to `/work/<slug>` with name, info and an `aria-hidden` arrow
- after `scrollIntoView({ block: "center" })` on row 2, it has `data-state="selected"`, a transparent title `color` and `background-clip: text`
- the other row titles have `--opacity-dimmed` and their info has opacity 1
- every title fits on one line (height ≤ 1.2 × line height, no overflow)
- the document doesn't scroll and there's no horizontal scroll
- with `reducedMotion: "reduce"`, the arrow's transform is `none`

Check: typecheck, lint, unit tests, e2e and axe (with a row selected). Commit: `feat(index): scroll-snapped project rows with centred selection`.

### 4. Mobile preview

Set `preview` (`src: /previews/<slug>.jpg` and a one-line alt) in the two published files. Check the PROBELL aspect (Decision 5). Add `preview.tsx` in the fixed area (Decision 6). In e2e at 375 and 768px:

- the selected row's preview has opacity 1 and the others 0
- the preview area doesn't move while the list scrolls
- each preview `img` has non-empty alt text
- the shown image's `naturalWidth` ≥ its rendered width × `devicePixelRatio`

Check: typecheck, lint, unit tests, e2e and axe. Commit: `feat(index): preview area for the selected project`.

### 5. Mobile screenshots, then stop for Stu

Add homepage cases to `e2e/screenshots.spec.ts`: rest, row 2 centred, and reduced motion, at 375 and 768px. Compare them with every ProjectIndex Must and list the differences. Fix only bugs in this plan's files (commit as `fix(index): <what>`).

**Then stop the build.** Report the findings, the screenshot paths and Decision 9. Stu then:

- runs `npm run dev -- -H 0.0.0.0` and opens the LAN URL on a real phone
- checks the snap feel, the title fade, the dimming, the iOS gradient fill and preview sharpness
- replies with fixes or "go desktop"

Don't start step 6 without that reply. A resumed `/feature 04` continues from step 6 only once the reply is in the conversation or noted in this plan's Result.

### 6. Desktop: preview beside the list, hover and focus

From 1024px: two columns (list and preview), pointer and focus selection, the resting state and the leave behaviour (Decision 9), and the measured `--text-display-index` if it was approved. In e2e at 1024 and 1440px:

- hovering row 1 and focusing it with Tab give identical computed opacity and colour on every row
- at rest nothing is dimmed and the first preview shows
- after the pointer leaves, nothing is dimmed and the last preview stays
- titles fit on one line
- the mobile tests still pass

Check: typecheck, lint, unit tests, e2e and axe (row hovered too). Commit: `feat(index): desktop layout with hover and focus selection`.

### 7. Desktop screenshots and findings

Add rest, row 2 hovered and reduced-motion cases at 1024 and 1440px. Compare them with the Musts and list the differences. Fix only this plan's bugs. Check: all checks pass. Commit any fix as `fix(index): <what>`.

## Verification

- **Agent-run:** typecheck, lint, unit tests (stage contrast included), e2e and axe (with a row selected), `npm run build`, and screenshots at 375 / 768 / 1024 / 1440px plus reduced motion, compared with the Musts.
- **Stu:**
  - at step 5, on a real iPhone (Safari) and, if available, an Android phone: snap feel, fade and dim timing, gradient fill without `background-attachment: fixed`, and preview sharpness
  - at close-out: the desktop feel, and the stage colours and grain on a normal screen

## AGENTS.md updates

Proposed. Stu edits AGENTS.md.

- **Design system → ProjectIndex** (`docs/design-system.md`): replace "dims the other rows to about 35% opacity" with "dims the other rows' titles and arrows to `--opacity-dimmed`, the lowest opacity that keeps 3:1 over every stage field (tested); info text never dims". Add the layout: "below 1024px, a fixed 16:9 preview above a scroll-snapped list; from 1024px, preview beside the list".
- **Platform:** "The homepage stage is owned by `src/features/project-index/` and rendered through `Shell`'s `stage` slot. Preview images live in `public/previews/<slug>.jpg`."
- **Design system → ProjectIndex:** the rows line becomes "Rows: PROBELL, SUNDET, PORTFOLIO." This is done in the prep commit, since Stu asked for every reference to be replaced.
- **Workflow:** "UI plans may include a stop step for Stu's real-device check. The build doesn't continue past it without Stu's reply."

## Result

Filled at close-out.
