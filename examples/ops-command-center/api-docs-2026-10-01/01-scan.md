# API docs · scan

- Run: api-docs-2026-10-01
- Stage: 01 of 03 — scan
- Status: complete
- Inputs: `apps/api/src/main.ts`, `apps/api/src/configure-app.ts`, 4 controllers, 1 gateway, DTOs in `*/dto/`; docs folder `docs/api` (first run — folder does not exist)
- Next: /steel:api-docs-generate .steel/runs/api-docs-2026-10-01

## Applications

| App | Entry | Global prefix | Global pipes / guards / filters |
| --- | ----- | ------------- | ------------------------------- |
| `@occ/api` | `apps/api/src/main.ts` → `configure-app.ts` | `api` (`configure-app.ts:7`) | `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })` (`:9`) — unknown body/query fields are rejected with 400; `ApiExceptionFilter` (`:11`) — every error has the `ApiError` shape; no guards (no authentication yet) |

Domain errors are mapped in `apps/api/src/common/api-exception.filter.ts`:
`EntityNotFoundError` → 404, `InvalidTransitionError` → 409, any other error → 500 with a
generic message.

## Drift summary

| Status | Count |
| ------ | ----- |
| `new` | 11 |
| `changed` | 0 |
| `unchanged` | 0 |
| `removed` | 0 |

## Endpoints

| Status | Method | Path | Module | Source |
| ------ | ------ | ---- | ------ | ------ |
| new | GET | `/api/health` | health | `apps/api/src/health/health.controller.ts:11` |
| new | GET | `/api/zones` | zones | `apps/api/src/zones/zones.controller.ts:13` |
| new | GET | `/api/cameras` | cameras | `apps/api/src/cameras/cameras.controller.ts:13` |
| new | GET | `/api/cameras/:id/stream` | cameras | `apps/api/src/cameras/cameras.controller.ts:21` |
| new | GET | `/api/incidents` | incidents | `apps/api/src/incidents/incidents.controller.ts:24` |
| new | GET | `/api/incidents/:id` | incidents | `apps/api/src/incidents/incidents.controller.ts:31` |
| new | POST | `/api/incidents` | incidents | `apps/api/src/incidents/incidents.controller.ts:39` |
| new | POST | `/api/incidents/:id/acknowledge` | incidents | `apps/api/src/incidents/incidents.controller.ts:47` |
| new | POST | `/api/incidents/:id/resolve` | incidents | `apps/api/src/incidents/incidents.controller.ts:59` |
| new | EVENT | `/events` `incident.created` | realtime | `apps/api/src/realtime/events.gateway.ts:37` |
| new | EVENT | `/events` `incident.updated` | realtime | `apps/api/src/realtime/events.gateway.ts:42` |

## Changes in detail

First run — every endpoint is `new`. No consumers are at risk.

## Signatures

**health**
- `GET /api/health | returns: {database, status} | auth: none`

**zones**
- `GET /api/zones | returns: Zone[] | auth: none`

**cameras**
- `GET /api/cameras | query: zoneId? | returns: Camera[] | auth: none`
- `GET /api/cameras/:id/stream | params: id | returns: StreamDescriptor | auth: none`

**incidents**
- `GET /api/incidents | query: limit?, severity?, status? | returns: Incident[] | auth: none`
- `GET /api/incidents/:id | params: id | returns: IncidentDetail | auth: none`
- `POST /api/incidents | body: ReportIncidentDto{description?, position?, severity, title, type, zoneId} | returns: IncidentDetail | auth: none`
- `POST /api/incidents/:id/acknowledge | params: id | body: TransitionIncidentDto{note?} | returns: IncidentDetail | auth: none`
- `POST /api/incidents/:id/resolve | params: id | body: TransitionIncidentDto{note?} | returns: IncidentDetail | auth: none`

**realtime**
- `EVENT /events incident.created | payload: Incident | auth: none`
- `EVENT /events incident.updated | payload: Incident | auth: none`
