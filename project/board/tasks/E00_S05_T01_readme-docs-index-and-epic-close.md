---
id: E00_S05_T01
title: README, docs index, clean-clone check, and epic close
status: Pending
story_id: E00_S05
epic_id: E00
date_created: 2026-08-16
date_started: null
date_completed: null
depends_on:
  - E00_S04_T02
needs_docs: false
---

# Task: README, docs index, clean-clone check, and epic close

## Description

The whole of story E00_S05 in one task. Written last on purpose: a README drafted before the scripts
exist documents intentions, one written after documents facts.

Read `project/board/stories/E00_S05_readme-and-documentation-skeleton.md` for the full reasoning.

### `README.md`

Six sections, in order:

1. **What this is** — two or three sentences. See the domain-language constraint below.
2. **Requirements** — Node as pinned in `.nvmrc`, npm. One line on `nvm use`.
3. **Getting started** — `nvm use`, `npm ci`, `npm run dev`, and what to expect at the local URL.
4. **Checks** — `npm run ci` as the single command that runs everything, then the individual
   commands (`lint`, `typecheck`, `test`, `build`, `format:check`) with one line each.
5. **Project layout** — `src/` (application), `scripts/ci/` (check registry and runner), `docs/`
   (documentation), `project/` (scrum board, not application code). Include the one-line note on why
   `@jenga-ai/agent` is a dependency, so nobody deletes it as unused.
6. **Documentation** — a link to `docs/index.md`.

Run every command while writing it. A README documenting a script that was renamed is worse than no
README.

### The domain-language constraint

The epic requires both that the README says what Skolkartan is *and* that no file references a
kommun, skola, nyckeltal or data source. Resolution: the no-leakage rule governs code, configuration,
schema, fixtures and identifiers. The README's opening paragraph is prose framing the epic itself
mandates, so it stays, written at the general level — a research tool that aggregates public school
data for a set of Swedish municipalities into one comparable dataset with full provenance. It names
**no individual kommun, no individual school, no specific nyckeltal and no data source.**

No permanent CI check enforces the domain-term ban; such a check would be correct for exactly one
epic and would have to be deleted the moment E01 legitimately introduces domain terms. Verified once,
by review, here. Write that decision and its reason down.

### `docs/index.md`

The index page later Epics add to:

- One line on what `docs/` is for and what belongs there rather than in the README or
  `PROJECT_SUMMARY.md`.
- A table of pages with columns: page, what it covers, owning Epic. The owning-Epic column mirrors
  the `owner` field on CI checks — provenance applied to documentation.
- The convention for adding a page: one Markdown file in `docs/`, kebab-case filename, one row in the
  table. Stated explicitly so E01's `docs/kallor.md` lands predictably.
- An initial row for `docs/ci-checks.md`.

`docs/index.md` is the canonical entry point, not `docs/README.md`. Two competing entry points in one
folder is the drift this file prevents.

### Clean-clone check and epic close

Clone into a clean temporary directory and follow only the README's getting-started steps. It must
reach a running dev server with no undocumented step.

Then walk each of E00's Definition-of-Done items from
`project/board/epics/E00_project-foundation.md` one by one against the actual repository and record
the outcome of each in the commit message.

Also clean up `src/lib/.gitkeep`, flagged as vestigial by `E00_S02_T04`.

Any `PROJECT_SUMMARY.md` change goes through `project/queue/project_summary_updates.jsonl` for the
scrum-master to apply — do not write that file directly.

## Acceptance Criteria

- [ ] `README.md` exists with all six sections, in order.
- [ ] Every command shown in the README was executed while writing it and behaves as described.
- [ ] The README's "What this is" names no individual kommun, school, nyckeltal or data source.
- [ ] The README explains why `@jenga-ai/agent` is present and that it is not application code.
- [ ] `docs/index.md` exists with the purpose statement, the page table (page / coverage / owning
      Epic), and the convention for adding a page.
- [ ] `docs/index.md` links to `docs/ci-checks.md` and the link resolves.
- [ ] `README.md` links to `docs/index.md` and the link resolves.
- [ ] No `docs/README.md` exists competing with `docs/index.md`.
- [ ] A clone into a clean temporary directory, following only the README, reaches a running dev
      server with no undocumented step.
- [ ] Following the README's Checks section alone, `npm run ci` runs and passes.
- [ ] `src/lib/.gitkeep` is removed.

## Definition of Done

- [ ] All acceptance criteria are met and `npm run ci` passes.
- [ ] Each item of E00's Definition of Done is walked through and its outcome recorded.
- [ ] A sweep of every file E00 created or modified confirms no kommun, skola, nyckeltal or data
      source is referenced, with the README's general-level prose the only exception.
- [ ] The decision not to enforce the domain-term ban as a permanent CI check is written down with
      its reason.
- [ ] Any `PROJECT_SUMMARY.md` change is proposed via `project/queue/project_summary_updates.jsonl`.
- [ ] E01 can add `docs/kallor.md` by following the documented convention: one file, one row, no
      restructuring.
