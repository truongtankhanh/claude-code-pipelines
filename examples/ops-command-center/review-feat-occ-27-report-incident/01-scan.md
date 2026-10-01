# Review · scan

- Run: review-feat-occ-27-report-incident
- Stage: 01 of 04 — scan
- Status: complete
- Inputs: diff `4729042` (merge-base with `origin/main`)..working tree on `feat/occ-27-report-incident`; no `CLAUDE.md`; `eslint.config.mjs`, `apps/console/eslint.config.mjs`, `.prettierrc`
- Next: /steel:review-plan .steel/runs/review-feat-occ-27-report-incident

## Diff

| File | + | − |
| ---- | - | - |
| `.gitignore` | 3 | 0 |
| `apps/console/src/App.tsx` | 8 | 2 |
| `apps/console/src/api/queries.ts` | 16 | 0 |
| `apps/console/src/components/IncidentFeed.test.tsx` | 13 | 1 |
| `apps/console/src/components/IncidentFeed.tsx` | 11 | 1 |
| `apps/console/src/components/ReportIncidentForm.test.tsx` | 123 | 0 |
| `apps/console/src/components/ReportIncidentForm.tsx` | 148 | 0 |
| `apps/console/src/store.ts` | 9 | 2 |
| `apps/console/src/styles/app.css` | 80 | 0 |

No generated files in the diff.

### Line map

| File | Added / modified lines |
| ---- | ---------------------- |
| `.gitignore` | 8–10 |
| `apps/console/src/App.tsx` | 6, 13, 18, 24–28 |
| `apps/console/src/api/queries.ts` | 5, 72–86 |
| `apps/console/src/components/IncidentFeed.test.tsx` | 48–50, 80–89 |
| `apps/console/src/components/IncidentFeed.tsx` | 16, 24–33 |
| `apps/console/src/components/ReportIncidentForm.test.tsx` | 1–123 (new file) |
| `apps/console/src/components/ReportIncidentForm.tsx` | 1–148 (new file) |
| `apps/console/src/store.ts` | 12–13, 16–17, 29, 33, 36, 38–39 |
| `apps/console/src/styles/app.css` | 201–205, 623–697 |

## Findings

| ID | Severity | Location | Finding | Fixable here |
| -- | -------- | -------- | ------- | ------------ |
| R1 | major | `apps/console/src/components/IncidentFeed.tsx:28` | `aria-pressed` makes the action a toggle button, but clicking it again does not close the form — assistive technology announces a state the control does not have. It opens a panel, so `aria-expanded` with `aria-controls` pointing at the form is the accurate pattern. | yes |
| R2 | minor | `apps/console/src/components/ReportIncidentForm.tsx:29` | Escape closes the form while a report is in flight; the incident is still created and then opened. Raised in `task-occ-27/04-verify.md`. | yes |
| R3 | nit | `apps/console/src/components/ReportIncidentForm.tsx:55` | Inline `style={{ margin: 0 }}` on the heading; every other style override in the console lives in `app.css`. | yes |
| R4 | nit | `apps/console/src/components/ReportIncidentForm.test.tsx:95` | Assertion compares the whole cached list with `[created]`; fine today, but couples the test to the cache holding nothing else. Acceptable for a focused test. | yes |

## Out of scope

- [OUT OF SCOPE] `apps/console/src/components/IncidentDetail.tsx:23` — panel-level Escape
  listener predates this branch; a shared hook would remove the duplication now that two panels
  use the same pattern. Candidate follow-up.
- [OUT OF SCOPE] `apps/console/src/components/IncidentFeed.tsx:38` — filter tabs use
  `role="tab"` without an associated `tabpanel`; pre-existing.

## Looks good

- Request type comes straight from `@occ/contracts`; limits mirror the API DTO.
- Cache update is idempotent with the live event, and the comment says why.
- Tests cover success, server error and both close paths, and assert on behaviour
  (request body, store, rendered alert) rather than implementation.
- Severity uses native radios in a `fieldset` with a `legend` — keyboard and screen-reader
  friendly without custom ARIA.
