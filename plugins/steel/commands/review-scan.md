---
description: Self-review pipeline 1/4 — review only the lines changed on this branch and record findings.
argument-hint: [base ref, default origin/main]
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git merge-base:*), Bash(git rev-parse:*), Bash(git branch:*)
---

# /steel:review-scan

Load the `steel:pipeline-conventions` skill and follow it for this whole stage.

A self-review runs **before** a pull request reaches another person. Its rule is strict
**diff scoping**: only lines added or modified on this branch are reviewed and, later, fixed.
Pre-existing code is never changed by this pipeline, however tempting.

**Input:** `$ARGUMENTS` — the base ref to compare against (default `origin/main`; fall back to
`main` if there is no remote).
**Output:** `.steel/runs/review-<branch>/01-scan.md` (`<branch>` = current branch, slashes
replaced by dashes). This stage reads only.

## Steps

1. **Establish the diff.** `git merge-base HEAD <base>`, then the diff from that point to the
   working tree, including staged, unstaged and untracked files. Record the base commit and the
   file list with added/removed line counts. Skip generated files (lockfiles, build output,
   snapshots) and say you skipped them.
2. **Build the line map**: for each file, the ranges of added or modified lines. Every finding
   must point inside these ranges. Anything you notice outside them is `[OUT OF SCOPE]`.
3. **Read the rules**: `CLAUDE.md` files on the path of each changed file, `.claude/rules/`,
   lint config. Repo rules are review criteria too.
4. **Review each changed hunk** against the checklist below, with enough surrounding context to
   judge it correctly (read the whole function, not just the hunk).
5. **Classify each finding**:
   - _Severity_: `blocker` (bug, security issue, data loss, broken contract), `major` (likely
     defect, missing test for new behaviour, convention break), `minor` (clarity, naming),
     `nit`.
   - _Fixable here_: yes if the fix stays inside the line map; otherwise `[OUT OF SCOPE]` with
     a note.

## Checklist

**Correctness** — edge cases (empty, null, duplicates, concurrency), error paths handled and
not swallowed, async work awaited, time zones, off-by-one, idempotency of retries.

**Boundaries** — input validated where it enters (DTOs, query params, events), output shapes
match the shared contract, no secrets or internals leaked in errors or logs.

**Data** — transactions where several writes must succeed together, migrations reversible,
queries indexed for the access pattern, no N+1 introduced.

**Framework conventions**

- _NestJS_: thin controllers, logic in services, DTOs with validation, exceptions mapped
  consistently, providers injected not instantiated, no circular module imports.
- _Angular_: `OnPush` where the codebase uses it, subscriptions cleaned up, no logic in
  templates, typed forms, lazy-loaded features stay lazy.
- _React_: hooks rules respected, effects have correct dependencies and cleanups, server state
  in the data layer rather than component state, keys stable, accessible markup.

**Tests** — new behaviour has a test at the right level, tests assert behaviour rather than
implementation, no skipped or focused tests left behind.

**Hygiene** — debug output, commented-out code, TODOs without a ticket, dead code introduced by
the change.

## Artifact template

```markdown
# Review · scan

- Run: review-<branch>
- Stage: 01 of 04 — scan
- Status: complete
- Inputs: diff <base-sha>..working tree; <rules read>
- Next: /steel:review-plan .steel/runs/review-<branch>

## Diff

| File | +   | −   |
| ---- | --- | --- |

## Findings

| ID  | Severity | Location    | Finding | Fixable here |
| --- | -------- | ----------- | ------- | ------------ |
| R1  | major    | src/x.ts:42 | …       | yes          |

## Out of scope

- [OUT OF SCOPE] src/y.ts:10 — … (pre-existing)

## Looks good

- <things done well — a review that only lists problems is half a review>
```
