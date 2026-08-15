---
id: E00_S02_T04
title: Toolchain interop proof and base-command sweep
status: Pending
story_id: E00_S02
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S02_T01
  - E00_S02_T02
  - E00_S02_T03
---

# Task: Toolchain interop proof and base-command sweep

## Description

The three preceding tasks each installed one tool and verified it in isolation. This task verifies
the properties that **only exist once all three are present**, and closes the story against
`E00_S03`, which will register these commands as CI checks by name.

It is a verification-and-correction task. It creates no new tooling. Where a check below fails, the
fix belongs in whichever of `.prettierrc.json` / `.prettierignore` / `eslint.config.mjs` /
`vitest.config.ts` / `package.json` is wrong — do not paper over a conflict by weakening
`--max-warnings=0` or by adding a blanket ignore.

### 1. Prettier and ESLint do not fight

This is the criterion the whole division-of-responsibility decision exists to satisfy. On a clean
tree:

1. `npm run lint:fix`
2. `npm run format`
3. `git diff` must be **empty**.

Then the reverse order — `npm run format` followed by `npm run lint:fix` — must also produce no
diff. If either order produces a diff, `eslint-config-prettier` is not doing its job: confirm it is
the **last** element of the flat-config array and that no stylistic rule is re-enabled after it.

Record the commands and their output in the task's rapport. "It seemed fine" is not evidence.

### 2. All four base commands pass on a clean tree

Run each individually, from a clean `git status`, and record the exit code of each:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

All four must exit zero. `npm run format:check` must also exit zero, though it is a fifth command
rather than one of the Epic's four.

Then do it from a genuinely cold state: delete `node_modules/` and `.next/`, run `npm ci`, and run
all five again. A green result that depends on leftover local state is not a green result — this
mirrors the reproducibility bar `E00_S01` set.

### 3. The ignore lists are audited, not assumed

Confirm, by inspection and by running the tools, that:

- Neither `.prettierignore` nor `eslint.config.mjs`'s `ignores` excludes `src/`.
- Neither excludes `scripts/`. That directory does not exist yet — `E00_S03` creates
  `scripts/ci/checks.ts` and `scripts/ci/run-checks.ts` and expects both tools to reach them. An
  ignore added now would silently unlint the Epic's most important file.
- Every entry that *is* excluded carries a stated reason in the file.

Prove the `scripts/` case rather than reasoning about it: create a temporary
`scripts/ci/scratch.ts` containing a lint violation, confirm `npm run lint` reports it, then delete
the file and the directory.

### 4. The script-name contract with E00_S03

`E00_S03` registers checks by npm script name and its registry entries are `lint`, `typecheck`,
`test` and `build`. Confirm `package.json` contains all of these spelled **exactly** that way, plus
`lint:fix`, `format`, `format:check` and `test:watch`. Confirm none of them is a wrapper around
another that would double-run work, and that `test` is the single-run form rather than watch mode.

Confirm also that `npm run <name>` for each of the eight exits with the code the check registry will
depend on — zero on success, non-zero on failure.

### 5. The recorded decisions are actually findable

Two decisions from this story must be written where the next reader will find them, and both live in
config files rather than under `docs/` — `E00_S05` owns the `docs/` layout and its index table, and
a page added here would land outside that convention. Confirm:

- The **Prettier-owns-formatting** decision, with its reason, is in the comment block at the top of
  `eslint.config.mjs`.
- The **no-coverage-threshold** decision, with its reason, is in `vitest.config.ts`.

If either is missing or reduced to a bare assertion without the reason, add it. A decision without
its reason gets reversed by the first person who finds it inconvenient.

### 6. Domain-leakage sweep

Review every file this story created or modified — `.prettierrc.json`, `.prettierignore`,
`eslint.config.mjs`, `vitest.config.ts`, `src/lib/assertNever.ts`, `src/lib/assertNever.test.ts`,
`package.json`, `package-lock.json` — and confirm none references a kommun, skola, nyckeltal or data
source. This applies to the test fixtures with full force: the union in the example test stays
abstract.

Confirm too that no temporary file from any of the three preceding tasks survived — no floating-promise
scratch file, no misformatted file, no `scripts/ci/scratch.ts`, no deliberately failing assertion.
`git status` clean plus a read of `git log --stat` for the story's commits is the check.

## Acceptance Criteria

- [ ] `npm run lint:fix` followed by `npm run format` produces an empty `git diff`, and the output
      of both commands is recorded in the rapport.
- [ ] `npm run format` followed by `npm run lint:fix` also produces an empty `git diff`.
- [ ] `eslint-config-prettier` is confirmed to be the last element of the exported flat-config array
      in `eslint.config.mjs`.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` and
      `npm run format:check` each exit zero on the clean tree, with exit codes recorded.
- [ ] After `rm -rf node_modules .next && npm ci`, all five commands exit zero again.
- [ ] Neither `.prettierignore` nor `eslint.config.mjs`'s `ignores` excludes `src/` or `scripts/`,
      and every entry that is excluded carries a stated reason.
- [ ] A temporary `scripts/ci/scratch.ts` containing a lint violation is shown to be reported by
      `npm run lint`, then removed along with the directory it created; `git status` is clean
      afterwards.
- [ ] `package.json` contains exactly these scripts spelled this way, alongside `dev`, `build`,
      `start` and `typecheck` from `E00_S01`: `lint`, `lint:fix`, `format`, `format:check`, `test`,
      `test:watch`.
- [ ] `test` runs Vitest in single-run mode and terminates without manual interrupt.
- [ ] The Prettier-owns-formatting decision and its reason are present in `eslint.config.mjs`.
- [ ] The no-coverage-threshold decision and its reason are present in `vitest.config.ts`.
- [ ] No `docs/` page was created by this story.
- [ ] No file created or modified by this story references a kommun, skola, nyckeltal or data
      source, including the example test's fixtures.
- [ ] No temporary or scratch file from any task in this story remains in the repository.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] The story's four base commands (`lint`, `typecheck`, `test`, `build`) are confirmed green from
      a cold `npm ci`, with the evidence recorded in the rapport rather than asserted.
- [ ] `E00_S03` can register `lint`, `typecheck`, `test` and `build` as CI checks by name, with no
      renaming, no rewrapping and no shell quoting, and can add `format:check` as a fifth without
      the script needing to change.
- [ ] Any correction this task had to make to a config file produced by `E00_S02_T01`,
      `E00_S02_T02` or `E00_S02_T03` is described in the rapport, so the story's history shows what
      the isolated tasks could not have caught.
- [ ] `git status` is clean and the working tree contains no artefact of any deliberate breakage
      used as proof in this story.
