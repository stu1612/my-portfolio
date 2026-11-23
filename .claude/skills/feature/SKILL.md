---
description: Plan a feature as prompts/NN-name.md, or build an approved plan. Use `/feature <description>` to draft, `/feature NN` to build.
argument-hint: <feature description> | <plan number>
disable-model-invocation: true
---

Input: $ARGUMENTS

If the input is only a plan number (e.g. `04`), go to **Build**. Otherwise go to **Plan**.

## Plan

1. Check the branch with `git branch --show-current`. Plans are drafted on `dev`. If on anything else, stop and tell Stu.
2. Read `ROADMAP.md`, the existing plans in `prompts/`, and `docs/design-system.md` if the feature touches UI. Find where this feature sits on the roadmap and what earlier plans decided.
3. Choose `NN` (the roadmap number, or the next free one) and a short kebab-case name. Copy `prompts/TEMPLATE.md` to `prompts/NN-name.md` and keep `Status: draft`.
4. Fill in every section. The Brief is Stu's input above, verbatim. For any framework or library API, read the docs for the version pinned in `package.json` (Context7), not memory.
5. Under Implementation notes, set `Model:` to the model you recommend for the build, with a one-line reason: Haiku for mechanical, fully specified steps; Sonnet for typical feature work; Opus for novel UI, tricky state or anything the design system marks as hard.
6. Do not create a branch and do not touch `src/`.
7. In chat, list the **Decisions for you** with your recommendation first, plus anything in **What I need to understand**, and the recommended model. Then stop and ask for approval with a **Your turn** block:

   > **Your turn — approve plan NN**
   > 1. Review `prompts/NN-name.md` and answer the decisions above (reply here if you want changes).
   > 2. Set `Status: approved` in the plan.
   > 3. Run `/model <recommended>` then `/feature NN`.

## Build

1. Open `prompts/NN-*.md`. If the status is not `approved`, stop and say so.
2. If `feat/NN-*` already exists, this is a resumed build: switch to it, read `git log` to see which steps are committed, and continue from the first step without a commit. Otherwise you must be on `dev`: create the branch with `git switch -c feat/NN-name` and commit the plan file as its first commit: `docs(plan): NN name`.
3. If the plan's `Model:` differs from the current session model, tell Stu once before step 1 so they can switch with `/model`. Continue only after they reply.
4. Work through the Steps in order. For each step: do the work, run that step's check, and commit with a conventional message once it passes. If a check fails and the fix is not clear, stop and report. Never weaken a test.
5. If the plan turns out to be wrong or incomplete, stop and propose the change. Do not improvise scope.
6. When every step is done, run `npm run typecheck`, `npm run lint` and `npm test`. When they pass, set `Status: built` and commit.
7. Report: what was built, any deviations from the plan, and any test files changed. End with:

   > **Your turn:** run `/close-out NN`.
