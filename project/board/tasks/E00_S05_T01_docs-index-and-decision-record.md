---
id: E00_S05_T01
title: docs/ skeleton — index page and the domain-term decision record
status: Pending
story_id: E00_S05
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on: []
---

# Task: docs/ skeleton — index page and the domain-term decision record

## Description

Create `docs/index.md`, the canonical entry point for the project's technical documentation, and
record the story's one standing decision in `docs/ci-checks.md`.

This task owns the **shape** of `docs/`, not its contents. `docs/ci-checks.md` already exists —
`E00_S03` created it and `E00_S04` extended it — and this task must not restate, summarise or
duplicate what that page says about registering a CI check. It links to it and adds one short
section that page does not already cover.

`README.md` is `E00_S05_T02`'s job. This task comes first because T02 links to `docs/index.md` and
must be able to verify that the link resolves.

### `docs/index.md`

Create at `docs/index.md`. `docs/README.md` must **not** be created — two competing entry points in
one folder is precisely the drift this file prevents. Structure:

```markdown
# Skolkartan documentation

This directory holds durable technical reference for people working **inside** the repository:
conventions, mechanisms and recorded decisions. It is not a getting-started guide and it is not a
description of the project's subject matter.

- Getting from a clone to a running application and to the checks → [`../README.md`](../README.md)
- What the project is for, its scope and its domain conventions →
  [`../project/PROJECT_SUMMARY.md`](../project/PROJECT_SUMMARY.md)
- How a mechanism in this repository works, and why it works that way → this directory

## Pages

| Page | What it covers | Owning Epic |
| --- | --- | --- |
| [`ci-checks.md`](./ci-checks.md) | The CI check registry, the two-step procedure for registering a new check, and the merge gate | E00 |

## Adding a page

Later Epics add documentation here without restructuring anything:

1. Create **one** Markdown file directly in `docs/`. Filename is kebab-case and ends in `.md`
   (for example `kallor.md`). No subdirectories.
2. Add **one** row to the table above: a relative link to the file, one line on what it covers, and
   the id of the Epic that introduced it.
3. Nothing else. Do not create a second index, do not create `docs/README.md`, do not nest folders.

The **Owning Epic** column is not decoration. It mirrors the `owner` field on a CI check: when a
page is found to be stale, the first question is whose page it is and which Epic's story explains
it. Provenance applies to documentation for the same reason it applies to data.
```

The exact wording is a starting point, not a contract — improve the prose if it reads badly. What is
fixed is: the purpose statement, the three-way split between `README.md` / `PROJECT_SUMMARY.md` /
`docs/`, the table with the three named columns, the initial `ci-checks.md` row, and the numbered
adding-a-page convention.

### The decision record

The story records one decision that must survive in the repository, not only in the board:

> **No permanent CI check enforces E00's domain-term ban.**

Append a short section to the end of `docs/ci-checks.md` — do not create a new page for it, and do
not edit any existing section of that file:

```markdown
## Checks deliberately not registered

**A check forbidding domain terms (kommun, skola, nyckeltal, data source names) is deliberately not
registered.** Such a check would be correct for exactly one Epic. E01 legitimately introduces those
terms, at which point the check would have to be deleted — and a rule whose known lifetime is one
Epic is not a rule, it is a temporary review step. E00's freedom from domain terms was therefore
verified once, by manual review, as part of `E00_S05`. Recorded in `E00_S05`.
```

`docs/ci-checks.md` is the right home because the decision is precisely a decision *about the check
registry*: it explains why something a reader might expect to find in `scripts/ci/checks.ts` is
absent. Putting it anywhere else leaves the registry looking incomplete.

### Formatting

`npm run format` must leave both files unchanged after this task. Run it before finishing.

### Domain constraint

E00 is pure infrastructure. Neither file may name a kommun, a school, a nyckeltal or a data source.
The `kallor.md` filename used as an example in the adding-a-page section is a filename, not a data
source; if it reads as leakage, use a neutral placeholder such as `<topic>.md` instead.

## Acceptance Criteria

- [ ] `docs/index.md` exists.
- [ ] `docs/README.md` does not exist anywhere in the repository.
- [ ] `docs/index.md` opens with a statement of what `docs/` is for and explicitly distinguishes it
      from `README.md` and from `project/PROJECT_SUMMARY.md`.
- [ ] `docs/index.md` contains a Markdown table with exactly the three columns **Page**, **What it
      covers** and **Owning Epic** (wording may vary, the three concepts may not).
- [ ] The table contains a row for `ci-checks.md` with owning Epic `E00`.
- [ ] `docs/index.md` contains an "Adding a page" section stating all three rules: one Markdown file
      directly in `docs/`, kebab-case filename, one row added to the table.
- [ ] Every relative link in `docs/index.md` resolves to a file that exists — checked by following
      each one, including `./ci-checks.md`, `../README.md` (which `E00_S05_T02` creates; if it is
      not yet present, this criterion is re-checked after T02 lands) and
      `../project/PROJECT_SUMMARY.md`.
- [ ] `docs/ci-checks.md` ends with a section stating that no CI check enforces the domain-term ban,
      giving the reason (it would be correct for one Epic only and deleted at E01) and naming
      `E00_S05` as where the decision was made.
- [ ] No section of `docs/ci-checks.md` that existed before this task has been modified —
      `git diff` shows only an addition at the end of the file.
- [ ] Neither file names a kommun, a school, a nyckeltal or a data source.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] `npm run format:check` and `npm run ci` both exit zero after the change.
- [ ] No subdirectory has been created under `docs/`.
- [ ] A dry run of the documented convention is confirmed by inspection: adding a hypothetical
      `docs/<topic>.md` would require creating one file and adding one table row, with no
      restructuring and no change to any other file.
- [ ] `E00_S05_T02` can link to `docs/index.md` and cite it as the documentation entry point without
      needing any further change to this file.
