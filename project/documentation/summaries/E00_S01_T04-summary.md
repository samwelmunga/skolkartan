# Execution Summary — E00_S01_T04

**Task**: Record the toolchain decisions in `docs/decisions.md`
**Story**: E00_S01 — Application skeleton and TypeScript configuration
**Epic**: E00 — Project Foundation
**Status**: Passed
**Date started**: 2026-08-15
**Date completed**: 2026-08-15

## What was implemented

Created the project's decision log at `docs/decisions.md`, plus the `docs/` directory that holds
it. The file has a preamble defining what belongs in the log and the append-only, dated convention
for adding to it, followed by the two decisions E00_S01 made and that this task exists to protect:

1. **`exactOptionalPropertyTypes` is not enabled** — records that `strict: true` is on, together
   with `noUncheckedIndexedAccess`, `noImplicitOverride` and `forceConsistentCasingInFileNames`,
   and that `exactOptionalPropertyTypes` is off by choice rather than by omission. The reason given
   is the story's own: the option interacts badly with the third-party type definitions later Epics
   pull in, producing friction at every boundary where an optional property meets a library's types,
   and for a personal research tool that cost outweighs the benefit. The reversal condition is real
   bugs of the kind it prevents appearing, or the third-party surface shrinking enough to make it
   cheap.
2. **`@jenga-ai/agent` is a dependency but is never imported** — records that the package stays in
   `dependencies`, must never be imported from `src/`, and must not be deleted as unused. The reason
   given is the story's own: it belongs to the agent harness that operates on this repository rather
   than to the application, so pruning tools and readers will inevitably flag it as dead weight. The
   reversal condition is the agent harness ceasing to be used on this repository.

Both entries are written as complete prose paragraphs, not single-line notes, so a reader who was
not present when the decisions were taken can act on them.

## Files changed

| File | Change |
|---|---|
| `docs/decisions.md` | Created (3350 bytes) |
| `project/documentation/plans/E00_S01_T04-plan.md` | Created (execution plan) |
| `project/documentation/summaries/E00_S01_T04-summary.md` | Created (this file) |
| `project/board/tasks/E00_S01_T04_record-toolchain-decisions-in-docs.md` | Front-matter status and dates updated |
| `project/logs/events.json` | Session start and sender object appended |

No source file, no configuration file and no sibling task's file was touched. `tsconfig.json`,
`package.json`, `.gitignore` and `README.md` were not modified by this task. `git status` shows
modifications to `.gitignore` and `project/PROJECT_SUMMARY.md`, but those are the work of the two
sibling agents (E00_S01_T01 and E00_S01_T03) operating in the same directory, not of this task.

## Commits

No commits were made. Git worktree isolation is unavailable in this harness and the orchestrator
commits on the developer's behalf after the task finishes, so all mutating git commands were
deliberately avoided.

## Acceptance criteria coverage

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | `docs/decisions.md` exists and is not zero bytes | Pass | `wc -c` reports 3350 bytes |
| 2 | Opens with a statement of what belongs in it and the append-only, dated convention | Pass | Preamble, lines 3–10: states the recording criterion (reversing it by accident is plausible) and that entries are append-only, dated, newest at the bottom, superseded by addition rather than edit |
| 3 | `exactOptionalPropertyTypes` entry with Decision, Reason, Revisit-if, stating the option is off on purpose and that `strict` is on | Pass | Entry at line 12; Decision paragraph names `strict: true` and calls the omission a choice, not an oversight |
| 4 | `@jenga-ai/agent` entry with Decision, Reason, Revisit-if, stating it is harness tooling, must never be imported from `src/`, must not be deleted as unused | Pass | Entry at line 35; all three statements present in the Decision and Reason paragraphs |
| 5 | Each entry names `E00_S01` as originating story and carries the date `2026-08-15` | Pass | Two `**Epic/Story:** E00_S01` lines; both `##` headings begin `2026-08-15` |
| 6 | Valid Markdown, sensible outline — one `#`, one `##` per entry | Pass | Heading scan returns exactly one `#` (`# Decisions`) and two `##` headings, one per entry; no other heading levels |
| 7 | `docs/` contains only `decisions.md` — no `index.md`, no `README.md` | Pass | `ls -a docs` returns `decisions.md` only |

## Definition of Done coverage

- All acceptance criteria met — yes, see table above.
- Both entries written as actionable prose rather than single-line notes — yes; each Decision,
  Reason and Revisit-if is a full paragraph.
- No file outside `docs/` created or modified by this task; `tsconfig.json`, `package.json` and
  `README.md` untouched — yes. The only other writes are this task's own workflow artefacts (plan,
  summary, task front-matter, event log), which are board bookkeeping rather than project files.
- Handover note telling `E00_S05` to index this page — recorded below.
- No kommun, skola, nyckeltal or data source referenced — yes. A case-insensitive scan for
  `kommun`, `skol`, `nyckeltal`, `resursskol`, `samverkan`, `huvudman`, `Kolada`, `SCB`,
  `Skolverket`, `Lund` and `Malmö` returns a single hit, which is the project's own name
  "Skolkartan" inside the phrase "Skolkartan is a personal research tool". That is the project
  name, used the same way the Epic and Story files use it, not a reference to a school, a kommun,
  a nyckeltal or a data source.

## Handover — note for E00_S05_T01

**`E00_S05` must add a row for `docs/decisions.md` to `docs/index.md` when it builds the
documentation index.** This task deliberately did not create `docs/index.md`, because the index
page and the overall `docs/` layout are owned by `E00_S05_T01`. Suggested row content: page
`decisions.md`, titled "Decisions", described as the append-only log of durable technical
decisions and the reasoning behind them. `E00_S03_T04` will add `docs/ci-checks.md` alongside it
and needs a row of its own; that page is not this task's concern.

## Concerns for the tester

- Nothing is executable here, so there is no build or runtime behaviour to exercise. Verification
  is a read of `docs/decisions.md` against the seven acceptance criteria.
- Worth confirming that `docs/` still contains only `decisions.md` at review time. If
  `docs/index.md` or `docs/ci-checks.md` has appeared, it came from `E00_S05_T01` or
  `E00_S03_T04`, not from this task.
- The second entry states explicitly that the story did not record why `@jenga-ai/agent` sits in
  `dependencies` rather than `devDependencies`. This is intentional: the task's instruction was to
  record the choice and mark the rationale as unrecorded rather than fabricate one.
