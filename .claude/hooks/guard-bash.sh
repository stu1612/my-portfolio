#!/usr/bin/env bash
# PreToolUse (Bash): blocks commands that AGENTS.md says need Stu.
# Exit 2 blocks the call; stderr goes back to the agent.
set -euo pipefail

cmd=$(jq -r '.tool_input.command // ""')

block() { echo "Blocked by guard-bash: $1" >&2; exit 2; }

# Adding a dependency (bare `npm install` / `npm ci` to restore the lockfile is fine)
if echo "$cmd" | grep -Eq '(^|[;&|]\s*)(npm|pnpm|yarn|bun)\s+(install|i|add)(\s+-[^[:space:]]+)*\s+[^-[:space:]]'; then
  block "adding a dependency needs Stu's approval. Put it in the plan's 'Decisions for you' and ask."
fi

# Pushing, merging, rewriting history, destructive deletes
if echo "$cmd" | grep -Eq 'git\s+(push|merge|rebase)\b|git\s+reset\s+--hard|--force\b|\s-f\s.*push|rm\s+-[a-zA-Z]*r[a-zA-Z]*f'; then
  block "push, merge, rebase, hard reset, force and rm -rf are Stu's to run. Ask in chat."
fi

# fix/ and chore/ branches skip the plan gate, so only Stu creates them.
# feat/NN branches are fine: the gate still needs Stu's approved plan.
if echo "$cmd" | grep -Eq 'git\s+(switch\s+(-c|-C|--create)|checkout\s+-[bB]|branch)\s+(fix|chore)/'; then
  block "fix/ and chore/ branches skip the plan, so Stu creates them. Ask whether this is a small fix or needs a plan."
fi

current=$(git -C "${CLAUDE_PROJECT_DIR:-.}" branch --show-current 2>/dev/null || echo "")

# feat/NN branches are cut from dev, never from main
if echo "$cmd" | grep -Eq 'git\s+(switch\s+(-c|-C|--create)|checkout\s+-[bB]|branch)\s+feat/' \
   && [ "$current" != "dev" ]; then
  block "feat/ branches are cut from dev, never from '${current:-detached}'. Switch to dev first, or ask Stu."
fi

# No commits directly on main or dev: Stu merges into them
if echo "$cmd" | grep -Eq 'git\s+commit\b' && { [ "$current" = "main" ] || [ "$current" = "dev" ]; }; then
  block "no commits directly on '$current'. Commit on the plan's feat/NN branch; Stu merges into dev and main."
fi

# Auditing with forced fixes rewrites the dependency tree
if echo "$cmd" | grep -Eq 'npm\s+audit\s+fix\s+--force'; then
  block "npm audit fix --force can upgrade majors silently. Report the audit output instead."
fi

exit 0