---
description: API docs pipeline 3/3 — check the generated docs against the code and the running API's own spec.
argument-hint: <run folder, e.g. .steel/runs/api-docs-2026-10-01>
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*)
---

# /steel:api-docs-verify

Load the `steel:pipeline-conventions` skill and follow it for this whole stage.

**Input:** `$ARGUMENTS` — the run folder. Read `01-scan.md` and `02-generate.md`.
**Output:** `03-verify.md`. This stage does not change any file.

## Steps

1. **Completeness.** Every endpoint in the scan with status `new`, `changed` or `unchanged` has
   exactly one section whose marker matches its signature. Every `removed` endpoint is marked
   `[DEPRECATED]`, not deleted.
2. **Accuracy, by sampling the code.** For at least one endpoint per module — and every endpoint
   marked `needs-rework` — re-read the handler, DTO and any global pipes, and confirm the
   documented parameters, validation, status codes and errors are what the code actually does.
3. **OpenAPI validity.** `openapi.json` parses as JSON, declares `openapi: 3.1.x`, every `$ref`
   resolves, and every documented path appears. If the repository has an OpenAPI linter, run it.
4. **Cross-check with the app's own spec**, when the app exposes one (for example
   `@nestjs/swagger` at `/api/docs-json`) and the user confirms the app is running: list paths
   or parameters present in one and not the other.
5. **Scope.** `git status` shows changes only inside the docs folder.

## Artifact template

```markdown
# API docs · verify

- Run: api-docs-<date>
- Stage: 03 of 03 — verify
- Status: complete | needs-input | blocked
- Inputs: 01-scan.md, 02-generate.md, docs folder
- Next: none — run finished

## Result

<docs match the code | list of mismatches to fix by re-running generate>

## Completeness

| Module | Expected | Documented | Deprecated |
| ------ | -------- | ---------- | ---------- |

## Accuracy samples

| Endpoint | Checked | Result |
| -------- | ------- | ------ |

## OpenAPI

- parse / version / refs / paths: …

## Not verified

- …
```
