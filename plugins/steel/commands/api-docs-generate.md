---
description: API docs pipeline 2/3 — write or reconcile Markdown + OpenAPI docs from the scan.
argument-hint: <run folder, e.g. .steel/runs/api-docs-2026-10-01>
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(git status:*), Bash(ls:*)
---

# /steel:api-docs-generate

Load the `steel:pipeline-conventions` skill and follow it for this whole stage.

**Input:** `$ARGUMENTS` — the run folder. Read `01-scan.md`.
**Output:** files in the docs folder named by the scan, and `02-generate.md` in the run folder.
This stage writes **only** inside the docs folder.

## Layout of the docs folder

```
<docs>/
  README.md           index: every module, endpoint count, last reconciled date
  <module>.md         one file per Nest module (zones.md, incidents.md, …)
  openapi.json        OpenAPI 3.1 document for all documented endpoints
```

## Writing an endpoint

Each endpoint is one section, in this order, so readers and the next scan can rely on it:

```markdown
### List incidents

<!-- steel:endpoint GET /api/incidents | query: limit?, severity?, status? | returns: Incident[] | auth: none -->

`GET /api/incidents` · Status: current

Unresolved first, then by severity, then newest.

| Query    | Type               | Notes           |
| -------- | ------------------ | --------------- |
| `status` | `IncidentStatus[]` | comma-separated |

**200** — `Incident[]`
**400** — validation error (`ApiError`)

Source: `apps/api/src/incidents/incidents.controller.ts:24`
```

Write descriptions from the code's behaviour (validation rules, ordering, error mapping),
not from method names. Reuse the doc comments in the code when they exist.

## Reconciling an existing docs folder

Never rewrite hand-written prose blindly. Per scan status:

| Scan status | Action                                                                                                                                                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new`       | Add a section in the module file, `Status: current`.                                                                                                                                                     |
| `changed`   | Update the parts that differ and the marker. Set `Status: needs-rework` when consumers were found, and list them in a _Consumers to update_ note. Keep any human-written explanation that is still true. |
| `unchanged` | Leave it exactly as it is.                                                                                                                                                                               |
| `removed`   | Do not delete. Prefix the heading with `[DEPRECATED]`, set `Status: deprecated` and add the date. Deletion is a human decision.                                                                          |

If several endpoints were removed or deprecated, ask once, in a single consolidated
`[NEEDS INPUT]`, whether any should be deleted outright — not once per endpoint.

## OpenAPI

Regenerate `openapi.json` from the documented endpoints (not deprecated ones): paths, parameters,
request bodies and responses, with schemas under `components.schemas` named after the DTOs and
contract types. If the app already serves a generated spec (for example `@nestjs/swagger`),
prefer its schemas and note in the artifact that the two should be compared in verify.

## Artifact template

```markdown
# API docs · generate

- Run: api-docs-<date>
- Stage: 02 of 03 — generate
- Status: complete | needs-input
- Inputs: 01-scan.md
- Next: /steel:api-docs-verify .steel/runs/api-docs-<date>

## Files written

| File | Endpoints | Change |
| ---- | --------- | ------ |

## Reconciliation

| Endpoint | Scan status | Action |
| -------- | ----------- | ------ |
```
