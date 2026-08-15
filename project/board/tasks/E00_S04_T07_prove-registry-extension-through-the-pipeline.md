---
id: E00_S04_T07
title: Prove the check registry extends through the real pipeline
status: Pending
story_id: E00_S04
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S04_T04
---

# Task: Prove the check registry extends through the real pipeline

## Description

S03 proved the extension mechanism **locally**: a throwaway validator was registered, shown to pass,
shown to fail the run when broken, and removed. That split was intentional — a mechanism that only
works when a CI provider is present is a mechanism nobody can debug.

This task closes the loop by running the same proof **through the real pipeline**. It is the concrete
evidence behind the story's final Definition-of-Done item: that `E01_S01` can satisfy *"registered in
CI through the E00 validator hook and blocks a merge on failure"* by appending one registry entry,
with **no change to `.github/workflows/ci.yml`**.

If this task cannot be completed without editing the workflow file, the whole design has failed and
S03 or S04 must be amended — not worked around.

### Use a separate branch

Work on `ci-registry-demo`, branched off current `main`, with its own pull request against `main`.
Keep it distinct from T06's `ci-gate-demo` branch so the two lines of evidence do not interleave and
so the two tasks can proceed independently.

```
git switch -c ci-registry-demo
git push -u origin ci-registry-demo
gh pr create --base main --head ci-registry-demo --title "CI registry extension demonstration" \
  --body "Throwaway branch proving a fifth check registers without touching .github/. To be deleted."
```

### The proof, in four pushes

**Push 1 — register and pass.** Recreate S03's throwaway validator:

1. Add `scripts/ci/example-validator.ts` — trivial and entirely domain-free. S03's suggestion stands:
   assert that no file under `docs/` is zero bytes. Exit non-zero with a clear message on violation.
2. Add the `validate:example` script to `package.json`.
3. Append one entry to `scripts/ci/checks.ts` with `owner: "E00-throwaway"`.

That is the entire registration: **one npm script, one array entry, nothing else.** Push and confirm
the pipeline reports **five** checks, all PASS, run concludes `success`.

**Push 2 — break it and observe red.** Violate the condition the validator asserts — for example
create a zero-byte file under `docs/`. Push. Confirm:

- The run concludes `failure`.
- The summary reports `validate:example` (owner `E00-throwaway`) as FAIL.
- **All four base checks still ran and still reported PASS.** This is the important half. A runner
  that aborts on the new check would mean later Epics' validators can mask the base checks, and that
  would be a defect in S03's fail-slow behaviour.
- The failing check's output is reproduced in full in the log; passing checks' output is not.

**Push 3 — confirm it gates.** With the run red, confirm the pull request is not mergeable:

```
gh pr view --json mergeable,mergeStateStatus,statusCheckRollup
```

This is what makes the E01 promise real: a check registered by appending one line genuinely blocks a
merge. Capture the JSON.

**Push 4 — remove it cleanly.** Delete `scripts/ci/example-validator.ts`, the `validate:example`
script, the registry entry and the zero-byte file. Push. Confirm the run is green, reports exactly
**four** checks, and that the pull request is mergeable again.

### The no-workflow-change assertion

At the end, prove the workflow file was never touched:

```
git diff main...ci-registry-demo -- .github/
```

This must produce **no output**. Capture that. It is the single most important piece of evidence in
this task.

### Removal sweep

After push 4, searching the branch for `validate:example` and `example-validator` must return no
hits outside the board and rapport records. The registry must contain exactly the four base entries.

### Leave the branch in place

Do **not** delete `ci-registry-demo`. T09 owns cleanup.

### Constraint

The throwaway validator must assert something entirely generic. No kommun, skola, nyckeltal or data
source may appear in it, in the zero-byte fixture file's name, or in any commit message.

## Acceptance Criteria

- [ ] A throwaway branch `ci-registry-demo` exists with its own open pull request targeting `main`.
- [ ] `scripts/ci/example-validator.ts`, the `validate:example` script and one registry entry with
      `owner: "E00-throwaway"` are added — and nothing else is added to register the check.
- [ ] The first run reports **five** checks, all PASS, and concludes `success`; run URL captured.
- [ ] With the validator's condition broken, the run concludes `failure`, reports
      `validate:example` as FAIL, and shows all four base checks still ran and reported PASS; run
      URL captured.
- [ ] The failing check's output appears in full in the run log; passing checks' output does not.
- [ ] `gh pr view --json mergeable,mergeStateStatus,statusCheckRollup` shows the pull request not
      mergeable while the fifth check is red; raw JSON captured.
- [ ] After removal, the run is green, reports exactly **four** checks, and the pull request is
      mergeable again; run URL captured.
- [ ] `git diff main...ci-registry-demo -- .github/` produces no output, proving the workflow file
      was never modified.
- [ ] Searching the branch for `validate:example` and `example-validator` returns no hits outside
      board and rapport records.
- [ ] The throwaway validator references no kommun, skola, nyckeltal or data source.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] All four pushes' run URLs and per-check summaries are recorded in the story's rapport.
- [ ] The empty `.github/` diff is recorded as the explicit evidence that `E01_S01` can register
      `npm run validate:kallor` by appending one entry and changing nothing in
      `.github/workflows/ci.yml`.
- [ ] If the registration required any change beyond one npm script and one registry entry, that is
      raised as an amendment against S03 rather than absorbed silently.
- [ ] The branch and pull request are left in place for T09 to clean up.
