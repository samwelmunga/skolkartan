# Execution Summary — E00_S02_T04: Toolchain interop proof and base-command sweep

- **Task ID**: E00_S02_T04
- **Story**: E00_S02 — Linting, formatting and the test runner
- **Epic**: E00 — Project Foundation
- **Date**: 2026-08-16
- **Author**: developer agent
- **Base commit**: `1f6ae8b`
- **Environment**: Node `v24.18.0` (via `nvm use`, pinned by `.nvmrc`), npm `11.16.0`

This document is the rapport the task's acceptance criteria refer to. Every exit code below was
captured with `echo "exit=$?"` immediately after the command, not inferred from the absence of an
error message.

## Outcome in one line

All fourteen acceptance criteria pass. **One correction was required**: `eslint.config.mjs` and
`.prettierignore` disagreed about `.claude/` and `.agents/`, so ESLint was linting two
harness-owned JavaScript files that Prettier deliberately ignores. That is described in full in
"Correction made" below.

## 1. Prettier and ESLint do not fight

### A note on what "empty `git diff`" means here

`git diff` was not empty when this task started: the orchestrator had already flipped the task
file to `status: Running`, and `project/logs/events.json` gained this session's entries. Both live
under `project/`, which **both** tools ignore, so neither can touch them. The criterion's intent is
that *the tools introduce no diff*. Both readings are therefore recorded: the full
`git status --porcelain` before and after (byte-identical), and
`git diff -- . ':(exclude)project/'` (genuinely empty).

### Pre-state

```
$ git status --porcelain
 M project/board/tasks/E00_S02_T04_toolchain-interop-and-base-command-sweep.md
 M project/logs/events.json
?? project/documentation/plans/E00_S02_T04-plan.md

$ git diff --stat
 .../E00_S02_T04_toolchain-interop-and-base-command-sweep.md |  4 ++--
 project/logs/events.json                                    | 13 +++++++++++++
 2 files changed, 15 insertions(+), 2 deletions(-)
```

### Order A — `lint:fix` then `format`

```
$ npm run lint:fix
> eslint . --fix
lint:fix exit=0

$ npm run format
> prettier --write .
.prettierrc.json 11ms (unchanged)
docs/decisions.md 33ms (unchanged)
eslint.config.mjs 8ms (unchanged)
next.config.ts 14ms (unchanged)
package.json 1ms (unchanged)
src/app/layout.tsx 5ms (unchanged)
src/app/page.tsx 2ms (unchanged)
src/app/site-metadata.ts 1ms (unchanged)
src/lib/assertNever.test.ts 6ms (unchanged)
src/lib/assertNever.ts 2ms (unchanged)
tsconfig.json 1ms (unchanged)
vitest.config.ts 2ms (unchanged)
format exit=0
```

Every one of the twelve files Prettier touched came back `(unchanged)` — ESLint's `--fix` pass left
nothing for Prettier to rewrite. Post-state:

```
$ git status --porcelain          # byte-identical to pre-state
 M project/board/tasks/E00_S02_T04_toolchain-interop-and-base-command-sweep.md
 M project/logs/events.json
?? project/documentation/plans/E00_S02_T04-plan.md

$ git diff -- . ':(exclude)project/'
                                  # (no output)
$ git diff --name-only -- . ':(exclude)project/' | wc -l
       0
```

**PASS.**

### Order B — `format` then `lint:fix`

```
$ npm run format
> prettier --write .
(all twelve files: unchanged)
format exit=0

$ npm run lint:fix
> eslint . --fix
lint:fix exit=0

$ git status --porcelain          # byte-identical to pre-state
$ git diff -- . ':(exclude)project/'
                                  # (no output)
$ git diff --name-only -- . ':(exclude)project/' | wc -l
       0
```

**PASS.** Both orders were re-run after the correction in section 7 and were still clean.

### `eslint-config-prettier` is the last element

Read from the file:

```js
  ...next,

  prettier,
];

export default config;
```

Proven programmatically rather than by eye — identity comparison against the package's own default
export:

```
exported array length: 11
last element === eslint-config-prettier default export: true
last element rule count: 358
rules the last element leaves ON: 0
```

And proven against the *resolved* config for a real file, which is the only form that shows nothing
later re-enables a stylistic rule:

```
$ npx eslint --print-config src/lib/assertNever.test.ts
print-config exit=0
stylistic rules eslint-config-prettier disables that are still ON
in the resolved config for src/lib/assertNever.test.ts: 0
(none)
```

**PASS.**

## 2. All five base commands on a clean tree

### Warm run

| Command | Exit code |
| --- | --- |
| `npm run lint` | **0** |
| `npm run typecheck` | **0** |
| `npm run test` | **0** — `Test Files 1 passed (1)`, `Tests 4 passed (4)` |
| `npm run build` | **0** — `✓ Compiled successfully`, routes `/` and `/_not-found` prerendered |
| `npm run format:check` | **0** — `All matched files use Prettier code style!` |

### Cold run

`rm -rf node_modules .next tsconfig.tsbuildinfo && npm ci`. `tsconfig.tsbuildinfo` was removed on
top of what the task asked for: it is TypeScript's incremental cache, and leaving it behind would
have let `typecheck` pass on stale state — exactly the failure mode this section exists to exclude.

The cold sweep was run **twice**: once before the correction in section 7, and again afterwards so
the recorded evidence matches the tree actually being committed. Both were identical.

```
$ npm ci
@@@ npm ci exit = 0 @@@

COLD SWEEP #2 (post-correction) — node v24.18.0, npm 11.16.0
@@@ COLD exit code for 'lint' = 0 @@@
@@@ COLD exit code for 'typecheck' = 0 @@@
@@@ COLD exit code for 'test' = 0 @@@
@@@ COLD exit code for 'build' = 0 @@@
@@@ COLD exit code for 'format:check' = 0 @@@

$ git status --porcelain          # no stray artefact produced by the cold sweep
 M eslint.config.mjs
 M project/board/tasks/E00_S02_T04_toolchain-interop-and-base-command-sweep.md
 M project/logs/events.json
?? project/documentation/plans/E00_S02_T04-plan.md
```

**PASS.** `npm ci` emits `npm warn allow-scripts` notices for six packages with install scripts.
These are warnings on stderr, not failures; `npm ci` exits 0.

### Ordering note worth carrying into E00_S03

In both sweeps `format:check` ran **after** `build`. That matters: `next build` regenerates
`next-env.d.ts` with double-quoted imports, which `singleQuote: true` would otherwise flag.
`.prettierignore` excludes that file for exactly this reason, and the green `format:check` after a
build is the evidence that the exclusion works. A CI pipeline may order `build` and `format:check`
either way.

## 3. Ignore-list audit

Neither list excludes `src/` or `scripts/`:

```
$ grep -nE '(^|[^a-zA-Z.])(src|scripts)/' .prettierignore eslint.config.mjs
NO MATCH: neither file excludes src/ or scripts/
```

Every excluded entry carries a stated reason.

**`.prettierignore`** — `node_modules/`, `.next/`, `out/` ("Build output and installed dependencies
— not authored files"); `package-lock.json` ("Generated by npm; reformatting it produces enormous,
meaningless diffs"); `project/` ("The scrum board is hand-maintained Markdown with deliberate line
breaks, not source code"); `next-env.d.ts` ("Regenerated by `next build` on every run … Formatting
it would leave `format:check` red after every build"); `.claude/`, `.agents/` ("Agent harness …
authored and rewritten outside this repository's source conventions").

**`eslint.config.mjs`** — `node_modules/` ("third-party code; not ours to lint"); `.next/`
("Next.js build output, regenerated on every build"); `out/` ("Next.js static export output"),
`next-env.d.ts` ("generated by Next, not authored here"); `project/` ("the scrum board is Markdown
and JSON, not source"); `.claude/`, `.agents/` (added by this task — see section 7).

### `src/` is reached — proven, not assumed

```
$ npx eslint . --format json
total files linted: 8
  eslint.config.mjs
  next.config.ts
  src/app/layout.tsx
  src/app/page.tsx
  src/app/site-metadata.ts
  src/lib/assertNever.test.ts
  src/lib/assertNever.ts
  vitest.config.ts
src/ files linted: 5
```

### `scripts/` is reached — proven with a real violation

`scripts/` did not exist. A temporary `scripts/ci/scratch.ts` was created carrying a
**type-aware-only** violation (a floating promise) *and* a Prettier violation, so one file proves
all three tools reach the directory `E00_S03` will build in:

```
$ npm run lint
/Users/samwelmunga/Desktop/Projects/skolkartan/scripts/ci/scratch.ts
  4:8  error  Async function 'probe' has no 'await' expression   @typescript-eslint/require-await
  8:1  error  Promises must be awaited, …                        @typescript-eslint/no-floating-promises
✖ 2 problems (2 errors, 0 warnings)
@@@ lint exit = 1 @@@

$ npm run format:check
[warn] scripts/ci/scratch.ts
[warn] Code style issues found in the above file.
@@@ format:check exit = 1 @@@

$ npx tsc --noEmit --listFiles | grep -c scripts/ci/scratch.ts
files matching scripts/ci/scratch.ts in tsc --listFiles: 1
```

The floating-promise rule is the load-bearing part. A type-aware rule can only fire if the file is
inside the TypeScript program, so this simultaneously proves `tsconfig.json`'s `include`
(`**/*.ts`) covers `scripts/`. Had `include` been `src/**/*`, ESLint would have produced a *parser*
error about a missing project entry instead of a lint error, and `E00_S03`'s most important file
would have been effectively unlintable for a reason no ignore-list audit would have revealed.

Removal, and the proof it left nothing behind:

```
$ rm -f scripts/ci/scratch.ts && rm -rf scripts
$ ls -d scripts
ls: scripts: No such file or directory
$ git status --porcelain          # identical to the pre-probe state
$ find . -name "scratch*" -not -path "./node_modules/*" -not -path "./.git/*"
no scratch file anywhere in the tree
```

The probe was re-run after the correction in section 7 to confirm the new `.claude/` and `.agents/`
entries did not accidentally widen into `scripts/`; it still reported the violation and exited 1.

**PASS.**

## 4. The script-name contract with E00_S03

`package.json` contains exactly ten scripts, no more:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "typecheck": "tsc --noEmit",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "lint": "eslint . --max-warnings=0",
  "lint:fix": "eslint . --fix",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

```
unexpected extra scripts: (none)
```

**Wrapper audit** — every script was tested against a pattern matching `npm`, `yarn`, `pnpm`,
`npm-run-all`, `run-s` and `run-p`:

```
STANDALONE dev: next dev
STANDALONE build: next build
STANDALONE start: next start
STANDALONE typecheck: tsc --noEmit
STANDALONE format: prettier --write .
STANDALONE format:check: prettier --check .
STANDALONE lint: eslint . --max-warnings=0
STANDALONE lint:fix: eslint . --fix
STANDALONE test: vitest run
STANDALONE test:watch: vitest
```

Every script invokes exactly one binary directly. No script wraps another, so nothing double-runs.
There are also no npm lifecycle hooks (`pretest`, `prebuild`, `posttest`…) — the ten names above are
the complete list, so npm cannot chain one into another implicitly.

`test` is `vitest run`, the single-run form, and terminated unaided in every sweep above.
`test:watch` is bare `vitest`.

### Exit codes on success and on failure

`E00_S03`'s registry depends on both directions, so both were measured first-hand.

| Script | Exit on success | Exit on failure | How failure was induced |
| --- | --- | --- | --- |
| `lint` | 0 | **1** | `scripts/ci/scratch.ts` floating promise |
| `lint:fix` | 0 | n/a | fix-mode; not a registry check |
| `format` | 0 | n/a | write-mode; never registered in CI |
| `format:check` | 0 | **1** | misformatted `scripts/ci/scratch.ts` |
| `typecheck` | 0 | **2** | `const notANumber: number = 'this is a string'` |
| `build` | 0 | **1** | same type error |
| `test` | 0 | **1** | `expect(1).toBe(2)` |
| `test:watch` | does not exit by design | n/a | watch mode |

Captured output for the failure probes:

```
$ npm run typecheck
src/lib/__t04probe.ts(2,14): error TS2322: Type 'string' is not assignable to type 'number'.
@@@ typecheck exit = 2 @@@

$ npm run build
  Running TypeScript ...
src/lib/__t04probe.ts(2,14): error TS2322: Type 'string' is not assignable to type 'number'.
Failed to type check.
@@@ build exit = 1 @@@

$ npm run test
 ❯ src/lib/__t04probe.test.ts (1 test | 1 failed) 4ms
   × is a deliberately failing assertion, removed in the same task 3ms
 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 4 passed (5)
@@@ test exit = 1 @@@
```

Both probe files were deleted immediately; `git status` and `ls src/lib` afterwards showed only
`assertNever.ts` and `assertNever.test.ts`.

> **Carry this into E00_S03.** `typecheck` exits **2**, not 1 — that is `tsc`'s convention. The
> check runner must treat *any* non-zero code as failure and must not compare against `1`.

**`test:watch`.** Started, stayed alive through a file change, and only ended on `SIGTERM` — which
is the correct behaviour and confirms it is the watch form rather than a second single-run script.
Its re-run-on-change output could **not** be observed here: captured through a redirected,
non-TTY stream Vitest 4 printed only the initial `Test Files 1 passed (1)` block, across two
attempts with 8 s and 20 s post-edit windows. That is a limitation of observing a TTY watcher from
a script, not a defect — and re-run-on-change is `E00_S02_T03`'s acceptance criterion, already
Passed, not one of this task's. `test:watch` is not registered as a CI check.

**PASS.**

## 5. The recorded decisions are findable

Both were already present with their reasons. **No change was needed.**

**Prettier-owns-formatting** — `eslint.config.mjs`, lines 3–8, first thing in the file:

> `PRETTIER OWNS FORMATTING; ESLINT NEVER REPORTS A FORMATTING RULE.` … "The two tools overlap by
> default, and the overlap produces contradictory autofixes: one tool's fix is the other tool's
> violation, so the developer ends up running them alternately forever. `eslint-config-prettier` is
> therefore the LAST element of the exported array…"

Decision, reason, and the mechanism that implements it. Not a bare assertion.

**No coverage threshold** — `vitest.config.ts`, inside the `test` block:

> "No coverage threshold. There is nothing meaningful to cover in an empty skeleton, and a threshold
> on a near-empty codebase is a number that gets lowered rather than met. Coverage stays available
> on demand via `vitest run --coverage`, but is not configured and not gated."

Decision, reason, and the escape hatch. Not a bare assertion.

**No `docs/` page was created by this story.** `docs/` contains one file:

```
$ git ls-files docs
docs/decisions.md  <- first added in 3c3df77 E00_S01: install Next toolchain, harden gitignore, record decisions
```

`docs/decisions.md` was created by **E00_S01**. S02 appended two entries to it (`32f169c`) but
created no page, and this task created none. `E00_S05` remains free to own the `docs/` layout and
its index table.

**PASS.**

## 6. Domain-leakage sweep

Swept for `kommun`, `skola`, `skolenhet`, `skolverk`, `skolinspek`, `nyckeltal`, `resursskol`,
`samverkan`, `huvudman`, `lärartäthet`, `behörighet`, `kolada`, `dataportal`, `källregister`,
`källa`, `elev`, `pupil`, `municipal`, `school` — case-insensitive.

Across all eight files this story created or modified — `.prettierrc.json`, `.prettierignore`,
`eslint.config.mjs`, `vitest.config.ts`, `src/lib/assertNever.ts`, `src/lib/assertNever.test.ts`,
`package.json`, `docs/decisions.md`:

```
CLEAN: zero domain terms across all eight files
```

`docs/decisions.md` is not in the task's file list but S02 modified it, so it was swept anyway.

Whole source tree, excluding `node_modules`, `.git`, `.next`, `project/`, `.claude/`, `.agents/`:

```
CLEAN: no domain term anywhere in the source tree
```

The example test's fixtures are abstract, as required:

```ts
type Flavour = 'alpha' | 'beta';
```

with `'gamma'` as the deliberately-unhandled value. No domain vocabulary.

`package-lock.json` declares no domain-named package. The only occurrence of the string
`skolkartan` outside `project/` is `package.json`'s `"name"` field, which is the repository's own
name, set by `E00_S01`.

### No surviving scratch file

Both story commits reviewed with `git log --stat`:

- `9879ed6` (T01) — `.prettierignore`, `.prettierrc.json`, `package.json`, `package-lock.json`,
  its board task file, its plan and its summary. No scratch file.
- `32f169c` (T02+T03) — `docs/decisions.md`, `eslint.config.mjs`, `vitest.config.ts`,
  `src/lib/assertNever.ts`, `src/lib/assertNever.test.ts`, `package.json`, `package-lock.json`, two
  board task files. No scratch file, no floating-promise probe, no misformatted file, no failing
  assertion.

```
$ git ls-files | grep -iE 'scratch|tmp|temp|probe|broken|fail|misformat|\.bak$|\.orig$'
CLEAN: no scratch/temp artefact tracked
```

Working tree at the end of this task carries only this task's own deliberate changes.

**PASS.**

## 7. Correction made

**One correction was required, in `eslint.config.mjs` — a file produced by `E00_S02_T02`.**

### What was wrong

`.prettierignore` excludes `.claude/` and `.agents/`, with a stated reason: they are the agent
harness, "authored and rewritten outside this repository's source conventions". `eslint.config.mjs`
had no corresponding entry. The two ignore lists disagreed.

The consequence was not theoretical. Enumerating what ESLint actually inspected showed it reaching
into both harness trees:

```
$ npx eslint . --format json      # BEFORE
total files linted: 10
  .agents/skills/self-sync/scripts/run.js
  .claude/skills/self-sync/scripts/run.js
  eslint.config.mjs
  next.config.ts
  src/app/layout.tsx
  src/app/page.tsx
  src/app/site-metadata.ts
  src/lib/assertNever.test.ts
  src/lib/assertNever.ts
  vitest.config.ts
```

Both files are tracked, both were added by `285b47a init:` — neither is authored in this repository.
They happen to lint clean today, which is exactly why `E00_S02_T02` could not have caught this in
isolation: the check was green, so nothing pointed at it.

### Why it matters

`npm run lint` runs with `--max-warnings=0`, and from `E00_S04` it is a merge gate. A harness
upgrade shipping a `run.js` with any lint finding would turn the gate red for code that no author
in this repository owns or may edit — an unfixable red build arriving through a dependency bump.
The leading dot in the directory names makes this easy to assume away; ESLint's flat config does
not skip dot-directories, and only enumerating the file list actually shows it.

### The fix

Seven lines added to the existing `ignores` array, with the reason stated inline in the style of
its neighbours:

```js
      // Agent harness. Both directories ship JavaScript (`skills/self-sync/scripts/run.js`), which
      // ESLint reaches by default even though the leading dot suggests otherwise. `.prettierignore`
      // already excludes them for the same reason: the harness authors and rewrites these files
      // outside this repository's source conventions, so a harness upgrade shipping a lint
      // violation would turn `npm run lint` — and, from E00_S04, the merge gate — red for code no
      // author here owns or may edit. The two ignore lists must agree; before E00_S02_T04 they did
      // not.
      '.claude/',
      '.agents/',
```

This is not the blanket ignore the task warns against. It does not weaken `--max-warnings=0`, it
touches no rule, and it narrows ESLint's scope only to what `.prettierignore` had already excluded
for a recorded reason. `src/` and `scripts/` are untouched.

### Verification after the fix

```
$ npx eslint . --format json      # AFTER
total files linted: 8
harness files linted: 0 (must be 0)
src/ files linted: 5 (must be 5)

scripts/ probe re-run:  lint exit = 1, reports no-floating-promises   ✓ still reachable
lint exit=0  typecheck exit=0  test exit=0  build exit=0  format:check exit=0
interop order A: unexpected changed files = 0
interop order B: unexpected changed files = 0
prettier --check eslint.config.mjs: All matched files use Prettier code style! exit=0
```

The full cold `npm ci` sweep was then re-run against the corrected tree (section 2, "COLD SWEEP #2")
so the recorded cold evidence describes the commit rather than its predecessor.

Nothing else needed correcting. `.prettierrc.json`, `.prettierignore`, `vitest.config.ts` and
`package.json` were all verified correct as delivered by T01/T02/T03.

## Observations — not defects, not fixed here

These are recorded for the tester and for later stories. None affects an exit code and none is
within this task's scope.

1. **Vite config-loader deprecation warning.** Every `vitest` run prints: *"Your Vite config uses
   features that are unsupported by `configLoader: 'native'` … ESM syntax in a file loaded as
   CommonJS (vitest.config.ts:1:1). Use a `.mjs` extension or set `"type": "module"`."* It is a
   forward-looking warning; `npm run test` exits 0. It was deliberately **not** fixed. Renaming to
   `vitest.config.mts` would move the file outside `tsconfig.json`'s `include` (`**/*.ts` does not
   match `.mts`) while typescript-eslint's type-aware layer still claims it, trading a warning for
   a hard parser error. Adding `"type": "module"` to `package.json` is a repo-wide change with
   knock-on effects for `next.config.ts`. The right time to fix it is when Vite actually flips the
   default.
2. **`src/lib/.gitkeep` is now vestigial.** It was added by `E00_S01` to keep an empty directory;
   `src/lib/` now holds `assertNever.ts` and `assertNever.test.ts`. It was left in place: it is an
   S01 artefact, not a scratch file from this story, and `prettier --check .` skips it (it errors
   only when named by an explicit glob, which nothing does). A candidate for `E00_S05`'s closing
   sweep.
3. **`E00_S02_T02` and `E00_S02_T03` have no plan or summary under
   `project/documentation/`.** Only `E00_S02_T01` does. Both tasks are marked `Passed` and their
   configs verify correct here, so this is a process gap in the record rather than a defect in the
   code.
4. **`vitest.config.ts` has `include: ['src/**/*.test.ts']`.** If `E00_S03` wants unit tests
   alongside `scripts/ci/checks.ts`, that glob will need widening. Flagged now so it is a decision
   rather than a surprise.

## Acceptance criteria

| # | Criterion | Result |
| --- | --- | --- |
| 1 | `lint:fix` → `format` gives an empty `git diff`; both outputs recorded | **PASS** |
| 2 | `format` → `lint:fix` also gives an empty `git diff` | **PASS** |
| 3 | `eslint-config-prettier` confirmed last in the flat-config array | **PASS** |
| 4 | `lint`, `typecheck`, `test`, `build`, `format:check` each exit 0, codes recorded | **PASS** |
| 5 | After `rm -rf node_modules .next && npm ci`, all five exit 0 again | **PASS** |
| 6 | Neither ignore list excludes `src/` or `scripts/`; every entry has a reason | **PASS** |
| 7 | `scripts/ci/scratch.ts` violation reported by lint, then removed; `git status` clean | **PASS** |
| 8 | `package.json` has exactly the ten required script names | **PASS** |
| 9 | `test` is single-run and terminates without manual interrupt | **PASS** |
| 10 | Prettier-owns-formatting decision + reason in `eslint.config.mjs` | **PASS** (already present) |
| 11 | No-coverage-threshold decision + reason in `vitest.config.ts` | **PASS** (already present) |
| 12 | No `docs/` page created by this story | **PASS** |
| 13 | No domain reference in any file this story created or modified | **PASS** |
| 14 | No temporary or scratch file from this story remains | **PASS** |

## Definition of Done

| Item | Result |
| --- | --- |
| All acceptance criteria met | **YES** — 14 / 14 |
| Four base commands green from a cold `npm ci`, evidence recorded not asserted | **YES** — section 2, exit codes captured per command, sweep re-run after the correction |
| `E00_S03` can register `lint`, `typecheck`, `test`, `build` by name — no renaming, no rewrapping, no shell quoting; `format:check` addable as a fifth unchanged | **YES** — all five are single-binary, standalone, colon-free-argument scripts invoked as `npm run <name>`; see the caveat that `typecheck` fails with exit **2** |
| Any correction to a T01/T02/T03 config described in the rapport | **YES** — section 7, `eslint.config.mjs` ignore-list inconsistency from T02 |
| `git status` clean of every deliberate-breakage artefact | **YES** — `scripts/` removed entirely, both failure probes removed, no scratch file anywhere |

## Files changed by this task

| Path | Change |
| --- | --- |
| `eslint.config.mjs` | `.claude/` and `.agents/` added to `ignores` with a stated reason (the one correction) |
| `project/documentation/plans/E00_S02_T04-plan.md` | new — execution plan |
| `project/documentation/summaries/E00_S02_T04-summary.md` | new — this rapport |
| `project/logs/events.json` | session-start and sender entries for this task |

No dependency was added, removed or upgraded. `package.json`, `package-lock.json`,
`.prettierrc.json`, `.prettierignore`, `vitest.config.ts`, `tsconfig.json` and everything under
`src/` are unchanged.

## For the tester

- Re-verification is a single sequence: `nvm use`, then `rm -rf node_modules .next
  tsconfig.tsbuildinfo && npm ci`, then the five commands. All five must exit 0.
- The load-bearing new assertion is `npx eslint . --format json` returning **8** files with **0**
  under `.claude/` or `.agents/` and **5** under `src/`.
- To re-prove `scripts/` reachability, recreate `scripts/ci/scratch.ts` with a floating promise,
  confirm `npm run lint` exits non-zero naming `@typescript-eslint/no-floating-promises`, then
  `rm -rf scripts`.
- `typecheck` exits **2** on failure, not 1. Any check-registry work must treat non-zero generally.
