---
id: E00_S04_T02
title: Prove the gate blocks a merge, then clean up
status: Pending
story_id: E00_S04
epic_id: E00
date_created: 2026-08-16
date_started: null
date_completed: null
depends_on:
  - E00_S04_T01
needs_docs: false
---

# Task: Prove the gate blocks a merge, then clean up

## Description

A pipeline that runs but does not gate is a status light nobody has tested. This task proves the red
run actually blocks the merge.

**Blocked on a user action.** Branch protection must be configured first — see
`project/board/tasks/E00_S04_T02_INSTRUCTIONS.md`. Do not start until the user confirms, then verify
with `gh api repos/samwelmunga/skolkartan/branches/main/protection` before doing anything else.

### The demonstration

One throwaway branch, one pull request against `main`.

1. Commit a deliberate **type error** — something plainly wrong, not a subtle edge case. Push it.
2. Observe the pipeline go red, and observe that it failed via `typecheck`.
3. Observe the pull request reported as **not mergeable** while the check is red
   (`gh pr view --json mergeable,mergeStateStatus`).
4. Record the run URL and the mergeability output.
5. Confirm `npm run ci` locally reproduces the same failure without needing to push.
6. Close the pull request and delete the branch.

The original story specified three separate breakages (type error, lint violation, failing test) plus
a fourth registry-extension proof. That was collapsed to one deliberately: the three breakages prove
the same thing about *gating* and differ only in which check catches them, and each check was already
verified locally in `E00_S02_T04` and `E00_S03_T01`. The epic's Definition of Done asks for "a
deliberately broken commit demonstrated failing the pipeline" — singular. If the single
demonstration reveals anything surprising about how the gate behaves, raise it rather than adding
demonstrations speculatively.

### Cleanup

`main` must be left with no trace of the breakage: no branch, no open pull request, no leftover file.
`git status` clean, `gh pr list` empty of this task's PR.

## Acceptance Criteria

- [ ] Branch protection is verified via the GitHub API before the demonstration begins, with
      `checks` present in `required_status_checks.contexts`.
- [ ] A commit containing a deliberate type error is pushed to a throwaway branch with a PR open
      against `main`.
- [ ] The pipeline is observed failing, and the failure is attributable to `typecheck`.
- [ ] The pull request is observed as **not mergeable** while the check is red, with the API output
      recorded.
- [ ] `npm run ci` locally reproduces the failure without pushing.
- [ ] The run URL and the mergeability output are recorded in the commit message.
- [ ] The pull request is closed and the throwaway branch is deleted.
- [ ] `main` contains no trace of the breakage and `git status` is clean.

## Definition of Done

- [ ] All acceptance criteria are met and the pipeline is green on `main`.
- [ ] Evidence is recorded — run URL and captured API output — rather than asserted.
- [ ] Whether the user chose to enforce protection on administrators is written down either way.
- [ ] No kommun, skola, nyckeltal or data source is referenced, including in the deliberate breakage.
- [ ] `E01_S01` can satisfy "registered in CI through the E00 validator hook and blocks a merge on
      failure" by appending one registry entry, with no change to `.github/workflows/ci.yml`.
