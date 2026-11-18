#!/usr/bin/env bash
# PreToolUse (Edit|MultiEdit|Write): protects files and enforces content rules.
# Exit 2 blocks the call; stderr goes back to the agent.
set -euo pipefail

input=$(cat)
path=$(echo "$input" | jq -r '.tool_input.file_path // ""')
content=$(echo "$input" | jq -r '.tool_input | (.content // .new_string // ([.edits[]?.new_string] | join("\n"))) // ""')

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
rel="${path#"$root"/}"

block() { echo "Blocked by guard-paths: $1" >&2; exit 2; }

# 1. Secrets and generated files
case "$rel" in
  .env.example) ;;
  .env|.env.*)            block "$rel holds secrets. Never edit it; list variable names in .env.example." ;;
  .next/*|node_modules/*) block "$rel is generated. Change the source instead." ;;
esac

# 2. Files Stu owns: propose changes in chat instead
case "$rel" in
  AGENTS.md|ROADMAP.md)   block "$rel is Stu's. Propose the exact change in chat (or under 'AGENTS.md updates' in the plan)." ;;
esac

# 3. Tests: no skipping or focusing
if echo "$rel" | grep -Eq '(\.(test|spec)\.[jt]sx?$)|(^(tests|e2e)/)'; then
  if echo "$content" | grep -Eq '\b(it|test|describe)\.(skip|only|todo)\b|\bx(it|describe)\('; then
    block "skip/only/todo in tests is not allowed. If a test fails and the fix isn't clear, stop and report."
  fi
fi

# 4. Design tokens: no raw hex colours in app code outside tokens.css
if echo "$rel" | grep -Eq '^src/.*\.(css|tsx?|jsx?)$' \
   && [ "$rel" != "src/styles/tokens.css" ] \
   && ! echo "$rel" | grep -Eq '\.(test|spec)\.'; then
  if echo "$content" | grep -Eq '(^|[^&[:alnum:]_])#[0-9a-fA-F]{3,8}\b'; then
    block "raw hex colour in $rel. Use a token from src/styles/tokens.css. (If this is a false positive, tell Stu.)"
  fi
fi

# 5. Plan gate: app code only with an approved plan for the current branch
if echo "$rel" | grep -Eq '^src/'; then
  branch=$(git -C "$root" branch --show-current 2>/dev/null || echo "")
  case "$branch" in
    fix/*|chore/*) ;;  # small fixes skip the plan
    feat/*)
      num=$(echo "$branch" | sed -E 's#^feat/([0-9]+).*#\1#')
      plan=$(ls "$root"/prompts/"$num"-*.md 2>/dev/null | head -n 1 || true)
      [ -n "$plan" ] || block "no plan prompts/$num-*.md for branch $branch. Write and get it approved first."
      status=$(grep -m1 -E '^Status:' "$plan" | sed -E 's/^Status:[[:space:]]*//' | tr -d '[:space:]')
      case "$status" in
        approved|built|verified) ;;
        *) block "plan $(basename "$plan") is '$status'. No app code until Stu sets Status: approved." ;;
      esac
      ;;
    *) block "app code is written on a feat/NN-name, fix/ or chore/ branch, never on '${branch:-detached}'." ;;
  esac
fi

exit 0