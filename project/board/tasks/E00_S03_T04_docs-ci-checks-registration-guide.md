---
id: E00_S03_T04
title: Document the registration mechanism in docs/ci-checks.md
status: Pending
story_id: E00_S03
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S03_T01
  - E00_S03_T02
  - E00_S03_T03
docs: ["docs/ci-checks.md"]
---

# Task: Document the registration mechanism in docs/ci-checks.md

## Description

Write `docs/ci-checks.md` — the page a developer on E01, E02 or E09 reads instead of reading this
story. If that page is wrong or vague, the mechanism fails no matter how good the code is, because
the next Epic will improvise around it.

This task **creates the `docs/` directory** for the first time. It creates exactly one file in it.

Assumes `E00_S03_T01`, `T02` and `T03` have landed, so the page documents behaviour that has been
observed rather than behaviour that was planned. Every code block and every error message in this
page is copied from the real files and from real runner output — not paraphrased.

**Scope boundary.** Do not create `docs/index.md`, `docs/README.md` or any other page:
`E00_S05_T01` owns the `docs/` index and will add a row pointing here. Do not describe the GitHub
Actions workflow or the merge gate beyond the one prohibition below — `E00_S04` extends this page
with that section, so leave it room and do not pre-create empty headings for it.

### Contents

Sections, in this order.

**1. What this is.** Two or three sentences: the repository has one command, `npm run ci`, which
runs an ordered registry of checks; the registry lives in `scripts/ci/checks.ts`; adding a check is
two edits and no design work.

**2. The `Check` descriptor.** A table with columns field / type / meaning covering `id`,
`description`, `command` and `owner`, followed by two short paragraphs explaining the two
non-obvious decisions:

- **Why `owner` exists.** When a check fails eighteen months from now the first question is whose
  rule it is and which Epic's story explains it. Recording provenance on a check is the same
  no-fact-without-provenance convention the project applies to its data, applied to its tooling.
- **Why `command` is an npm script name and not a shell string.** It keeps every check runnable
  standalone by a developer (`npm run <command>`), keeps quoting and shell-portability problems out
  of the registry, and stops the registry becoming a place where inline shell logic accumulates.

**3. Registering a new check — the two steps.** Numbered, with copyable code blocks:

1. Add the npm script to `package.json`.
2. Append one `Check` entry to `scripts/ci/checks.ts`, with your Epic id as `owner`.

Then, explicitly: **nothing else.** No workflow edit, no runner edit, no new config file.

**4. Worked example — E01.** Name `E01_S01` and its `npm run validate:kallor` as the first external
consumer, and show the exact entry it appends:

```ts
{
  id: 'validate-kallor',
  description: 'Validates E01 registry files against their schema',
  command: 'validate:kallor',
  owner: 'E01',
},
```

Add one line noting that the `description` wording is E01's to choose. `E01_S01`'s acceptance
criterion "registered in CI through the E00 validator hook and blocks a merge on failure" is
satisfied by that single append plus the merge gate `E00_S04` configures — and if E01 finds it must
modify the runner or the workflow, that is an amendment to `E00_S03`, not something to work around.
State that in the page.

**5. What happens when you run it.** Fail-slow, stated plainly: every check runs in declared order
even after one fails; the summary prints one line per check; failing checks' output is reproduced in
full and passing checks' output is discarded; the process exits non-zero if any check failed. Paste
a real summary block captured from `npm run ci`. Explain the reason for fail-slow in one sentence —
a pipeline reporting only the first error costs a full push-and-wait cycle per error.

**6. When the registry is wrong.** The three pre-flight rules from `E00_S03_T03` — duplicate `id`,
`command` that is not a script in `package.json`, and `command: 'ci'` — with a real error message
copied from the runner for each, and the key property: **the runner refuses to run any check at
all** rather than skipping the broken one. Say why: a skipped check that everyone believes is
running is worse than a hard stop.

**7. The workflow is not the place to add a check.** `.github/workflows/` contains no list of
checks and must not be edited to add one. The reason, stated rather than asserted: if every Epic
edits the workflow, three Epics invent three step layouts, the workflow becomes where merge
conflicts live, and the checks drift apart in how they report failure. Instead the pipeline is
deliberately stupid and the registry holds everything.

**8. Recorded decisions.** Short list, each with its reason:

- How the runner is executed — Node type stripping, the scoped `type: module` variant, or `tsx` —
  exactly as recorded in `run-checks.ts`'s header comment, including the constraints that choice
  imposes (no `enum`, no `namespace`, no parameter properties; local imports carry `.ts`).
- The four base checks are ordinary registry entries with no privileged path, so the extension
  mechanism is exercised on every run instead of rotting until someone needs it.
- `format:check` is deliberately not registered; registering it later would be a one-line
  demonstration of this very procedure.
- `scripts/**/*` is in `tsconfig.json`, so a malformed entry is a type error caught by
  `npm run typecheck` before the runner ever sees it.

### The domain-language tension — resolved here, not discovered later

The story's Definition of Done forbids referencing a kommun, skola, nyckeltal or data source, while
an acceptance criterion requires naming `E01_S01`'s `npm run validate:kallor` as the worked example.

**Resolution:** the ban governs domain content — no kommun name, no kommunkod, no school, no
nyckeltal, no named data source (no Kolada, no SCB, no Skolverket, no Skolenhetsregistret). A script
name and a story id belonging to a future Epic are neither; they are the seam this story exists to
provide, and the acceptance criterion requires them. Keep the example's `description` string generic
for the same reason. Write this resolution into the page as a short note so the `E00_S05` closing
sweep does not flag it as a leak.

### Formatting

`docs/` is not excluded by `.prettierignore`, so this Markdown file is format-checked. Run
`npm run format` after writing and confirm `npm run format:check` is clean. Keep prose inside the
configured `printWidth`.

## Acceptance Criteria

- [ ] `docs/ci-checks.md` exists, is non-empty, and is the only file created under `docs/` by this
      task — no `docs/index.md` and no `docs/README.md`.
- [ ] The page documents all four `Check` fields in a table with their types and meanings.
- [ ] It explains why `owner` exists and why `command` is restricted to an npm script name.
- [ ] It gives the registration procedure as two numbered steps with copyable code blocks, and
      states explicitly that nothing else is required.
- [ ] It names `E01_S01` and `npm run validate:kallor` as the first external consumer and shows the
      exact `Check` entry E01 appends, with `owner: 'E01'`.
- [ ] It states that fail-slow means every check runs in declared order after a failure, that failing
      output is reproduced in full while passing output is discarded, and that the process exits
      non-zero if any check failed.
- [ ] It contains a summary block copied verbatim from a real `npm run ci` run, not an invented one.
- [ ] It lists the three pre-flight validation rules with a real error message for each, copied from
      actual runner output, and states that no check runs when validation fails.
- [ ] It states that `.github/workflows/` contains no list of checks and must not be edited to add
      one, together with the reason.
- [ ] It records the runner-execution decision (`node` type stripping / scoped `type: module` /
      `tsx`) with its reason and constraints, matching the comment block in `run-checks.ts` — the two
      must not disagree.
- [ ] It records the no-privileged-path, the `format:check`-not-registered and the
      `scripts/**/*`-in-tsconfig decisions.
- [ ] It contains the short note resolving the domain-language tension.
- [ ] It names no kommun, no school, no nyckeltal and no individual data source; the only E01
      references are the story id `E01_S01` and the script name `validate:kallor`.
- [ ] Every code block in the page matches the real file it claims to show (verified by diffing
      against `scripts/ci/checks.ts` and `package.json`).
- [ ] `npm run format:check` and `npm run ci` both exit zero with the page present.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] A reader who has never seen `project/board/` could register a new check correctly using this
      page alone — `E00_S03_T05` verifies this by following the page verbatim rather than following
      the story, and any step it finds missing is fixed here before `T05` closes.
- [ ] The page describes observed behaviour: every command shown in it was executed while writing it.
- [ ] No section describing the GitHub Actions workflow or the merge gate has been added — that
      space is left for `E00_S04`.
- [ ] `docs/ci-checks.md` is a single flat file directly under `docs/`, kebab-case, matching the
      convention `E00_S05_T01` will document in `docs/index.md`.
- [ ] `git status` is clean after `npm run format`.
