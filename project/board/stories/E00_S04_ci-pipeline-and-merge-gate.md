---
id: E00_S04
title: CI pipeline and merge gate
status: Pending
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
tasks:
  - E00_S04_T01
  - E00_S04_T02
depends_on:
  - E00_S03
docs: ["docs/ci-checks.md"]
---

# Story: CI pipeline and merge gate

**ID**: E00_S04
**Epic**: E00 — Project Foundation
**Status**: Pending
**Date Added**: 2026-08-15
**Wave**: 4 — needs the check registry and `npm run ci` from S03. Transitively needs S01 and S02.

## User Story

As the maintainer of Skolkartan, I want every push and pull request to run the full check suite and
a failing run to actually block the merge, so that a rule the project agreed on cannot be bypassed
by forgetting to run it.

## Description

S03 built the machinery. This story connects it to the repository and then **proves it blocks** —
because a pipeline that runs but does not gate is a status light nobody has tested.

### The workflow

`.github/workflows/ci.yml`, one job named `checks`:

- **Triggers**: `push` to `main`, and `pull_request` targeting `main`.
- **Concurrency**: grouped by ref with `cancel-in-progress: true`, so a second push supersedes the
  first run instead of queueing behind it.
- **Steps**: checkout → `actions/setup-node` with `node-version-file: .nvmrc` and `cache: npm` →
  `npm ci` → `npm run ci`.
- **`timeout-minutes`** set on the job so a hung check cannot burn the runner budget.
- **No secrets.** The workflow must run to completion on a clean clone with no configured secrets.
  A later Epic that needs a credential adds it then, with its own story.

### Deliberately stupid — decision made

The workflow contains **exactly one execution step**: `npm run ci`. It does not list lint,
typecheck, test and build. It does not know how many checks exist. This is the whole point of S03:
E01, E02 and E09 add checks by appending to `scripts/ci/checks.ts`, and this file never changes.

`node-version-file: .nvmrc` rather than a hard-coded version, for the same reason — one place
states the Node version.

`npm ci`, not `npm install`. If `package-lock.json` has drifted from `package.json`, that is a
defect worth failing on, not something CI should quietly repair.

### Proving it blocks

The Epic requires a deliberately broken commit to be demonstrated failing the pipeline. That is
carried out concretely, on a throwaway branch with a pull request open against `main`, with **three
separate breakages proven one at a time**, because they fail through three different checks:

1. A type error — must fail via `typecheck` (and `build`).
2. A lint violation — must fail via `lint`.
3. A failing assertion in the example test — must fail via `test`.

For each: the run is observed red, the pull request is observed as not mergeable, and the run URL
or console output is recorded in the story's rapport. The branch is deleted afterwards.

A fourth demonstration re-runs S03's throwaway example validator through the real pipeline: register
it, break it, observe the pipeline red with the other four checks still reported, then remove it.
This closes the loop on the extension mechanism — S03 proved it locally, S04 proves it in the gate.

### The gate itself

Running the workflow is not the same as blocking a merge. The `checks` job must be a **required
status check** on `main`, which is a GitHub repository setting, not a file in the repository.

## Prerequisites

These require action by the user and cannot be performed by an agent. They must be completed before
this story can be finished:

- [ ] **A GitHub remote must exist.** The repository is currently a local git repository; confirm
      or create the GitHub remote the workflow will run on.
- [ ] **GitHub Actions must be enabled** for the repository.
- [ ] **Branch protection on `main`** must be configured with the `checks` job set as a required
      status check, and direct pushes to `main` restricted so the gate cannot be bypassed.

The developer picking up this story must write an instructions file covering these three items and
must not mark the story complete on the basis of a green run alone — the gate has to be shown to
block.

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` exists with a single job that runs checkout, Node setup from
      `.nvmrc` with npm caching, `npm ci`, and `npm run ci`.
- [ ] The workflow triggers on `push` to `main` and on `pull_request` targeting `main`.
- [ ] The workflow file contains **no list of individual checks** — `lint`, `typecheck`, `test` and
      `build` appear nowhere in it.
- [ ] Concurrency is configured so a superseded run on the same ref is cancelled.
- [ ] `timeout-minutes` is set on the job.
- [ ] The workflow completes green on the current clean `main`.
- [ ] A commit containing a deliberate **type error** is pushed to a branch and the pipeline is
      observed failing on `typecheck`.
- [ ] A commit containing a deliberate **lint violation** is pushed and the pipeline is observed
      failing on `lint`.
- [ ] A commit containing a deliberately **failing test** is pushed and the pipeline is observed
      failing on `test`.
- [ ] For each of those three, the open pull request is observed as **not mergeable** while the
      check is red.
- [ ] The throwaway example validator from S03 is registered, broken, observed failing the
      pipeline while the other four checks still report, and then removed.
- [ ] The throwaway branch is deleted and `main` is left with no trace of any deliberate breakage.
- [ ] `npm run ci` run locally reproduces each of the three failures without needing to push.

## Definition of Done

- [ ] All acceptance criteria are met and the pipeline is green on `main`.
- [ ] All three prerequisites above are confirmed complete by the user.
- [ ] Evidence of each blocking demonstration — run URL or captured output — is recorded in the
      story's rapport, not merely asserted.
- [ ] `docs/ci-checks.md` is extended with a short section describing the pipeline, the merge gate,
      and the fact that the workflow file is not the place to add a check.
- [ ] The workflow needs no secrets and runs on a clean clone.
- [ ] No kommun, skola, nyckeltal or data source is referenced anywhere in this story's output,
      including the deliberate breakages used for the demonstrations.
- [ ] `E01_S01` can satisfy "registered in CI through the E00 validator hook and blocks a merge on
      failure" by appending one registry entry, with no change to `.github/workflows/ci.yml`.
