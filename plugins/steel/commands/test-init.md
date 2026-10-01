---
description: Set up unit-test infrastructure in a TypeScript repo or monorepo — scan, plan, then build after approval.
argument-hint: [target path in a monorepo] [--yes to build without stopping after the plan]
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(ls:*)
---

# /steel:test-init

Load the `steel:pipeline-conventions` skill and follow it for this whole stage.

One command, three phases, with a checkpoint between planning and building — test
infrastructure touches package manifests, so a human approves the plan before anything changes.

**Input:** `$ARGUMENTS` — optional target path (one app or package in a monorepo) and the
optional `--yes` flag.
**Output:** `.steel/runs/test-init-<slug>/01-scan.md`, `02-plan.md`, `03-build.md`, where
`<slug>` is the target path in kebab-case or `repo`.

If `02-plan.md` already exists with status `complete` and the user has approved it, skip straight
to the build phase.

## Phase 1 — scan (reads only)

1. **Workspace.** Package manager (lockfile), workspace tool (pnpm/yarn/npm workspaces, Nx,
   Turborepo) and the members. Narrow to the target path if one was given.
2. **Classify each member**:
   - _renders UI_ — Angular, React (Vite, Next.js, CRA), React Native
   - _logic only_ — NestJS, Node services, libraries
   - _no tests needed_ — config-only packages, generated clients; say why
3. **Existing test tooling** per member: runner and version, config files, setup files, test
   scripts, number of existing tests, coverage config, and whether CI runs tests.
4. **Framework defaults**: what the framework's own CLI generates for the installed version
   (for example Jest for NestJS, Vitest for Vite). The repository's existing choice always wins
   over a default.

Write `01-scan.md` with a member table: path, kind, framework, current runner, tests found, gap.

## Phase 2 — plan (reads only)

For each member with a gap, plan the smallest setup that gives a working, conventional test
command:

- runner and the exact packages to add (with versions compatible with the installed framework),
- config file and setup file contents in outline,
- one **smoke test** per member that exercises real code (a service method, a component render),
  not `expect(true)`,
- `package.json` scripts named like the repository's existing scripts (`test`, `test:watch`,
  `test:cov`), and the root task wiring for monorepos (Turborepo/Nx pipeline entries),
- what CI should run — proposed only; CI files are edited only if the plan lists them.

Shared configuration goes in one place when the members share a runner; per-member configs only
where frameworks differ. Mark choices with real trade-offs as `[NEEDS INPUT]`.

Write `02-plan.md` with a _Scope_ table (every file to create or modify) and stop with
`Next: /steel:test-init <same args>` — unless `--yes` was passed and the plan has no
`[NEEDS INPUT]`.

## Phase 3 — build

1. Install the planned packages with the repository's package manager. Nothing unplanned.
2. Create and modify exactly the files in the plan's scope.
3. Run each member's new test command and the repository's typecheck. Fix failures inside
   scope; stop with `blocked` if a fix would need files outside it.
4. Write `03-build.md`: files changed, packages added, the command output proving each smoke
   test ran and passed, and anything _not verified_.

Never commit. Finish by giving the user the commands to run the tests themselves.
