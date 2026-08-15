# Execution Plan — E00_S01_T04

**Task**: Record the toolchain decisions in `docs/decisions.md`
**Story**: E00_S01 — Application skeleton and TypeScript configuration
**Epic**: E00 — Project Foundation
**Date**: 2026-08-15

## Objective

Create `docs/decisions.md` as the project's append-only decision log, seeded with the two
decisions E00_S01 made that a later reader would otherwise reverse by accident:

1. `exactOptionalPropertyTypes` is deliberately off while `strict` is on.
2. `@jenga-ai/agent` is a dependency that is never imported and must not be pruned.

## Scope

**In scope** — exactly one new file: `docs/decisions.md` (plus creating the `docs/` directory).

**Out of scope**

- `docs/index.md` — owned by E00_S05_T01.
- `docs/ci-checks.md` and the CI check registry — owned by E00_S03_T04.
- `tsconfig.json`, `package.json`, `.gitignore`, `README.md` — owned by sibling tasks or later
  stories. These must remain untouched.

## Concurrency note

Two sibling agents are working in the same directory (E00_S01_T01 owns `package.json` and is
running `npm install`; E00_S01_T03 owns `.gitignore`). No git worktree is created; no mutating
git command is run. Only `docs/decisions.md`, this plan, the summary and the task file are
written.

## Source of content

The decisions and their reasoning come from:

- `project/board/stories/E00_S01_application-skeleton-and-typescript-configuration.md`
  — the `TypeScript configuration — decisions made` and `Dependency and lockfile policy` sections.
- `project/board/tasks/E00_S01_T04_record-toolchain-decisions-in-docs.md`
  — the prescribed file structure and the required content of each entry.

Where the story gives a reason, that reason is carried across verbatim in meaning. Where no
reason was recorded, the entry says so rather than inventing one. No justification is fabricated.

## File design

Structure is fixed by the task:

- One `#` heading: `# Decisions`.
- A short preamble stating what belongs in the log and the append-only, dated convention
  (newest entry at the bottom; superseding means adding a new entry, not editing an old one).
- One `##` heading per entry, of the form `## 2026-08-15 — <subject>`.
- Each entry carries `**Epic/Story:** E00_S01` and the three labelled fields
  `**Decision:**`, `**Reason:**`, `**Revisit if:**`, written as complete prose paragraphs.

### Entry 1 — `exactOptionalPropertyTypes` is not enabled

- Decision: `strict: true` is on, together with `noUncheckedIndexedAccess`, `noImplicitOverride`
  and `forceConsistentCasingInFileNames`; `exactOptionalPropertyTypes` is deliberately left off.
  Its absence is a choice, not a gap.
- Reason (from the story): it interacts badly with the third-party type definitions later Epics
  will pull in, causing friction at every boundary where an optional property meets a library's
  own types; for a personal research tool the cost outweighs the benefit.
- Revisit if: the class of bug it prevents starts appearing for real, or the third-party surface
  shrinks enough that enabling it is cheap.

### Entry 2 — `@jenga-ai/agent` is a dependency but is never imported

- Decision: it stays in `dependencies`, must never be imported from `src/`, and must not be
  deleted as unused.
- Reason (from the story): it belongs to the agent harness that operates on this repository, not
  to the application, so every dependency-pruning tool and every reader will flag it as dead
  weight.
- Revisit if: the agent harness stops being used on this repository.

Note: the story does not record why the package sits in `dependencies` rather than
`devDependencies`. The entry will say the rationale for that placement was not recorded rather
than invent one.

## Domain constraint

E00 is pure infrastructure. The finished file must contain no reference to kommun, skola,
nyckeltal or any data source. Both entries are about TypeScript compiler options and npm
dependencies, so this is achievable without contortion. Verification is a grep over the produced
file for those terms and for the source names listed in `PROJECT_SUMMARY.md`.

## Steps

1. Create `docs/`.
2. Write `docs/decisions.md` in the structure above.
3. Verify each acceptance criterion against the written file:
   - file exists and is non-empty;
   - preamble states purpose and the append-only, dated convention;
   - both entries present with Decision / Reason / Revisit-if;
   - both entries name `E00_S01` and carry `2026-08-15`;
   - heading outline is one `#` and one `##` per entry;
   - `docs/` contains only `decisions.md`;
   - no domain terms present.
4. Confirm via `git status` that no file outside the permitted set changed at my hand.
5. Write the execution summary, including the handover note for E00_S05_T01.
6. Update the task front-matter to `status: Passed` with start and completion dates.

## Risks

- **Accidentally widening scope into the docs index.** Mitigated by creating exactly one file and
  handing the indexing requirement to E00_S05_T01 through the summary.
- **Fabricated rationale.** Mitigated by sourcing every reason from the story text and explicitly
  marking the one gap (`dependencies` vs `devDependencies`) as unrecorded.
- **Collision with sibling agents.** Mitigated by touching no shared file and running no mutating
  git command.
