---
id: E00_S03_T03
title: Pre-flight registry validation guard with unit tests
status: Pending
story_id: E00_S03
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S03_T01
  - E00_S03_T02
---

# Task: Pre-flight registry validation guard with unit tests

## Description

Add the guard that makes one-line registration **safe**: before the runner executes anything, it
validates the registry against `package.json` and refuses to run at all if the registry is
incoherent.

This is the part of the story that stops the mechanism from failing silently. A typo in a new entry
must fail loudly and immediately. The alternative — the runner skipping or mis-running a check that
everybody then believes is enforced — is far worse than a hard stop, because a check nobody knows is
dead is indistinguishable from a check that passes.

Assumes `E00_S03_T01` and `E00_S03_T02` have landed: the registry exists and
`scripts/ci/run-checks.ts` executes it behind `npm run ci`.

**Scope boundary.** This task adds one new module, its tests, and about five lines of wiring in the
runner. It does not change how checks are executed, how output is captured or how the summary is
printed.

### `scripts/ci/validate-registry.ts`

A **pure function**. No `process.exit`, no `console`, no spawning, no file reads — so it is trivially
unit-testable and the runner keeps sole responsibility for I/O and exit codes.

```ts
import type { Check } from './checks.ts';

/**
 * Returns a list of human-readable problems with the registry.
 * An empty array means the registry is safe to execute.
 */
export function validateRegistry(
  checks: readonly Check[],
  scripts: Readonly<Record<string, string | undefined>>,
): string[];
```

Rules, checked in this order, all problems collected rather than returning on the first:

1. **Duplicate `id`.** Two entries sharing an `id` make the summary ambiguous and mean one of them
   is almost certainly a copy-paste that was never finished being edited.
   Message: `duplicate check id "lint" (entries 1 and 4)` — one-based indices, both named.
2. **Unknown `command`.** The `command` is not a key of `package.json`'s `scripts`.
   Message: `check "validate-kallor": command "validate:kallor" is not a script in package.json`.
   Both the check id and the missing script name appear, because the reader needs to know which
   entry to fix and what to add.
3. **Self-reference.** `command === 'ci'`. Registering the runner's own entry point makes
   `npm run ci` fork-bomb itself. This is not in the story's acceptance criteria; it is a cheap
   guard against an obvious and destructive mistake, and it is called out here so it is a deliberate
   addition rather than an undocumented extra.
   Message: `check "ci": command "ci" would run the check runner recursively`.

Nothing else. Do not validate id casing, description length or owner format — the type system covers
shape, and speculative rules here become friction for E01, E02 and E09 later.

### Wiring it into the runner

In `scripts/ci/run-checks.ts`, before the first spawn:

- Read the **repository root** `package.json` explicitly —
  `readFileSync(new URL('../../package.json', import.meta.url), 'utf8')`, then `JSON.parse`. Resolve
  it from the module's own location, not from `process.cwd()`, and not via `import` — a nearest-
  package.json lookup would find `scripts/ci/package.json` if rung 2 of `E00_S03_T02`'s execution
  ladder was taken.
- Call `validateRegistry(checks, pkg.scripts ?? {})`.
- If the returned array is non-empty: print each problem to **stderr**, prefixed `registry error: `,
  print a one-line pointer to `docs/ci-checks.md`, set `process.exitCode = 1`, and **return without
  spawning anything**. No summary table, no progress lines, no check output — the absence of that
  output is what proves nothing ran.
- If it is empty, proceed exactly as before.

Treat the parsed `package.json` as unknown data and narrow it — do not cast to `any` to satisfy the
type-aware lint rules.

### Tests

`scripts/ci/validate-registry.test.ts`, run by Vitest. `E00_S02` configured Vitest; check whether its
`include` pattern reaches outside `src/`. If `npm run test` does not pick this file up, extend
`vitest.config.ts`'s `include` to cover both `src/**` and `scripts/**` test files. That is an
additive change to test discovery, not a change to `tsconfig.json` strictness or the `@/` alias, so
it is within this story's remit — but state the change in the commit and keep it minimal.

Cases, each with a hand-built registry literal (do **not** import the real `checks` array — these
tests must not break when E01 registers its validator):

- A coherent registry with two entries and a matching `scripts` object → returns `[]`.
- Two entries sharing an `id` → exactly one problem, whose message contains the duplicated id and
  both one-based indices.
- An entry whose `command` is absent from `scripts` → exactly one problem naming both the check id
  and the command.
- An entry with `command: 'ci'` → exactly one problem naming the recursion.
- A registry with **two different** faults → two problems, proving faults are collected rather than
  returned on the first.
- An empty registry → returns `[]` (an empty registry is coherent; whether it is useful is not this
  function's business).

Assert on message content with `toContain`, not on exact string equality of the whole message —
tests that pin punctuation break every time the wording is improved.

### Domain constraint

No file created or modified by this task may reference a kommun, skola, nyckeltal or data source.
The test fixtures must use abstract ids such as `alpha` and `beta`, with abstract script names.

## Acceptance Criteria

- [ ] `scripts/ci/validate-registry.ts` exists and exports `validateRegistry(checks, scripts)`
      returning `string[]`.
- [ ] That module performs no I/O: it contains no `console`, no `process.exit`, no `spawn*`, and no
      `node:fs` or `node:child_process` import.
- [ ] `scripts/ci/run-checks.ts` calls `validateRegistry` before its first spawn, using the
      repository-root `package.json` resolved from `import.meta.url`.
- [ ] Temporarily duplicating the `lint` entry in `scripts/ci/checks.ts` makes `npm run ci` exit
      non-zero, print `registry error:` naming the duplicated id, and print **no summary table and
      no check output whatsoever**; the duplicate is then removed and `npm run ci` is green.
- [ ] Temporarily changing the `build` entry's `command` to `buidl` makes `npm run ci` exit non-zero
      with a message naming both the check id `build` and the command `buidl`, and again runs no
      checks; it is then reverted.
- [ ] Introducing **both** faults at once produces **both** messages in a single run.
- [ ] An entry with `command: 'ci'` is rejected with the recursion message and no check is run.
- [ ] The error output includes a pointer to `docs/ci-checks.md`.
- [ ] `scripts/ci/validate-registry.test.ts` exists, covers all six cases listed above, and passes
      under `npm run test`.
- [ ] `npm run test` discovers that file; if `vitest.config.ts` needed its `include` extended, the
      diff is limited to that one addition.
- [ ] The tests build their own registry literals and do not import `checks` from
      `scripts/ci/checks.ts`.
- [ ] `npm run ci` on the clean tree still runs all four checks and exits zero.
- [ ] `npm run lint`, `npm run format:check`, `npm run typecheck` and `npm run build` all exit zero.
- [ ] No file created or modified by this task references a kommun, skola, nyckeltal or data source.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] The guard's evidence of correctness is the absence of execution, not just the exit code — each
      of the three fault demonstrations records the observed output in the task's rapport, showing
      no check ran.
- [ ] The three rules are the only rules; no speculative validation was added beyond them, and the
      self-reference rule is documented in code as a deliberate addition beyond the story's stated
      criteria.
- [ ] `validateRegistry` is exported and testable independently of the runner, so a later Epic that
      wants to lint its own registry entry can call it directly.
- [ ] `git status` is clean and every temporary fault introduced for the acceptance criteria has been
      reverted; `scripts/ci/checks.ts` contains exactly the four base entries.
