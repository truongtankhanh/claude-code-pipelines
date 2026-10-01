---
description: Self-review pipeline 3/4 — apply the approved fix batches, touching only lines changed on this branch.
argument-hint: <run folder, e.g. .steel/runs/review-feature-x>
allowed-tools: Read, Grep, Glob, Edit, Bash(git diff:*), Bash(git status:*)
---

# /steel:review-apply

Load the `steel:pipeline-conventions` skill and follow it for this whole stage.

**Input:** `$ARGUMENTS` — the run folder. Read `01-scan.md` and `02-plan.md`.
**Output:** fixes in the working tree and `03-apply.md`.

## Rules

- Apply batches in the plan's order. Skip findings decided `won't fix`, and stop if any
  `[NEEDS INPUT]` is unanswered.
- **Every edit must land inside the lines the batch names.** Before saving, compare the edit
  with the scan's line map. If a correct fix needs to touch a pre-existing line — for example
  a caller outside the diff — do not make it: record it under _Deferred_ with the reason.
- Keep each fix minimal. A self-review is not the place for a refactor.
- If a batch's lines have changed since the scan (the author kept working), re-read them; if the
  finding no longer applies, mark it `obsolete`.
- No git commands that change state.

## Artifact template

```markdown
# Review · apply

- Run: review-<branch>
- Stage: 03 of 04 — apply
- Status: complete | needs-input
- Inputs: 02-plan.md
- Next: /steel:review-verify .steel/runs/review-<branch>

## Batches

| Batch | Findings | Result | Files |
| ----- | -------- | ------ | ----- |

## Deferred

- R4 — the fix requires changing src/y.ts:12, which predates this branch.
```
