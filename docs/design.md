# Design notes

Why these pipelines look the way they do. Each section is a decision, the alternative it beat,
and what it costs.

## Stages instead of one big prompt

**Decision.** Every job is split into stages — understand, plan, change, prove — each a
separate command that writes a Markdown artifact and stops.

**Instead of** a single "implement this ticket" prompt.

**Why.** A one-shot prompt mixes the cheap part of the work (deciding what to do) with the
expensive part (changing code), so the first chance to correct a misunderstanding is after the
diff exists. With stages, the plan is a page of Markdown that takes two minutes to review and
seconds to edit, and the apply stage follows it literally. Mistakes are caught when they cost
least.

**Cost.** More commands to run, and some repetition between artifacts. For a one-line fix this is
overhead; the pipelines are meant for tickets that deserve a plan.

## Artifacts on disk, not chat history

**Decision.** A stage reads only earlier artifacts and the repository — never the conversation.

**Why.** It makes runs resumable in a fresh session, reviewable by someone who was not there,
and editable: if the human rewrites a line of the plan, that edit is the new truth. It also
keeps the model honest — whatever it relied on has to be written down.

**Cost.** Artifacts must be complete enough to stand alone, which makes them longer than a chat
reply.

## The tool never commits

**Decision.** No stage commits, pushes, opens pull requests or changes git state. `allowed-tools`
never pre-approves those commands, and CI fails if one does.

**Why.** Committing is the moment a person takes responsibility for a change. Keeping it manual
keeps that moment deliberate, and it means a bad run can always be discarded with
`git checkout .`.

**Cost.** One more manual step per run. The verify stage softens it by writing the commit message.

## Markers with fixed spelling

**Decision.** `[NEEDS INPUT]`, `[OUT OF SCOPE]` and `[ASSUMPTION]`, written exactly like that.

**Why.** They are greppable across runs and repositories, the next stage can refuse to continue
while a `[NEEDS INPUT]` has no answer, and `[OUT OF SCOPE]` items turn into tickets instead of
drive-by edits. `[ASSUMPTION]` exists so that small, defensible defaults do not stop the run but
still get seen.

## The repository's rules win

**Decision.** `CLAUDE.md`, `.claude/rules/` and existing code patterns override the commands'
generic guidance, and the artifact names the rule it followed.

**Why.** A generic pipeline that "improves" a codebase's conventions creates review noise and
inconsistency. The pipelines bring process; the repository brings taste.

## Diff scoping for self-review

**Decision.** The review pipeline builds a line map of what the branch changed, and every
finding and every fix must fall inside it. The verify stage proves it line by line.

**Why.** A self-review that also "fixes" surrounding code turns a 40-line pull request into a
400-line one and hides the real change. Pre-existing problems are still reported — as
`[OUT OF SCOPE]` follow-ups.

**Cost.** Sometimes the right fix lives outside the diff (a caller that should change too). The
pipeline defers it rather than widening scope; a human decides.

## Docs that detect their own drift

**Decision.** Generated API docs embed a signature marker per endpoint
(`<!-- steel:endpoint GET /api/x | query: … | returns: … -->`). The next scan compares markers
with the code and classifies each endpoint as `new`, `changed`, `unchanged` or `removed`.

**Instead of** regenerating everything from scratch each time.

**Why.** Regeneration destroys the explanations people add by hand and hides what actually
changed. Reconciliation keeps prose, updates only what moved, marks callers of changed endpoints
`needs-rework`, and deprecates rather than deletes — deletion is a human call.

## Plain Markdown commands, checked in CI

**Decision.** The pipelines are ordinary Claude Code command files plus one skill, packaged as a
plugin, with a dependency-free script that checks their structure.

**Why.** Anyone can read and fork a Markdown file. The structure check (`scripts/check-pipelines.mjs`)
catches the failures that matter for a pipeline: a `Next:` pointing at a command that does not
exist, stage numbers that disagree with the pipeline's length, a command that forgets to load
the conventions, or `allowed-tools` that would let a stage change git state.
