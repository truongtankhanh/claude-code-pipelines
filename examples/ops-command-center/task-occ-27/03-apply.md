# Task · apply

- Run: task-occ-27
- Stage: 03 of 04 — apply
- Status: complete
- Inputs: 02-plan.md
- Next: /steel:task-verify .steel/runs/task-occ-27

## Summary

Operators can now report an incident from the console: a "Report incident" button above the
feed opens a form in the right-hand panel; submitting creates the incident through the existing
API, writes it into the cache and opens its detail. Working tree was clean before this stage
(only the untracked `.steel/` run folder).

## Steps

| # | Step | Status | Files |
| - | ---- | ------ | ----- |
| 1 | UI state: `reporting`, `startReport`, `closeReport`; `select` closes the form | done | `store.ts` |
| 2 | `useReportIncident` mutation, cache write + idempotent list upsert | done | `api/queries.ts` |
| 3 | Report form with API-matching limits, error display, Cancel/Escape | done | `components/ReportIncidentForm.tsx`, `components/ReportIncidentForm.test.tsx` |
| 4 | "Report incident" action in the feed | done | `components/IncidentFeed.tsx`, `components/IncidentFeed.test.tsx` |
| 5 | Panel slot renders the form or the detail | done | `App.tsx` |
| 6 | Form field, segmented severity and feed action styles | done | `styles/app.css` |
| 7 | Ignore `.steel/` run folders | done | `.gitignore` |

## Changed files

```
 M .gitignore
 M apps/console/src/App.tsx
 M apps/console/src/api/queries.ts
 M apps/console/src/components/IncidentFeed.test.tsx
 M apps/console/src/components/IncidentFeed.tsx
 M apps/console/src/store.ts
 M apps/console/src/styles/app.css
?? apps/console/src/components/ReportIncidentForm.test.tsx
?? apps/console/src/components/ReportIncidentForm.tsx
```

All nine files are in the plan's scope. No dependencies added.

## Deviations from the plan

- none

## Notes for the reviewer

- The severity control is a radio group styled as segments (`.segmented`), so it stays keyboard
  operable with arrow keys and announces as one group.
- The submit button reads "Reporting…" while the request is in flight, then the panel switches
  to the new incident's detail.
- `useReportIncident` writes the response into the list cache even though the live
  `incident.created` event will arrive too; both go through `upsertIncident`, which dedupes by id.
