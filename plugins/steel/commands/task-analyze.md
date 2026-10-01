---
description: Task pipeline 1/4 — understand a ticket and the code it touches, without changing anything.
argument-hint: <ticket text, ticket file, or issue reference>
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git log:*), Bash(git diff:*), Bash(ls:*)
---

# /steel:task-analyze

Load the `steel:pipeline-conventions` skill and follow it for this whole stage.

**Input:** `$ARGUMENTS` — the ticket. It may be pasted text, a path to a file, or an issue
reference the user can paste on request. If it is empty, ask for the ticket and stop.

**Output:** `.steel/runs/task-<slug>/01-analyze.md`, where `<slug>` is the ticket id if there is
one (`occ-27`), otherwise a 3–5 word kebab-case summary.

This stage **reads only**. It does not edit, create or delete any file other than its artifact.

## Steps

1. **Restate the ticket** in two or three sentences: the user-visible outcome, who benefits, and
   how we will know it is done. List explicit acceptance criteria; if the ticket has none, derive
   them and tag each `[ASSUMPTION]`.
2. **Read the repository's rules**: every `CLAUDE.md` on the path to the affected code,
   `.claude/rules/`, lint/format config, and the test setup. Note the rules that will shape the
   change.
3. **Map the code the ticket touches.** Start from entry points (routes, controllers, pages,
   commands) and follow the calls. For each relevant file record why it matters. Include the
   tests that currently cover that behaviour.
4. **Find the existing pattern to copy.** Locate the closest feature that already does something
   similar and name it — the plan should extend existing patterns rather than invent new ones.
5. **Identify contracts at risk**: public API shapes, shared types, database schema, events,
   configuration. Anything another team or app depends on is called out explicitly.
6. **List open questions.** Anything that changes behaviour and is not answered by the ticket
   becomes `[NEEDS INPUT]` with options and a recommendation. Do not guess on these.

## Artifact template

```markdown
# Task · analyze

- Run: task-<slug>
- Stage: 01 of 04 — analyze
- Status: complete | needs-input
- Inputs: <ticket source>; <rules files read>
- Next: /steel:task-plan .steel/runs/task-<slug>

## Ticket

<restatement>

### Acceptance criteria

1. …

## Repository rules that apply

- `CLAUDE.md`: …

## Code map

| File | Role in this ticket |
| ---- | ------------------- |

## Pattern to follow

<closest existing feature and why>

## Contracts at risk

- …

## Open questions

- [NEEDS INPUT] … Options: A / B. Recommendation: A, because …

## Observations

- [OUT OF SCOPE] …
```

Finish by telling the user the artifact path, the status, and the next command.
