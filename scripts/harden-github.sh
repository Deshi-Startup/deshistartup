#!/usr/bin/env bash
# GitHub settings for Deshi-Startup/deshistartup, as code.
#
# These live outside the build because they are repository *settings*, and any
# admin can change them from the web UI. This script is the intended state:
# re-run it to undo drift, or to set up a mirror or a fork the same way
# (REPO=owner/name bash scripts/harden-github.sh). Every call is idempotent.
#
# Needs a token with "Administration: Read and write" on the repository; a
# fine-grained PAT holding only Contents/PR write returns 403.
#
set -euo pipefail

REPO="${REPO:-Deshi-Startup/deshistartup}"

say() { printf '\n\033[1m%s\033[0m\n' "$1"; }

say "Merge hygiene: delete merged branches, allow auto-merge"
gh api -X PATCH "repos/$REPO" \
  -F delete_branch_on_merge=true \
  -F allow_auto_merge=true \
  --jq '{delete_branch_on_merge, allow_auto_merge}'

say "Dependabot security updates"
gh api -X PUT "repos/$REPO/automated-security-fixes" --silent
gh api -X PUT "repos/$REPO/vulnerability-alerts" --silent

say "Private vulnerability reporting (the form SECURITY.md points at)"
gh api -X PUT "repos/$REPO/private-vulnerability-reporting" --silent

# Non-provider patterns and validity checks belong to GHAS Secret Protection.
# The API accepts them on this plan and leaves them disabled, so they are not
# set here — only the two that public repositories actually get.
say "Secret scanning and push protection"
gh api -X PATCH "repos/$REPO" \
  -F 'security_and_analysis[secret_scanning][status]=enabled' \
  -F 'security_and_analysis[secret_scanning_push_protection][status]=enabled' \
  --jq '.security_and_analysis'

say "Actions: only GitHub-authored and verified-creator actions may run"
gh api -X PUT "repos/$REPO/actions/permissions" \
  -F enabled=true -f allowed_actions=selected --silent
gh api -X PUT "repos/$REPO/actions/permissions/selected-actions" \
  -F github_owned_allowed=true -F verified_allowed=true --silent

# The second flag is one switch for "create *and* approve pull requests", and
# refresh-contributors has to open one. Leaving it on costs nothing here: the
# ruleset requires zero approving reviews, so an approval from a workflow is
# not what lets anything merge. Each workflow still starts from a read-only
# token and has to ask for more in its own `permissions:` block.
say "Actions: workflow token starts read-only"
gh api -X PUT "repos/$REPO/actions/permissions/workflow" \
  -f default_workflow_permissions=read \
  -F can_approve_pull_request_reviews=true --silent

say "CodeQL default setup"
gh api -X PATCH "repos/$REPO/code-scanning/default-setup" \
  -f state=configured -f query_suite=default \
  -f 'languages[]=javascript-typescript' --jq '.run_id // .state' ||
  echo "  (skipped — already configured or unsupported here)"

# Ruleset notes
#
# No "required_status_checks" rule. A contributor-snapshot PR created or updated
# with the repository's GITHUB_TOKEN creates `pull_request` runs that wait for
# manual approval, so a required check would leave this unattended PR "expected"
# forever. Every human and App PR still runs PR checks, they are just not a hard
# gate.
#
# To make them a hard gate later: give the refresh-contributors workflow a
# token from the org's GitHub App (actions/create-github-app-token, with
# APP_ID and APP_PRIVATE_KEY as Actions secrets), then add back:
#
#   { "type": "required_status_checks", "parameters": {
#       "strict_required_status_checks_policy": false,
#       "do_not_enforce_on_create": false,
#       "required_status_checks": [ { "context": "check", "integration_id": 15368 } ] } }
#
# GitHub Actions itself cannot be a bypass actor on a repository-level ruleset
# ("must be part of the ruleset source or owner organization"), and org-level
# rulesets need GitHub Team, so bypassing the bot is not an option on this plan.
say "Branch ruleset on the default branch"
RULESET_ID="$(gh api "repos/$REPO/rulesets" --jq '.[] | select(.name == "Protect Main") | .id' || true)"
BODY="$(cat <<JSON
{
  "name": "Protect Main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "bypass_actors": [
    { "actor_id": null, "actor_type": "OrganizationAdmin", "bypass_mode": "always" },
    { "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "always" }
  ],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true,
        "automatic_copilot_code_review_enabled": false,
        "allowed_merge_methods": ["merge", "squash", "rebase"]
      }
    }
  ]
}
JSON
)"

if [ -n "$RULESET_ID" ]; then
  printf '%s' "$BODY" | gh api -X PUT "repos/$REPO/rulesets/$RULESET_ID" --input - --jq '.name + " updated"'
else
  printf '%s' "$BODY" | gh api -X POST "repos/$REPO/rulesets" --input - --jq '.name + " created"'
fi

say "Done. Current state:"
gh api "repos/$REPO" --jq '{delete_branch_on_merge, allow_auto_merge, security_and_analysis}'
gh api "repos/$REPO/actions/permissions"
