# 00 · Setup

Status: verified

<!-- One value only: draft → approved (Stu) → built (agent, all agent-run checks pass) → verified (Stu, human checks pass).
     The plan-gate hook reads this line: app code is blocked until it says approved. -->

**Fixed rules for this plan: only Stu sets `approved` and `verified`. The agent sets `draft` and `built`.**

## Goal

Every command in AGENTS.md works and the starter app is gone. A green `npm test` proves the design tokens meet WCAG AA, and a green `npm run test:e2e` proves the page loads with no axe violations. `main` deploys to Vercel as a plain placeholder page.

## Brief

Setup: tooling, tokens, test runners, hooks, commands, deploy to Vercel

- Image: none. This plan only puts up a placeholder page, and its visual design starts in plans 01–02.

## Decisions for you

1. **New dev dependencies:** `vitest`, `@playwright/test` and `@axe-core/playwright`, each pinned to an exact version. **Recommended: yes.** These are the test runners AGENTS.md already names. Nothing else: the `@/` alias is a one-line `resolve.alias`, so `vite-tsconfig-paths` isn't needed. This also raises `@types/node` from `^20` to `22`, to match the Node 22 runtime and Vitest 5's peer range (`^22 || >=24`).
2. **Who runs the install:** the guard hook blocks the agent from adding dependencies. **Recommended:** you run the install command in "Your turn" after approving, so the hook stays strict. Alternative: you relax the hook for this one build.
3. **Placeholder homepage:** **Recommended:** one line of name and role plus "Site in progress", using the default tokens and system fonts. Plan 01 adds the fonts and plan 02 adds the dark homepage theme. Alternative: a blank page.
4. **Delete starter files:** `public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`, plus the Create Next App README text. **Recommended: yes**, and replace the README with a short project README.
5. **Remove Geist now:** **Recommended: yes.** AGENTS.md allows only Archivo and IBM Plex Mono, so text falls back to the `system-ui` / `ui-monospace` stacks in `tokens.css` until plan 01.
6. **CI:** a GitHub Actions workflow that runs typecheck, lint, unit tests and e2e on PRs to `dev` and `main`. **Recommended: yes.** It's free for public repos, adds no new account (the repo is already on GitHub), and gives tech leads visible green checks. Alternative: hooks and Vercel's build only. You decide whether GitHub Actions counts as a new service.
7. **Playwright browsers:** **Recommended: Chromium only for now**, to keep e2e fast. Adding WebKit (Safari) later is one config line, and it's worth doing at plan 08's audit.
8. **Vercel setup:** **Recommended:** connect it through the Vercel dashboard's Git import, with production branch `main`. Pushes to `dev` and `feat/*` then get preview URLs. There's no Vercel CLI and no `vercel.json`. You do the import, because it needs your account.
9. **Concern about a Must rule (no change proposed):** `hairline` measures 1.3–1.4:1 against both surfaces. That's fine for decorative borders such as callouts and dividers, but WCAG requires 3:1 for UI boundaries like form field borders. **Recommended:** the contrast test labels `hairline` as decorative and skips it, and plan 06 adds a field-border token that meets 3:1.

## What I need to understand

**Concepts and docs**

- `next typegen` (Next 15.5+) generates the global `LayoutProps` / `PageProps` types without a build, so `tsc --noEmit` can run on its own: https://nextjs.org/docs/app/api-reference/cli/next#next-typegen-options
- Vitest 5 needs Node ≥ 22.12 (you have 22.22): https://vitest.dev/guide/
- Playwright `webServer` starts the app before tests run: https://playwright.dev/docs/test-webserver
- Accessibility testing with axe in Playwright: https://playwright.dev/docs/accessibility-testing
- WCAG relative luminance and contrast ratio: https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
- Vercel Git integration, production vs preview: https://vercel.com/docs/git

**Questions you should be able to answer**

- Why test design tokens? A unit test fails the build as soon as someone changes a colour so it drops below AA, before anyone looks at a page.
- What can't axe catch? Focus order, whether alt text makes sense, motion, and contrast over gradients and images (the homepage stage). Those checks stay manual.
- Why run e2e against `next build && next start` rather than `next dev`? It tests what Vercel actually serves: production rendering, Cache Components and no dev overlay.
- Why both hooks and CI? The hooks guard the agent while it works locally. CI guards every PR, whoever wrote it.

**Spike:** none needed. The token contrast ratios were checked while writing this plan, and every text pair passes AA in both themes (lowest: light `accent` on `surface`, 5.22:1).

## Implementation notes

Model: Sonnet — configuration and test wiring with clear specs, plus a few judgment calls (Tailwind loader, typegen) if the build complains.

**Found while planning**

- `src/app/globals.css` imports `./styles/tokens.css`, but the file is at `src/styles/tokens.css`, so the import should be `../styles/tokens.css`. Fix it in step 1.
- `npm test` must run `vitest run`, not `vitest`. The Stop hook (`.claude/hooks/checks.sh`) calls `npm run test`, and watch mode would hang it.
- `LayoutProps<"/">` in `layout.tsx` is a generated global type, so `typecheck` must run `next typegen` first.
- `.gitignore` has `.env*`, which would also ignore `.env.example`. That doesn't matter until plan 06 (see Out of scope).

**Scripts (`package.json`)**

```json
"typecheck": "next typegen && tsc --noEmit",
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test --project=e2e",
"screenshots": "playwright test --project=screenshots",
"format": "prettier --write .",
"format:check": "prettier --check ."
```

Add `"engines": { "node": ">=22.12" }`. Vercel reads it to pick the Node version, and Vitest 5 needs it.

**Files**

- `src/lib/contrast.ts`: pure functions `relativeLuminance(hex)` and `contrastRatio(a, b)`.
- `src/lib/tokens.ts`: `parseTokenBlocks(css)` returns `{ light: Record<string,string>, dark: Record<string,string> }` from the `:root` and `[data-theme="dark"]` blocks. It reads custom properties with hex values only.
- `src/lib/contrast.test.ts`: unit tests of the maths against known pairs (black/white = 21, same colour = 1).
- `src/lib/tokens.test.ts`: reads `src/styles/tokens.css` with `fs` and checks these pairs in both themes:
  - text at ≥ 4.5: `ink`, `ink-muted`, `accent`, `success` and `error` on `surface` and on `surface-raised`.
  - UI at ≥ 3: `accent` on `surface`, which is the focus ring.
  - stage at ≥ 4.5: `glow-1..3` and dark `ink` / `ink-muted` on `stage-base`. This checks the flat colours only; contrast over the gradient stays a manual check.
  - `hairline` sits in an explicit `decorative` list, with a comment pointing to plan 06.
- `vitest.config.ts`: `environment: "node"`, `include: ["src/**/*.test.ts"]`, and `resolve.alias` mapping `@` to `src`. If `resolve.alias` doesn't work in the installed Vitest, use the `vite-tsconfig-paths` plugin, which needs your approval as a new dependency.
- `playwright.config.ts`:
  - `webServer`: `npm run build && npm run start -- -p 3100` on port 3100, so it never clashes with a dev server on 3000; `reuseExistingServer: !process.env.CI`.
  - `baseURL`: `http://localhost:3100`.
  - Two projects, both Chromium: `e2e` (`testIgnore: /screenshots/`) and `screenshots` (`testMatch: /screenshots\.spec\.ts/`).
- `e2e/routes.ts`: `export const routes = ["/"]`. Later plans append their routes here.
- `e2e/smoke.spec.ts`: every route returns 200, has `<html lang="en">`, has exactly one `h1`, and logs no console errors.
- `e2e/a11y.spec.ts`: an axe scan of every route with tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`; it expects no violations.
- `e2e/screenshots.spec.ts`: every route at widths 375, 768 and 1440 (full page), saved to `test-results/screenshots/<route>-<width>.png`. A `REDUCED_MOTION=1` env var switches on `reducedMotion: "reduce"` for plans that add motion.
- `.gitignore`: add `/playwright-report`, `/test-results` and `/blob-report`.
- `eslint.config.mjs`: add the same folders to `globalIgnores`.
- `.prettierignore`: `.next`, `node_modules`, `package-lock.json` and the report folders.
- `.claude/settings.json`: allow `npm run screenshots`, `npm run format`, `npm run format:check` and `npx playwright install:*`.
- `.github/workflows/ci.yml` (if decision 6 is yes):
  - Triggers: `pull_request` to `dev` and `main`.
  - Node 22 with an npm cache.
  - Steps: `npm ci`, `npx playwright install --with-deps chromium`, typecheck, lint, test, test:e2e.
  - Upload `playwright-report` when the job fails.

**Placeholder page.** `src/app/page.tsx` contains:

- one `<main>` with an `h1` "Stu"
- a role line, "Full-stack developer, Copenhagen / Skåne"
- a `meta`-style line, "Site in progress"

Use only token utilities (`bg-surface`, `text-ink`, `text-ink-muted`, `text-h1`, `text-body`, `font-mono`, `text-meta`) and only spacing steps 4/8/16/24. `layout.tsx` sets `<body className="bg-surface text-ink font-sans">`, keeps `lang="en"`, and sets metadata title "Stu — Full-stack developer" and a one-line description.

**Hooks.** The three hooks and the settings already exist from the setup commit and need no logic changes. Step 2 confirms the Stop hook runs green once the scripts exist.

## Out of scope

- Fonts: plan 01. The placeholder uses the token fallback stacks.
- Navbar, footer, route themes, `data-theme="dark"` on the homepage, page transitions: plan 02.
- `.env.example` and the `!.env.example` line in `.gitignore`: plan 06, the first plan that has a secret.
- Lighthouse CI: plan 08. The CI workflow leaves room for a later job.
- Custom domain: plan 08. This plan uses the `*.vercel.app` URL.
- Visual-regression snapshots (`toHaveScreenshot`): not planned. Screenshots are for close-out comparison only and are not committed.

## Steps

### 1. Clear out the starter

Files: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, the five starter SVGs in `public/`.

Fix the tokens import path. Remove Geist and its CSS variables. Replace the starter page with the placeholder described in Implementation notes, and set the body classes and metadata. Delete the starter SVGs (if decision 4 is yes).

Done when:

- `npm run build` and `npm run lint` pass.
- `grep -rnE "zinc|#[0-9a-fA-F]{3,8}|Geist" src --include=*.tsx --include=*.css` matches only inside `src/styles/tokens.css`.

Commit: `chore: replace create-next-app starter with token-based placeholder`.

### 2. Scripts, engines and formatting

Files: `package.json`, `.prettierignore`.

Add the scripts and `engines` from Implementation notes. Leave `test` / `test:e2e` / `screenshots` out until their runner is installed in steps 3 and 4. Run `npm run format` once, so the following commits only contain real changes.

Done when:

- `npm run typecheck` passes from a clean `.next` (delete `.next/types` first to prove `typegen` creates it).
- `npm run format:check` passes.

Commit: `chore: add typecheck and format scripts, pin node engine`.

### 3. Vitest and the token contrast tests

**Before this step:** the dependencies from decision 1 must be in `package.json`. If they aren't, stop and ask Stu to run the install command.

Files: `vitest.config.ts`, `src/lib/contrast.ts`, `src/lib/tokens.ts`, `src/lib/contrast.test.ts`, `src/lib/tokens.test.ts`, the `test` and `test:watch` scripts.

Done when:

- `npm test` passes and exits on its own, without watch mode.
- Mutation check: temporarily set light `--ink-muted` to `#9a949e`. `npm test` must fail and name the pair. Then revert the change; it is never committed.
- The Stop hook passes. It runs typecheck, lint and test.

Commit: `test: add WCAG contrast tests for design tokens`.

### 4. Playwright, axe and screenshots

Files: `playwright.config.ts`, `e2e/routes.ts`, `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `e2e/screenshots.spec.ts`, the `test:e2e` and `screenshots` scripts, `.gitignore`, `eslint.config.mjs`, `.claude/settings.json`.

Run `npx playwright install chromium`.

Done when:

- `npm run test:e2e` passes, including axe on `/`.
- `npm run screenshots` writes `/-375.png`, `/-768.png` and `/-1440.png` under `test-results/screenshots/`.
- `npm run lint` ignores the report folders.

Commit: `test: add Playwright e2e, axe scan and screenshot runner`.

### 5. CI workflow (only if decision 6 is yes)

Files: `.github/workflows/ci.yml`.

Done when: the YAML is valid and every command in it passes locally in the same order. The real run happens on Stu's first PR.

Commit: `ci: run checks and e2e on pull requests`.

### 6. README and deploy readiness

Files: `README.md`.

The README covers:

- one paragraph on what the site is
- the command list from AGENTS.md
- links to `docs/workflow.md` and `docs/design-system.md`
- the Vercel setup in a few lines: Git import, production branch `main`, preview deployments for other branches

Then run `npm run build` once more from a clean `.next`.

Done when:

- The build passes with no warnings about fonts, CSS or config.
- `npm run typecheck`, `npm run lint` and `npm test` all pass.

Commit: `docs: project README with commands and deploy notes`. Then set `Status: built`.

## Verification

- **Agent-run:**
  - typecheck, lint, unit tests (including the mutation check in step 3)
  - `npm run test:e2e` with axe on `/`
  - `npm run screenshots` at 375 / 768 / 1440, compared with the placeholder spec: no starter content, token colours only, no horizontal scroll at 375
- **Stu:**
  - Import the repo in Vercel with production branch `main`, and confirm `dev` gets a preview URL.
  - After merging `dev` into `main`, open the production URL on your phone.
  - If CI is added, confirm the PR to `dev` shows green checks.

## AGENTS.md updates

For **Commands**:

- Replace "Scripts are added in plan 00. Until then, only the first four exist." with these lines:
  - `Screenshots: npm run screenshots (375 / 768 / 1440 for every route in e2e/routes.ts; REDUCED_MOTION=1 for reduced motion)`
  - `Format: npm run format`
- Note that `npm test` is `vitest run`, and that watch mode is `npm run test:watch`.

For **Platform**:

- Unit tests sit next to the code as `src/lib/**/*.test.ts`. E2E specs go in `e2e/`. Every new route is added to `e2e/routes.ts`, which puts it under the smoke, axe and screenshot tests.
- Node ≥ 22.12 (set in `engines`).

For **Design system**:

- `src/lib/tokens.test.ts` enforces AA contrast for the token pairs. A new colour token or pairing gets a line in that test.

For **Checks**, if decision 6 is yes:

- CI runs typecheck, lint, unit tests and e2e on every PR to `dev` and `main`.

## Result

All steps built and committed; typecheck, lint, unit tests (34), format check and a clean production build pass. At close-out, `npm run test:e2e` (smoke and axe on `/`) passed, and screenshots at 375 / 768 / 1440px passed in normal and reduced-motion runs.

**Changed from the plan, and why**

- **Local browser:** Playwright 1.65 cannot install its bundled Chromium on macOS 12. `playwright.config.ts` uses the installed Chrome (`channel: "chrome"`) locally and bundled Chromium when `CI` is set. Still Chromium-only, as decision 7 says. `npx playwright install` is not needed locally; the CI workflow installs Chromium itself.
- **`@types/node` 22:** added to the install, because Vitest 5 would not resolve against `^20` (reflected in decision 1).
- **Dependencies committed in step 2, not step 3:** `package.json` and the lockfile changed together with the new scripts.
- **`vitest.config.mts`, not `.ts`:** avoids a Vite warning about ESM in a CommonJS package.
- **Screenshot names:** `home-<width>.png` (plus `-reduced`), not `/-<width>.png`. Each run clears `test-results/`, so the normal and reduced-motion sets don't coexist.
- **Clean-`.next` typecheck proof skipped:** the `rm` was denied. Typecheck passed with an existing `.next`, and `next typegen` ran each time.
- **Corrupted Turbopack cache:** a leftover stray folder `node_modules/@types/node 2` broke the first build, and a corrupted `.next/cache` broke the e2e build later. Stu removed both. Likely cause: `next dev` running while Playwright's web server built. Stop `next dev` before `npm run test:e2e`.
- **Prettier formatted** three skill files and `docs/workflow.md` in step 2 (the planned one-off pass).

**Test files**

- Added: `src/lib/contrast.test.ts`, `src/lib/tokens.test.ts`, `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `e2e/screenshots.spec.ts`.
- Existing tests changed, skipped or weakened: none.

**Screenshot differences from the placeholder spec**

- None. At 1440px the text stays at the left edge with no max-width. Intended for a placeholder; plan 02's layout shell sets the real container.

**Pending for Stu**

- Import the repo in Vercel with production branch `main`; confirm `dev` gets a preview URL.
- After merging `dev` into `main`, open the production URL on your phone.
- Confirm the PR to `dev` shows green CI checks. The workflow has not run on GitHub yet.
