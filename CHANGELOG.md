# Changelog

All notable changes to the `steel` plugin. Versions follow [Semantic Versioning](https://semver.org):
a breaking change to a stage's artifact format or command name is a major version.

## 1.0.0 — 2026-10-01

First public release.

- **Task pipeline** — `task-analyze`, `task-plan`, `task-apply`, `task-verify`.
- **Self-review pipeline** — `review-scan`, `review-plan`, `review-apply`, `review-verify`, with
  strict diff scoping and a line-by-line scope proof.
- **API docs pipeline** — `api-docs-scan`, `api-docs-generate`, `api-docs-verify` for NestJS:
  Markdown + OpenAPI 3.1, signature markers for drift detection, reconcile mode with
  `needs-rework` and `[DEPRECATED]` statuses.
- **Test init** — single-command scan → plan → build with an approval checkpoint and
  monorepo-aware member classification.
- **`pipeline-conventions` skill** — the shared stage contract.
- Example runs on ops-command-center, structural checks and CI.
