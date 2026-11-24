# 03 · Content pipeline

Status: built

<!-- One value only: draft → approved (Stu) → built (agent, all agent-run checks pass) → verified (Stu, human checks pass).
     The plan-gate hook reads this line: app code is blocked until it says approved. -->

**Fixed rules for this plan: only Stu sets `approved` and `verified`. The agent sets `draft` and `built`.**

## Goal

Stu writes a case study, blog post or Now update as one MDX file in `content/`. At build time it is checked against a typed schema: bad or missing frontmatter fails the build with a clear message. Later plans (04, 05, 07) get typed, sorted, draft-aware data and compiled MDX from one place, `src/lib/content`. No visible page changes in this plan.

## Brief

Content pipeline: one MDX system with typed collections for case studies, blog and Now

- No design reference: this plan has no UI.

## Decisions for you

1. **Collections tool. Recommended: Content Collections** (`@content-collections/core` 0.15, `/next` 0.2) with Zod schemas, and `@mdx-js/mdx` 3.1.1 for the MDX compile. It reads `content/**/*.mdx`, validates frontmatter and generates typed arrays (`allPosts`); `@mdx-js/mdx` compiles the body at build time. **Decided: `@content-collections/mdx` is not used.** It pulls in `mdx-bundler`, `remark-mdx-frontmatter` and `toml`/`uuid`, which gave 5 unfixable `npm audit` findings (3 high, 2 moderate). It supports Next 16 and works with Turbopack because it hooks in at config load, not through a bundler loader. Alternatives:
   - **`@next/mdx` plus a hand-written loader:** it's first-party, and every `.mdx` file becomes a module. However, frontmatter has to be `export const meta`, you'd write the glob, validation and types yourself, and Turbopack only accepts remark/rehype plugins whose options can be serialised. It's more code to own for the same result.
   - **Velite:** similar to Content Collections, but it runs as a separate process next to `next dev` and renders MDX through `new Function`. The Next integration is weaker.
2. **Zod now, not in plan 06. Recommended: yes**, add `zod` 4 in this plan. AGENTS.md already names Zod as the validator. Plan 06 reuses it for the contact form, and nothing changes owner.
3. **One extra dev dependency. Recommended: `@content-collections/cli`.** It runs `content-collections build` before `typecheck` and `test`, so a fresh clone and the Stop hook have the generated types without starting `next dev`. Alternative: rely on `next typegen` loading the config (step 1 tests this, and the CLI is dropped if it works).
4. **Content shape** (this creates a schema, so you approve it). Slugs come from file names. Every collection has `draft: boolean` (default `false`). Drafts show in dev and are left out of production builds.
   - **Case study** (`content/case-studies/*.mdx`): `title`, `displayName` (the short caps name on the index, max 12 characters, e.g. `PROBELL`), `summary` (the problem in one sentence), `client`, `role`, `year` (number), `stack` (string array, 1–5), `order` (number, index position), `preview` (`{ src, alt }`, optional until plan 04 supplies the screenshots).
   - **Blog post** (`content/blog/*.mdx`): `title`, `description` (≤ 160 characters, also the meta description), `published` (ISO date), `updated` (optional ISO date), `tags` (string array, default `[]`).
   - **Now** (`content/now.mdx`, exactly one file): `updated` (ISO date). The body is the update. If the file is missing or there are two, the build fails.
   - **Computed on every entry:** `slug`, `url` (`/work/<slug>` or `/blog/<slug>`, `/now`), `readingMinutes` (rounded up at 225 words a minute, minimum 1).
5. **Case study URL. Recommended: `/work/<slug>`.** "Index" is the nav label for the homepage, and `/work` keeps case studies separate from the blog. Alternative: `/projects/<slug>`. Plan 05 builds the route; this plan only fixes the `url` field.
6. **Seed content. Recommended:** three case study stubs (`probell`, `team4q`, `portfolio`) using the display names from the design system, plus a `now.mdx` stub, all `draft: true`. The frontmatter values I can't know (client, role, year, stack, summary) are marked `TODO` for you to fill in. I won't invent claims about your work. No blog post is seeded.
7. **Blog pages have no roadmap owner.** No line builds `/blog` (list) or `/blog/<slug>`. Recommended: rename roadmap 05 to "Case study and blog post templates", since both share the same prose, callouts and code blocks. Alternative: a new line `05b Blog index and post pages`. The roadmap is yours to edit, and this plan builds neither.

## What I need to understand

- **Content Collections**: a build step that turns files into typed data. Docs: https://www.content-collections.dev/docs and https://www.content-collections.dev/docs/adapter/next. MDX: https://www.content-collections.dev/docs/content/mdx
- **Compile at build, render on the server:** `compile(body, { outputFormat: "function-body" })` from `@mdx-js/mdx` turns each body into a JavaScript string at build time. `run()` from `@mdx-js/mdx` turns that string into a React component on the server. No MDX compiler ships to the browser.
- **Zod 4 / Standard Schema:** Content Collections accepts any Standard Schema library. Zod is the one AGENTS.md already names. https://zod.dev
- **Cache Components and dynamic routes:** with `cacheComponents: true`, `generateStaticParams` must return at least one param, and `dynamicParams` is not allowed (https://nextjs.org/docs/messages/empty-generate-static-params). That's why this plan adds no `[slug]` route. A route with only draft content would fail the production build. Plans 05 and 07 must handle it (see AGENTS.md updates).
- **Interview questions you should be able to answer:**
  - Why validate content at build time rather than at request time? (Bad content never deploys, and there's nothing to check at runtime.)
  - How do drafts stay out of production? (A pure `isPublished(entry, env)` filter in `src/lib/content`, applied in one place.)
  - Why does MDX compile at build time instead of on each request, and where does the compiler run?
  - What would you change to move to a CMS later? (Only the source in `content-collections.ts`. Pages read `src/lib/content`, so they don't change.)

## Implementation notes

Model: Sonnet — typical setup work, but with a real unknown (Content Collections with Next 16.4, Turbopack and Cache Components), so it needs judgement in step 1.

**Files**

- `content-collections.ts` (repo root): `defineCollection` for `caseStudies`, `posts` and `now`, plus `defineConfig`. Schemas are imported from `src/lib/content/schemas.ts` by relative path, so Vitest can test them without the generator. Each `transform` calls `compile` from `@mdx-js/mdx` (function-body output, `remarkGfm` not included until plan 05 asks for it) on the document body and adds the computed fields through pure helpers.
- `src/lib/content/schemas.ts`: Zod schemas (frontmatter only) and exported inferred types.
- `src/lib/content/derive.ts`: pure helpers: `slugFromPath`, `urlFor(collection, slug)`, `readingMinutes(text)`, `isPublished(entry, isProduction)`, `sortPosts` (newest `published` first), `sortCaseStudies` (`order` ascending), `assertSingle(items, name)` (for Now).
- `src/lib/content/index.ts`: the only module that imports `content-collections`. It exports `getCaseStudies()`, `getCaseStudy(slug)`, `getPosts()`, `getPost(slug)` and `getNow()`, each applying `isPublished` with `process.env.NODE_ENV === "production"` and sorting. Pages and components import from here, never from `content-collections` directly. Add an ESLint `no-restricted-imports` rule to enforce that outside `src/lib/content/`.
- `src/components/mdx/mdx.tsx`: `export async function Mdx({ code })` is a server component that evaluates the compiled string with `run(code, { ...jsxRuntime, baseUrl: import.meta.url })` and renders the result with a `components` map from `src/components/mdx/components.ts`. The map starts empty. It is the seam where plan 05 adds `Callout`, figures and code blocks.
- `next.config.ts`: wrap the export with `withContentCollections(nextConfig)`. It must be the outermost wrapper, and the existing `cacheComponents`, `partialPrefetching` and `turbopack.rules` stay.
- `tsconfig.json`: add `"content-collections": ["./.content-collections/generated"]` to `paths`.
- `vitest.config.mts`: add the same alias so `src/lib/content/index.test.ts` can import generated data.
- `.gitignore`: add `/.content-collections`.
- `package.json` scripts: `"content": "content-collections build"`, plus `pretypecheck` and `pretest` running `npm run content` (if step 1 keeps the CLI).

**Schema details**

- Dates: `z.iso.date()`, stored as strings (`YYYY-MM-DD`). Format them in the UI, not in data.
- `displayName`: `z.string().max(12).regex(/^[A-Z0-9 ]+$/)`, which enforces the design system's "short display names" Must at the data level.
- Unknown frontmatter keys fail validation (`.strict()`), so typos don't pass silently.
- `content` (the raw body) is dropped from the output after `readingMinutes` uses it, which keeps the generated module small.

**Fallbacks**

- If `withContentCollections` fails under Turbopack in 16.4.6, run `content-collections watch` beside `next dev` (`predev`/`prebuild` scripts plus `concurrently`, which is a new dependency, so stop and ask first) and remove the Next adapter.
- If `run()` from `@mdx-js/mdx` won't work in a Server Component (for example `import.meta.url` or Turbopack bundling), evaluate the string with `new Function` the way Velite's `MDXContent` does, still server-side. Don't make it a client component, because that ships the code string and runtime to the browser.

## Out of scope

- Every route that renders content: case study pages (05), blog list and post pages (05 or a new line, see Decision 7), the homepage index rows (04), and the Now page (07). The existing placeholders stay as they are.
- Prose styling, `Callout`, figures, code blocks and syntax highlighting (plan 05). Seam: the empty `components` map, plus a `remarkPlugins`/`rehypePlugins` array in the `compile` options for 05 to fill.
- RSS, sitemap, OG images and tags pages. Seam: `getPosts()` returns everything those need.
- Real case study, blog and Now copy. That's Stu's writing.

## Steps

### 1. Install and spike the generator

On the plan branch, install `@content-collections/core`, `@content-collections/next`, `@mdx-js/mdx` and `zod` (exact versions, no `^`), plus `@content-collections/cli` as a dev dependency. Add a throwaway `content-collections.ts` with one `posts` collection over `content/blog/*.mdx` and a temporary `content/blog/spike.mdx`. Wrap `next.config.ts`, add the tsconfig path and the gitignore line. Then check each of these:

- `rm -rf .content-collections && npm run typecheck`. Does `next typegen` generate the files by itself? If yes, drop the CLI dependency and the `pre*` scripts. If no, keep them.
- `npm run dev` starts, and editing `spike.mdx` regenerates the data.
- `npm run build` passes with `cacheComponents` on.

Record the outcome in the Result. Delete `spike.mdx` before committing. **Check:** typecheck, lint and build pass. Commit: `build(content): add content collections and zod`.

### 2. Schemas and pure helpers, test-first

Write `src/lib/content/schemas.test.ts` and `src/lib/content/derive.test.ts` first. Cover: valid frontmatter for each collection parses; a missing required field fails; an unknown key fails; a `displayName` that is too long or lowercase fails; a bad ISO date fails; `readingMinutes` handles 0 words (gives 1), 225 words (1) and 226 words (2); `isPublished` hides drafts only in production; `sortPosts` puts the newest first; `sortCaseStudies` sorts by `order`; `assertSingle` throws on 0 or 2 items; `urlFor` gives `/work/x`, `/blog/x` and `/now`. Then implement `schemas.ts` and `derive.ts`. **Check:** `npm test` passes. Commit: `feat(content): frontmatter schemas and derive helpers`.

### 3. Collections and seed content

Replace the spike config with the three real collections, using the schemas and helpers from step 2 and `compile` from `@mdx-js/mdx` in each transform. Add the seed files from Decision 6: `content/case-studies/{probell,team4q,portfolio}.mdx` and `content/now.mdx`, all `draft: true`, with `TODO` values and a one-line body. Then confirm the build catches mistakes: temporarily break one file's frontmatter, run `npm run content` (or `npm run build`), check the error names the file and the field, and revert. **Check:** `npm run build` passes, and the failure test is described in the commit body. Commit: `feat(content): case study, blog and now collections`.

### 4. Query module, MDX renderer and import rule

Add `src/lib/content/index.ts`, `src/components/mdx/mdx.tsx` and `src/components/mdx/components.ts`, plus the `no-restricted-imports` rule in `eslint.config.mjs`. Add `src/lib/content/index.test.ts`, which imports the generated data. Its tests: in the test env (not production), `getCaseStudies()` returns the three seeds in `order`; `getCaseStudy("probell")` finds one and `getCaseStudy("nope")` returns `undefined`; `getNow()` returns one entry; and rendering the Now entry's compiled code with `renderToStaticMarkup(createElement(Mdx, { code }))` outputs the seed body text. **Check:** typecheck, lint and tests pass, and `npm run build` passes. Commit: `feat(content): typed query module and server MDX renderer`.

### 5. Writing guide

Add `content/README.md`, a short guide for Stu: where each collection lives, every frontmatter field with an example, how drafts work, and what a validation error looks like. Fill the "AGENTS.md updates" section below with what the build proved. **Check:** the README examples match the schemas, and each example's frontmatter is pasted into a scratch test and parses. Commit: `docs(content): writing guide for collections`.

## Verification

- **Agent-run:** typecheck, lint, unit tests, `npm run build`, and the existing e2e and axe suite, unchanged and still passing. This plan has no UI, so no new screenshots are needed. The existing screenshots should show no diff.
- **Stu:** open `content/case-studies/probell.mdx`, fill in one real `TODO`, break one field on purpose, and check the error message is readable. Read `content/README.md` and check it is enough to write a post without asking.

## AGENTS.md updates

Proposed. Stu edits AGENTS.md.

- **Who owns what → Content** (replaces "The collections tool is chosen in plan 03"): "MDX in `content/`, validated and compiled at build time by Content Collections with Zod schemas in `src/lib/content/schemas.ts`; MDX is compiled with `@mdx-js/mdx`. Pages read content only through `@/lib/content` (lint-enforced). No CMS."
- **Platform:** "Generated content types live in `.content-collections/` (gitignored, created by `next typegen`, which `typecheck` and `pretest` run). Never edit them."
- **Rules:** "Routes over content with `generateStaticParams` must still build when every entry is a draft (Cache Components rejects an empty list): fall back to a list page or `notFound()`, and test it."
- **Rules:** "Don't add `@content-collections/mdx` (its `mdx-bundler` dependency brings unfixable `npm audit` findings). MDX compiles with `@mdx-js/mdx`."

## Result

Filled at close-out.
