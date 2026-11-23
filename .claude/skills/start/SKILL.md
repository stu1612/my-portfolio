---
description: Orientation for Stu after time away — where the project is, what comes next, and the exact command to start it. Use `/start`.
disable-model-invocation: true
allowed-tools: Bash(git *) Bash(grep *) Bash(ls *)
---

Stu has been away and wants to pick up the project. Work out where things stand from the repo alone and tell Stu what to do next. Read only: change nothing, run nothing that writes.

## State (gathered before this prompt)

```!
echo "Branch: $(git branch --show-current)"
echo "Branches:"; git branch -a --format='  %(refname:short)'
echo "Uncommitted:"; git status --short | sed 's/^/  /'
echo "Recent commits:"; git log --oneline -8 | sed 's/^/  /'
echo "Plans:"; plans=$(find prompts -name '[0-9]*.md' -exec grep -H -m1 '^Status:' {} \; | sort); echo "${plans:-none yet}" | sed 's/^/  /'
```

Also read `ROADMAP.md` (for order and the next item) and, for any plan that is not `verified`, its Goal, Steps and Result.

## Where are we

Find the lowest-numbered roadmap item whose plan is not `verified`, then use the first matching row:

| State | Stu's next action |
|---|---|
| No `dev` branch | Commit `main`, then `git switch -c dev` and `git push -u origin dev` |
| No plan file for the item | `/feature <one-line description from the roadmap>` (on `dev`) |
| Plan `draft` | Read `prompts/NN-*.md`, answer its Decisions, set `Status: approved`, then `/model <plan's Model>` and `/feature NN` |
| Plan `approved`, no `feat/NN-*` branch | `/model <plan's Model>`, then `/feature NN` |
| Plan `approved`, branch exists | Build was interrupted. `/feature NN` resumes it |
| Plan `built`, Result not filled | `/close-out NN` |
| Plan `built`, Result filled | Do the "Stu" checks in Verification, set `Status: verified` and tick the roadmap line on the branch, push, open the PR to `dev`, merge |
| Plan `verified`, branch not merged into `dev` | Open or merge the PR for `feat/NN-*` |

Flag anything odd: uncommitted work, being on the wrong branch, a `verified` plan whose roadmap line is unticked, or two plans in progress at once.

## Reply format

Keep it short: Stu wants to be moving within a minute.

1. **Where we are:** milestone, last finished plan, current plan and its status, one line each.
2. **Since you left:** the last few commits in plain words, and any uncommitted work.
3. **Next:** the next task and why it is next.
4. **Your turn:** the exact commands to run, in a code block, in order.
5. **Reminder:** one line — `/feature <description>` plans, `/feature NN` builds, `/close-out NN` finishes, `/start` gets you back here. Full guide: `docs/workflow.md`.
