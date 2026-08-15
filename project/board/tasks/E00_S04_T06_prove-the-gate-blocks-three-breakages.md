---
id: E00_S04_T06
title: Prove the gate blocks all three deliberate breakages
status: Pending
story_id: E00_S04
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S04_T03
  - E00_S04_T05
---

# Task: Prove the gate blocks all three deliberate breakages

## Description

This is the task the Epic's Definition of Done points at: *"a deliberately broken commit is
demonstrated to fail the pipeline"*. Demonstrated, not asserted. The story goes further and requires
three separate breakages, because they fail through three different checks and a gate that catches
one does not necessarily catch the others.

Use the recipes recorded by T03 in `project/rapports/analysis/E00_S04_breakage-recipes.md` verbatim.
Do not invent new breakages here — the point of T03 was to make this task deterministic.

### Setup

Create one throwaway branch off current `main` and open a pull request against `main`:

```
git switch -c ci-gate-demo
git push -u origin ci-gate-demo
gh pr create --base main --head ci-gate-demo --title "CI gate demonstration" \
  --body "Throwaway branch proving the merge gate blocks. To be deleted."
```

Keep **one** pull request open for all three demonstrations, applying and reverting each breakage in
turn as successive commits. One PR keeps the evidence in a single timeline and makes the
mergeability transitions legible.

### The three demonstrations

For each of Recipe 1 (type error), Recipe 2 (lint violation) and Recipe 3 (failing test), in order:

1. Apply the recipe from the T03 file. Commit and push to `ci-gate-demo`.
2. Wait for the run and capture its outcome and URL:
   ```
   gh run list --branch ci-gate-demo --limit 3
   gh run view <id> --json conclusion,url,jobs
   ```
   The conclusion must be `failure`.
3. Confirm from the job log that the **expected check** reported FAIL and that the other checks
   still ran and reported — the runner is fail-slow, so a run that stops at the first failure is
   itself a defect and must be raised against S03 rather than accepted.
   - Recipe 1 → `typecheck` FAIL **and** `build` FAIL.
   - Recipe 2 → `lint` FAIL, others PASS.
   - Recipe 3 → `test` FAIL, others PASS.
4. Confirm the pull request is **not mergeable** while the check is red:
   ```
   gh pr view --json mergeable,mergeStateStatus,statusCheckRollup
   ```
   `mergeStateStatus` must report a blocked state (`BLOCKED` or `UNSTABLE` depending on the
   configuration) and the `checks` context must appear in `statusCheckRollup` with a failing
   conclusion. Capture the raw JSON.
5. Additionally confirm in the GitHub UI that the merge button is disabled, and capture that
   observation. The API field and the UI can disagree if the protection rule is misconfigured, and
   the UI is what a human would actually rely on.
6. Revert the recipe, commit and push. Confirm the run goes green and
   `gh pr view --json mergeable` reports the PR mergeable again. This green-again step is not
   optional decoration: it proves the block was caused by the breakage and not by some unrelated
   permanent obstruction.

### Cross-check against local behaviour

For each demonstration, compare the CI failure against the local `npm run ci` output captured in
T03. The failing check id, and the reason it failed, must match. Any divergence between local and CI
is a finding that must be written up, not smoothed over — S03 promised parity and this is where that
promise is tested.

### Evidence

Record in the story's rapport, per demonstration: the recipe used, the commit SHA, the run URL, the
run conclusion, the per-check PASS/FAIL summary, the `gh pr view` JSON showing non-mergeability, the
UI observation, and the run URL of the subsequent green run after reverting.

### Leave the branch in place

Do **not** delete `ci-gate-demo` at the end of this task. T09 owns cleanup and does it once, after
T07 has also finished with its own branch, so that all evidence is collected before anything is
removed.

### Constraint

Every breakage is generic. No kommun, skola, nyckeltal or data source may appear in any commit on
this branch, including commit messages.

## Acceptance Criteria

- [ ] A throwaway branch `ci-gate-demo` exists with one open pull request targeting `main`.
- [ ] Recipe 1 pushed: the run concludes `failure` with `typecheck` FAIL and `build` FAIL, the run
      URL is captured, and the other checks are shown to have still run.
- [ ] Recipe 2 pushed: the run concludes `failure` with `lint` FAIL and `typecheck`, `test` and
      `build` PASS; run URL captured.
- [ ] Recipe 3 pushed: the run concludes `failure` with `test` FAIL and `lint`, `typecheck` and
      `build` PASS; run URL captured.
- [ ] For each of the three, `gh pr view --json mergeable,mergeStateStatus,statusCheckRollup` shows
      the pull request **not mergeable** while the check is red, and the raw JSON is captured.
- [ ] For each of the three, the merge button is observed disabled in the GitHub UI and the
      observation is recorded.
- [ ] For each of the three, reverting the breakage produces a green run and the pull request
      becomes mergeable again; both are captured.
- [ ] Each CI failure is cross-checked against the corresponding local `npm run ci` failure from
      T03, and the failing check id matches.
- [ ] `main` is untouched throughout — no breakage is ever committed to `main`.
- [ ] No commit, branch name or commit message on the demo branch references a kommun, skola,
      nyckeltal or data source.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] Evidence for all three demonstrations — run URLs, per-check summaries and the mergeability
      JSON — is recorded in the story's rapport, not merely asserted.
- [ ] Any divergence between local and CI behaviour is written up as a finding against S03 rather
      than worked around.
- [ ] The pull request is left open and the branch left in place for T09 to clean up.
- [ ] The gate has been shown to **block**, which is a stronger statement than the pipeline having
      been shown to fail; both are evidenced separately.
