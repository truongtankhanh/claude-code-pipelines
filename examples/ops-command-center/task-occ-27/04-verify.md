# Task · verify

- Run: task-occ-27
- Stage: 04 of 04 — verify
- Status: needs-input
- Inputs: 01-analyze.md, 02-plan.md, 03-apply.md, working tree
- Next: none — run finished (one minor finding below for the author to accept or fix)

## Result

Ready for a human to commit and open a pull request. All repository checks pass, every
acceptance criterion has evidence, and the change stayed inside the planned scope. One minor
behavioural question is listed under _Review findings_; it does not block the change.

## Checks

| Command | Exit | Evidence |
| ------- | ---- | -------- |
| `pnpm format:check` | 0 | `All matched files use Prettier code style!` |
| `pnpm lint` | 0 | `Tasks: 6 successful, 6 total` |
| `pnpm typecheck` | 0 | `Tasks: 6 successful, 6 total` |
| `pnpm test` | 0 | console `Tests 19 passed (19)` (was 14); camera-adapter `5 passed`; api `17 passed` |
| `pnpm build` | 0 | `Tasks: 4 successful, 4 total` |
| Manual, two consoles | — | API + console running locally, two separate browser contexts (A and B). A reported "Visitor collapsed at library entrance" (Medical, High, Library). A switched to the detail of `INC-000006`; B showed the new row without reloading. |

## Acceptance criteria

| # | Criterion | Evidence | Result |
| - | --------- | -------- | ------ |
| 1 | Report action always visible in the feed | `IncidentFeed.test.tsx` › "opens the report form from the feed and clears the selection"; visible in manual run | passed |
| 2 | Form fields and API limits | `ReportIncidentForm.test.tsx` › "keeps the submit button disabled until type, zone and title are set" (asserts `maxLength` 160 / 2000) | passed |
| 3 | Creates via `POST /api/incidents`, closes, selects new incident | `ReportIncidentForm.test.tsx` › "posts the report and selects the new incident" (asserts URL, trimmed body, cache, store); manual run | passed |
| 4 | Errors shown, input kept | `ReportIncidentForm.test.tsx` › "shows the server's message and keeps the input" | passed |
| 5 | Other consoles receive it live | Manual run (console B); API e2e "runs the full lifecycle and broadcasts every change" (unchanged, passing in CI) | passed |
| 6 | Cancel and Escape close the form | `ReportIncidentForm.test.tsx` › "closes on Cancel and on Escape" | passed |

## Scope

All changed files are in the plan's scope:
`.gitignore`, `App.tsx`, `api/queries.ts`, `components/IncidentFeed.tsx`,
`components/IncidentFeed.test.tsx`, `components/ReportIncidentForm.tsx`,
`components/ReportIncidentForm.test.tsx`, `store.ts`, `styles/app.css`.
No out-of-scope changes.

## Review findings

| Severity | File | Finding |
| -------- | ---- | ------- |
| minor | `apps/console/src/components/ReportIncidentForm.tsx:29` | Escape closes the form even while the request is in flight. The request still completes and `onSuccess` (`:47`) then opens the new incident, which is reasonable — but an operator who pressed Escape to abandon the report might be surprised. `[NEEDS INPUT]` keep as is, or ignore Escape while pending? Recommendation: keep; the incident was reported, showing it is honest. |
| nit | `apps/console/src/components/ReportIncidentForm.tsx:55` | Inline `style={{ margin: 0 }}` on the heading; every other override lives in `app.css`. |

## Not verified

- Small-screen layout of the form was not checked in a browser; it reuses the `.detail` panel's
  sheet behaviour, which was checked when the console was built.
- Screen-reader announcement of the segmented severity group was reviewed in the markup
  (`fieldset` + `legend`, native radios), not with an actual screen reader.

## Suggested commit message

```
feat(console): report an incident from the console

OCC-27. A "Report incident" action above the feed opens a form in the
right-hand panel (type, severity, zone, title, details) with the API's
limits. On success the incident is written to the cache and selected;
errors keep the operator's input. Other consoles receive it live through
the existing incident.created event.
```
