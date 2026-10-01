---
description: Self-review pipeline 4/4 — confirm fixes stayed in scope and the branch is ready for review.
argument-hint: <run folder, e.g. .steel/runs/review-feature-x>
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(git merge-base:*)
---

# /steel:review-verify

Load the `steel:pipeline-conventions` skill and follow it for this whole stage.

**Input:** `$ARGUMENTS` — the run folder. Read every earlier artifact.
**Output:** `04-verify.md`. This stage does not change source files.

## Steps

1. **Prove diff scoping held.** Diff the working tree against the scan's base again. Every line
   changed by the apply stage must fall inside the scan's line map; list any that do not as
   blockers.
2. **Run the checks** from the plan using the repository's own commands. Record exit codes and
   output tails.
3. **Re-check each fixed finding** in the new code and mark it `resolved` or `still present`.
4. **Summarise for the human reviewer** who will see the pull request next: what was fixed, what
   was deliberately left, and the follow-ups worth filing.

## Artifact template

```markdown
# Review · verify

- Run: review-<branch>
- Stage: 04 of 04 — verify
- Status: complete | needs-input | blocked
- Inputs: 01-scan.md, 02-plan.md, 03-apply.md, working tree
- Next: none — run finished

## Result

<ready for PR / not yet, and why>

## Scope check

<all edits inside the line map | list of violations>

## Checks

| Command | Exit | Evidence |
| ------- | ---- | -------- |

## Findings

| ID  | Severity | Status |
| --- | -------- | ------ |

## For the PR description

- Self-review: <n> findings, <m> fixed, <k> deferred (see follow-ups)

## Follow-ups

- …
```
