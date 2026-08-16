---
id: E00_S03
title: Extensible CI check registry
status: Pending
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
tasks:
  - E00_S03_T01
depends_on:
  - E00_S01
  - E00_S02
docs: ["docs/ci-checks.md"]
---

# Story: Extensible CI check registry

**ID**: E00_S03
**Epic**: E00 — Project Foundation
**Status**: Pending
**Date Added**: 2026-08-15
**Wave**: 3 — needs all four base commands from S01 and S02. Blocks S04, which wires the pipeline
to this registry.

## User Story

As the maintainer of Skolkartan, I want a documented registry that a later Epic adds one entry to
in order to have its own validator enforced on every merge, so that each Epic's rules are enforced
automatically without anyone redesigning the pipeline six more times.

## Description

This is the story the Epic exists for. Everything else in E00 is ordinary scaffolding that any
project needs; this is the part that determines whether E01, E02 and E09 get their rules enforced
cheaply or expensively.

The problem it solves: E01 will produce `npm run validate:kallor`, E02 will produce migration
checks, E09 will produce freshness checks. If each of those has to edit a CI workflow file, three
Epics each invent their own step layout, the workflow becomes the place merge conflicts live, and
the checks drift apart in how they report failure. Instead, **the pipeline is deliberately stupid
and the registry holds everything**.

### Design

Two files, outside `src/` so the Next.js build never compiles them:

- `scripts/ci/checks.ts` — the registry. An ordered array. This is the only file a later Epic
  touches.
- `scripts/ci/run-checks.ts` — the runner. Executes the registry.

`tsconfig.json` includes `scripts/**/*` so the registry is type-checked by `npm run typecheck`,
while `next.config.ts` and the App Router only ever see `src/`. A malformed registry is therefore
a type error, caught before it ever reaches the runner.

### The descriptor

```ts
export type Check = {
  id: string;          // stable kebab-case identifier, e.g. "typecheck"
  description: string; // one line, printed in the summary output
  command: string;     // an npm script name, invoked as `npm run <command>`
  owner: string;       // the Epic that registered it, e.g. "E00", "E01"
};

export const checks: Check[] = [ /* four base entries */ ];
```

`owner` is not decoration. When a check fails eighteen months from now, the first question is
whose rule it is and which Epic's story explains it. Recording provenance on a check matches the
project's own no-fact-without-provenance convention.

`command` is restricted to an npm script name rather than an arbitrary shell string. This keeps
every check runnable standalone by a developer, keeps quoting and shell-portability problems out of
the registry, and means the registry cannot become a place where inline shell logic accumulates.

### The runner — decisions made

- **Registered, not special-cased.** The four base checks (`lint`, `typecheck`, `test`, `build`)
  are themselves entries in the registry. There is no privileged built-in path, so the extension
  mechanism is exercised by the project's own checks on every single run rather than being a
  second-class add-on that quietly rots.
- **Fail-slow, not fail-fast.** The runner executes every check in declared order even after one
  fails, then prints a summary and exits non-zero if any failed. A pipeline that reports only the
  first error costs a full push-and-wait cycle per error.
- **Validation before execution.** Before running anything, the runner refuses to proceed and exits
  non-zero if two checks share an `id`, or if a check's `command` is not present in
  `package.json`'s `scripts`. This guard is what makes one-line registration safe: a typo in a new
  entry fails loudly and immediately instead of silently skipping a check that everyone then
  believes is running.
- **Summary output.** One line per check — id, owner, PASS/FAIL, duration — followed by a count.
  Failed checks' output is reproduced in full; passing checks' output is not.
- **Execution.** `node scripts/ci/run-checks.ts`, relying on Node 24's built-in TypeScript type
  stripping, which the `.nvmrc` pin of 24.18.0 guarantees. If that proves unreliable in practice,
  the fallback is `tsx` as a devDependency; whichever is used, the decision and its reason are
  recorded rather than left implicit.
- **Local/CI parity.** `npm run ci` is the single entry point and behaves identically in both
  places. A red build is reproducible locally without pushing.

### The contract with later Epics

Registering a new check is **two edits and no design work**:

1. Add the npm script to `package.json`.
2. Append one `Check` entry to `scripts/ci/checks.ts` with your Epic as `owner`.

Nothing else. Specifically: **`.github/workflows/` contains no list of checks and must not be
modified to add one.** S04 enforces this by giving the workflow exactly one execution step.

**Named seam for E01**: `E01_S01` registers `npm run validate:kallor` with `owner: "E01"` by
appending one entry. Its acceptance criterion "registered in CI through the E00 validator hook and
blocks a merge on failure" is satisfied by that single append plus the merge gate S04 configures.
If E01 finds it must modify the runner or the workflow, this story failed and should be amended,
not worked around.

E02's migration checks and E09's freshness checks register the same way.

### The throwaway proof

The mechanism is not proven by describing it. A disposable check is added, exercised and removed:

1. Add `scripts/ci/example-validator.ts` — deliberately trivial and domain-free (for example:
   assert that no file under `docs/` is zero bytes).
2. Add the `validate:example` npm script and append a fifth registry entry with
   `owner: "E00-throwaway"`.
3. Show `npm run ci` now reports five checks and passes.
4. Break the condition the example validator asserts; show `npm run ci` reports it as the failing
   check, still runs the other four, and exits non-zero.
5. Remove the file, the script and the registry entry. Show the registry is back to exactly four
   entries and `npm run ci` is green.

S04 repeats this proof through the real pipeline. This story proves it locally; that split is
intentional, because a mechanism that only works when a CI provider is present is a mechanism
nobody can debug.

## Acceptance Criteria

- [ ] `scripts/ci/checks.ts` exports the `Check` type and an ordered `checks` array containing
      exactly four entries: `lint`, `typecheck`, `test`, `build`, each with `id`, `description`,
      `command` and `owner: "E00"`.
- [ ] `scripts/ci/run-checks.ts` executes every entry in declared order via `npm run <command>`.
- [ ] `npm run ci` is registered in `package.json` and runs the runner.
- [ ] The runner continues past a failing check, runs all remaining checks, and exits non-zero if
      any failed.
- [ ] The runner prints one summary line per check showing id, owner, result and duration, plus a
      final pass/fail count.
- [ ] Output from failing checks is reproduced in full; output from passing checks is suppressed.
- [ ] The runner exits non-zero **without running any check** if two entries share an `id`.
- [ ] The runner exits non-zero **without running any check** if an entry's `command` is not a
      script in `package.json`, and names the offending entry.
- [ ] `scripts/**/*` is included in `tsconfig.json`, so `npm run typecheck` type-checks the
      registry and a malformed entry is a type error.
- [ ] `docs/ci-checks.md` documents the descriptor fields, the two-step registration procedure, the
      fail-slow behaviour, and the rule that `.github/workflows/` is not to be edited to add a
      check.
- [ ] `docs/ci-checks.md` names `E01_S01`'s `npm run validate:kallor` as the first external
      consumer and shows the exact entry E01 will add, as a worked example.
- [ ] `npm run ci` on the clean tree runs four checks and exits zero.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] **The throwaway example validator has been added, shown to pass, shown to fail the run when
      broken, and then removed** — all five steps of the throwaway proof above are carried out and
      the outcome of each is recorded in the story's rapport.
- [ ] After removal, searching the repository for `validate:example` and `example-validator`
      returns no hits outside the board and rapport records; the registry contains exactly the four
      base entries.
- [ ] The base checks are registered through the same mechanism as any later check — there is no
      hard-coded or privileged execution path in the runner.
- [ ] The Node-type-stripping-versus-`tsx` decision is recorded with its reason.
- [ ] `npm run ci` produces identical behaviour when run locally and when run by S04's pipeline.
- [ ] No kommun, skola, nyckeltal or data source is referenced anywhere in this story's output —
      including the throwaway example validator, which must assert something entirely generic.
- [ ] E01, E02 and E09 can each register a validator by adding one npm script and one registry
      entry, with no change to the runner or the workflow; any change they need after this point is
      an amendment to this story, not an assumption.
