---
id: E00_S01_T04
title: Record the toolchain decisions in docs/decisions.md
status: Passed
story_id: E00_S01
epic_id: E00
date_created: 2026-08-15
date_started: 2026-08-15
date_completed: 2026-08-15
depends_on: []
docs: ["docs/decisions.md"]
---

# Task: Record the toolchain decisions in docs/decisions.md

## Description

The story's Definition of Done requires two decisions to be "written down where the next reader
will find them, not left as tribal knowledge":

1. Why `exactOptionalPropertyTypes` is deliberately **off** despite `strict: true` being on.
2. Why `@jenga-ai/agent` is a dependency of an application that never imports it.

Both are decisions someone will otherwise reverse by accident — the first because it looks like an
oversight in a strict config, the second because it looks like an unused dependency ripe for
deletion. This task creates the file that stops that happening.

It depends on nothing: both decisions were made during story planning and are stated in
`E00_S01`'s description, so the text can be written before, during or after the implementation
tasks land.

### Where it lives — decided

`docs/decisions.md`. Not a comment in `tsconfig.json`, and not `README.md`.

- `tsconfig.json` is kept as strict comment-free JSON (see `E00_S01_T02`) so every tool that reads
  it parses it identically. A comment there would also put two tasks in the same file.
- `README.md` does not exist until `E00_S05`, and a decision log is not README material anyway.
- `docs/` is the project's documentation home. `E00_S03` will add `docs/ci-checks.md` alongside
  this file, and `E00_S05` creates `docs/index.md` and adds a row for each page. Creating
  `docs/decisions.md` here follows that convention rather than inventing a new location.

This task creates the `docs/` directory if it does not yet exist. It creates **only**
`docs/decisions.md` — it does not create `docs/index.md`, which is `E00_S05`'s.

### File format

A dated log, newest entry at the bottom, one section per decision. Each entry states the decision,
the reason, and what would justify revisiting it — the last part matters, because a decision log
without a reversal condition becomes a rule nobody dares change.

Use this structure:

```markdown
# Decisions

Durable technical decisions taken by this project, with the reasoning behind them. A decision is
recorded here when reversing it by accident is plausible — either because it looks like an
oversight, or because the reason for it is not visible from the code.

Entries are append-only and dated. Superseding an entry means adding a new one that says so, not
editing the old one.

## 2026-08-15 — `exactOptionalPropertyTypes` is not enabled

**Epic/Story:** E00_S01

**Decision:** …

**Reason:** …

**Revisit if:** …

## 2026-08-15 — `@jenga-ai/agent` is a dependency but is never imported

**Epic/Story:** E00_S01

**Decision:** …

**Reason:** …

**Revisit if:** …
```

### Entry 1 — `exactOptionalPropertyTypes`

Content the entry must convey:

- **Decision**: `tsconfig.json` runs `strict: true` plus `noUncheckedIndexedAccess`,
  `noImplicitOverride` and `forceConsistentCasingInFileNames`, but `exactOptionalPropertyTypes` is
  deliberately left off. Its absence is a choice, not a gap.
- **Reason**: it interacts badly with the third-party type definitions later Epics will pull in,
  producing friction at every boundary where an optional property meets a library's own types. For
  a personal research tool the cost outweighs the benefit.
- **Revisit if**: the friction it prevents starts showing up as real bugs, or the third-party
  surface shrinks enough that enabling it is cheap.

### Entry 2 — `@jenga-ai/agent`

Content the entry must convey:

- **Decision**: `@jenga-ai/agent` stays in `dependencies`. It must never be imported from `src/`,
  and it must not be deleted as unused.
- **Reason**: it belongs to the agent harness that operates on this repository, not to the
  application. Nothing under `src/` will ever import it, so every dependency-pruning tool and every
  reader will flag it as dead weight.
- **Revisit if**: the agent harness stops being used on this repository.

Both entries must be written as complete prose, not as the bullet fragments above.

### Handover

State explicitly, in the task's rapport, that `E00_S05` must add a row for `docs/decisions.md` to
`docs/index.md` when it builds the documentation index.

### Domain constraint

E00 is pure infrastructure. `docs/decisions.md` must reference no kommun, skola, nyckeltal or data
source. Both entries are about TypeScript configuration and npm dependencies, so this costs
nothing.

## Acceptance Criteria

- [ ] `docs/decisions.md` exists and is not zero bytes.
- [ ] The file opens with a short statement of what belongs in it and the append-only, dated
      convention for adding entries.
- [ ] It contains an entry for `exactOptionalPropertyTypes` with Decision, Reason and Revisit-if,
      stating that the option is off on purpose and that `strict` is on.
- [ ] It contains an entry for `@jenga-ai/agent` with Decision, Reason and Revisit-if, stating that
      it is harness tooling, must never be imported from `src/`, and must not be deleted as unused.
- [ ] Each entry names `E00_S01` as the originating story and carries the date `2026-08-15`.
- [ ] The file is valid Markdown and its headings form a sensible outline (one `#`, one `##` per
      entry).
- [ ] `docs/` contains only `decisions.md` after this task — no `index.md`, no `README.md`.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] Both entries are written as prose a reader who was not present can act on, not as
      single-line notes.
- [ ] No file outside `docs/` was created or modified by this task — in particular
      `tsconfig.json`, `package.json` and `README.md` are untouched.
- [ ] The handover note telling `E00_S05` to index this page is recorded in the task's rapport.
- [ ] No kommun, skola, nyckeltal or data source is referenced in the file.
