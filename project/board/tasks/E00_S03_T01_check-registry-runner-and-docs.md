---
id: E00_S03_T01
title: Check registry, runner, npm run ci, and docs
status: Passed
story_id: E00_S03
epic_id: E00
date_created: 2026-08-16
date_started: 2026-08-16
date_completed: 2026-08-17
depends_on: []
needs_docs: false
---

# Task: Check registry, runner, npm run ci, and docs

## Description

The whole of story E00_S03 in one task. Two source files, one tsconfig change, one npm script, one
docs page, and a throwaway proof at the end.

Read the story file `project/board/stories/E00_S03_extensible-ci-check-registry.md` for the design
and the reasoning behind each decision. This task does not restate it.

### `scripts/ci/checks.ts`

The registry, and the only file a later Epic touches. Exports the `Check` type and an ordered
`checks` array with exactly four entries — `lint`, `typecheck`, `test`, `build` — each with
`owner: "E00"`.

```ts
export type Check = {
  id: string;          // stable kebab-case identifier
  description: string; // one line, printed in the summary
  command: string;     // an npm script name, invoked as `npm run <command>`
  owner: string;       // the Epic that registered it
};
```

`command` is an npm script name, not a shell string — this keeps quoting and portability problems
out of the registry and keeps every check runnable standalone.

### `scripts/ci/run-checks.ts`

The runner. Behaviour:

- **Validate before executing.** Exit non-zero *without running any check* if two entries share an
  `id`, or if an entry's `command` is not a key in `package.json`'s `scripts`. Name the offending
  entry. This guard is what makes one-line registration safe.
- **Fail slow.** Run every check in declared order even after one fails. Exit non-zero at the end if
  any failed.
- **Summary.** One line per check — id, owner, PASS/FAIL, duration — then a final count. Reproduce
  failing checks' output in full; suppress passing checks' output.
- **Non-zero means failure, whatever the code.** `typecheck` exits 2, not 1 — this was recorded by
  `E00_S02_T04`. Treat any non-zero exit as a failure; do not compare against 1.

Run it with `node scripts/ci/run-checks.ts`, relying on Node 24's built-in TypeScript type
stripping, which the `.nvmrc` pin of 24.18.0 guarantees. If that proves unreliable in practice, fall
back to `tsx` as a devDependency. Either way, record the decision and its reason in a comment in the
runner.

### Wiring

- Add `scripts/**/*` to `tsconfig.json`'s `include` so `npm run typecheck` covers the registry and a
  malformed entry is a type error. `next.config.ts` and the App Router must still only see `src/`.
- Add `"ci": "node scripts/ci/run-checks.ts"` to `package.json` scripts.

### `docs/ci-checks.md`

Document the descriptor fields, the two-step registration procedure (add npm script, append registry
entry), the fail-slow behaviour, and the rule that `.github/workflows/` is **not** to be edited to
add a check. Name `E01_S01`'s `npm run validate:kallor` as the first external consumer and show the
exact entry E01 will add, as a worked example.

Do not create `docs/index.md` — `E00_S05` owns that.

### The throwaway proof

Prove the mechanism rather than describing it, then remove it:

1. Add `scripts/ci/example-validator.ts` — trivial and domain-free (e.g. assert no file under
   `docs/` is zero bytes).
2. Add the `validate:example` npm script and a fifth registry entry with `owner: "E00-throwaway"`.
3. Show `npm run ci` reports five checks and passes.
4. Break the condition it asserts; show `npm run ci` reports it as the failing check, still runs the
   other four, and exits non-zero.
5. Remove the file, the script and the registry entry. Show the registry is back to four entries and
   `npm run ci` is green.

Record the outcome of each of the five steps in the commit message.

## Acceptance Criteria

- [ ] `scripts/ci/checks.ts` exports `Check` and an ordered `checks` array of exactly four entries —
      `lint`, `typecheck`, `test`, `build` — each with `id`, `description`, `command`, `owner: "E00"`.
- [ ] `scripts/ci/run-checks.ts` executes every entry in declared order via `npm run <command>`.
- [ ] `npm run ci` is registered in `package.json` and runs the runner.
- [ ] The runner continues past a failing check and exits non-zero if any failed.
- [ ] The runner prints one summary line per check — id, owner, result, duration — plus a final count.
- [ ] Failing checks' output is reproduced in full; passing checks' output is suppressed.
- [ ] The runner exits non-zero **without running any check** on a duplicate `id`.
- [ ] The runner exits non-zero **without running any check** when a `command` is absent from
      `package.json` scripts, and names the offending entry.
- [ ] Both guard conditions are covered by unit tests that run under `npm run test`.
- [ ] Any non-zero exit code counts as failure — verified against `typecheck`'s exit code 2.
- [ ] `scripts/**/*` is in `tsconfig.json`'s `include`; `npm run typecheck` type-checks the registry.
- [ ] `docs/ci-checks.md` documents the descriptor, the two-step registration, fail-slow behaviour,
      and the do-not-edit-workflows rule.
- [ ] `docs/ci-checks.md` shows E01's `validate:kallor` entry as a worked example.
- [ ] All five throwaway-proof steps carried out, with the outcome of each recorded.
- [ ] After removal, `validate:example` and `example-validator` return no hits outside the board and
      the commit message; the registry has exactly four entries.
- [ ] `npm run ci` on the clean tree runs four checks and exits zero.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] The four base checks run through the same mechanism as any later check — no hard-coded or
      privileged path in the runner.
- [ ] The Node-type-stripping-versus-`tsx` decision is recorded with its reason.
- [ ] No kommun, skola, nyckeltal or data source is referenced anywhere in this task's output,
      including the throwaway validator.
- [ ] `git status` is clean; no artefact of the throwaway proof survives.
- [ ] E01, E02 and E09 can each register a validator by adding one npm script and one registry entry,
      with no change to the runner.
