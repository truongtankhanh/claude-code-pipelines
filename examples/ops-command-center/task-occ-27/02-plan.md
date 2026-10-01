# Task · plan

- Run: task-occ-27
- Stage: 02 of 04 — plan
- Status: complete
- Inputs: 01-analyze.md; re-read `store.ts`, `App.tsx`, `queries.ts`, `IncidentFeed.tsx`, `IncidentDetail.tsx`
- Next: /steel:task-apply .steel/runs/task-occ-27

## Approach

The right-hand column becomes a panel slot that shows either an incident's detail or the new
report form. The store gains one piece of UI state, `reporting`, kept mutually exclusive with
`selectedIncidentId`: opening the form clears the selection, selecting an incident closes the
form. A `useReportIncident` mutation mirrors `useTransition` — it writes the returned detail
into the cache, upserts the list, and the component selects the new incident on success.

| Option | Effort | Risk | Fit |
| ------ | ------ | ---- | --- |
| **Form in the right-hand panel** (chosen) | S | Low | Reuses panel layout, Escape and responsive sheet behaviour |
| Modal dialog | S | Medium | New pattern (focus trap, backdrop) the console does not have yet |
| Inline form at the top of the feed | M | Medium | Squeezes a 360 px column; hides the incident list while typing |

## Scope

| File | Change | Reason |
| ---- | ------ | ------ |
| `apps/console/src/store.ts` | modify | `reporting` state + `startReport` / `closeReport`; `select` closes the form |
| `apps/console/src/api/queries.ts` | modify | `useReportIncident` mutation |
| `apps/console/src/components/ReportIncidentForm.tsx` | create | The form |
| `apps/console/src/components/ReportIncidentForm.test.tsx` | create | Tests for criteria 2, 3, 4, 6 |
| `apps/console/src/components/IncidentFeed.tsx` | modify | "Report incident" action (criterion 1) |
| `apps/console/src/components/IncidentFeed.test.tsx` | modify | Test that the action opens the form |
| `apps/console/src/App.tsx` | modify | Panel slot shows the form or the detail |
| `apps/console/src/styles/app.css` | modify | Form field styles, feed action row |
| `.gitignore` | modify | Ignore `.steel/` run folders (suggested in analyze) |

## Steps

1. **UI state** — `store.ts`: add `reporting: boolean`, `startReport()` (sets `reporting`,
   clears `selectedIncidentId`), `closeReport()`; `select(id)` sets `reporting: false`.
2. **Mutation** — `queries.ts`: `useReportIncident()` posts `ReportIncidentRequest` to
   `/incidents`; on success sets `queryKeys.incident(id)` and upserts `queryKeys.incidents`
   with `upsertIncident` (idempotent with the live `incident.created` event).
3. **Form** — `ReportIncidentForm.tsx`: fields type (select, no default), severity (segmented
   radio group, default `medium`), zone (select from `useZones`), title (input, `maxLength` 160,
   required), description (textarea, `maxLength` 2000). Submit button "Report incident" is
   disabled until type, zone and a non-blank title are set, and while pending. On success call
   `select(newId)`. On error show `ApiRequestError.message` with `role="alert"` and keep the
   input. "Cancel" and Escape call `closeReport()`. Title is trimmed; an empty description is
   not sent.
4. **Entry point** — `IncidentFeed.tsx`: a full-width "Report incident" button above the filter
   tabs, calling `startReport()`; `aria-pressed` reflects `reporting`.
5. **Panel slot** — `App.tsx`: the workspace has a panel when `reporting || selectedId`;
   render `<ReportIncidentForm />` when reporting, else the detail.
6. **Styles** — `app.css`: `.feed-actions`, `.field`, `.field-label`, `.field input/select`,
   `.segmented` radio group with severity colour, reusing existing tokens; same small-screen
   sheet behaviour as `.detail`.
7. **Ignore run folders** — `.gitignore`: add `.steel/`.

## Tests

| Acceptance criterion | Test | File |
| -------------------- | ---- | ---- |
| 1 — action always visible | "opens the report form from the feed" | `IncidentFeed.test.tsx` |
| 2 — fields and limits | "keeps the submit button disabled until type, zone and title are set"; asserts `maxLength` on title/description | `ReportIncidentForm.test.tsx` |
| 3 — creates and selects | "posts the report and selects the new incident" (mocked `fetch`, asserts body and store) | `ReportIncidentForm.test.tsx` |
| 4 — errors keep input | "shows the server's message and keeps the input" (mocked 404) | `ReportIncidentForm.test.tsx` |
| 5 — live to other consoles | Existing API e2e "runs the full lifecycle and broadcasts every change" already asserts `incident.created` on report | `apps/api/test/incidents.e2e-spec.ts` (unchanged) |
| 6 — cancel / Escape | "closes on Cancel and on Escape" | `ReportIncidentForm.test.tsx` |

## Verification commands

From `package.json` scripts and `.github/workflows/ci.yml`:

- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- Manual: run the stack, report an incident from one console, confirm it appears in a second.

## Risks and rollback

- No API, contract or schema change; rollback is reverting the console commit.
- The reporting console gets the incident twice (HTTP response and event). `upsertIncident`
  dedupes by id; the "fresh" highlight from the event is cleared by `select`.
