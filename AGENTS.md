# Stu's portfolio

A personal developer portfolio for Stu, a full-stack developer (frontend-strong, product-minded) job-hunting in Copenhagen/Skåne. Its readers are tech leads and recruiters with about 60 seconds. It shows problem-first case studies of real client work, a blog, a Now page, a contact form and a CV. The site is itself a case study in agentic development, so its plans in `prompts/` are part of the portfolio.

## Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Type check: `npm run typecheck` (`tsc --noEmit`)
- Unit tests: `npm test` (Vitest)
- E2E + accessibility: `npm run test:e2e` (Playwright + axe)

Scripts are added in plan 00. Until then, only the first four exist.

## Platform

- Next.js App Router, TypeScript strict, Tailwind CSS v4. For any framework or library API, read the docs for the installed major version, not memory. Exact versions are pinned in `package.json`.
- Routes in src/app/; they import from components and features. Global site-frame components (shell, navbar, footer) in src/components/; generic presentational components in src/components/ui/. Code owned by one feature (components, hooks, logic, types, tests) in src/features/<feature>/. Non-UI logic shared by 2+ features in src/lib/ (exception: src/lib/content/ also holds the MDX renderer). Pure logic is written so Vitest can test it without a browser. Tests sit beside the file they test.
- Styles: `src/styles/tokens.css` imported by `src/app/globals.css`. No other global CSS.
- Never edit `.next/`, `node_modules/` or generated files.

## Who owns what

- **Hosting:** Vercel (Hobby, personal use only). No other host.
- **Styling:** Tailwind v4 and `tokens.css`. No CSS-in-JS, no component libraries, no animation libraries.
- **Fonts:** Archivo (variable, width and weight axes) and IBM Plex Mono, both via `next/font/google`. No other families.
- **Content:** MDX in the repo with typed collections for case studies, blog and Now. The collections tool is chosen in plan 03. No CMS.
- **Contact email:** Resend, called from a server action. Validation with Zod, shared by client and server. Added in plan 06.
- **Analytics and AI:** none in v1.

Ask before moving a responsibility between tools or adding a new one.

## Design system

- Tokens: `src/styles/tokens.css`. No raw colour, spacing, radius or font values anywhere else.
- Rules and components: `docs/design-system.md`. Read it for any plan that touches UI.
- **Must** rules are fixed: raise a concern in the plan, never change one silently. **Suggested** approaches may be replaced by a better proposal in the Ask step.
- Themes are set by route: the homepage is `data-theme="dark"`, every other page is light. No toggle, no `prefers-color-scheme` switching.

## Rules

- Secrets live in `.env.local` only. Never commit, print or log them. `.env.example` lists names, never values.
- Ask before: adding a dependency, adding a service, changing a schema or content collection shape, deleting files, or changing any rule in this file.
- Don't build ahead. Future roadmap items may shape interfaces and leave seams, but no code for a feature outside the current approved plan.
- Never delete, skip or weaken a test to make it pass. If a test fails and the fix isn't clear, stop and report.
- Any change to a test file is listed in the report.
- This file: replace, don't append. Propose changes to rules; never edit them silently.

## Checks

- **Before a plan is `built`:** typecheck, lint and unit tests pass (enforced by the Stop hook).
- **Before a plan closes:** e2e and axe pass; for UI work, Playwright screenshots at 375, 768 and 1440px, compared against the plan's design reference, with differences listed.
- **From plan 08:** Lighthouse CI budgets pass.

## Git

- `dev` is the integration branch. `main` only changes when Stu merges `dev` into it.
- One branch per approved plan: `feat/NN-name` (e.g. `feat/04-project-index`), always cut from `dev`, never from `main`. Its PR targets `dev`.
- No app code (`src/`) edits and no commits directly on `main` or `dev` (enforced by the guard hooks). Plans may be drafted on `dev`.
- Never create fix/ or chore/ branches; ask Stu whether work is a small fix.
- One commit per plan step, made after that step's check passes. Conventional commit messages.
- A finished plan becomes a PR: the diff plus the report is Stu's sign-off point.
- Never push, merge or force anything unless Stu asks.

## Workflow

- Feature work follows `/feature`; finishing follows `/close-out`. Small fixes (one file, no new behaviour, no dependency) skip the plan.
- The roadmap is `ROADMAP.md`. Read it only when planning, never during a build.
- Plans live in `prompts/NN-name.md`, copied from `prompts/TEMPLATE.md`.
