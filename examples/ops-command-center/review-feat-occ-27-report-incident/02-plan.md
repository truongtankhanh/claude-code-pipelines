# Review · plan

- Run: review-feat-occ-27-report-incident
- Stage: 02 of 04 — plan
- Status: complete
- Inputs: 01-scan.md
- Next: /steel:review-apply .steel/runs/review-feat-occ-27-report-incident

## Decisions

| ID | Decision | Reason |
| -- | -------- | ------ |
| R1 | fix | Wrong ARIA state is a real accessibility defect, and the fix is local. |
| R2 | won't fix | The report has already been sent when Escape is pressed; opening the created incident is the honest outcome. Matches the recommendation in `task-occ-27/04-verify.md`. Revisit if operators find it surprising. |
| R3 | fix | Cheap, keeps styling in one place. |
| R4 | won't fix | The test renders with an empty cache on purpose; asserting the exact list is the clearest statement of the behaviour. |

## Batches

### B1 — Announce the report action accurately (R1)

- Lines: `apps/console/src/components/IncidentFeed.tsx:24-33`,
  `apps/console/src/components/ReportIncidentForm.tsx:52`
- Change: replace `aria-pressed={reporting}` with `aria-expanded={reporting}` and
  `aria-controls="report-incident-panel"`; give the form's `<aside>` that id.

### B2 — Move the heading override into the stylesheet (R3)

- Lines: `apps/console/src/components/ReportIncidentForm.tsx:53-57`,
  `apps/console/src/styles/app.css:623-697`
- Change: drop the inline style; add a `.report-form .detail-title { margin: 0; }` rule next to
  the other `.report-form` rules.

## Checks

- `pnpm --filter @occ/console lint`
- `pnpm --filter @occ/console typecheck`
- `pnpm --filter @occ/console test`
- then the full `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

## Follow-ups (not part of this review)

- Shared `useEscapeToClose` hook for both right-hand panels (`IncidentDetail.tsx:23`,
  `ReportIncidentForm.tsx:29`).
- Filter tabs: either add `tabpanel` semantics or switch to a radio/segmented control
  (`IncidentFeed.tsx:38`).
