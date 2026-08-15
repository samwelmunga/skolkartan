---
id: E00_S04_T03
title: Reproduce the three deliberate breakages locally
status: Pending
story_id: E00_S04
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on: []
---

# Task: Reproduce the three deliberate breakages locally

## Description

Before anything is pushed, prove that `npm run ci` reproduces each of the three deliberate failures
on a local machine, and write down the **exact recipe** for each. T06 replays these same three
recipes through the real pipeline; if the recipes are not pinned down here, T06 turns into
guess-and-push, which costs a full remote round trip per attempt.

This task needs no remote, no workflow file and no network. It depends only on the four base checks
from S01/S02 and the `npm run ci` runner from S03, all of which have landed.

### Why local parity matters

S03's Definition of Done promises "`npm run ci` produces identical behaviour when run locally and
when run by S04's pipeline". This task is the local half of the evidence for that claim. T06 is the
remote half. If the two halves disagree — a check that fails locally but passes in CI, or the
reverse — that is a defect in the runner, and it is S03's to fix, not something to work around here.

### The three recipes

Each breakage must isolate to **one** check, with the single documented exception that a type error
fails both `typecheck` and `build` because `next build` type-checks by default. The runner is
fail-slow, so every check runs on every invocation; the assertion is about which ones report FAIL in
the summary, not about the run stopping.

**Recipe 1 — type error.** In `src/app/page.tsx`, add inside the component body:

```ts
const deliberateTypeError: number = 'not a number';
```

Expected: `typecheck` FAIL and `build` FAIL; `lint` and `test` PASS. Note that this line is also an
unused variable, so depending on rule configuration `lint` may fail too — if it does, record that
observation and instead reference the value (`void deliberateTypeError;`) so the breakage isolates
to the type checks as intended. Do not leave it ambiguous.

**Recipe 2 — lint violation.** In `src/app/page.tsx`, add inside the component body:

```ts
const deliberateLintViolation = 1;
```

An unused local, caught by `@typescript-eslint/no-unused-vars`. Chosen because it is a plain
correctness rule, not a formatting rule (Prettier owns formatting per S02), and because it is **not**
a type error under this project's `tsconfig.json` — `noUnusedLocals` is not enabled — so it isolates
cleanly to `lint`.

Expected: `lint` FAIL; `typecheck`, `test` and `build` PASS.

**Recipe 3 — failing test.** In the example test covering `src/lib/assertNever.ts`, invert a single
assertion — for example change an expected throw into an expected non-throw. Change the assertion
only; do not modify `src/lib/assertNever.ts` itself, so the failure cannot be confused with a
production-code defect.

Expected: `test` FAIL; `lint`, `typecheck` and `build` PASS.

### Procedure per recipe

1. Confirm the tree is clean and `npm run ci` is green. Record the summary output as the baseline.
2. Apply the recipe.
3. Run `npm run ci`. Capture the **full** summary block — one line per check with id, owner,
   PASS/FAIL and duration, plus the final count — and confirm the exit code is non-zero
   (`echo $?`).
4. Confirm the expected check(s) FAIL and that every other check still ran and reported.
5. Revert the recipe with `git checkout -- <file>` and confirm `npm run ci` is green again and
   `git status` is clean.

Recipes are applied and reverted **one at a time**. Never stack two breakages.

### Output

Write the evidence to `project/rapports/analysis/E00_S04_breakage-recipes.md`, containing for each
recipe: the exact file path, the exact line to add or change, the expected FAIL set, and the
captured `npm run ci` summary output with the exit code. T06 consumes this file verbatim.

### Constraint

None of these breakages may reference a kommun, skola, nyckeltal or data source. The variable names
above are deliberately generic; keep them that way.

## Acceptance Criteria

- [ ] `npm run ci` on the clean tree exits zero, and the baseline summary output is captured.
- [ ] Recipe 1 applied: `npm run ci` exits non-zero with `typecheck` reported FAIL and `build`
      reported FAIL; the captured output shows all other checks still ran.
- [ ] Recipe 1 reverted: `npm run ci` exits zero and `git status` is clean.
- [ ] Recipe 2 applied: `npm run ci` exits non-zero with `lint` reported FAIL and `typecheck`,
      `test` and `build` reported PASS.
- [ ] Recipe 2 reverted: `npm run ci` exits zero and `git status` is clean.
- [ ] Recipe 3 applied: `npm run ci` exits non-zero with `test` reported FAIL and `lint`,
      `typecheck` and `build` reported PASS.
- [ ] Recipe 3 reverted: `npm run ci` exits zero and `git status` is clean.
- [ ] For every failing run, the failing check's own output is reproduced in full in the captured
      summary, and passing checks' output is suppressed — S03's contract holds.
- [ ] `project/rapports/analysis/E00_S04_breakage-recipes.md` exists and records, per recipe, the
      exact file, the exact edit, the expected FAIL set and the captured output with exit code.
- [ ] No breakage references a kommun, skola, nyckeltal or data source.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] The working tree is left exactly as it was found: no breakage remains, `git status` clean, and
      `npm run ci` green.
- [ ] If any recipe did not isolate to its intended check, the adjusted recipe and the reason are
      written down rather than the discrepancy being quietly absorbed.
- [ ] The recipes file is written so T06 can apply each one without re-deriving it.
