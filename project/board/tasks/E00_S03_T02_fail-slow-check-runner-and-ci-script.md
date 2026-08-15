---
id: E00_S03_T02
title: Fail-slow check runner and the npm run ci entry point
status: Pending
story_id: E00_S03
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S03_T01
---

# Task: Fail-slow check runner and the npm run ci entry point

## Description

Write `scripts/ci/run-checks.ts`, the runner that executes the registry, and register it as
`npm run ci` — the single entry point that behaves identically on a laptop and in `E00_S04`'s
pipeline.

Assumes `E00_S03_T01` has landed: `scripts/ci/checks.ts` exports `Check` and `checks`,
`tsconfig.json` includes `scripts/**/*` and sets `allowImportingTsExtensions: true`.

**Scope boundary.** This task owns execution, output capture and the summary. It does **not** own
the pre-flight validation guard (duplicate ids, unknown commands) — `E00_S03_T03` adds that and
wires it in ahead of the first spawn. It does not write documentation (`E00_S03_T04`) and it does
not create `.github/workflows/` — that is `E00_S04`, and this task must not make the workflow's job
any harder than running one command.

### How the runner is executed — decide, verify, record

The intended form is `node scripts/ci/run-checks.ts`, relying on Node's built-in TypeScript type
stripping, which the `.nvmrc` pin of **24.18.0** guarantees is available. Verify this actually works
before building on it (`node --version` first, then run the file). If it does not, climb this ladder
and stop at the first rung that works:

1. `node scripts/ci/run-checks.ts` as-is, relying on Node's module-syntax detection to treat the
   file as ESM because it uses `import`.
2. Add `scripts/ci/package.json` containing exactly `{ "type": "module" }` to remove the ambiguity.
   Do **not** add `"type": "module"` to the root `package.json` — that changes how Next.js and every
   config file in the repository are loaded.
3. Add `tsx` as a devDependency with a caret range and make the script
   `tsx scripts/ci/run-checks.ts`.

**Record which rung was used and why in a comment block at the top of `run-checks.ts`**, together
with the constraints type stripping imposes if rungs 1 or 2 were used: no `enum`, no `namespace`, no
constructor parameter properties, and local imports must carry the real `.ts` extension. This is a
Definition-of-Done item on the story — a future reader must not have to reverse-engineer which path
was taken or why the import specifiers look unusual.

### `scripts/ci/run-checks.ts`

```ts
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checks } from './checks.ts';
```

The `.ts` extension in that specifier is required, not a typo — `E00_S03_T01` enabled
`allowImportingTsExtensions` for exactly this.

Resolve the repository root once, from the module's own location, and use it as the `cwd` for every
spawn so `npm run ci` behaves the same whichever directory it is invoked from:

```ts
const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
```

For each entry in `checks`, **in declared array order**:

- Record a start timestamp (`Date.now()`).
- `spawnSync('npm', ['run', check.command], { cwd: repoRoot, encoding: 'utf8' })` — output is
  captured, not inherited, because passing checks must stay silent.
- A check **passes** when `status === 0`. Any non-zero status, a signal, or a spawn `error` is a
  failure; treat a missing `status` as a failure rather than a pass.
- Store id, owner, pass/fail, elapsed milliseconds, and the captured `stdout` and `stderr`.

Never `throw` out of the loop and never `return` early. **Fail-slow is the point**: a pipeline that
reports only the first error costs a full push-and-wait cycle per error, and the developer fixes
three problems in three round trips instead of one.

### Output

Nothing is printed while a check runs except a single progress line naming the check that is
starting (so a long `build` does not look like a hang). Passing checks' captured output is
**discarded, never printed**.

After the loop, print the summary — one line per check, columns aligned, in declared order:

```
PASS  lint          E00     2.1s
PASS  typecheck     E00     3.4s
FAIL  test          E00     4.7s
PASS  build         E00    18.9s

4 checks: 3 passed, 1 failed
```

Result is `PASS` or `FAIL`, then `id`, then `owner`, then duration in seconds to one decimal. Pad
the id and owner columns to a fixed width computed from the longest value present, so a later Epic
registering `validate-kallor` does not misalign the table.

Then, and only then, reproduce each failing check's output **in full** under a header naming both
the id and the exact command a developer can rerun by hand:

```
----- FAIL: test (npm run test) -----
<captured stdout verbatim>
<captured stderr verbatim>
```

Failures print after the summary, not interleaved with it — the summary is the thing a reader scans
first and it must not be buried under a stack trace.

Set `process.exitCode = 1` when any check failed and leave it at `0` otherwise. Use `process.exitCode`
rather than `process.exit()` so buffered stdout is flushed before the process ends; a truncated
failure log is worse than no log.

**No check id may be special-cased anywhere in this file.** The runner must not contain the strings
`lint`, `typecheck`, `test` or `build` outside of comments. Removing an entry from
`scripts/ci/checks.ts` must reduce the run to three checks with no other edit — that is the property
the whole story is buying.

### The npm script

Add exactly one script to `package.json`:

```json
"ci": "node scripts/ci/run-checks.ts"
```

(or the `tsx` form, if the ladder above landed on rung 3). Add nothing else. `ci` must not itself
appear in the registry; `E00_S03_T03` adds a guard that rejects it, but do not create the recursion
in the first place.

### Lint and format

`scripts/ci/` is linted and format-checked. The runner prints to stdout, so if a `no-console` rule
fires, add an override **scoped to `scripts/ci/**`** in `eslint.config.mjs` with a one-line comment
saying why, rather than disabling the rule globally or scattering `eslint-disable` comments. If
type-aware rules complain about `spawnSync`'s partially-typed result, narrow the value properly
rather than casting to `any`.

### Domain constraint

No file created or modified by this task may reference a kommun, skola, nyckeltal or data source.

## Acceptance Criteria

- [ ] `scripts/ci/run-checks.ts` exists and obtains its work exclusively from
      `import { checks } from './checks.ts'`.
- [ ] The file contains no literal check id outside comments — grepping it for `lint`, `typecheck`,
      `test` and `build` returns only comment lines, if anything.
- [ ] A comment block at the top records which execution rung was used (`node` type stripping,
      scoped `type: module`, or `tsx`), the reason, and the constraints that choice imposes.
- [ ] `package.json` contains the script `ci`, and `ci` does not appear as a `command` in the
      registry.
- [ ] Every spawn uses the repository root as `cwd`, and `npm run ci` produces identical output when
      invoked from a subdirectory such as `scripts/ci/`.
- [ ] `npm run ci` on the clean tree runs all four checks in declared array order and exits zero.
- [ ] The summary prints one line per check showing result, `id`, `owner` and duration in seconds,
      followed by a blank line and a final `N checks: X passed, Y failed` count.
- [ ] No output from a passing check appears anywhere in the run —
      `npm run ci > /tmp/ci-out.txt 2>&1` on the clean tree produces a file containing only the
      progress lines, the summary table and the count.
- [ ] Temporarily making the example test from `E00_S02` fail causes `npm run ci` to: still run all
      four checks, report `test` as `FAIL` and the other three as `PASS`, reproduce the Vitest output
      in full under a `FAIL: test (npm run test)` header, and exit non-zero. The captured output is
      recorded in the task's rapport and the test is then restored.
- [ ] With that same failure in place, the summary still shows `build` running **after** `test` —
      proving execution did not stop at the first failure.
- [ ] Temporarily deleting the `build` entry from `scripts/ci/checks.ts` makes `npm run ci` report
      exactly three checks, with no other file edited; the entry is then restored.
- [ ] `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run test` and
      `npm run build` all exit zero with the runner present.
- [ ] If an ESLint override was needed for `console`, it is scoped to `scripts/ci/**` and carries a
      comment stating why; no `eslint-disable` comment was added to `run-checks.ts`.
- [ ] No file created or modified by this task references a kommun, skola, nyckeltal or data source.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] `process.exit()` is not called anywhere in the runner; the exit status is set via
      `process.exitCode`, and a large failure log is verified to print in full without truncation.
- [ ] There is no privileged or hard-coded execution path: an entry added to the registry is
      executed by exactly the same code as the four base entries.
- [ ] `npm run ci` is the only command a caller needs — `E00_S04`'s workflow can consist of
      checkout, Node setup, `npm ci` and `npm run ci`, with no knowledge of how many checks exist.
- [ ] The runner is resilient to a check whose npm script does not exist only insofar as it reports a
      failure rather than crashing with an unhandled exception; making that case a clean pre-flight
      error is `E00_S03_T03`'s job and is explicitly left to it.
- [ ] `git status` is clean and every temporary breakage introduced for the acceptance criteria has
      been reverted.
