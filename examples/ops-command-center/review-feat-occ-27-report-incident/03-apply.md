# Review · apply

- Run: review-feat-occ-27-report-incident
- Stage: 03 of 04 — apply
- Status: complete
- Inputs: 02-plan.md
- Next: /steel:review-verify .steel/runs/review-feat-occ-27-report-incident

## Batches

| Batch | Findings | Result | Files |
| ----- | -------- | ------ | ----- |
| B1 | R1 | applied — `aria-pressed` → `aria-expanded` + `aria-controls="report-incident-panel"`; the form's `<aside>` carries that id | `IncidentFeed.tsx:28-29`, `ReportIncidentForm.tsx:52` |
| B2 | R3 | applied — inline style removed; `.report-form .detail-title { margin: 0 }` added beside the other `.report-form` rules | `ReportIncidentForm.tsx:55`, `app.css:629-632` |

Skipped by decision: R2, R4 (see plan).

## Deferred

- none — every fix fit inside the branch's own lines.
