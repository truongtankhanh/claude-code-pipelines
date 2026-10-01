---
description: Self-review pipeline 2/4 — group in-scope findings into fix batches the human can approve.
argument-hint: <run folder, e.g. .steel/runs/review-feature-x>
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*)
---

# /steel:review-plan

Load the `steel:pipeline-conventions` skill and follow it for this whole stage.

**Input:** `$ARGUMENTS` — the run folder. Read `01-scan.md`.
**Output:** `02-plan.md`. This stage reads only.

## Steps

1. **Drop what will not be fixed here.** Findings marked not fixable, or `[OUT OF SCOPE]`, are
   carried into a _Follow-ups_ list (each one a candidate ticket) and excluded from batches.
2. **Decide each remaining finding**: `fix`, `won't fix` (with the reason — e.g. it matches an
   existing repo convention), or `[NEEDS INPUT]` when fixing it changes behaviour the author
   may have intended.
3. **Batch the fixes** so each batch is one coherent change that can be applied and checked on
   its own: group by file and concern, blockers first. For each batch list the findings, the
   exact lines it may touch (always inside the scan's line map), and the intended change.
4. **Name the checks** the verify stage will run (lint, typecheck, the tests closest to the
   touched code, then the full suite).

## Artifact template

```markdown
# Review · plan

- Run: review-<branch>
- Stage: 02 of 04 — plan
- Status: complete | needs-input
- Inputs: 01-scan.md
- Next: /steel:review-apply .steel/runs/review-<branch>

## Decisions

| ID  | Decision | Reason |
| --- | -------- | ------ |

## Batches

### B1 — <title>

- Findings: R1, R3
- Lines: src/x.ts:40-48
- Change: …

## Checks

- …

## Follow-ups (not part of this review)

- …
```
