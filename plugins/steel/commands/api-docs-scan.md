---
description: API docs pipeline 1/3 — inventory every NestJS endpoint and detect drift against the existing docs.
argument-hint: [docs folder, default docs/api]
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git log:*), Bash(ls:*)
---

# /steel:api-docs-scan

Load the `steel:pipeline-conventions` skill and follow it for this whole stage.

API documentation that is written once and never reconciled becomes wrong quietly. This pipeline
documents NestJS APIs **from the code**, and on every later run reports exactly what drifted.

**Input:** `$ARGUMENTS` — where the docs live (default `docs/api`). The folder may not exist
yet; that is a first run.
**Output:** `.steel/runs/api-docs-<yyyy-mm-dd>/01-scan.md`. This stage reads only.

## Steps

1. **Find the applications.** Locate every `main.ts` that calls `NestFactory.create`. Record each
   app's global prefix, versioning setup, global pipes, guards, interceptors and exception
   filters — they change what every endpoint actually accepts and returns.
2. **Inventory endpoints.** For each `@Controller`, every handler decorated with `@Get`, `@Post`,
   `@Put`, `@Patch`, `@Delete`, `@All`, plus `@WebSocketGateway` events if present. For each
   endpoint capture:
   - method and full path (global prefix + controller path + route)
   - path params, query params and body, with their DTO and validation rules
   - success status code and response type; documented error responses
   - guards, roles or auth requirements
   - the source location `file:line`
3. **Build each endpoint's signature line** — the stable, comparable summary used for drift
   detection:
   `METHOD /full/path | params: a, b | query: x?, y? | body: DtoName{field, field?} | returns: Type | auth: guard|none`
   List fields in alphabetical order; mark optional fields with `?`.
4. **Compare with existing docs.** Each documented endpoint carries its signature in a marker:
   `<!-- steel:endpoint <signature> -->`. Match code and docs by `METHOD /path` and classify:

   | Status      | Meaning                                                      |
   | ----------- | ------------------------------------------------------------ |
   | `new`       | In code, not in docs                                         |
   | `changed`   | In both, signature differs — list exactly which parts differ |
   | `unchanged` | Signatures identical                                         |
   | `removed`   | In docs, no longer in code                                   |

5. **Flag consumers at risk.** For `changed` and `removed` endpoints, search the repository for
   callers (frontend API clients, other services, tests) and list them. These become
   `needs-rework` in the generated docs.

## Artifact template

```markdown
# API docs · scan

- Run: api-docs-<date>
- Stage: 01 of 03 — scan
- Status: complete | needs-input
- Inputs: <apps found>; docs folder <path> (<n> documented endpoints | first run)
- Next: /steel:api-docs-generate .steel/runs/api-docs-<date>

## Applications

| App | Entry | Global prefix | Global pipes / guards / filters |
| --- | ----- | ------------- | ------------------------------- |

## Drift summary

| Status | Count |
| ------ | ----- |

## Endpoints

| Status | Method | Path | Module | Source |
| ------ | ------ | ---- | ------ | ------ |

## Changes in detail

### GET /api/example — changed

- query: added `limit?`
- consumers: apps/web/src/api/example.ts:12 → needs-rework

## Signatures

<one signature line per endpoint, grouped by module>
```
