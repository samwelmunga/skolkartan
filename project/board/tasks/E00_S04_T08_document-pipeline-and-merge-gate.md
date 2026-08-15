---
id: E00_S04_T08
title: Document the pipeline and the merge gate in docs/ci-checks.md
status: Pending
story_id: E00_S04
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S04_T01
  - E00_S04_T05
---

# Task: Document the pipeline and the merge gate in docs/ci-checks.md

## Description

`docs/ci-checks.md` already exists — S03 created it to document the check descriptor, the two-step
registration procedure, the fail-slow behaviour and the rule that `.github/workflows/` is not to be
edited to add a check. This task **extends** that file with a section on the pipeline and the gate.
Do not restructure or rewrite what S03 wrote; append.

The audience is a future maintainer, or a future Epic's developer, who has just had a merge blocked
and wants to know why and what to do about it.

### The section to add

Append a section titled **"The pipeline and the merge gate"** covering, in this order:

1. **Where it lives** — `.github/workflows/ci.yml`, one job named `checks`, triggered on pushes to
   `main` and pull requests targeting `main`.

2. **What it does** — checkout, Node from `.nvmrc` with npm caching, `npm ci`, then `npm run ci`.
   State the Node version comes from `.nvmrc` and that this is the only place it is declared.

3. **Why it is deliberately dumb** — the workflow has exactly one step that executes project checks
   and contains no list of individual checks. State plainly: **the workflow file is not the place to
   add a check.** Adding a check means one npm script and one entry in `scripts/ci/checks.ts`, and
   cross-reference the registration procedure S03 already documented above in the same file. Give
   the reason: three Epics each editing the workflow would make it the place merge conflicts live
   and let each Epic invent its own step layout.

4. **`npm ci`, not `npm install`** — a lockfile that has drifted from `package.json` is a defect
   worth failing on, not something CI should quietly repair.

5. **Local parity** — `npm run ci` is the same entry point locally and in CI. Any red pipeline is
   reproducible locally without pushing. If it is not, that is a bug worth reporting rather than a
   quirk to live with.

6. **The merge gate** — that `checks` is a required status check on `main`, that this is a GitHub
   repository setting rather than a file, and therefore that it does not travel with a fork or a
   clone and has to be re-applied if the repository is ever recreated. Record the actual settings as
   configured in T05: required context `checks`, strict (branches must be up to date), the
   `enforce_admins` choice and the review-requirement choice, each with the reason the user gave.

7. **What to do when the gate blocks you** — run `npm run ci` locally, read the summary, fix the
   named check, push again. Note that checks are fail-slow so the summary lists every failure at
   once, not just the first.

8. **No secrets** — the pipeline runs on a clean clone with no configured secrets. A later Epic
   needing a credential adds it with its own story.

### Constraints

- Every statement must describe the pipeline **as it actually is** at the time of writing. Verify
  each claim against `.github/workflows/ci.yml` and against the protection settings read back in
  T05. A document describing an intended configuration is worse than none.
- No kommun, skola, nyckeltal or data source may be referenced. The worked example S03 already
  includes for `E01_S01`'s `validate:kallor` entry is S03's, is already on the page, and is not to be
  expanded on here.
- Keep it short. This is a reference section, not an essay.

### Delivery route

Branch protection is live by the time this task runs, so `main` cannot be pushed to directly. Deliver
this change as its own pull request off a branch (for example `docs-ci-pipeline`), let the `checks`
run go green, and merge through the gate. That merge is itself a small piece of evidence: the first
ordinary change to land through the gate rather than around it. Record the PR URL.

## Acceptance Criteria

- [ ] `docs/ci-checks.md` contains a new section covering all eight points listed above.
- [ ] S03's existing content in the file is unmodified — the change is purely additive, verifiable
      from the diff.
- [ ] The section states explicitly that the workflow file is not the place to add a check, and
      points to the registration procedure documented earlier in the same file.
- [ ] The documented branch protection settings match the actual settings read back via
      `gh api repos/{owner}/{repo}/branches/main/protection` in T05.
- [ ] The section notes that branch protection is a repository setting and does not travel with a
      clone or fork.
- [ ] Every command named in the section has been run and behaves as described.
- [ ] The change is delivered through a pull request that passes `checks` and is merged through the
      gate; the PR URL is recorded.
- [ ] No kommun, skola, nyckeltal or data source is referenced in the added content.

## Definition of Done

- [ ] All acceptance criteria are met and `npm run ci` passes on the branch.
- [ ] The added section describes the configuration as it actually is, each claim verified against
      the workflow file or the protection API response rather than from memory.
- [ ] The pull request was merged through the gate, not by bypassing it.
- [ ] `docs/index.md` is **not** edited here — S05 owns the documentation index and its page table.
