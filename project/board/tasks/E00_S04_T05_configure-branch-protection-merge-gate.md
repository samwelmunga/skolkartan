---
id: E00_S04_T05
title: Configure branch protection so a red run blocks the merge
status: Pending
story_id: E00_S04
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S04_T04
---

# Task: Configure branch protection so a red run blocks the merge

## Description

A workflow that runs is not a gate. Until the `checks` job is a **required status check** on `main`,
a red run is a status light nobody is obliged to look at. This task turns the light into a lock.

Branch protection is a GitHub repository setting, not a file in the repository, so nothing in this
task is committed. That is exactly why it is easy to forget and exactly why it gets its own task.

### This is a user action — do not perform it yourself

Configuring branch protection changes how the user's own repository behaves for everyone including
themselves, and the strictness options involved (whether the owner can bypass, whether linear
history is required) are the user's call. Do **not** apply protection rules via `gh api` on the
user's behalf.

A companion instructions file, `project/board/tasks/E00_S04_T05_INSTRUCTIONS.md`, gives the exact
steps. Surface it to the user and wait.

### The one string that matters

The required status check must be named exactly as the job reported in T04 — `checks`. T04 recorded
that string verbatim from the run; pass it to the user rather than letting them retype it from
memory. A required check whose name does not match any reported context is worse than no protection:
GitHub shows the branch as "waiting for status to be reported" and the merge button stays blocked
for a reason unrelated to the actual checks, which is a confusing failure that takes a while to
diagnose.

### Your part

1. Present the instructions file, with the recorded job name string filled in.
2. Once the user reports back, verify rather than trust:
   ```
   gh api repos/{owner}/{repo}/branches/main/protection
   ```
   Confirm from the response that:
   - `required_status_checks.contexts` (or `checks[].context`) contains `checks`.
   - `required_status_checks.strict` is `true` — branches must be up to date with `main` before
     merging.
   - `required_pull_request_reviews` is present, or the user has consciously declined it. This is a
     single-maintainer personal research tool, so requiring a second reviewer would block the only
     person able to review. Record whichever way the user decided and why.
   - `enforce_admins` is set as the user chose, and the choice is recorded.
   - Direct pushes to `main` are restricted so the gate cannot be bypassed by pushing straight to
     the branch.
3. Record the full protection response in the story's rapport.

### Do not prove the gate here

This task configures the gate. **T06 proves it blocks.** Do not mark this task complete on the basis
of the settings looking right — settings that look right and do not block are precisely the failure
mode this story exists to rule out.

### Consequence for the rest of the story

Once protection is on, `main` can no longer be pushed to directly. Every subsequent change in this
story — including T08's documentation edit — goes through a pull request. That is not friction to
work around; it is the gate working, and it doubles as further evidence.

## Acceptance Criteria

- [ ] `project/board/tasks/E00_S04_T05_INSTRUCTIONS.md` has been surfaced to the user with the exact
      job name string from T04 filled in.
- [ ] `gh api repos/{owner}/{repo}/branches/main/protection` returns a protection rule for `main`.
- [ ] The required status checks list contains exactly the context `checks`, matching the job name
      recorded in T04 character for character.
- [ ] `required_status_checks.strict` is `true`.
- [ ] Direct pushes to `main` are restricted; an attempted direct push to `main` is rejected, and
      the rejection message is captured.
- [ ] The `enforce_admins` setting and the pull-request-review-requirement decision are both
      recorded with the user's stated reason.
- [ ] The full protection API response is recorded in the story's rapport.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] The user has explicitly confirmed the protection settings are the ones they intend.
- [ ] No repository file is created or modified by this task other than the rapport record.
- [ ] It is understood and stated in the rapport that this task configures the gate and does not
      prove it — T06 owns the proof.
