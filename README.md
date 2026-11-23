# Stu's portfolio

A personal developer portfolio for Stu, a full-stack developer in Copenhagen / Skåne. It has problem-first case studies of real client work, a blog, a Now page, a contact form and a CV. The site is also a case study in agentic development: the plans it was built from are in [`prompts/`](prompts/).

Built with Next.js (App Router), TypeScript, Tailwind CSS v4 and MDX. Hosted on Vercel.

## Commands

| Command               | What it does                                                         |
| --------------------- | -------------------------------------------------------------------- |
| `npm install`         | Install dependencies (Node 22.12 or newer)                           |
| `npm run dev`         | Start the dev server on port 3000                                    |
| `npm run build`       | Production build                                                     |
| `npm run lint`        | ESLint                                                               |
| `npm run typecheck`   | Generate route types, then `tsc --noEmit`                            |
| `npm test`            | Unit tests (Vitest, single run); `npm run test:watch` for watch mode |
| `npm run test:e2e`    | Playwright and axe against a production build on port 3100           |
| `npm run screenshots` | Full-page screenshots at 375, 768 and 1440px into `test-results/`    |
| `npm run format`      | Prettier                                                             |

Every route goes in [`e2e/routes.ts`](e2e/routes.ts) so it gets the smoke, accessibility and screenshot tests. Locally, Playwright uses your installed Chrome; CI uses its bundled Chromium.

## Docs

- [`docs/workflow.md`](docs/workflow.md): how plans, branches and checks fit together
- [`docs/design-system.md`](docs/design-system.md): design rules; values live in `src/styles/tokens.css`
- [`ROADMAP.md`](ROADMAP.md): what is planned and in what order

## Deploying

The repo is connected to Vercel through its Git import. `main` is the production branch; pushes to `dev` and `feat/*` branches get preview URLs. There is no `vercel.json` and no CLI step. `dev` is the integration branch and only changes by pull request.
