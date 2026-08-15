---
id: E00
title: Project Foundation
status: Pending
date_created: 2026-08-15
date_started: null
date_completed: null
stories:
  - E00_S01
  - E00_S02
  - E00_S03
  - E00_S04
  - E00_S05
depends_on: []
docs: ["README.md"]
---

# Epic: Project Foundation

## Short Description

Stand up the empty-but-real repository skeleton that every later Epic builds inside: a Next.js
(App Router) application, TypeScript configuration, linting, formatting, a test runner, and a CI
pipeline that gates every merge. Also delivers the README and the documentation skeleton under
`docs/`. This Epic contains **no domain logic** — no kommun, no skola, no nyckeltal, no data
sources. Its product is the scaffolding and, critically, the **CI hook that later Epics plug
their own validators into**, so that a rule written once (for example källregister validation in
E01) is enforced automatically on every subsequent change.

## Purpose

Before E01 the repository has a `package.json` and little else. Every later Epic assumes a
working build, a place to put source files, a test command, and a CI job that will fail a bad
merge. Without this Epic each of those assumptions gets improvised nine different ways.

The second, less obvious purpose is the **extension point**. E01 produces
`npm run validate:kallor`; E02 will produce migration checks; E09 will produce freshness checks.
Each of those must run in CI. E00 defines *how* a new validator is registered so that later
Epics add one line rather than redesigning the pipeline.

## Scope

**In scope**

- Next.js App Router application skeleton that builds and serves an empty page.
- TypeScript configuration in strict mode, with path aliases for `src/`.
- Linting and formatting, runnable locally and in CI.
- A test runner with at least one passing example test.
- A CI pipeline that runs install, lint, typecheck, test and build on every push and pull request,
  and **blocks the merge on failure**.
- A documented, extensible validator hook so later Epics register additional CI checks.
- `README.md` and a `docs/` skeleton.

**Out of scope**

- Any domain model, database, Postgres connection or migration tooling (E02).
- Any data source, connector, registry or fixture (E01 onwards).
- Deployment and scheduled runs (E09).
- Authentication, multi-user concerns — the project is a personal research tool.

## Stories

Five stories, strictly sequential — each wave depends on the one before it.

- **E00_S01 — Application skeleton and TypeScript configuration** *(wave 1, blocking)*
  Next.js App Router skeleton under `src/`, strict `tsconfig.json` with the `@/*` path alias, and
  the `dev` / `build` / `start` / `typecheck` scripts. Makes `npm ci && npm run build` work at all.
- **E00_S02 — Linting, formatting and the test runner** *(wave 2)*
  ESLint flat config with type-aware rules, Prettier owning formatting exclusively, and Vitest with
  one meaningful example test. Completes the four base commands.
- **E00_S03 — Extensible CI check registry** *(wave 3)*
  The Epic's crown jewel: `scripts/ci/checks.ts` plus a runner behind `npm run ci`, documented in
  `docs/ci-checks.md`, proven by adding and removing a throwaway example validator. Later Epics
  register a check with one npm script and one array entry.
- **E00_S04 — CI pipeline and merge gate** *(wave 4)*
  A GitHub Actions workflow whose only execution step is `npm run ci`, plus branch protection, and
  a demonstration that a type error, a lint violation and a failing test each block the merge.
- **E00_S05 — README and documentation skeleton** *(wave 5, closes the Epic)*
  `README.md` from clone to checks, `docs/index.md` with the convention for adding pages, and the
  final sweep confirming every Definition-of-Done item and the absence of domain leakage.

## Definition of Done

- [ ] A fresh clone followed by `npm install && npm run build` succeeds with no manual steps
      beyond the Node version pinned in `.nvmrc`.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` and `npm run build` all exist and pass.
- [ ] TypeScript runs in strict mode and the build fails on a type error.
- [ ] CI runs all four commands on every push and pull request and a deliberately broken commit
      is demonstrated to fail the pipeline.
- [ ] The mechanism for registering an additional CI validator is documented in `docs/`, and a
      throwaway example validator has been added and removed to prove it works.
- [ ] `README.md` states what Skolkartan is, how to run it locally, and how to run the checks.
- [ ] A `docs/` directory exists with an index page that later Epics can add to.
- [ ] No file in the repository references a kommun, skola, nyckeltal or data source.
