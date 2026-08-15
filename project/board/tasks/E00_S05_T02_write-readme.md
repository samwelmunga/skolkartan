---
id: E00_S05_T02
title: Write README.md from clone to checks
status: Pending
story_id: E00_S05
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S05_T01
---

# Task: Write README.md from clone to checks

## Description

Create `README.md` at the repository root. There is currently no README at all.

This is written **after** E00_S01–S04 have landed, deliberately. Every command named in the README
must be a script that actually exists in `package.json` and must be executed while writing the
section that names it. A README that documents a script which was renamed is worse than no README,
because it is trusted.

`E00_S05_T03` verifies the result against a clean clone. That is a separate task on purpose: this
task's job is to write down what is true on the machine it is written on; T03's job is to prove it
is true for someone who has never run the project.

### Sections, in this order

**1. What this is** — two or three sentences. See the domain-language constraint below; this
section is the one place it bites.

**2. Requirements** — Node as pinned in `.nvmrc` (currently `24.18.0`) and npm. One line saying
`nvm use` in the repository root picks the pinned version up automatically. State that
`package.json`'s `engines.node` agrees with `.nvmrc` so there is no second source of truth.

**3. Getting started** — the exact sequence, as a copy-pasteable block:

```bash
nvm use
npm ci
npm run dev
```

Followed by what to expect: the dev server on `http://localhost:3000` serving a placeholder page.
Say plainly that the application is currently a skeleton with no data in it — a newcomer who opens
an almost-empty page needs to know that is the intended state, not a broken install.

Use `npm ci`, not `npm install`, consistent with the lockfile policy set in `E00_S01` and used by
the pipeline in `E00_S04`.

**4. Checks** — lead with the single entry point:

```bash
npm run ci
```

State that this runs every registered check in order, continues past a failure rather than stopping
at the first one, prints a per-check summary, and is exactly what the CI pipeline runs — so a red
build is reproducible locally without pushing.

Then a table or list of the individual commands with one line each on what it does and when to reach
for it on its own. Cover, at minimum, the scripts delivered by S01–S03:

| command | what it does | when to run it alone |
| --- | --- | --- |
| `npm run lint` | ESLint, warnings fail | after changing code, before pushing |
| `npm run typecheck` | `tsc --noEmit` | fastest signal on a type error |
| `npm run test` | Vitest, single run | after changing logic |
| `npm run build` | production Next.js build, type-checks too | before trusting a release |
| `npm run format:check` | Prettier, verify only | when a diff looks like whitespace |

Also mention the writing/watching variants that exist but are not checks — `npm run format`,
`npm run lint:fix`, `npm run test:watch`, `npm run start` — and say explicitly that CI never
rewrites files, which is why only `format:check` is registered.

**Verify each row by running the command before writing the row.** Take the script names from
`package.json` rather than from this task file; if any name here disagrees with `package.json`,
`package.json` wins and the discrepancy is worth flagging in the task's rapport.

**5. Project layout** — a short annotated list:

- `src/` — the application (Next.js App Router). All application code lives here.
- `scripts/ci/` — the CI check registry and its runner. See `docs/ci-checks.md` for how to add a
  check.
- `docs/` — technical documentation. Entry point: `docs/index.md`.
- `project/` — the scrum board, summaries and rapports. **Not application code**; it is excluded
  from linting and formatting on purpose.

Plus the one-line note that keeps a dependency alive:

> `@jenga-ai/agent` is a dependency of the agent harness that develops this repository, not of the
> application. It is never imported from `src/`. Do not remove it as unused.

**6. Documentation** — a link to [`docs/index.md`](docs/index.md), one line on what belongs there
rather than here.

### The domain-language constraint — already resolved, do not re-litigate

E00's Definition of Done requires both that the README says what Skolkartan is *and* that no file
references a kommun, skola, nyckeltal or data source. `E00_S05` resolved this and the resolution is
binding here:

- The ban governs **code, configuration, schema, fixtures and identifiers**. Nothing in this task
  produces any of those.
- The README's opening paragraph is prose framing the Epic itself mandates, so it stays — written at
  a **general** level.
- It names **no individual municipality, no individual school, no specific nyckeltal and no data
  source**. Not one. Not as an example, not in parentheses, not in a footnote.

An acceptable "What this is" reads roughly like:

> Skolkartan is a research tool that gathers publicly available school data for a set of Swedish
> municipalities into a single comparable dataset. Every figure it stores carries its source and the
> date it was retrieved, so any number can be traced back and re-checked. It is a personal research
> tool: no authentication, run locally or on a private URL.

Anything more specific belongs in `project/PROJECT_SUMMARY.md`, which already carries it. If the
opening paragraph feels thin, that is the intended outcome, not a defect to fix.

### Style

- English. E00 has no Swedish domain terms to preserve.
- Fenced `bash` blocks for anything meant to be copy-pasted, one command per line, no `$` prompt
  prefixes (they break paste).
- Relative links only. `docs/index.md`, not an absolute or remote URL.
- `npm run format` must leave `README.md` unchanged after this task; run it before finishing.

## Acceptance Criteria

- [ ] `README.md` exists at the repository root with all six sections — What this is, Requirements,
      Getting started, Checks, Project layout, Documentation — in that order.
- [ ] Every command named in the README exists as a script in `package.json`; a cross-check of the
      README against `package.json`'s `scripts` object shows no command in the README that is absent
      from `package.json`.
- [ ] Every command named in the README has been executed on this machine while writing the section
      that names it, and behaves as the README describes.
- [ ] The Getting started section gives `nvm use`, `npm ci`, `npm run dev` in that order and names
      `http://localhost:3000` as the local URL.
- [ ] The Checks section presents `npm run ci` as the single entry point and additionally documents
      `lint`, `typecheck`, `test`, `build` and `format:check` with one line each.
- [ ] The Checks section states that CI never rewrites files and that this is why only
      `format:check`, not `format`, is a registered check.
- [ ] The Project layout section describes `src/`, `scripts/ci/`, `docs/` and `project/`, and states
      that `project/` is not application code.
- [ ] The README explains that `@jenga-ai/agent` belongs to the agent harness rather than the
      application, is never imported from `src/`, and must not be removed as unused.
- [ ] `README.md` links to `docs/index.md` and the link resolves to an existing file.
- [ ] The "What this is" section names no individual municipality, no individual school, no specific
      nyckeltal and no data source — verified by reading it word by word, not by a grep.
- [ ] No section of the README other than "What this is" describes the project's subject matter at
      all.
- [ ] `npm run format:check` exits zero with `README.md` in the tree.

## Definition of Done

- [ ] All acceptance criteria are met and `npm run ci` exits zero.
- [ ] Any discrepancy found between this task file's assumed script names and the real
      `package.json` is resolved in favour of `package.json` and recorded in the task's rapport.
- [ ] No script was renamed, added or removed in order to make the README correct — the README was
      changed to match the repository, never the reverse.
- [ ] `README.md` is the only file created or modified by this task.
- [ ] `E00_S05_T03` can run the Getting started and Checks sections verbatim, with no additional
      knowledge, and reach a running dev server and a green `npm run ci`.
