---
id: E00_S03_T05
title: Throwaway example validator — add, pass, fail, remove
status: Pending
story_id: E00_S03
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S03_T04
---

# Task: Throwaway example validator — add, pass, fail, remove

## Description

Prove the extension mechanism by using it, then delete the evidence. A mechanism that has only been
described has not been tested; the first Epic to rely on it discovers the gap at the worst possible
moment.

This task carries out the story's five-step throwaway proof end to end and records the outcome of
each step. Its output is a **rapport**, not a feature: when it is finished the repository must be
byte-for-byte back where `E00_S03_T04` left it.

Depends on `E00_S03_T04` for two reasons: the example validator asserts something about `docs/`, so
`docs/ci-checks.md` must exist for the assertion to have any content; and the proof is carried out
by **following `docs/ci-checks.md` verbatim**, which is what validates the page.

**Scope boundary.** Everything this task adds is removed before it completes. It changes no
permanent file. `E00_S04` repeats this proof through the real pipeline once the workflow exists —
that split is deliberate, because a mechanism that only works when a CI provider is present is a
mechanism nobody can debug.

### Follow the documentation, not the story

Open `docs/ci-checks.md` and perform the two-step registration procedure exactly as written there.
Do not fall back on this task file or on `E00_S03`'s story for a step the page omits. **If the page
is missing a step, is ambiguous, or is wrong, fix `docs/ci-checks.md` first**, record what was wrong
in the rapport, then start the proof again from the corrected page. That correction is the most
valuable thing this task can produce.

### Step 1 — Add `scripts/ci/example-validator.ts`

Deliberately trivial and entirely domain-free. It asserts that **no file under `docs/` is zero
bytes**, which is a real property with a real failure mode and nothing to do with the project's
subject matter.

- Walk `docs/` recursively using `node:fs` from a path resolved off `import.meta.url`, not
  `process.cwd()`.
- For every regular file, `statSync(...).size === 0` is a violation.
- On violation: print each offending path to stderr and set `process.exitCode = 1`.
- On success: print one line such as `example-validator: N files under docs/, none empty` and exit
  zero.
- Same execution mechanism as the runner, whichever rung `E00_S03_T02` recorded — this file must not
  invent a second way of running TypeScript.

### Step 2 — Register it

- `package.json`: add `"validate:example": "node scripts/ci/example-validator.ts"` (or the `tsx`
  form, matching the recorded decision).
- `scripts/ci/checks.ts`: append a **fifth** entry:

```ts
{
  id: 'validate-example',
  description: 'Asserts no file under docs/ is empty',
  command: 'validate:example',
  owner: 'E00-throwaway',
},
```

The `owner` value is `E00-throwaway` precisely so it is greppable at removal time.

### Step 3 — Show it passes

Run `npm run ci`. It must report **five** checks, all `PASS`, count `5 checks: 5 passed, 0 failed`,
and exit zero. Capture the full output.

### Step 4 — Break it and show the failure behaviour

Create a genuinely zero-byte file under `docs/` — `: > docs/empty-proof.md` — so the validator fails
on a real condition rather than on a sabotaged assertion.

Run `npm run ci`. It must:

- report `validate-example` as `FAIL`,
- still report the other **four** checks, each `PASS`, proving fail-slow,
- reproduce the validator's output in full under its `FAIL: validate-example (npm run
  validate:example)` header, naming `docs/empty-proof.md`,
- print `5 checks: 4 passed, 1 failed`,
- exit non-zero.

Capture the full output. If a zero-byte Markdown file happens to disturb `format:check` or any other
base check, say so in the rapport and pick a different genuinely-empty file under `docs/` — but the
other four checks passing is part of what is being proven, so do not proceed with a break that
poisons them.

### Step 5 — Remove everything and prove the removal

Delete, in this order:

1. `docs/empty-proof.md`
2. `scripts/ci/example-validator.ts`
3. the `validate:example` script from `package.json`
4. the fifth entry from `scripts/ci/checks.ts`

Then prove the tree is clean:

- `scripts/ci/checks.ts` contains exactly four entries, all with `owner: 'E00'`.
- Searching the repository for `validate:example`, `example-validator`, `E00-throwaway` and
  `empty-proof` returns hits **only** under `project/` (this task file, the story, the rapport) and
  nothing under `src/`, `scripts/`, `docs/`, `package.json` or any config file. `node_modules/` is
  excluded from the search.
- `npm run ci` reports four checks, all passing, and exits zero.
- `git status` shows no leftover file and `git diff` against the tree as `E00_S03_T04` left it is
  empty apart from the rapport.

### The rapport

The story's Definition of Done requires the outcome of **each of the five steps** to be recorded, not
merely asserted. Write the captured console output for steps 3, 4 and 5 into the task's rapport,
along with any correction that had to be made to `docs/ci-checks.md`. Output that was observed and
pasted is evidence; a sentence saying it worked is not.

### Domain constraint

Everything this task creates — including the throwaway validator, the empty file used to break it,
and the rapport — must reference no kommun, skola, nyckeltal or data source. The validator asserts
something entirely generic on purpose.

## Acceptance Criteria

- [ ] The registration was performed by following `docs/ci-checks.md` alone; any gap, ambiguity or
      error found in that page was fixed there and the correction is recorded in the rapport.
- [ ] **Step 1**: `scripts/ci/example-validator.ts` was created, resolves `docs/` from
      `import.meta.url`, fails on any zero-byte file and passes otherwise, and uses the same
      execution mechanism recorded for the runner.
- [ ] **Step 2**: `validate:example` was added to `package.json` and a fifth entry with
      `owner: 'E00-throwaway'` was appended to `scripts/ci/checks.ts` — with **no change to
      `scripts/ci/run-checks.ts`, `scripts/ci/validate-registry.ts`, `tsconfig.json`,
      `eslint.config.mjs`, `vitest.config.ts` or anything under `.github/`**.
- [ ] **Step 3**: `npm run ci` reported five checks, all `PASS`, `5 checks: 5 passed, 0 failed`, and
      exited zero. The output is captured in the rapport.
- [ ] **Step 4**: with `docs/empty-proof.md` present at zero bytes, `npm run ci` reported
      `validate-example` as `FAIL`, the other four checks as `PASS`, `5 checks: 4 passed, 1 failed`,
      reproduced the validator's output in full naming the offending path, and exited non-zero. The
      output is captured in the rapport.
- [ ] **Step 5**: all four artefacts were removed, `scripts/ci/checks.ts` contains exactly four
      entries, and `npm run ci` reports four checks and exits zero. The output is captured in the
      rapport.
- [ ] Searching the repository for `validate:example`, `example-validator`, `E00-throwaway` and
      `empty-proof`, excluding `node_modules/` and `project/`, returns no hits.
- [ ] `git diff` between the tree as `E00_S03_T04` left it and the tree after this task shows no
      change outside `project/` — including no whitespace change to `package.json` or
      `scripts/ci/checks.ts`.
- [ ] `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run test` and
      `npm run build` all exit zero at the end.
- [ ] No file created during this task referenced a kommun, skola, nyckeltal or data source.

## Definition of Done

- [ ] All acceptance criteria are met and all five steps are recorded in the task's rapport with
      captured output, not summarised.
- [ ] The proof demonstrated fail-slow at least once: a failing fifth check did not prevent the four
      base checks from running and reporting.
- [ ] The registration required exactly two edits — one npm script and one registry entry — and this
      is stated in the rapport as a confirmed fact, since it is the property `E01`, `E02` and `E09`
      depend on.
- [ ] If registration required any third edit, that is recorded as a **defect in `E00_S03`** and
      raised as a story amendment rather than absorbed silently — the story's contract with later
      Epics is two edits and no design work.
- [ ] The repository is left with no trace of the throwaway outside `project/`, and `npm run ci` is
      green on the clean tree.
