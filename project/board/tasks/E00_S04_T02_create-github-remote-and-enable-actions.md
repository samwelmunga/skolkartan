---
id: E00_S04_T02
title: Create the GitHub remote and enable Actions
status: Pending
story_id: E00_S04
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on: []
---

# Task: Create the GitHub remote and enable Actions

## Description

The repository is a local git repository on branch `main` with **no remote configured** — verified
at planning time with `git remote -v`, which returned nothing. Nothing in this story's remaining
work can happen until a GitHub remote exists and Actions is enabled on it.

### This is a user action — do not perform it yourself

Creating the remote requires decisions that are not the agent's to make: the repository name, the
owning account or organisation, and public versus private visibility. Do **not** run
`gh repo create` on the user's behalf and do not guess a name.

A companion instructions file, `project/board/tasks/E00_S04_T02_INSTRUCTIONS.md`, spells out the
exact steps the user must take. Surface it to the user and wait. The `gh` CLI is installed
(v2.96.0) and authenticated as `samwelmunga` with `repo` and `workflow` token scopes, so the user
has a fast path available; the instructions cover both the CLI and the web UI.

### Your part

1. Present the instructions file to the user.
2. Once the user reports back, verify the outcome yourself rather than taking it on trust:
   - `git remote -v` names a remote (conventionally `origin`) pointing at a GitHub URL.
   - `gh repo view --json name,visibility,defaultBranchRef` succeeds and reports `main` as the
     default branch.
   - `gh api repos/{owner}/{repo}/actions/permissions` reports `"enabled": true`.
3. Record the resolved `owner/repo` slug and the visibility in the story's rapport. Every later task
   in this story refers back to that slug.

### Do not push yet

This task establishes the remote only. T04 owns the first push of `main` and the first workflow run.
Keeping them apart means that if the first run misbehaves, it is unambiguous whether the fault lies
in the remote setup or in the workflow file.

### If the remote already exists

If the user reports that a remote was already configured out of band, still run all three
verification commands. A remote that exists but has Actions disabled at the account or organisation
level produces a silent no-run that is easy to mistake for a passing pipeline.

## Acceptance Criteria

- [ ] `project/board/tasks/E00_S04_T02_INSTRUCTIONS.md` has been surfaced to the user.
- [ ] `git remote -v` returns a GitHub remote for both fetch and push.
- [ ] `gh repo view --json name,visibility,defaultBranchRef` succeeds and reports the default branch
      as `main`.
- [ ] `gh api repos/{owner}/{repo}/actions/permissions` returns `"enabled": true`.
- [ ] The resolved `owner/repo` slug and repository visibility are recorded in the story's rapport.
- [ ] No commit is pushed and no workflow run is triggered by this task.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] The user has explicitly confirmed the remote is the one they intend this project to live on.
- [ ] The verification command output is captured in the rapport, not merely asserted.
- [ ] No repository file is created or modified by this task other than the rapport record.
