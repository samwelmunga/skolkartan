---
id: E00_S05
title: README and documentation skeleton
status: Pending
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
tasks:
  - E00_S05_T01
  - E00_S05_T02
  - E00_S05_T03
  - E00_S05_T04
depends_on:
  - E00_S01
  - E00_S02
  - E00_S03
  - E00_S04
docs: ["README.md", "docs/index.md"]
---

# Story: README and documentation skeleton

**ID**: E00_S05
**Epic**: E00 — Project Foundation
**Status**: Pending
**Date Added**: 2026-08-15
**Wave**: 5 — closes the Epic. Needs every command and the pipeline to exist so the documentation
describes what is actually there rather than what was planned.

## User Story

As the maintainer of Skolkartan, I want a README that gets a newcomer from clone to running checks,
and a `docs/` structure that later Epics add pages to without inventing a layout each time, so that
the project explains itself instead of relying on memory.

## Description

This story is written last on purpose. A README drafted before the scripts exist documents
intentions; one written after documents facts.

### `README.md`

Sections, in order:

1. **What this is** — two or three sentences. See the domain-language constraint below.
2. **Requirements** — Node as pinned in `.nvmrc`, npm. One line on using `nvm use`.
3. **Getting started** — `nvm use`, `npm ci`, `npm run dev`, and what to expect at the local URL.
4. **Checks** — `npm run ci` as the single command that runs everything, followed by the
   individual commands (`lint`, `typecheck`, `test`, `build`, `format:check`) with one line each on
   what they do and when to reach for them individually.
5. **Project layout** — `src/` (application), `scripts/ci/` (check registry and runner), `docs/`
   (documentation), `project/` (scrum board, not application code). Also the one-line note on why
   `@jenga-ai/agent` is a dependency, so nobody deletes it as unused.
6. **Documentation** — a link to `docs/index.md`.

The README states the check commands **exactly as they exist**, verified by running each one while
writing it. A README that documents a script that was renamed is worse than no README.

### The domain-language constraint — resolved, not ignored

The Epic's Definition of Done requires both that the README says what Skolkartan is *and* that no
file references a kommun, skola, nyckeltal or data source. Those two lines pull against each other
and the tension is resolved deliberately here rather than being discovered mid-implementation.

**Resolution**: the no-domain-leakage rule governs code, configuration, schema, fixtures and
identifiers — no domain model, no source ids, no kommunkoder, no nyckeltal names. The README's
opening paragraph is prose framing that the Epic itself mandates, so it stays, but it is written at
the general level: a research tool that aggregates public school data for a set of Swedish
municipalities into one comparable dataset with full provenance. It names **no individual kommun,
no individual school, no specific nyckeltal and no data source**. Anything more specific belongs in
`PROJECT_SUMMARY.md`, which already carries it.

**No permanent CI check enforces the domain-term ban.** Such a check would be correct for exactly
one Epic and would then have to be deleted the moment E01 legitimately introduces domain terms. It
is verified once, by review, as part of this story's closing sweep. Recorded decision.

### `docs/index.md`

The index page later Epics add to. It carries:

- A one-line statement of what `docs/` is for and what belongs there rather than in the README or
  `PROJECT_SUMMARY.md`.
- A table of documentation pages with columns: page, what it covers, owning Epic. The owning-Epic
  column mirrors the `owner` field on CI checks — provenance again, applied to documentation.
- The convention for adding a page: one Markdown file in `docs/`, kebab-case filename, one row
  added to the table. Stated explicitly so E01's `docs/kallor.md` and any later page land in a
  predictable place.
- An initial row for `docs/ci-checks.md` from S03 and S04.

`docs/index.md` is the canonical entry point rather than `docs/README.md`; two competing entry
points in the same folder is exactly the drift this file is meant to prevent.

### Closing the Epic

This story also performs the Epic's final sweep: each of E00's eight Definition-of-Done items is
walked through and confirmed against the actual repository, including a fresh clone into a clean
temporary directory to prove the getting-started instructions work as written for someone who has
never run this project.

## Acceptance Criteria

- [ ] `README.md` exists with all six sections listed above, in order.
- [ ] Every command shown in the README has been executed while writing it and behaves as
      described.
- [ ] The README's "What this is" section names no individual kommun, school, nyckeltal or data
      source.
- [ ] The README explains why `@jenga-ai/agent` is present and that it is not application code.
- [ ] `docs/index.md` exists with the purpose statement, the page table including page / coverage /
      owning Epic, and the stated convention for adding a new page.
- [ ] `docs/index.md` links to `docs/ci-checks.md` and the link resolves.
- [ ] `README.md` links to `docs/index.md` and the link resolves.
- [ ] A clone into a clean temporary directory, followed only by the README's getting-started
      steps, reaches a running dev server with no undocumented step.
- [ ] Following the README's Checks section alone, `npm run ci` runs and passes.
- [ ] No `docs/README.md` exists competing with `docs/index.md`.

## Definition of Done

- [ ] All acceptance criteria are met and `npm run ci` passes.
- [ ] **All eight items of E00's Definition of Done are walked through one by one and confirmed
      against the repository**, with the outcome of each recorded in the story's rapport.
- [ ] A manual sweep of every file E00 created or modified — `src/`, `scripts/`, `docs/`,
      `README.md`, config files and `.github/` — confirms no kommun, skola, nyckeltal or data
      source is referenced, with the README exception documented above being the only prose
      mentioning the project's subject at a general level.
- [ ] The decision not to enforce the domain-term ban as a permanent CI check is written down with
      its reason.
- [ ] Any change to `PROJECT_SUMMARY.md` is proposed through
      `project/queue/project_summary_updates.jsonl` for the scrum-master to apply — this story does
      not write that file directly.
- [ ] E01 can add `docs/kallor.md` by following the documented convention: one file, one row in the
      index table, no restructuring.
