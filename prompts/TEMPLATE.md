# NN · Feature name

Status: draft

<!-- One value only: draft → approved (Stu) → built (agent, all agent-run checks pass) → verified (Stu, human checks pass).
     The plan-gate hook reads this line: app code is blocked until it says approved. -->

**Fixed rules for this plan: only Stu sets `approved` and `verified`. The agent sets `draft` and `built`.**

## Goal

What a visitor (or Stu) can do when this is done. One or two sentences.

## Brief

Stu's original prompt, verbatim, plus any design reference:

- Image: `docs/designs/NN-name.png` — intent: "layout reference only, values from tokens" or "match closely"

## Decisions for you

Only what Stu signs off on: visible behaviour, scope, content shape, new dependencies or services, any proposal to replace a **Suggested** approach. One line each, recommended option first.

## What I need to understand

For Stu, answered before approval:

- Concepts or APIs in this plan that are new or unfamiliar, with a link to the current docs for each
- Questions Stu should be able to answer about this feature (e.g. in an interview)
- A small spike or test to try first, if something is genuinely unknown

## Implementation notes

The agent's own choices: file names, APIs, techniques, fallbacks ("if X isn't available in the installed version, use Y"). Detailed enough for a fresh session to build from AGENTS.md plus this plan. Stu skims this.

## Out of scope

What this plan deliberately leaves out, and the seam left for it ("server action stubbed with a typed result; Resend wired in plan 06").

## Steps

### 1. Step title

A full prompt: files and context needed, what done looks like, and the check that proves it (test, command, screenshot). Each step leaves the app working and ends in a commit.

## Verification

- **Agent-run:** typecheck, lint, unit tests, e2e, axe, screenshots at 375 / 768 / 1440px (and reduced motion where relevant), compared with the design reference.
- **Stu:** only what the agent can't judge: feel, taste, real-device checks.

## AGENTS.md updates

Decisions later plans must respect, the section each belongs to, and any rule it replaces. "None" if nothing.

## Result

Filled at close-out: what changed from the plan and why, test files changed (if any), and checks still pending for Stu.
