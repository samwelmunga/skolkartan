# Execution Plan — E00_S02_T04: Toolchain interop proof and base-command sweep

- **Task ID**: E00_S02_T04
- **Story**: E00_S02 — Linting, formatting and the test runner
- **Epic**: E00 — Project Foundation
- **Date**: 2026-08-16
- **Author**: developer agent

## Objective

Verify the properties that only exist once Prettier (T01), ESLint (T02) and Vitest (T03) are all
present, correct whatever the isolated tasks could not have caught, and close the story against
`E00_S03`, which registers `lint`, `typecheck`, `test` and `build` as CI checks **by npm script
name**.

This task creates no new tooling. It installs nothing, adds no script, and writes no `docs/` page —
`E00_S05` owns the `docs/` layout. Its product is evidence: real command output and real exit codes
recorded in `project/documentation/summaries/E00_S02_T04-summary.md`, plus any correction to
`.prettierrc.json`, `.prettierignore`, `eslint.config.mjs`, `vitest.config.ts` or `package.json`
that the evidence forces.

## Current state

HEAD is `1f6ae8b`. The working tree carries exactly one modification, made by the orchestrator
rather than by this task: `project/board/tasks/E00_S02_T04_...md` flipped to `status: Running` and
gained a `date_started`. This matters for the interop criterion below — see R1.

Read before planning:

- `package.json` — ten scripts: `dev`, `build`, `start`, `typecheck` (S01) plus `format`,
  `format:check`, `lint`, `lint:fix`, `test`, `test:watch` (S02). `test` is `vitest run`,
  `test:watch` is `vitest`. `lint` is `eslint . --max-warnings=0`.
- `eslint.config.mjs` — flat array, `prettier` is the last element, ignores are
  `node_modules/`, `.next/`, `out/`, `next-env.d.ts`, `project/`, each with an inline reason.
  Header comment already carries the Prettier-owns-formatting decision with its reason.
- `vitest.config.ts` — `environment: 'node'`, `include: ['src/**/*.test.ts']`, `globals: false`,
  alias `@` → `./src`. The no-coverage-threshold decision is present as a trailing comment inside
  the `test` block, with its reason.
- `.prettierignore` — `node_modules/`, `.next/`, `out/`, `package-lock.json`, `project/`,
  `next-env.d.ts`, `.claude/`, `.agents/`. Each carries a stated reason. Neither `src/` nor
  `scripts/` appears.
- `tsconfig.json` — `include` is `**/*.ts` / `**/*.tsx`, `exclude` is `node_modules` only.
- `docs/decisions.md` exists but was **created by E00_S01** (`3c3df77`) and only appended to by
  S02 (`32f169c`). No `docs/` page is created by this story.
- Node must be 24.18.0 via `nvm`; the ambient shell Node is 20.10.0.

## Risks identified before running anything

### R1 — the "empty `git diff`" criterion versus a pre-existing board edit

`git diff` is not empty right now, because the orchestrator already modified the task file. A
literal reading of criterion 1 would fail before any command runs. `project/` is ignored by both
Prettier and ESLint, so neither tool can touch that file — the criterion's intent is that *the
tools introduce no diff*, not that the board is pristine.

**Method**: capture `git status --porcelain` and `git diff --stat` immediately before each
sequence and immediately after, and show them byte-identical; and additionally show
`git diff -- . ':(exclude)project/'` is genuinely empty. Both forms go in the rapport rather than
one being substituted for the other.

### R2 — `scripts/` may be unreachable for reasons that are not in an ignore list

Criterion 3 is about ignore lists, but reading the ignore lists is not sufficient proof. Type-aware
linting needs the file to be inside the TypeScript program: if `tsconfig.json`'s `include` had been
`src/**/*`, `scripts/ci/scratch.ts` would produce a *parser* error about a missing project entry
rather than the lint violation the criterion asks for, and `E00_S03`'s most important file would be
unlintable for a reason no ignore-list audit would reveal. `include` is `**/*.ts`, so the
expectation is that it works — but that is the thing to prove, not assume.

**Method**: write `scripts/ci/scratch.ts` with a violation that only a **type-aware** rule can see
(a floating promise), so a pass also proves type information reached the linter for a file outside
`src/`. Confirm `npm run lint` names the file and the rule. Then delete the file, then the `ci/`
and `scripts/` directories, then confirm `git status --porcelain` matches its pre-probe value.

### R3 — the probe leaves `scripts/` behind and collides with E00_S03

`scripts/` must not survive this task in any form. `E00_S03` creates `scripts/ci/checks.ts` there,
and an empty tracked directory or a stray file would both collide with it and break criterion 3's
own premise.

**Method**: `rm -rf scripts` (not just the file), and verify with `ls` and `git status --porcelain`
in the same recorded block. Git does not track empty directories, so the check that matters is the
filesystem one.

### R4 — the cold rebuild is the expensive step and can mask itself

`rm -rf node_modules .next && npm ci` discards `tsconfig.tsbuildinfo`-adjacent state as well. If any
of the five commands only passes because of leftover incremental state, this is the run that finds
it. It is also the run most likely to time out.

**Method**: run it with a generous timeout, and record each command's exit code separately via
`echo "exit=$?"` immediately after the command rather than inferring success from the absence of an
error message.

### R5 — correcting a config could weaken a gate

The task forbids papering over a conflict by weakening `--max-warnings=0` or adding a blanket
ignore. If a check fails, the fix goes into the config that is actually wrong, and the correction
gets described in the rapport so the story's history shows what T01/T02/T03 could not have caught.

## Steps

1. Record the pre-state: `git status --porcelain`, `git diff --stat`, `node -v`, `npm -v`.
2. **Interop, order A**: `npm run lint:fix` then `npm run format`, capturing both outputs. Compare
   `git status --porcelain` / `git diff --stat` with the pre-state; show
   `git diff -- . ':(exclude)project/'` empty.
3. **Interop, order B**: `npm run format` then `npm run lint:fix`. Same comparison.
4. **Structural confirmation**: show that `prettier` (the `eslint-config-prettier` import) is the
   last element of the exported array in `eslint.config.mjs`, and that nothing after it re-enables
   a stylistic rule.
5. **Warm sweep**: `lint`, `typecheck`, `test`, `build`, `format:check`, each run individually with
   its exit code captured.
6. **Ignore-list audit**: read both ignore lists, confirm no `src/` or `scripts/` entry and that
   every entry present carries a stated reason. Record the entries and their reasons in the
   rapport.
7. **`scripts/` reachability probe** (R2/R3): create, prove, delete, verify clean.
8. **Script-name contract**: enumerate `package.json` scripts, confirm the exact ten names, confirm
   `test` is single-run and terminates unaided, and confirm no script wraps another in a way that
   double-runs work. Record the exit code of each of the eight non-server scripts (`dev` and
   `start` are long-running servers and are excluded from the exit-code sweep by nature, not by
   omission — note that explicitly).
9. **Decision findability**: confirm the Prettier-owns-formatting decision *and its reason* in the
   `eslint.config.mjs` header, and the no-coverage-threshold decision *and its reason* in
   `vitest.config.ts`. Add the reason if either is a bare assertion.
10. **Domain-leakage sweep**: grep every file this story created or modified for kommun / skola /
    nyckeltal / källa / resursskola / Kolada / SCB / Skolverket and the rest of the domain
    vocabulary. Includes `docs/decisions.md`, which S02 modified even though the task's file list
    omits it. Confirm the `assertNever` test's union stays abstract (`'alpha' | 'beta'`).
11. **Scratch-file sweep**: `git log --stat` over `9879ed6` and `32f169c`, plus `git status`, to
    confirm no floating-promise scratch file, misformatted file or deliberately failing assertion
    from T01/T02/T03 survived.
12. **Cold sweep** (R4): `rm -rf node_modules .next && npm ci`, then all five commands again with
    exit codes.
13. Write `project/documentation/summaries/E00_S02_T04-summary.md` with the actual captured output.
14. Commit as `E00_S02_T04: ...`.

## Out of scope

- Any new dependency, script or config file.
- Any `docs/` page (`E00_S05` owns `docs/index.md` and the layout convention).
- Creating `scripts/` for anything other than the temporary probe (`E00_S03` owns that directory).
- Changing task, story or epic `status` fields — the tester agent owns status transitions.
- Calling `scripts/todo_manager.sh` or `scripts/board_resolver.sh`; neither exists in this
  repository.

## Definition of done for this plan

Every acceptance criterion in the task file is answered by a recorded command and its real exit
code in the summary, any correction made to a T01/T02/T03 config is described there, and
`git status` is clean of every probe artefact.
