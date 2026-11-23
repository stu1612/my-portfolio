---
description: Finish a built plan — run the closing checks, fill in the Result and prepare the PR for Stu's sign-off. Use `/close-out NN`.
argument-hint: <plan number>
disable-model-invocation: true
---

Plan: $ARGUMENTS

1. You must be on `feat/NN-*` and `prompts/NN-*.md` must say `Status: built`. If not, stop and say so.
2. Run `npm run test:e2e` (Playwright and axe). If a script does not exist yet, say so; do not skip silently.
3. For UI work, take Playwright screenshots at 375, 768 and 1440px (plus reduced motion where the plan involves motion). Compare them with the plan's design reference and list every difference.
4. From plan 08 on, run Lighthouse CI and report against the budgets.
5. Fill in the plan's **Result**: what changed from the plan and why, every test file changed, and the checks still pending for Stu (from Verification → Stu).
6. If the plan's **AGENTS.md updates** is not "None", write the exact proposed text in chat. AGENTS.md is Stu's; never edit it.
7. Commit: `docs(plan): close out NN`. Do not push and do not open the PR unless Stu asks.
8. In chat, give the PR title and description (summary, the Result section, screenshot differences, pending checks), targeting `dev`. Then ask for verification with a **Your turn** block:

   > **Your turn — verify plan NN**
   >
   > 1. Do these checks yourself: <the Verification → Stu items>.
   > 2. On the branch, set `Status: verified` in `prompts/NN-name.md`, tick plan NN in `ROADMAP.md`, and commit both (so nothing is committed on `dev` directly).
   > 3. `git push -u origin feat/NN-name`, then open the PR to `dev` (e.g. `gh pr create --base dev`) with the text above.
   > 4. Merge it, then `git switch dev && git pull`.
   > 5. Run `/start` for what comes next.
