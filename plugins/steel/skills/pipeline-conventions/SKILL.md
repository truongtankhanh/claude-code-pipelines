---
name: pipeline-conventions
description: The stage contract every steel pipeline follows — run folders, artifact headers, resumability, NEEDS INPUT and OUT OF SCOPE markers, repo-rule precedence and the no-commit rule. Load before running any /steel command.
user-invocable: false
---

# Steel pipeline conventions

Every `/steel:*` command is one **stage** of a pipeline. Stages are small, explicit and
resumable, so a human can stop between any two of them, read what happened, correct it and
continue. These rules apply to every stage. When a stage's own instructions are more specific,
the stage wins; when the repository's own rules disagree with either, the repository wins.

## 1. Precedence of rules

1. **The repository's own rules** — `CLAUDE.md` files (root and nested), `.claude/rules/`,
   linters, formatters, existing patterns in neighbouring code. Read them first, in every stage.
2. **The stage's instructions** — the command file being executed.
3. **General engineering judgment** — only where the first two are silent.

When you follow a repo rule that overrides a default, say so in the artifact
(`Followed CLAUDE.md: "services never import controllers"`). Never "improve" a repo convention
you disagree with; record it under _Observations_ instead.

## 2. Run folders and artifacts

Each pipeline run lives in its own folder:

```
.steel/runs/<pipeline>-<slug>/
  01-<stage>.md
  02-<stage>.md
  ...
```

- `<pipeline>` is the pipeline name (`task`, `review`, `api-docs`, `test-init`).
- `<slug>` comes from the stage that starts the run (a ticket id, a branch name, a short
  kebab-case summary). Later stages receive the run folder as their argument.
- `.steel/` is local working state. If it is not ignored yet, suggest adding it to
  `.gitignore` in the first artifact — do not edit `.gitignore` yourself unless asked.

Every artifact starts with this header:

```markdown
# <Pipeline> · <stage>

- Run: <pipeline>-<slug>
- Stage: <NN> of <total> — <stage>
- Status: complete | needs-input | blocked
- Inputs: <previous artifact(s) and files read>
- Next: <the exact command to run next, or "none — run finished">
```

`Status` means:

| Status        | Meaning                                                              | Next stage may run? |
| ------------- | -------------------------------------------------------------------- | ------------------- |
| `complete`    | The stage did everything it was asked to.                            | Yes                 |
| `needs-input` | At least one `[NEEDS INPUT]` item must be answered by a human first. | No                  |
| `blocked`     | Something outside the pipeline prevents progress (see _Blockers_).   | No                  |

## 3. Resumability

- A stage reads **only** the artifacts of earlier stages plus the repository. It never relies on
  chat history, so a run can be resumed in a new session.
- Before starting, check the previous artifact: if it is missing, or its status is not
  `complete`, stop and tell the user which stage to run or which question to answer.
- Re-running a stage **overwrites** its own artifact and invalidates later ones. Mark any later
  artifacts as stale by adding `- Stale: superseded by re-run of <stage> on <date>` to their
  header; do not delete them.
- A human may edit any artifact between stages. Treat the edited artifact as the source of truth.

## 4. Markers

Use these markers verbatim so they can be searched for:

- **`[NEEDS INPUT]`** — a decision only a human can make (product behaviour, naming that
  affects other teams, a trade-off with no clear default). Write the question, the options and
  your recommendation. Set the artifact status to `needs-input` and stop. The human answers
  inline (`Answer: …`) and re-runs the next stage, which must check every marker has an answer.
- **`[OUT OF SCOPE]`** — something noticed but deliberately not touched (pre-existing issues,
  unrelated files, refactors nobody asked for). Record it with a file reference so it can become
  its own ticket. Never fix out-of-scope findings "while you are there".
- **`[ASSUMPTION]`** — a choice you made where the inputs were silent but a reasonable default
  exists. Assumptions do not stop the run; they make it reviewable.

## 5. What a stage never does

- **No commits, pushes, pull requests, tags or releases.** Changes stay in the working tree
  for the human to review. This holds even if the user asks mid-stage — finish the stage, then
  let them run git themselves.
- **No changes outside the agreed scope.** The plan defines the files a run may touch; the apply
  stage may only touch those, plus tests for them. A needed file outside the plan means the plan
  is wrong: stop with `needs-input` and say why.
- **No silent dependency changes.** Adding, removing or upgrading a package is always a planned,
  explicit step with a reason.
- **No destructive commands** (`rm -rf`, `git reset --hard`, dropping databases, force-pushes)
  unless the plan names them and the human approved that plan.

## 6. Evidence

Verification is done with the repository's own commands — read `package.json` scripts, the
`Makefile`, CI workflows or `CLAUDE.md` to find them. Every claim of "passes" in an artifact is
backed by the command that was run and the relevant tail of its output. If a check cannot be
run (missing service, missing credentials), say so plainly under _Not verified_ instead of
implying it passed.

## 7. Writing artifacts

- Lead with the outcome, then the detail. A reviewer should understand the stage from the first
  ten lines.
- Reference code as `path/to/file.ts:42` so editors can jump to it.
- Prefer tables for lists of findings or steps; keep prose for reasoning.
- Keep artifacts in English unless the repository's `CLAUDE.md` asks for another language.
