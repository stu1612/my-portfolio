# 05 · Case study template

Status: draft

<!-- One value only: draft → approved (Stu) → built (agent, all agent-run checks pass) → verified (Stu, human checks pass).
     The plan-gate hook reads this line: app code is blocked until it says approved. -->

**Fixed rules for this plan: only Stu sets `approved` and `verified`. The agent sets `draft` and `built`.**

## Goal

A visitor clicks PROBELL on the index and reads `/work/probell` as an article: a centred reading column with a headline, the problem as the deck, and the facts. A wide cover image follows, then the story with callouts, wide figures and highlighted code. It ends on the next project. The route still builds when every case study is a draft.

## Brief

Case study and blog post templates

Direction from Stu at review:

- **Round 1** (A, B and C): case studies and blog posts get different designs, so this plan is case studies only, one design at a time, starting from mockups.
- **Round 2** (D, bands): "not quite what I want; the original version was more correct". Keep A's article structure, but centre the content on desktop. It should read like a case study article, similar to Medium.
- **References:**
  - https://theaicareerlab.com/design-md/portfolio-case-study-magazine: a 640px prose column, a kicker, headline and deck, a metadata block with a rule above each item, images that break wider than the text, and a quiet "View next project →" ending
  - https://shanjid.bd/projects/my-portfolio: cover, title and one-line description, date and reading time, live and source links, the stack, then the body with code
- Code inside MDX was not considered in rounds 1 and 2, so it's added here.
- **Round 3** (E): approved. Stu's answers: the headline is the `title`; code stays plain, with no highlighting; add the `url` field to the schema.

Design reference, to **match closely** (values from tokens):

- `docs/designs/05-case-study/e.html`
- `docs/designs/05-case-study-e-375.png` and `05-case-study-e-1440.png`

Mockups A to D were deleted once E was chosen. The Brief above records what they tried.

## Decisions for you

1. **Design direction. Decided: E, centred article.**
   - **Column:** one reading column of 68ch (about 680px), centred, with left-aligned text.
   - **Header:** kicker (`CASE STUDY · CLIENT · YEAR`), headline `h1`, the summary as the deck in `ink-muted`, then a facts row: ROLE, STACK, YEAR, READ, each under a 1px `ink` rule. A `LIVE SITE ↗` link follows.
   - **Cover:** the `preview` image breaks out to a wide measure (64rem).
   - **Body:** `h2` sections with 24 steps (96px) between them, and callouts in the column. Wide figures (`<Figure wide>`) break out like the cover, but their caption stays in the column.
   - **Code blocks:** sit in the column inside a frame, with a filename bar.
   - **Ending:** an `ink` rule, `NEXT PROJECT · STACK · YEAR`, "Sundet →" and `← INDEX`.
   - **Mobile:** the same layout in one column with the usual gutters.

   Everything is Archivo and Plex Mono, square, with borders and no shadows. Only existing colours are used.

2. **The headline is the `title`. Decided: yes.** The `h1` reads as a headline ("A credible US storefront for a Swedish supplement brand"), and the client and year move to the kicker. Stu rewrites `title` in each case study; that's content, not a schema change. The browser `<title>` is "Probell Nutrition · Stu Bolderson", built from `client`.
3. **Code in MDX. Decided: plain code blocks, no highlighting and no new dependency.**
   - Fenced code blocks (` ```astro title="src/components/Hero.astro" `) render in `ink` on `surface-raised`.
   - The frame shows the filename on the left and the language on the right, and scrolls sideways inside itself.
   - Highlighting can be revisited in the blog plan. Seam: the `rehypePlugins` array in `compileBody`.
4. **Live site link. Decided: an optional `url` field** in the case study frontmatter (`z.url()`), shown as `LIVE SITE ↗`. Stu approved this schema change.
5. **Figures:** `<Figure src alt caption width height wide? />`, with images in `public/content/<slug>/`. A Markdown image fails the build. Captions are numbered (`FIG 1`, `FIG 2`) in order of appearance.
6. **`remark-gfm`: not now.** Case studies don't use tables. It's decided in the blog plan.
7. **Draft-only route:** the `_empty` sentinel slug with `notFound()`, proved with an all-drafts build in step 3.
8. **Where components live:**
   - The page parts go in `src/features/case-study/`.
   - `Callout`, `Figure` and the code frame go in the MDX map in `src/lib/content/mdx/`.
   - Nothing moves to `src/components/ui/` until the blog plan decides what's shared.

## What I need to understand

- **Breakout layout:** the reading column and the wide items share a centre line. Each item sets its own `max-width` (`68ch` or `64rem`) with `margin-inline: auto`, so a wide figure can sit between paragraphs without a separate grid. [Every Layout: the Center](https://every-layout.dev/layouts/center/)
- **remark and rehype:** remark changes the Markdown tree, and rehype changes the HTML tree. This plan adds two tiny rehype steps of its own, inside the existing `@mdx-js/mdx` compile: one copies a code fence's `title="…"` onto its `<pre>`, and one numbers the figures. [MDX plugins](https://mdxjs.com/docs/extending-mdx/)
- **Dynamic routes with Cache Components:** `generateStaticParams` must return at least one param, and the page calls `notFound()` itself. [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params), [empty-generate-static-params](https://nextjs.org/docs/messages/empty-generate-static-params)
- **Questions you should be able to answer:**
  - How does a wide figure break out of the reading column without a grid?
  - Where does a code block's filename come from, and when does that happen?
  - Why does the route still build when every case study is a draft?

## Implementation notes

Model: Opus. This is a new page matched closely to a reference, plus small build-time tree transforms and one real unknown (prerendering a `notFound()` sentinel).

**Files**

- `content-collections.ts`: `compileBody` gets `rehypePlugins: [codeMeta, numberFigures]`.
  - `codeMeta` (in `src/lib/content/mdx/code-meta.ts`): for each `pre > code`, it reads the language from the `language-*` class and `title="…"` from the fence meta, then sets `data-lang` and `data-title` on the `<pre>`. It's a plain tree walk with no dependency. If the fence meta isn't on the hast node, it's read from the mdast `code` node in a matching remark step instead.
  - `numberFigures` (in `src/lib/content/mdx/number-figures.ts`): sets a `number` prop on each `Figure` element in document order.
- `src/lib/content/schemas.ts`: add an optional `url` (Decision 4), with tests.
- `src/lib/content/derive.ts`: add `EMPTY_SLUG`, `staticSlugs(entries)` and `nextCaseStudy(entries, slug)`, with tests.
- `src/lib/content/mdx/components.tsx` (renamed from `.ts`):
  - covers `h2`, `h3`, `p`, `a` (external links get `rel="noreferrer"`), `ul`, `ol`, `li`, `blockquote`, `hr`, inline `code`, and `pre`
  - `pre` is the code frame: a filename bar from `data-title` (or the language alone), then a horizontally scrolling body in `ink`, `text-code`
  - `img` throws (Decision 5)
  - also maps `Callout` and `Figure`
- `src/lib/content/mdx/callout.tsx`: labels DECISION, WHAT WENT WRONG and AI NOTE, each with an inline SVG icon, rendered as `<aside aria-label>`. An unknown `type` throws.
- `src/lib/content/mdx/figure.tsx`: `next/image` in a hairline frame with `radius-md`. `wide` breaks it out to `--measure-wide`. The caption sits in the column, with a mono `FIG N` and `body-sm` text in `ink-muted`. Numbering comes from a small rehype step that sets a `number` prop on each `Figure` in document order.
- `src/features/case-study/`:
  - `case-study-header.tsx`: kicker, `h1`, deck, facts and the optional `LIVE SITE ↗`
  - `facts.ts`: pure; ROLE, STACK (joined with " · "), YEAR and READ (`N min`); tested
  - `cover.tsx`: `preview` at wide measure, with `preload`
  - `next-project.tsx`: the ending
- `src/app/(pages)/work/[slug]/page.tsx`:
  - `generateStaticParams` from `staticSlugs`
  - `generateMetadata`: the title is "{client} · Stu Bolderson", and the description is `summary`
  - `notFound()` for `EMPTY_SLUG` or a missing entry
  - renders the header, cover, `<Mdx>` and `NextProject`
  - the `Mdx` output sits in a wrapper whose children default to `--measure`, with `wide` figures opting out
- `src/styles/tokens.css`:
  - `--measure: 68ch` and `--measure-wide: 64rem`
  - `type-deck` (h3 size, 400, `ink-muted`)
  - `h1` stepping down to 2.25rem below 720px
  - the `frame` utility
  - no new colours
- `e2e/routes.ts`: add `/work/probell` and `/work/sundet`.
- `content/README.md`:
  - `<Callout>`, `<Figure>` (and `wide`)
  - code fences with a language and `title`
  - `url`, and that bodies start at `##`
  - fix the stale `@/components/mdx/mdx` path

**Fallbacks**

- If `notFound()` in a prerendered sentinel fails `next build`, use `redirect("/")` for the sentinel only.
- If `next/image` rejects a `public/` path in MDX at build time, `Figure` uses `unoptimized`, keeps `width` and `height`, and flags it.

## Out of scope

- The blog list and post pages, in their own plan and design. That plan decides what's shared, including whether the code frame and Figure are reused as they are.
- Syntax highlighting (revisit in the blog plan), and live or interactive components inside MDX.
- `remark-gfm` and tables, heading anchors, and a table of contents.
- `/work` as a list page.
- View transitions from an index row into a case study.
- Real case study copy, including the rewritten titles (Decision 2). That's Stu's writing. The mockup headline is a suggestion.
- Plan 04's invalid-YAML bug.

## Steps

### 1. Build-time steps: code fence titles and figure numbers

Write `code-meta.ts` and `number-figures.ts` and wire them into `compileBody`. Tests in `src/lib/content/mdx/code-meta.test.ts` and `number-figures.test.ts`:

- a fenced `ts` block with `title="a.ts"` compiles to a `pre` with `data-title="a.ts"` and `data-lang="ts"`
- a fence with no language or title compiles with neither attribute
- two `<Figure>`s get `number` 1 and 2 in order

Check: typecheck, lint, unit tests, `npm run build`. Commit: `feat(content): code fence titles and figure numbers at build time`.

### 2. MDX components

Write `components.tsx`, `callout.tsx` and `figure.tsx`, and add the `frame`, `type-deck`, measure and phone `h1` tokens. Tests in `src/lib/content/mdx/components.test.tsx`, using `loadMdx` and `renderToStaticMarkup`:

- each callout type renders its label and an `aria-hidden` icon; an unknown type throws
- figures are numbered `FIG 1` and `FIG 2` in order, and `wide` sets the wide class
- a Markdown image throws with a message naming `<Figure>`
- the code frame shows the filename and the language
- external links get `rel="noreferrer"`
- no content file has a `# ` line

Check: typecheck, lint, unit tests. Commit: `feat(content): callout, figure and code frame for mdx`.

### 3. Schema and route helpers, and the draft-only spike

Add `url` to the schema, and `staticSlugs` and `nextCaseStudy` to `derive.ts`, with tests. Spike: set PROBELL and SUNDET to drafts locally, add a bare `work/[slug]/page.tsx`, and confirm `npm run build` passes. Revert, and record the result in the commit message. Check: typecheck, lint, unit tests, `npm run build`. Commit: `feat(content): case study url, static slugs and next project`.

### 4. Case study page

Build `src/features/case-study/` and the page to mockup E. Add the routes to `e2e/routes.ts`. In a new `e2e/case-study.spec.ts`:

- the header has one `h1`, the deck, and facts with role and stack. `LIVE SITE` shows only when `url` is set.
- at 1440px:
  - the reading column is centred (equal space either side, within 1px) and no wider than 68ch
  - the cover and wide figures are wider than the column, and share its centre line
- at 375px there's no horizontal scroll, and a long code line scrolls inside its frame
- the three callouts render with their labels
- the next project goes to `/work/sundet`, and SUNDET's wraps to `/work/probell`
- `/work/nope` and `/work/_empty` return 404
- `<title>` is "Probell Nutrition · Stu Bolderson"
- the homepage rows land on 200 pages
- hover and `:focus-visible` look identical on the next-project link, `← INDEX` and `LIVE SITE`
- axe passes

Check: typecheck, lint, unit tests, e2e and axe. Commit: `feat(work): case study article page`.

### 5. Screenshots against the mockup

Add `/work/probell` screenshot cases at 375, 768 and 1440px. Compare them with `05-case-study-e-375.png` and `-1440.png` and the design-system Musts, list every difference, and fix only bugs in this plan's files. 768px has no mockup, so check it against the Musts. Update `content/README.md`. Check: typecheck, lint, unit tests, e2e, axe, screenshots. Commit: `test(work): case study screenshots and content guide`.

## Verification

- **Agent-run:**
  - typecheck, lint and unit tests
  - `npm run build`, including the all-drafts spike
  - e2e and axe on both case studies
  - screenshots at 375, 768 and 1440px compared with mockup E, with differences listed
- **Stu:**
  - read `/work/probell` on a phone and a laptop: does it read like an article, and is the column width right?
  - rewrite one `title` as a headline and add a code block and a `<Figure wide>` using only `content/README.md`

## AGENTS.md updates

Proposed. Stu edits AGENTS.md and the design system.

- **Design system:** add a "Case study page" section covering:
  - the centred 68ch column and the 64rem breakout for the cover and `wide` figures
  - kicker, headline and deck, with facts under `ink` rules
  - the ending
- **Design system:** add a "Code block" section (frame, filename bar, plain `ink`, scrolls inside itself). Remove "Case study header", "code block" and "figure with caption" from "Not yet designed"; "MDX prose" stays until the blog plan.
- **Design system → Callout:** "Labels are DECISION, WHAT WENT WRONG and AI NOTE. An unknown `type` fails the build."
- **Rules:** "MDX bodies start at `##`; the page owns the `h1`. Images in MDX use `<Figure>`."
- **Platform:** "Routes over content use `staticSlugs()` and call `notFound()` for `EMPTY_SLUG` and unknown slugs."

## Result

Filled at close-out.
