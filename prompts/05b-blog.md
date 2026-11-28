# 05b · Blog list and post template

Status: approved

<!-- One value only: draft → approved (Stu) → built (agent, all agent-run checks pass) → verified (Stu, human checks pass).
     The plan-gate hook reads this line: app code is blocked until it says approved. -->

**Fixed rules for this plan: only Stu sets `approved` and `verified`. The agent sets `draft` and `built`.**

## Goal

A visitor opens `/blog`, sees every post newest first with its date, and opens one at `/blog/<slug>`. The post reads like the case study article: kicker, headline, deck, the same body and code frame, and an ending that points to the next older post. Both routes still build when every post is a draft.

## Brief

05b Blog list and post template

Context from earlier plans:

- **Plan 03** built the `posts` collection (`title`, `description` ≤ 160, `published`, `updated?`, `tags`, `draft`) and `getPosts()` / `getPost(slug)`, newest first. No post exists yet; `content/blog/` is empty.
- **Plan 05** said case studies and blog posts get different designs, starting from mockups. It left highlighting, `remark-gfm` and "what's shared" for this plan.

Design reference, to **match closely** (values from tokens). Stu chose list A and every other recommendation:

- List: `docs/designs/05b-blog/list-a.html` (B and C were the alternatives; deleted in step 5)
- Post page: `docs/designs/05b-blog/post.html`
- Shared mockup styles: `docs/designs/05b-blog/blog.css` (with `../05-case-study/base.css`)

Open them in a browser. Titles and copy are placeholders.

## Decisions for you

1. **List page design. Decided: A, dated rows.**
   - **A: dated rows** (`list-a.html`). Each post is one row under a hairline: a mono date column on the left (above the title on phones), then the title in `h3`, the description in `ink-muted`, and `N MIN · TAGS` in meta. The whole row is the link, with the arrow nudge from the case study ending. It works with one post and with thirty, and a reader with 60 seconds sees what each post is about without opening it.
   - **B: by year** (`list-b.html`). A dense log: a year label under an `ink` rule, then one line per post with the title and a short date. No descriptions. It looks sparse until there are ten or more posts.
   - **C: latest first** (`list-c.html`). The newest post leads at `h2` size with its description and `READ →`, and older posts follow as compact rows under EARLIER. It shows off one post well but makes a fresh post look more important than a better older one.
   - All three share the page header: `BLOG · N POSTS`, the `h1` "Blog" in the headline role, a one-line deck (placeholder copy for you to rewrite), and `← INDEX` at the end.
2. **Post page. Decided: `post.html`, the case study article without the facts and cover.**
   - **Header:** kicker `BLOG · 28 NOV 2026 · 6 MIN READ`, the `title` as headline, the `description` as deck, then one meta line under an `ink` rule: the tags on the left and `UPDATED <date>` on the right (only when `updated` is set).
   - **Body:** the same `article-flow`, callouts, figures and code frame as case studies, unchanged.
   - **Ending:** an `ink` rule, `OLDER POST · <date>`, the older post's title with `→` after the last word, then `← ALL POSTS`. The oldest post shows only `← ALL POSTS` (no wrap: posts are a timeline, case studies aren't).
3. **Tags are plain text, not links. Decided.** Tag pages are out of scope. If tags become links later, only the list row and post header change.
4. **Syntax highlighting. Decided: stay plain**, like case studies. No new dependency, one look for code across the site. Alternative: Shiki at build time through a rehype step (new dependency, zero client JS), with a two-colour theme made from tokens. It could be added later at the `rehypePlugins` seam in `compile.ts` without touching any page.
5. **`remark-gfm`. Decided: not now.** No post needs tables, footnotes or strikethrough yet. Adding it later is one line at the same seam, plus a dependency you approve then. Alternative: add it now; it changes case study parsing too (bare URLs become links).
6. **Content to build and test against. Decided: I draft two short, real posts from facts in this repo, published, for you to rewrite before `dev` reaches `main`.**
   - "Building this site with plans and an agent" (the plan → approve → build loop and the guard hooks) and "Content that fails the build, not the page" (plan 03: typed collections, and dropping `@content-collections/mdx` over its audit findings).
   - Two posts are the minimum to test order and the older-post ending. The e2e suite runs against a production build, where drafts are hidden, so they must be `draft: false`.
   - Like SUNDET's `TODO` fields, they go live only when you merge `dev` into `main`. Alternatives: you write two posts before step 3, or e2e builds with fixture posts from `e2e/fixtures/blog/` through an env flag in `content-collections.ts` (more moving parts, and real content stays untested).
7. **Shared article parts. Decided: move the header shell and the ending into `src/components/ui/`.** `ArticleHeader` (kicker, `h1`, deck, then a slot for facts or the post meta line) and `ArticleEnd` (the `ink` rule, an optional next link, the back link) are used by both pages. The case study page keeps the same look; its e2e spec must pass unchanged. In the shared ending, the arrow follows the last word of the title, which looks the same for a short client name. Alternative: copy the markup into `src/features/blog/` and leave case studies alone.

## What I need to understand

- **Nothing new in Next.js.** The post route copies plan 05's pattern: `generateStaticParams` from `staticSlugs`, `notFound()` for `EMPTY_SLUG` and unknown slugs. As in plan 05, unknown slugs show the not-found page with `noindex` but answer HTTP 200 under Cache Components.
- **Dates without time zones:** `published` is a `YYYY-MM-DD` string. Formatting it with `new Date()` parses it as UTC midnight and can show the day before in some zones. The formatter reads the three parts of the string instead, so "2026-11-28" is always "28 Nov 2026". [MDN: Date time string format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format)
- **`<time dateTime>`:** dates render inside `<time dateTime="2026-11-28">` so machines read the ISO date and people read "28 Nov 2026". [MDN: time](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time)
- **Questions you should be able to answer:**
  - Why do the blog and case studies share a body and code frame but not a header?
  - Why does the post ending not wrap to the newest post, when the case study ending does?
  - What happens to `/blog` and `/blog/<slug>` in production if every post is a draft?

## Implementation notes

Model: Sonnet. It reuses plan 05's route pattern, article body and tokens; the new parts are a list page matched to a mockup and a small refactor guarded by the existing case study e2e.

**Files**

- `src/lib/content/derive.ts`: add `olderPost(entries, slug)`, the entry after `slug` in newest-first order, or `undefined` for the oldest or an unknown slug. Export it from `src/lib/content/index.ts`. Tests in `derive.test.ts`.
- `src/features/blog/format.ts` (pure, tested in `format.test.ts`):
  - `formatDate("2026-11-28")` → `"28 Nov 2026"`, from the string parts, with a fixed English month table
  - `postKicker({ published, readingMinutes })` → `"Blog · 28 Nov 2026 · 6 min read"`
  - `listKicker(count)` → `"Blog · 1 post"` / `"Blog · 5 posts"`
  - `rowMeta({ readingMinutes, tags })` → `"6 min · Agents · Process"` (tags as written)
  - `olderLabel(published)` → `"Older post · 10 Nov 2026"`
- `src/components/ui/article-header.tsx`: `ArticleHeader({ kicker, title, deck, children })`. The markup and classes move from `case-study-header.tsx` (`max-w-measure mx-auto grid gap-6 …`, `text-headline`, `type-deck`). `CaseStudyHeader` keeps its facts and live link and passes them as children.
- `src/components/ui/article-end.tsx`: `ArticleEnd({ label, next?, back })`, where `next` is `{ href, kicker, title }` and `back` is `{ href, label }`. Moved from `next-project.tsx`, with the arrow as an inline element with a left margin after the title instead of a flex item. `NextProject` becomes a thin wrapper (`aria-label="More work"`). The blog uses `aria-label="More posts"`.
- `src/features/blog/post-header.tsx`: `ArticleHeader` plus the meta line (tags left, `Updated <time>` right, `type-meta text-ink-muted`, `border-ink border-t pt-2`, wrapping on phones).
- `src/features/blog/post-list.tsx`: the chosen list design (Decision 1). For A, an `<ol>` of row links: `<time>` column at `9rem` from 720px, title `text-h3`, description `text-body-sm text-ink-muted`, `rowMeta` in `type-meta`. Hover and `:focus-visible` both turn the title `accent` and nudge the arrow (`motion-safe:` only, as in `next-project.tsx`).
- `src/app/(pages)/blog/page.tsx`: replaces the placeholder. Header via `ArticleHeader` (kicker from `listKicker`, `h1` "Blog", deck), then `PostList`, then `← Index`. With no posts: "No posts yet." in `text-body` and `ink-muted` instead of the list. Metadata title stays "Blog · Stu Bolderson", plus a description (the deck).
- `src/app/(pages)/blog/[slug]/page.tsx`: same structure as `work/[slug]/page.tsx`. `generateStaticParams` from `staticSlugs(getPosts())`. `generateMetadata`: "{title} · Stu Bolderson" and `description`. Renders `PostHeader`, `<article className="article-flow"><Mdx …/></article>`, and `ArticleEnd` with `olderPost`.
- `src/components/ui/placeholder-page.tsx`: drop "Blog" from its comment.
- `content/blog/*.mdx`: the two posts from Decision 6, `draft: false`. One has `updated`, one has a code fence with a `title`, so the e2e covers both.
- `e2e/routes.ts`: add both post URLs.
- `content/README.md`: the blog section says where the title, description and tags show, and that the oldest post has no older-post link.

**Tokens:** none expected. The list's date column (`9rem`) is a layout width, so it goes in `tokens.css` as `--container-date: 9rem` if Tailwind needs a named value, rather than an arbitrary class.

**Fallbacks**

- If the shared `ArticleEnd` can't keep the case study ending identical (the case study e2e or a screenshot diff fails), keep `NextProject` as it is and give the blog its own `post-end.tsx`. Report it.

## Out of scope

- Tag pages and tag links (seam: `rowMeta` and the post header render tags as text).
- RSS, sitemap and OG images (seam: `getPosts()` has everything they need).
- Syntax highlighting and `remark-gfm` unless Stu chooses them in Decisions 4 and 5 (seam: `rehypePlugins` / `remarkPlugins` in `compile.ts`).
- Pagination: one list until there are enough posts to need it.
- A cover image or figure in the post header.
- Your real posts. The two seeded posts are drafts of your writing, for you to rewrite.

## Steps

### 1. Pure helpers

Add `olderPost` to `derive.ts` and write `src/features/blog/format.ts`. Tests:

- `olderPost`: the newest gives the second; the oldest gives `undefined`; an unknown slug gives `undefined`; a single post gives `undefined`
- `formatDate`: `2026-11-28` → `28 Nov 2026`, `2026-01-02` → `2 Jan 2026`, every month name; it never shifts the day (run once with `TZ=America/Los_Angeles`)
- `postKicker`, `listKicker` (1 and 5), `rowMeta` (no tags, two tags), `olderLabel`

Check: typecheck, lint, unit tests. Commit: `feat(blog): date format and post navigation helpers`.

### 2. Shared article header and ending

Move the header shell and the ending into `src/components/ui/` (Decision 7) and rewire the case study page. Take `/work/probell` screenshots at 375, 768 and 1440px before and after and compare them.

Check: typecheck, lint, unit tests, `e2e/case-study.spec.ts` passing unchanged, and no visible difference in the screenshots (list any pixel shift). Commit: `refactor(ui): share the article header and ending`.

### 3. Seed posts and the post page

Write the two posts (Decision 6) and `blog/[slug]/page.tsx` with `PostHeader` and `ArticleEnd`, to `post.html`. Spike: set both posts to `draft: true` locally, confirm `npm run build` passes, and revert. Record the result in the commit message. Add the post URLs to `e2e/routes.ts`. New `e2e/blog-post.spec.ts`:

- one `h1` (the title), the kicker with date and read time, the deck
- the tags line, and `UPDATED` only on the post that has `updated`
- `<time>` elements carry the ISO date in `datetime`
- at 1440px the column is centred and no wider than the case study column; at 375px there's no horizontal scroll
- the newest post's ending links to the older one; the oldest has only `← All posts`, which goes to `/blog`
- `<title>` is "{title} · Stu Bolderson"; `/blog/nope` shows the not-found page with `noindex`
- the Menu marks Blog as current on a post
- hover and `:focus-visible` look identical on the older-post link and `← All posts`
- axe passes

Check: typecheck, lint, unit tests, `npm run build`, e2e and axe. Commit: `feat(blog): post page`.

### 4. Blog list page

Build `PostList` to the chosen mockup and replace the placeholder page. New `e2e/blog-list.spec.ts`:

- the kicker shows the post count; one `h1`
- posts appear newest first, each linking to its page with its date in `<time datetime>`
- (A) each row shows its description and `N MIN`; at 375px the date sits above the title, from 720px beside it
- hover and `:focus-visible` look identical on a row; no arrow movement under reduced motion
- `← Index` goes to `/`
- axe passes

The empty state ("No posts yet.") is covered by a unit test rendering `PostList` with `[]` (and the all-drafts spike in step 3 proves the route builds). Check: typecheck, lint, unit tests, e2e and axe. Commit: `feat(blog): post list page`.

### 5. Screenshots against the mockups

The screenshot spec already loops over `routes.ts`, so `/blog` and both posts are captured at 375, 768 and 1440px, with and without reduced motion. Compare them with the chosen list mockup and `post.html` (render the mockups at the same widths), list every difference, and fix only bugs in this plan's files. Save the chosen mockups' renders as `docs/designs/05b-blog-list-375.png`, `-1440.png`, `05b-blog-post-375.png` and `-1440.png`, and delete the unchosen list mockups. Update `content/README.md`. Check: typecheck, lint, unit tests, e2e, axe, screenshots. Commit: `test(blog): screenshots and content guide`.

## Verification

- **Agent-run:**
  - typecheck, lint and unit tests
  - `npm run build`, including the all-drafts spike
  - e2e and axe on `/blog` and both posts, and the case study spec unchanged
  - screenshots at 375, 768 and 1440px compared with the chosen mockups, differences listed
  - `/work/probell` before and after the step 2 refactor, with no visible change
- **Stu:**
  - scan `/blog` on a phone: can you tell what each post is about in a few seconds?
  - read one post on a laptop: does it feel like the same site as the case study, but lighter?
  - rewrite both seeded posts (or replace them) before `dev` is merged into `main`

## AGENTS.md updates

Proposed. Stu edits AGENTS.md and the design system.

- **Design system:** add a "Blog" section: the list design chosen in Decision 1, and the post header (kicker with date and read time, headline, deck, tags and updated date under an `ink` rule, no cover).
- **Design system:** add "Article header and ending" as shared components (`src/components/ui/`), used by case studies and posts. Remove "MDX prose" from "Not yet designed": the `article-flow` body is now the prose design for both.
- **Platform:** "Content dates are `YYYY-MM-DD` strings. Format them with `formatDate` from the string parts, never through `new Date()`."

## Result

Filled at close-out.
