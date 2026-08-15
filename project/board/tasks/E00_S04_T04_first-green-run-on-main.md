---
id: E00_S04_T04
title: Push the workflow and observe the first green run on main
status: Pending
story_id: E00_S04
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S04_T01
  - E00_S04_T02
---

# Task: Push the workflow and observe the first green run on main

## Description

Bring the workflow file from T01 together with the remote from T02 and get the first green run on
`main`. This is the moment the pipeline stops being a file and starts being a pipeline.

This must happen **before** branch protection is configured (T05), for a practical reason: GitHub's
required-status-checks picker only offers check contexts it has actually seen report on the
repository within the last week. Configuring protection before the first run means typing the check
name blind and discovering the typo later, when a red run mysteriously fails to block anything.

### Procedure

1. Confirm the working tree is clean and `npm run ci` passes locally. A red local run pushed to a
   fresh pipeline makes the first remote result uninterpretable.
2. Confirm `package-lock.json` is committed and in sync with `package.json`. The workflow uses
   `npm ci`, which fails outright on a drifted lockfile — and that failure looks nothing like a
   check failure, so rule it out first.
3. Push `main` to the remote:
   ```
   git push -u origin main
   ```
4. Observe the run:
   ```
   gh run list --workflow=ci.yml --limit 5
   gh run watch
   ```
5. When it completes, capture the outcome and the run URL:
   ```
   gh run view --json databaseId,displayTitle,conclusion,url,jobs
   ```

### What "green" has to mean here

A green tick is not enough on its own. Confirm from the run log that:

- The job that ran is named **`checks`** — this exact string is what T05 will require. Record it
  verbatim, including case.
- `actions/setup-node` resolved the Node version **from `.nvmrc`**; the log states the version it
  selected. It must be 24.18.0. A workflow that silently fell back to the runner's default Node is a
  latent difference between local and CI.
- `npm ci` ran, not `npm install`.
- `npm run ci` executed and its summary lists **all four** base checks — `lint`, `typecheck`,
  `test`, `build` — each reported PASS with an owner of `E00`.
- Total job duration is comfortably under the 15-minute `timeout-minutes`.

### Concurrency spot-check

The story requires that a superseded run on the same ref is cancelled. Prove it rather than trusting
the YAML: push two commits to a branch in quick succession (an empty commit via
`git commit --allow-empty` is fine for the second), then confirm with `gh run list` that the earlier
run's conclusion is `cancelled` and the later one ran to completion. Delete that branch afterwards.

Use a throwaway branch for this, not `main` — a cancelled run on `main` in the repository's history
is noise, and after T05 lands, direct pushes to `main` are restricted anyway.

### Recording

Record in the story's rapport: the run URL, the exact job name string, the resolved Node version,
the four check results, the job duration, and the concurrency spot-check evidence.

## Acceptance Criteria

- [ ] `npm run ci` passes locally and `git status` is clean immediately before the push.
- [ ] `main` is pushed to the GitHub remote established in T02 and tracks it.
- [ ] A workflow run is triggered automatically by the push — no manual dispatch.
- [ ] The run concludes `success`, and the run URL is recorded.
- [ ] The job name in the run is exactly `checks`, recorded verbatim.
- [ ] The run log shows Node 24.18.0 resolved from `.nvmrc` by `actions/setup-node`.
- [ ] The run log shows `npm ci` executing, and `npm run ci` reporting all four base checks PASS.
- [ ] Job duration is recorded and is under `timeout-minutes`.
- [ ] Two rapid pushes to a throwaway branch produce one `cancelled` run and one completed run,
      evidencing `cancel-in-progress`; that branch is then deleted.
- [ ] The workflow completed with no configured secrets.

## Definition of Done

- [ ] All acceptance criteria are met and `main` is green.
- [ ] The run URL, job name, resolved Node version and check results are recorded in the story's
      rapport rather than asserted.
- [ ] The concurrency throwaway branch is deleted both locally and on the remote.
- [ ] Branch protection has **not** been touched by this task — it belongs to T05.
- [ ] `main` contains no deliberate breakage of any kind at the end of this task.
