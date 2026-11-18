#!/usr/bin/env bash
# Stop: refuses to finish while fast checks fail. E2E, axe and screenshots run in /close-out.
set -uo pipefail

input=$(cat)
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$root"

# Avoid an endless loop: if the agent already retried after a block, let it stop.
# AGENTS.md still requires failing checks to be reported as ❌.
if [ "$(echo "$input" | jq -r '.stop_hook_active // false')" = "true" ]; then
  exit 0
fi

# Only run when code or tests changed
if [ -z "$(git status --porcelain -- src tests e2e 2>/dev/null)" ]; then
  exit 0
fi

fail=""
npm run --silent --if-present typecheck >/tmp/check-types.log 2>&1 || fail="$fail typecheck"
npm run --silent --if-present lint      >/tmp/check-lint.log  2>&1 || fail="$fail lint"
npm run --silent --if-present test      >/tmp/check-test.log  2>&1 || fail="$fail tests"

if [ -n "$fail" ]; then
  {
    echo "Checks failed:$fail. Fix them before finishing, or report them as ❌ with the reason."
    for f in /tmp/check-types.log /tmp/check-lint.log /tmp/check-test.log; do
      [ -s "$f" ] && { echo "--- $(basename "$f")"; tail -n 20 "$f"; }
    done
  } >&2
  exit 2
fi

exit 0