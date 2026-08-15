---
id: E00_S05_T04
title: E00 closing sweep — Definition of Done and domain-leakage review
status: Pending
story_id: E00_S05
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S05_T02
  - E00_S05_T03
---

# Task: E00 closing sweep — Definition of Done and domain-leakage review

## Description

`E00_S05` is the story that closes the Epic. This task is the closing act: walk E00's Definition of
Done item by item against the actual repository, perform the manual domain-leakage review that
stands in for the CI check the project deliberately chose not to write, and propose the resulting
`PROJECT_SUMMARY.md` update through the queue.

This is a **verification and reporting** task. It writes no code, no config and no documentation
page. Its outputs are the rapport and one line appended to a queue file. If it finds a defect, it
records the defect and attributes it to the owning story; it does not silently repair it.

### Part 1 — E00's Definition of Done, one item at a time

Read `project/board/epics/E00_project-foundation.md` and walk all eight items. For each, record in
the rapport: the item, PASS or FAIL, and the concrete evidence — a command and its exit code, or a
file path and the specific line that satisfies it. An unevidenced PASS is a FAIL.

1. **Fresh clone + `npm install && npm run build` succeeds with no manual step beyond the `.nvmrc`
   Node version.** Cite `E00_S05_T03`'s clean-clone evidence; do not repeat the clone. Note in the
   rapport that the repository uses `npm ci` rather than `npm install` by deliberate lockfile policy
   (`E00_S01`), and that `npm ci` is the stricter of the two — the Epic's wording is satisfied, not
   circumvented.
2. **`npm run lint`, `npm run typecheck`, `npm run test` and `npm run build` all exist and pass.**
   Evidence: the four names present in `package.json` `scripts`, plus four exit codes.
3. **TypeScript runs in strict mode and the build fails on a type error.** Evidence: `strict: true`
   in `tsconfig.json`, plus `E00_S01`'s recorded demonstration. Re-running the demonstration is
   optional; citing it is not.
4. **CI runs all four commands on every push and pull request, and a deliberately broken commit is
   demonstrated to fail the pipeline.** Evidence: `.github/workflows/ci.yml` triggers, plus the run
   URLs or captured output recorded by `E00_S04`.
5. **The mechanism for registering an additional CI validator is documented in `docs/`, and a
   throwaway example validator has been added and removed to prove it works.** Evidence:
   `docs/ci-checks.md`, plus `E00_S03`'s five-step throwaway proof, plus confirmation that searching
   the repository for `validate:example` and `example-validator` returns hits only under `project/`.
6. **`README.md` states what Skolkartan is, how to run it locally, and how to run the checks.**
   Evidence: the three sections, plus `E00_S05_T03`'s clean-clone run.
7. **A `docs/` directory exists with an index page later Epics can add to.** Evidence:
   `docs/index.md`, its page table and its adding-a-page convention.
8. **No file in the repository references a kommun, skola, nyckeltal or data source.** Evidence:
   Part 2 below.

If any item fails, the story is not done. Record the failure, name the story that owns it, and stop
rather than marking the sweep complete.

### Part 2 — the domain-leakage review

This is the manual review that replaces the CI check the project decided not to write. The reason for
that decision is recorded in `docs/ci-checks.md` by `E00_S05_T01`; confirm it is there.

**In scope for the review** — every file E00 created or modified:

- `README.md`
- `docs/` (all files)
- `src/` (all files)
- `scripts/` (all files)
- `.github/` (all files)
- root config: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`,
  `eslint.config.mjs`, `vitest.config.ts`, `.prettierrc.json`, `.prettierignore`, `.gitignore`,
  `.nvmrc`

**Out of scope** — `node_modules/`, `.next/`, and `project/`. The scrum board is planning material
and legitimately contains domain language; that is what it is for.

A grep is a **starting point, not the review**. Run something like a case-insensitive search over the
in-scope paths for: `kommun`, `skol`, `nyckeltal`, `resursskol`, `samverkan`, `huvudman`, `kolada`,
`scb`, `skolverket`, `dataportal`, `skolinspektion`, `särskilt stöd`, `lärartäthet`, `behörighet`.

Two known false positives, both expected:

- **`skolkartan`** — the project's own name matches `skol`. It is not a school. Filter it out
  consciously rather than adjusting the pattern until the output is empty.
- **The `README.md` "What this is" paragraph** — it mentions schools and municipalities at a general
  level. This is the documented exception: the Epic mandates that the README say what the project is.
  Confirm it names **no individual municipality, no individual school, no specific nyckeltal and no
  data source**. Read it word by word.

Then read the remaining in-scope files, not just the grep output. A grep cannot catch a domain
assumption expressed without a domain word — a field named `code` that is really a kommunkod, a
fixture shaped like a statistics payload, a comment about the eventual data model. Those are what the
review is for.

Record in the rapport: the pattern used, the raw hit count, each hit and its disposition, and an
explicit statement that the in-scope files were read rather than only searched.

### Part 3 — the `PROJECT_SUMMARY.md` proposal

`project/PROJECT_SUMMARY.md` is owned by the scrum-master. **Do not edit it.** Append one JSON object
per line to `project/queue/project_summary_updates.jsonl` (create the file if absent; it currently
does not exist). If the file already has entries, match their field names exactly rather than the
shape below.

```json
{"agent":"developer","date":"2026-08-15","task_id":"E00_S05_T04","section":"Architecture & Structure","proposal":"<the text being proposed>","reason":"<why it is now true>"}
```

Propose, as separate lines:

- That the repository now has a working scaffold: Next.js App Router under `src/`, strict
  TypeScript, ESLint with Prettier owning formatting, Vitest, and a CI pipeline gating `main`.
- That `npm run ci` is the single entry point for all checks, and that a later Epic registers its own
  validator by adding one npm script plus one entry in `scripts/ci/checks.ts` — no workflow edit.
- That technical documentation lives in `docs/`, indexed by `docs/index.md`, and that a new page is
  one kebab-case Markdown file plus one row in that index table.

Keep each proposal to a sentence or two. The scrum-master decides the final wording; this task
supplies the facts.

### Part 4 — the story's remaining Definition-of-Done items

Confirm and record:

- `docs/README.md` does not exist (`E00_S05_T01`).
- The no-permanent-CI-check decision is written down with its reason (`E00_S05_T01`).
- E01 can add `docs/kallor.md` by following the documented convention — one file, one table row, no
  restructuring. Confirm by inspection against `docs/index.md`; do **not** create the file.

## Acceptance Criteria

- [ ] All eight items of E00's Definition of Done are walked individually and each is recorded in the
      rapport with PASS/FAIL and concrete evidence (a command and exit code, or a file path and
      line).
- [ ] Item 1 cites `E00_S05_T03`'s clean-clone evidence and addresses the `npm ci` versus
      `npm install` wording explicitly.
- [ ] The domain-leakage review covers `README.md`, `docs/`, `src/`, `scripts/`, `.github/` and the
      root config files, and explicitly excludes `project/`, `node_modules/` and `.next/` with the
      exclusion reason stated.
- [ ] The rapport records the search pattern used, the raw hit count, and the disposition of every
      hit — including the `skolkartan` project-name false positive.
- [ ] The rapport states explicitly that the in-scope files were **read**, not only searched, and
      names anything found that a search would have missed (or states that nothing was).
- [ ] The README's "What this is" paragraph is confirmed to name no individual municipality, no
      individual school, no specific nyckeltal and no data source.
- [ ] `docs/ci-checks.md` is confirmed to contain the recorded decision that no permanent CI check
      enforces the domain-term ban, together with its reason.
- [ ] `docs/README.md` is confirmed absent.
- [ ] At least three proposal lines are appended to `project/queue/project_summary_updates.jsonl`,
      each valid JSON on its own line, covering the scaffold, the `npm run ci` entry point plus
      one-line check registration, and the `docs/` convention.
- [ ] `project/PROJECT_SUMMARY.md` is **not** modified by this task — `git diff` confirms it.
- [ ] The rapport confirms, by inspection of `docs/index.md`, that E01 can add `docs/kallor.md` with
      one file and one table row.

## Definition of Done

- [ ] All acceptance criteria are met and `npm run ci` exits zero on the final tree.
- [ ] No source file, configuration file or documentation page was modified by this task; its only
      write outside the rapport is the append to
      `project/queue/project_summary_updates.jsonl`.
- [ ] Any Definition-of-Done item that fails is recorded as a failure and attributed to the story
      that owns it (`E00_S01`–`E00_S05`); the sweep is not marked complete while an item is failing.
- [ ] Any domain leakage found is recorded with its file path and attributed to the owning story
      rather than being fixed quietly inside this task.
- [ ] The rapport is self-contained enough that a reader who was not present can re-run the sweep
      from it alone and reach the same conclusion.
