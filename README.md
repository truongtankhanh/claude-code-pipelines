# Claude Code Pipelines

[![CI](https://github.com/truongtankhanh/claude-code-pipelines/actions/workflows/ci.yml/badge.svg)](https://github.com/truongtankhanh/claude-code-pipelines/actions/workflows/ci.yml)
![Claude Code plugin](https://img.shields.io/badge/Claude_Code-plugin-D97757)
![License: CC BY-ND 4.0](https://img.shields.io/badge/license-CC_BY--ND_4.0-lightgrey)

Staged, resumable [Claude Code](https://code.claude.com) pipelines for engineers who review what
their AI tools do. Each job is split into **understand → plan → change → prove**; every stage
writes a Markdown artifact and stops, so a human can read, correct and continue. Nothing is ever
committed for you.

This is a public, project-neutral edition of the pipeline set I use day to day on NestJS,
Angular and React codebases.

```
/steel:task-analyze  "OCC-27: operators can report an incident from the console"
        ↓  .steel/runs/task-occ-27/01-analyze.md    ← ticket, code map, open questions
/steel:task-plan     .steel/runs/task-occ-27
        ↓  02-plan.md                               ← file-by-file scope, tests, checks   ✎ edit here
/steel:task-apply    .steel/runs/task-occ-27
        ↓  03-apply.md + working-tree changes       ← follows the plan literally
/steel:task-verify   .steel/runs/task-occ-27
           04-verify.md                             ← evidence per criterion, commit message
```

**See it run:** [examples/ops-command-center](examples/ops-command-center/) has the unedited
artifacts of three real runs on a NestJS + React monorepo, and links to the commits they produced.

## Install

```bash
# in Claude Code
/plugin marketplace add truongtankhanh/claude-code-pipelines
/plugin install steel@truongtankhanh
```

or from a shell: `claude plugin marketplace add truongtankhanh/claude-code-pipelines` then
`claude plugin install steel@truongtankhanh`.

Add `.steel/` to your `.gitignore`; run folders are local working state.

## Pipelines

| Pipeline        | Commands                                                         | Use it when                                                                                                                                               |
| --------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Task**        | `task-analyze` → `task-plan` → `task-apply` → `task-verify`      | Implementing a ticket that deserves a plan                                                                                                                |
| **Self-review** | `review-scan` → `review-plan` → `review-apply` → `review-verify` | Before opening a PR — reviews and fixes **only the lines your branch changed**                                                                            |
| **API docs**    | `api-docs-scan` → `api-docs-generate` → `api-docs-verify`        | Documenting NestJS APIs from code, then keeping docs honest: each run reports `new` / `changed` / `removed` endpoints and reconciles instead of rewriting |
| **Test init**   | `test-init` (scan → plan → build, one command)                   | Adding unit-test infrastructure to a repo or monorepo member, with an approval checkpoint before packages change                                          |

All commands are namespaced: `/steel:<command>`.

## The contract every stage follows

Defined once in the [`pipeline-conventions` skill](plugins/steel/skills/pipeline-conventions/SKILL.md):

- **Artifacts, not chat history.** A stage reads only earlier artifacts and the repo, so runs
  resume in a new session and survive hand edits.
- **Status gates.** Each artifact declares `complete`, `needs-input` or `blocked`; the next stage
  refuses to run on anything but `complete`.
- **Markers with fixed spelling.** `[NEEDS INPUT]` stops the run for a human decision,
  `[ASSUMPTION]` records a default without stopping, `[OUT OF SCOPE]` turns a noticed problem
  into a follow-up instead of a drive-by edit.
- **The repository's rules win.** `CLAUDE.md`, `.claude/rules/` and existing patterns override
  the commands' generic guidance.
- **Scope is a file list.** The plan names every file a run may touch; needing another one stops
  the run.
- **Evidence over adjectives.** "Passes" always comes with the command and its output.
- **Never commits.** No commit, push, PR or other git state change — enforced in CI on every
  command's `allowed-tools`.

Why each of these exists, and what it costs: [docs/design.md](docs/design.md).

## Repository layout

```
.claude-plugin/marketplace.json     marketplace "truongtankhanh" → plugins/steel
plugins/steel/
  .claude-plugin/plugin.json
  commands/                         12 stage commands
  skills/pipeline-conventions/      the shared stage contract
examples/ops-command-center/        real run artifacts
docs/design.md                      design decisions and trade-offs
scripts/check-pipelines.mjs         structural checks run in CI
```

## Quality checks

```bash
node scripts/check-pipelines.mjs   # every command loads the contract, Next: pointers resolve,
                                   # stage numbers match, no git-changing tools pre-approved,
                                   # example artifacts have valid headers
claude plugin validate .           # marketplace manifest
claude plugin validate plugins/steel
npx prettier --check .
```

CI runs all of them on every push.

## Roadmap

The private set these come from also covers per-stack unit and e2e test pipelines
(Angular, React, NestJS), lint/format setup, root-cause investigation, safe restructuring and a
UI-from-API-docs implementation pipeline. They will move here as they are made project-neutral.
See [CHANGELOG.md](CHANGELOG.md) for what has shipped.

## License

[CC BY-ND 4.0](LICENSE) © Trương Tấn Khánh — you may use and share this work unchanged, with
attribution; distributing modified versions is not permitted. Releases up to and including 1.0.0
remain under the MIT License.
