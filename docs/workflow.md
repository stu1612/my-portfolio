# Workflow

How Stu and the agent build this site. If you've been away, run `/start` first: it reads the repo and tells you where things stand and what to type next.

## The loop

```
/start  →  /feature <description>  →  you approve  →  /feature NN  →  /close-out NN  →  you verify  →  /start
```

| Step | Who | What you type or do | What happens |
|---|---|---|---|
| 1. Orient | You | `/start` | Agent reports where the project is, what's next, and the exact commands. |
| 2. Plan | You → agent | `/feature <what you want>` on `dev` | Agent writes `prompts/NN-name.md` as `draft`, lists decisions, recommends a model. Writes no app code. |
| 3. Approve | **You** | Review the plan, answer decisions, set `Status: approved` | Unlocks app code for that plan (the plan-gate hook checks this line). |
| 4. Build | You → agent | `/model <recommended>`, then `/feature NN` | Agent cuts `feat/NN-name` from `dev`, builds step by step with a commit per step, ends at `built`. Run `/feature NN` again to resume an interrupted build. |
| 5. Close out | You → agent | `/close-out NN` | Agent runs e2e, axe and screenshots, fills the plan's Result, drafts the PR text. |
| 6. Verify | **You** | Your checks, set `Status: verified`, tick `ROADMAP.md`, push, PR to `dev`, merge | The plan is done. |

The agent always ends a step with a **Your turn** block when it needs you. Only you set `approved` and `verified`.

## Plan status

`draft` → `approved` (you) → `built` (agent) → `verified` (you). The status line in each `prompts/NN-*.md` is the project's source of truth; `/start` reads it, so there is no separate tracker to keep up to date.

## Branches

- `main`: only changes when you merge `dev` into it.
- `dev`: integration. Plans are drafted here; nothing is committed here directly.
- `feat/NN-name`: one per approved plan, cut from `dev`, merged back by PR.
- `fix/` and `chore/`: only you create these, for one-file changes with no new behaviour.

## Models

Each plan's Implementation notes has a `Model:` line. Plan on the strongest model; switch with `/model` before `/feature NN` if the plan recommends something lighter.

## Guards (what the hooks stop)

- App code (`src/`) outside an approved `feat/NN` plan, or on `main` / `dev`.
- Agent commits on `main` or `dev`; agent `feat/` branches not cut from `dev`; agent `fix/` and `chore/` branches.
- Push, merge, rebase, hard reset, force, `rm -rf`, new dependencies.
- Edits to `AGENTS.md`, `ROADMAP.md`, `.env*`; raw hex colours outside `tokens.css`; `.skip` / `.only` in tests.
- Finishing a turn while typecheck, lint or unit tests fail.

## Files

- `AGENTS.md`: rules for the agent (yours; the agent proposes changes).
- `ROADMAP.md`: plan order (yours).
- `prompts/NN-*.md`: one plan per feature, from `prompts/TEMPLATE.md`.
- `docs/design-system.md` and `src/styles/tokens.css`: design rules and values.
- `.claude/skills/`: `/start`, `/feature`, `/close-out`.
- `.claude/hooks/`: the guards above.
