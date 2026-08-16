---
id: E00_S04_T01
title: CI workflow, remote, and the first green run on main
status: Pending
story_id: E00_S04
epic_id: E00
date_created: 2026-08-16
date_started: null
date_completed: null
depends_on:
  - E00_S03_T01
needs_docs: false
---

# Task: CI workflow, remote, and the first green run on main

## Description

Connect the check registry built in `E00_S03_T01` to GitHub and get one green run on `main`.

**The GitHub repository already exists**: `https://github.com/samwelmunga/skolkartan.git` — public,
default branch `main`. It is not yet configured as a local remote. The `gh` CLI is installed and
authenticated as `samwelmunga` with `repo` and `workflow` scopes.

The user has decided deliberately that `project/` stays public. Do not add it to `.gitignore`.

### 1. Add the remote

```
git remote add origin https://github.com/samwelmunga/skolkartan.git
```

Then confirm with `git remote -v`. Check whether the remote has any commits — if it is non-empty and
has diverged from local `main`, **stop and ask** rather than forcing anything.

### 2. Confirm Actions is enabled

Verify with `gh api repos/samwelmunga/skolkartan/actions/permissions` that Actions is enabled. If it
is disabled at account or organisation level, write an instructions file and stop — do not guess.

### 3. Write `.github/workflows/ci.yml`

One job named `checks`. The job name matters: branch protection will reference it by exactly this
string.

- **Triggers**: `push` to `main`, and `pull_request` targeting `main`.
- **Concurrency**: grouped by ref with `cancel-in-progress: true`.
- **Steps**: checkout → `actions/setup-node` with `node-version-file: .nvmrc` and `cache: npm` →
  `npm ci` → `npm run ci`.
- **`timeout-minutes`** set on the job.
- **No secrets.** Must run to completion on a clean clone with none configured.

**Exactly one execution step: `npm run ci`.** The workflow must not list `lint`, `typecheck`, `test`
or `build`. Those words appear nowhere in the file. That is the entire point of `E00_S03` — later
Epics add checks by appending to `scripts/ci/checks.ts` and this file never changes.

`npm ci`, not `npm install`. Lockfile drift is a defect worth failing on, not something to repair
silently.

### 4. Push and observe

Push `main` and watch the run with `gh run watch` or `gh run list`. It must go green. Record the run
URL in the commit message.

If it fails, fix the cause. A red first run is not "done with a caveat".

### 5. Document

Extend `docs/ci-checks.md` with a short section on the pipeline: what triggers it, that the workflow
has one step, and that adding a check means editing the registry rather than the workflow.

## Acceptance Criteria

- [ ] `origin` points at `https://github.com/samwelmunga/skolkartan.git` and `git remote -v` confirms it.
- [ ] Actions is confirmed enabled via the GitHub API, not assumed.
- [ ] `.github/workflows/ci.yml` exists with a single job named `checks` running checkout, Node setup
      from `.nvmrc` with npm caching, `npm ci`, and `npm run ci`.
- [ ] The workflow triggers on `push` to `main` and `pull_request` targeting `main`.
- [ ] The strings `lint`, `typecheck`, `test` and `build` appear nowhere in the workflow file.
- [ ] Concurrency is grouped by ref with `cancel-in-progress: true`.
- [ ] `timeout-minutes` is set on the job.
- [ ] The workflow runs green on `main` and the run URL is recorded.
- [ ] `docs/ci-checks.md` has a section describing the pipeline and the do-not-edit-the-workflow rule.
- [ ] The workflow needs no secrets.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] `npm run ci` behaves identically locally and in the pipeline.
- [ ] No kommun, skola, nyckeltal or data source is referenced in this task's output.
- [ ] `project/` remains tracked — the user chose public deliberately.
- [ ] The user has been handed `project/board/tasks/E00_S04_T02_INSTRUCTIONS.md` for branch
      protection, which can only be configured after this task's run reports the `checks` job.
