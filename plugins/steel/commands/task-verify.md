---
description: Task pipeline 4/4 — prove the change meets its acceptance criteria with the repository's own checks.
argument-hint: <run folder, e.g. .steel/runs/task-occ-27>
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*)
---

# /steel:task-verify

Load the `steel:pipeline-conventions` skill and follow it for this whole stage.

**Input:** `$ARGUMENTS` — the run folder. Read all earlier artifacts.
**Output:** `04-verify.md`. This stage does not change source files.

## Preconditions

- `03-apply.md` has status `complete`.

## Steps

1. **Scope check.** Compare `git diff --stat` (plus untracked files) with the plan's _Scope_
   table. Any changed file outside scope is a finding, even if the change looks harmless.
2. **Run the verification commands** listed in the plan, in order. Ask before running anything
   that needs services (databases, containers) the user may not have started. Capture the exit
   code and the meaningful tail of each command's output.
3. **Check every acceptance criterion** against evidence: the test that proves it and that the
   test ran and passed, or a manual check you performed (a request and its response, a rendered
   page). A criterion without evidence is _not verified_, never _passed_.
4. **Read the diff as a reviewer.** Look for: unhandled errors, missing validation at
   boundaries, breaking changes to contracts listed in the analysis, leftover debug code, and
   drift from the repository's conventions. Report findings with `file:line`; do not fix them
   here.
5. **Decide the outcome**:
   - `complete` — all checks pass and every criterion has evidence.
   - `needs-input` — checks pass but there are findings a human must weigh.
   - `blocked` — a check fails or cannot run. Say which stage to re-run (usually apply, after
     amending the plan).

## Artifact template

```markdown
# Task · verify

- Run: task-<slug>
- Stage: 04 of 04 — verify
- Status: complete | needs-input | blocked
- Inputs: 01-analyze.md, 02-plan.md, 03-apply.md, working tree
- Next: none — run finished | /steel:task-apply .steel/runs/task-<slug>

## Result

<one paragraph: is this ready for a human to commit and open a PR?>

## Checks

| Command | Exit | Evidence |
| ------- | ---- | -------- |

## Acceptance criteria

| #   | Criterion | Evidence | Result |
| --- | --------- | -------- | ------ |

## Scope

<in scope / out-of-scope files changed>

## Review findings

| Severity | File | Finding |
| -------- | ---- | ------- |

## Not verified

- …

## Suggested commit message

<conventional-commit message the human can use as-is>
```

Finish by summarising the result in one or two sentences. Do not commit — offer the suggested
commit message instead.
