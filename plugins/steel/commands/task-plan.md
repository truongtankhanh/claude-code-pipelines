---
description: Task pipeline 2/4 — turn the analysis into a reviewable, file-by-file implementation plan.
argument-hint: <run folder, e.g. .steel/runs/task-occ-27>
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git log:*), Bash(git diff:*), Bash(ls:*)
---

# /steel:task-plan

Load the `steel:pipeline-conventions` skill and follow it for this whole stage.

**Input:** `$ARGUMENTS` — the run folder. Read `01-analyze.md` from it.
**Output:** `02-plan.md` in the same folder.

## Preconditions

- `01-analyze.md` exists and its status is `complete`, or every `[NEEDS INPUT]` in it has an
  `Answer:` line. Otherwise stop and point the user at the unanswered questions.
- Re-read the files listed in the code map — the working tree may have changed since analysis.

## Steps

1. **Choose the approach.** If there is more than one reasonable design, compare them in a
   short table (effort, risk, fit with existing patterns) and pick one. A choice that changes
   behaviour or a shared contract and is not settled by the analysis is `[NEEDS INPUT]`.
2. **Define scope as a file list.** Every file the apply stage may create, modify or delete.
   Nothing outside this list will be touched; if you are unsure whether a file is needed,
   include it with the reason.
3. **Break the work into ordered steps**, each small enough to review on its own:
   contracts and types first, then data and domain, then transport (controllers, events),
   then UI, then docs. For each step: files, what changes, and why.
4. **Plan the tests with the code**, not after it. For each acceptance criterion name the test
   that will prove it (unit, integration or e2e) and the file it lives in. Follow the repo's
   test naming and location conventions.
5. **Plan verification**: the exact repository commands that the verify stage will run
   (lint, typecheck, tests, build), found in `package.json` scripts, CI config or `CLAUDE.md`.
6. **Record risks and rollback**: migrations, data changes, feature flags, backward
   compatibility of any contract you change.

## Artifact template

```markdown
# Task · plan

- Run: task-<slug>
- Stage: 02 of 04 — plan
- Status: complete | needs-input
- Inputs: 01-analyze.md
- Next: /steel:task-apply .steel/runs/task-<slug>

## Approach

<chosen design in a paragraph; alternatives table if there were real alternatives>

## Scope

| File | Change | Reason |
| ---- | ------ | ------ |

## Steps

1. **<title>** — files: … — <what and why>

## Tests

| Acceptance criterion | Test | File |
| -------------------- | ---- | ---- |

## Verification commands

- `pnpm lint`
- …

## Risks and rollback

- …
```

Finish by telling the user the artifact path, the status, and the next command. Remind them
this is the best moment to edit the plan — the apply stage follows it literally.
