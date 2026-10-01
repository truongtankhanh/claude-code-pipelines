# API docs · verify

- Run: api-docs-2026-10-01
- Stage: 03 of 03 — verify
- Status: complete
- Inputs: 01-scan.md, 02-generate.md, `docs/api/`
- Next: none — run finished

## Result

The docs match the code. Every scanned endpoint is documented once with a matching signature
marker, sampled behaviour matches the handlers, and the OpenAPI document validates.

## Completeness

| Module | Expected | Documented | Deprecated |
| ------ | -------- | ---------- | ---------- |
| health | 1 | 1 | 0 |
| zones | 1 | 1 | 0 |
| cameras | 2 | 2 | 0 |
| incidents | 5 | 5 | 0 |
| realtime | 2 | 2 | 0 |

`grep -c "steel:endpoint" docs/api/*.md` → 11 markers; each marker's text is identical to its
signature line in `01-scan.md`.

## Accuracy samples

| Endpoint | Checked | Result |
| -------- | ------- | ------ |
| `GET /api/health` | 503 path and message in `health.controller.ts` | matches |
| `GET /api/cameras/:id/stream` | descriptor kinds against `packages/camera-adapter` and `CAMERA_SOURCE` handling | matches |
| `GET /api/incidents` | ordering, comma/repeated list parsing (`toList`), `limit` 1–500 default 100 | matches |
| `POST /api/incidents` | DTO limits, `forbidNonWhitelisted`, 404 for unknown zone, zone-centre default | matches |
| `POST /api/incidents/:id/acknowledge` | 409 rule in `IncidentEntity.acknowledge`, pessimistic lock | matches |
| `POST /api/incidents/:id/resolve` | 409 only when already resolved | matches |
| `incident.created` / `incident.updated` | emitted after commit in `IncidentsService`, broadcast in `EventsGateway` | matches |

## OpenAPI

- Parses as JSON; `openapi: 3.1.0`.
- `@apidevtools/swagger-parser` `validate()` → `valid 3.1.0 8 paths` (all `$ref`s resolve).
- Paths: the 8 paths / 9 operations documented in Markdown, nothing extra.

## Cross-check with the app's own spec

The app was running locally; `GET /api/docs-json` lists the same 8 paths and 9 operations.
No parameters present in one and missing in the other.

## Not verified

- Socket.IO events have no machine-readable spec to compare against; they were checked against
  the gateway source only.

## Scope

`git status` shows changes only under `docs/api/` (plus the ignored `.steel/` run folder).
