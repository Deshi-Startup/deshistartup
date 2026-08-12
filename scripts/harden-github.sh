#!/usr/bin/env bash
# One-shot GitHub hardening for Deshi-Startup/deshistartup.
#
# Everything here is a repository *setting*, not code, so it lives outside the
# build. Re-running is safe: every call is idempotent.
#
# Requires a token with "Administration: Read and write" on the repository
# (a fine-grained PAT with only Contents/PR write returns 403). Check with:
#
#   gh api -X PATCH repos/Deshi-Startup/deshistartup -f has_projects=true
#
set -euo pipefail

REPO="${REPO:-Deshi-Startup/deshistartup}"
ACTIONS_APP_ID=15368 # github-actions, needed as a ruleset bypass actor

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

say "Secret scanning: add non-provider patterns and validity checks"
gh api -X PATCH "repos/$REPO" \
  -F 'security_and_analysis[secret_scanning][status]=enabled' \
  -F 'security_and_analysis[secret_scanning_push_protection][status]=enabled' \
  -F 'security_and_analysis[secret_scanning_non_provider_patterns][status]=enabled' \
  -F 'security_and_analysis[secret_scanning_validity_checks][status]=enabled' \
  --jq '.security_and_analysis'

say "Actions: only GitHub-authored and verified-creator actions may run"
gh api -X PUT "repos/$REPO/actions/permissions" \
  -F enabled=true -f allowed_actions=selected --silent
gh api -X PUT "repos/$REPO/actions/permissions/selected-actions" \
  -F github_owned_allowed=true -F verified_allowed=true \
  -f 'patterns_allowed[]=' --silent 2>/dev/null ||
  gh api -X PUT "repos/$REPO/actions/permissions/selected-actions" \
    -F github_owned_allowed=true -F verified_allowed=true --silent

say "Actions: workflow token stays read-only, no PR approvals from workflows"
gh api -X PUT "repos/$REPO/actions/permissions/workflow" \
  -f default_workflow_permissions=read \
  -F can_approve_pull_request_reviews=false --silent

say "CodeQL default setup"
gh api -X PATCH "repos/$REPO/code-scanning/default-setup" \
  -f state=configured -f query_suite=default \
  -f 'languages[]=javascript-typescript' --jq '.run_id // .state' ||
  echo "  (skipped — already configured or unsupported here)"

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
    { "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "always" },
    { "actor_id": $ACTIONS_APP_ID, "actor_type": "Integration", "bypass_mode": "always" }
  ],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true,
        "automatic_copilot_code_review_enabled": false,
        "allowed_merge_methods": ["merge", "squash", "rebase"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": false,
        "required_status_checks": [
          { "context": "check", "integration_id": $ACTIONS_APP_ID }
        ]
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
