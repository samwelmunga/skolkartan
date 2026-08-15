---
id: E00_S04_T09
title: Clean up the demonstrations and close out the story
status: Pending
story_id: E00_S04
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S04_T06
  - E00_S04_T07
  - E00_S04_T08
---

# Task: Clean up the demonstrations and close out the story

## Description

T06 and T07 deliberately broke the build five separate times across two throwaway branches. This
task removes every trace of that from the repository and then performs the story's closing
verification.

Cleanup is a single task, done once, after **all** evidence has been gathered — which is why T06 and
T07 were each told to leave their branch in place rather than tidying up after themselves. Deleting
a branch before its run URLs have been recorded loses the evidence, since run logs are reachable but
far less legible once the branch is gone.

### Cleanup

1. Close both demonstration pull requests **without merging**:
   ```
   gh pr close <pr-number> --delete-branch
   ```
   for the `ci-gate-demo` PR and the `ci-registry-demo` PR. Neither branch may ever be merged into
   `main`.
2. Confirm both branches are gone locally and remotely:
   ```
   git branch -a --list '*ci-gate-demo*' '*ci-registry-demo*'
   git ls-remote --heads origin
   ```
   Also confirm the concurrency spot-check branch from T04 is gone.
3. Confirm `main`'s history contains no deliberate breakage:
   ```
   git log --oneline main
   git log -p main -- src/ scripts/ | grep -Ei 'deliberate|E00-throwaway|validate:example|example-validator'
   ```
   The search must return nothing. If any breakage commit reached `main`, that is a serious finding —
   stop and report it rather than rewriting history unilaterally.
4. Confirm the working tree is clean and `main` is in sync with the remote.

### Closing verification

Walk through and confirm each of the following against the actual repository, recording the outcome
of each rather than asserting it in aggregate:

- `npm run ci` passes locally on a clean checkout of `main`.
- The latest workflow run on `main` concludes `success`; record the run URL.
- The `checks` job is still listed as a required status check on `main`
  (`gh api repos/{owner}/{repo}/branches/main/protection`) — confirm it was not disturbed by any of
  the demonstration work.
- `grep -Eio 'lint|typecheck|test|build' .github/workflows/ci.yml` still produces no output.
- `scripts/ci/checks.ts` contains exactly the four base entries, all with `owner: "E00"`.
- The story's three user-action prerequisites are all confirmed complete: the GitHub remote exists
  (T02), Actions is enabled (T02), and branch protection requires the `checks` job with direct
  pushes to `main` restricted (T05).

### Evidence consolidation

The story's Definition of Done requires evidence of each blocking demonstration to be recorded in the
story's rapport, not merely asserted. Consolidate T03, T04, T06 and T07's captured output into a
single rapport at `project/rapports/analysis/E00_S04_merge-gate-evidence.md` containing, as a table:
each demonstration, the check it was meant to fail, the run URL, the observed conclusion, and the
observed mergeability state. A reader must be able to click through and verify without reading four
separate task records.

### Domain-leakage sweep

Confirm no file created or modified by this story — `.github/workflows/ci.yml`, the addition to
`docs/ci-checks.md`, and the now-removed demonstration content — references a kommun, skola,
nyckeltal or data source. Note that E00's board and rapport files themselves are exempt: they
necessarily discuss the constraint in order to state it.

### What this task does not do

It does not run E00's full eight-item Definition-of-Done sweep — S05 owns that and closes the Epic.
Limit this to the S04 items above.

## Acceptance Criteria

- [ ] Both demonstration pull requests are closed without merging, and both branches are deleted
      locally and remotely.
- [ ] The T04 concurrency spot-check branch is confirmed deleted.
- [ ] `main`'s history contains no deliberate breakage, evidenced by the history search returning
      nothing.
- [ ] `npm run ci` passes on a clean checkout of `main`.
- [ ] The latest workflow run on `main` concludes `success`, and the run URL is recorded.
- [ ] Branch protection still requires the `checks` context on `main`, confirmed by reading back the
      protection API response after all demonstration work.
- [ ] `grep -Eio 'lint|typecheck|test|build' .github/workflows/ci.yml` produces no output.
- [ ] `scripts/ci/checks.ts` contains exactly four entries, all with `owner: "E00"`, and no trace of
      `validate:example` or `example-validator` remains outside board and rapport records.
- [ ] All three user-action prerequisites are confirmed complete and recorded as such.
- [ ] `project/rapports/analysis/E00_S04_merge-gate-evidence.md` exists with the consolidated
      evidence table covering all five demonstrations — three breakages plus the registry
      registration and its breakage.
- [ ] No file produced by this story references a kommun, skola, nyckeltal or data source.

## Definition of Done

- [ ] All acceptance criteria are met and `main` is green.
- [ ] Every closing-verification item above is recorded individually with its outcome, not confirmed
      in aggregate.
- [ ] The consolidated evidence rapport lets a reader verify each demonstration from run URLs alone.
- [ ] The story is not marked complete on the basis of a green run — the gate has been shown to
      block, and that evidence is linked from the rapport.
- [ ] Any finding raised against S03 by T06 or T07 is carried forward explicitly rather than closed
      out here.
