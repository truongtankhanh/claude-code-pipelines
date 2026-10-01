---
description: Task pipeline 3/4 — implement the approved plan step by step, inside its file scope, without committing.
argument-hint: <run folder, e.g. .steel/runs/task-occ-27>
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(git status:*), Bash(git diff:*)
---

# /steel:task-apply

Load the `steel:pipeline-conventions` skill and follow it for this whole stage.

**Input:** `$ARGUMENTS` — the run folder. Read `01-analyze.md` and `02-plan.md`.
**Output:** code changes in the working tree, and `03-apply.md` in the run folder.

## Preconditions

- `02-plan.md` has status `complete` (or all its `[NEEDS INPUT]` items are answered).
- Record `git status --short` before you start, so the artifact can separate your changes from
  anything that was already modified. If files in the plan's scope already have uncommitted
  changes, stop with `blocked` and ask the user how to proceed.

## Rules for this stage

- **Follow the plan literally.** Implement its steps in order. The plan's _Scope_ table is a hard
  boundary: create, modify or delete only those files.
- **If reality disagrees with the plan** — a file needs changing that is not in scope, an API
  behaves differently than the analysis said — stop at the end of the current step, write what
  you found under _Deviations_, set status `needs-input`, and let the human decide whether to
  amend the plan. Do not improvise around it.
- **Write the planned tests in the same step as the code they cover.**
- **Match the surrounding code**: naming, file layout, error handling and comment style of the
  nearest existing feature. Repository rules beat your preferences.
- **Do not run git commands that change state.** No `add`, `commit`, `stash`, `checkout`,
  `reset` or `push`.
- Leave a short code comment only where the code cannot explain itself (a constraint, a
  non-obvious invariant), never to narrate the change.

## Artifact template

```markdown
# Task · apply

- Run: task-<slug>
- Stage: 03 of 04 — apply
- Status: complete | needs-input | blocked
- Inputs: 02-plan.md
- Next: /steel:task-verify .steel/runs/task-<slug>

## Summary

<two or three sentences: what now exists that did not before>

## Steps

| #   | Step | Status | Files |
| --- | ---- | ------ | ----- |
| 1   | …    | done   | …     |

## Changed files

<output of `git status --short`, limited to files changed by this stage>

## Deviations from the plan

- none | <what, why, and what the human needs to decide>

## Notes for the reviewer

- <anything that deserves a careful look>
```

Finish by telling the user what changed, the artifact path, and the next command.
