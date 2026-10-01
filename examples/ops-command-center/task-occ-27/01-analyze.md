# Task · analyze

- Run: task-occ-27
- Stage: 01 of 04 — analyze
- Status: complete
- Inputs: ticket OCC-27 (below); `README.md`, `docs/architecture.md`, `docs/roadmap.md`; no `CLAUDE.md` or `.claude/rules/` in the repo; `eslint.config.mjs`, `apps/console/eslint.config.mjs`, `.prettierrc`
- Next: /steel:task-plan .steel/runs/task-occ-27

> Suggestion: `.steel/` is not in `.gitignore` yet. Add it so run artifacts stay local.

## Ticket

**OCC-27 — Report an incident from the console.** Operators can see and handle incidents but
cannot create one: reports today come only from the simulator (or a raw `POST /api/incidents`).
An operator who receives a radio call should be able to report it from the console in a few
seconds, and every other console should see it immediately.

### Acceptance criteria

1. A "Report incident" action is visible in the incident feed at all times.
2. It opens a form in the right-hand panel with: type, severity, zone, title (required) and an
   optional description. Limits match the API: title ≤ 160, description ≤ 2000 characters.
3. Submitting creates the incident through `POST /api/incidents`; on success the form closes and
   the new incident is selected, so the operator lands on its detail.
4. Validation or network errors are shown in the form and the operator's input is kept.
5. Other consoles receive the new incident live — no extra work expected, but confirm the path.
6. The form can be cancelled with a button or Escape, returning to the previous view.

`[ASSUMPTION]` Position: the API already defaults to the zone centre when `position` is
omitted (`apps/api/src/incidents/incidents.service.ts:63`). Picking a point on the map is a
separate ticket; this one sends no position.

`[ASSUMPTION]` Defaults: severity `medium`, type `intrusion` is too presumptive — no type is
preselected; the operator must choose one. Severity defaults to `medium`.

## Repository rules that apply

- No `CLAUDE.md`; conventions are taken from the code and docs:
  - Server data lives in TanStack Query, UI state in Zustand (`apps/console/src/store.ts:19`).
  - Mutations update the query cache from the response instead of refetching
    (`apps/console/src/api/queries.ts`, `useTransition`).
  - Shared request types come from `@occ/contracts` (`ReportIncidentRequest`,
    `packages/contracts/src/api.ts:11`); the console never redefines them.
  - Copy is sentence case, plain verbs, buttons say exactly what happens.
  - Tests: Vitest + Testing Library next to the component (`IncidentFeed.test.tsx`).
- ESLint: `consistent-type-imports` is on for the console (off only for `apps/api`).

## Code map

| File | Role in this ticket |
| ---- | ------------------- |
| `packages/contracts/src/api.ts:11` | `ReportIncidentRequest` — the request shape to send |
| `packages/contracts/src/domain.ts` | `INCIDENT_TYPES`, `INCIDENT_SEVERITIES` for the form options |
| `apps/api/src/incidents/dto/incident-requests.dto.ts:58` | Server validation: enums, title 1–160, description ≤ 2000, `zoneId` UUID |
| `apps/api/src/incidents/incidents.controller.ts` | `POST /api/incidents` → 201 with `IncidentDetail`; 404 unknown zone; 400 validation |
| `apps/api/src/incidents/incidents.service.ts:59` | Emits `incident.created` after commit — other consoles get it live (criterion 5) |
| `apps/console/src/api/client.ts` | `api.post`; `ApiRequestError` carries the server message |
| `apps/console/src/api/queries.ts` | Query keys and the `useTransition` mutation pattern to mirror |
| `apps/console/src/realtime/useLiveIncidents.ts` | Applies `incident.created` via `upsertIncident` and marks it fresh |
| `apps/console/src/store.ts` | UI state; needs to know whether the report form is open |
| `apps/console/src/App.tsx` | Decides what the right-hand column shows |
| `apps/console/src/components/IncidentFeed.tsx` | Where the "Report incident" action belongs |
| `apps/console/src/components/IncidentDetail.tsx` | Panel layout, form styling and Escape handling to reuse |
| `apps/console/src/styles/app.css` | Panel, form and button styles |
| `apps/console/src/components/IncidentFeed.test.tsx` | Existing component test pattern |

## Pattern to follow

The response form in `IncidentDetail.tsx` (`Actions`): a mutation from `queries.ts`, error shown
with `role="alert"`, buttons disabled while pending, input kept on failure. The new form should
look and behave like it, and live in the same right-hand panel slot.

## Contracts at risk

None. The ticket consumes the existing `POST /api/incidents` contract unchanged. Because the
reporting console receives both the HTTP response and the `incident.created` event, the cache
update must be idempotent — `upsertIncident` already is.

## Open questions

None blocking. The two `[ASSUMPTION]`s above are reasonable defaults and easy to revisit.

## Observations

- `[OUT OF SCOPE]` `apps/console/src/components/IncidentDetail.tsx:23` — the Escape listener is
  registered per panel; with two panels possible, a shared "close panel" hook would be cleaner.
  Not needed for this ticket since only one panel is mounted at a time.
- `[OUT OF SCOPE]` The source shown in incident detail says "Operator" for every non-simulated
  report; once sign-in exists (OCC-21) it should name the person.
