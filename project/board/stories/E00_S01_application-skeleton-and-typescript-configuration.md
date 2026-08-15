---
id: E00_S01
title: Application skeleton and TypeScript configuration
status: Pending
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
tasks:
  - E00_S01_T01
  - E00_S01_T02
  - E00_S01_T03
  - E00_S01_T04
  - E00_S01_T05
depends_on: []
---

# Story: Application skeleton and TypeScript configuration

**ID**: E00_S01
**Epic**: E00 — Project Foundation
**Status**: Pending
**Date Added**: 2026-08-15
**Wave**: 1 — blocking. S02–S05 cannot start until this is done, and no story in any later Epic
can start either. This is the first real code in the repository.

## User Story

As the maintainer of Skolkartan, I want a fresh clone of the repository to install and build with
two commands, so that every later story has a working application to add files to instead of
improvising its own build.

## Description

Today the repository has a `package.json` with a single dependency (`@jenga-ai/agent`), no
scripts, a `.nvmrc` pinning Node 24.18.0, and a `.gitignore`. There is no `src/`, no TypeScript
configuration and nothing to build. This story fixes exactly that and nothing more.

The deliverable is an **empty-but-real** Next.js App Router application: it compiles, it serves one
placeholder page, and it contains no domain logic of any kind.

### Layout

- `src/app/layout.tsx` — root layout. `<html lang="sv">`, because the project's audience and
  eventual content are Swedish. This is a locale setting, not domain content.
- `src/app/page.tsx` — a placeholder page rendering the project name and a link to the README.
  No data, no fetch, no state.
- `src/lib/` — created, empty (`.gitkeep`), reserved for shared modules. S02 puts the first real
  file here.
- `next.config.ts` — minimal, typed, no experimental flags.
- `tsconfig.json` — see below.

### TypeScript configuration — decisions made

`strict: true` is the baseline, plus these deliberately-chosen extras:

| option | value | why |
|---|---|---|
| `strict` | `true` | required by the Epic DoD |
| `noUncheckedIndexedAccess` | `true` | array and record access returns `T \| undefined`; later Epics parse external payloads and must not assume presence |
| `noImplicitOverride` | `true` | cheap, catches real mistakes |
| `forceConsistentCasingInFileNames` | `true` | macOS is case-insensitive, CI on Linux is not |
| `isolatedModules` | `true` | required by the Next.js compiler |
| `moduleResolution` | `bundler` | matches how Next resolves |
| `noEmit` | `true` | Next owns emit; `tsc` is used only for checking |

`exactOptionalPropertyTypes` is deliberately **not** enabled — it interacts badly with the
third-party types later Epics will pull in, and the cost outweighs the benefit for a personal
research tool. This is a recorded decision, not an oversight.

**Path alias**: `baseUrl: "."` with `paths: { "@/*": ["./src/*"] }`. Every import from `src/` uses
`@/…`, never a relative path climbing more than one level. S02 proves the alias also resolves
inside tests.

### Type errors must break the build

`next build` type-checks by default. `typescript.ignoreBuildErrors` must remain `false` — setting
it true at any point is a defect, not a workaround. A separate `npm run typecheck` running
`tsc --noEmit` exists so type errors can be found in about a second without a full build; both must
fail on a type error.

### Dependency and lockfile policy

- Dependencies use caret ranges; `package-lock.json` is committed.
- CI (S04) uses `npm ci`, not `npm install`, so a lockfile that has drifted from `package.json`
  fails the build rather than being silently repaired.
- `engines.node` is set to `>=24.18.0` so it agrees with `.nvmrc`. Two files stating the Node
  version that disagree is worse than one.
- `@jenga-ai/agent` is left in place. It belongs to the agent harness, not to the application. It
  must never be imported from `src/`, and a one-line note in `package.json`'s surroundings or the
  README (S05) records why it is there.

### Scripts introduced by this story

`dev`, `build`, `start`, `typecheck`. Lint, format and test arrive in S02; `ci` arrives in S03.

## Acceptance Criteria

- [ ] A fresh clone into an empty directory, on Node 24.18.0 as pinned by `.nvmrc`, followed by
      `npm ci && npm run build`, succeeds with no manual steps and no prompts.
- [ ] `npm run dev` serves the placeholder page locally and `npm run start` serves the built
      output.
- [ ] `src/app/layout.tsx` and `src/app/page.tsx` exist and the page renders without console
      errors or warnings.
- [ ] `tsconfig.json` sets `strict: true`, `noUncheckedIndexedAccess: true`,
      `noImplicitOverride: true`, `forceConsistentCasingInFileNames: true` and `noEmit: true`.
- [ ] The path alias `@/*` → `./src/*` is configured and demonstrably resolves from a file under
      `src/app/`.
- [ ] `npm run typecheck` exists, runs `tsc --noEmit`, and exits zero on the clean tree.
- [ ] Introducing a deliberate type error causes **both** `npm run typecheck` and `npm run build`
      to exit non-zero; the error is then removed and both pass again.
- [ ] `typescript.ignoreBuildErrors` is absent or `false` in `next.config.ts`.
- [ ] `.gitignore` covers `node_modules/`, `.next/`, `out/`, `*.tsbuildinfo` and `.env*.local`,
      and `git status` is clean immediately after a build.
- [ ] `package.json` declares `engines.node` consistent with `.nvmrc`, and
      `package-lock.json` is committed and in sync.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] Deleting `node_modules/` and `.next/` and repeating `npm ci && npm run build` reproduces a
      successful build — the result does not depend on leftover local state.
- [ ] The `exactOptionalPropertyTypes` decision and the `@jenga-ai/agent` decision are written down
      where the next reader will find them, not left as tribal knowledge.
- [ ] No kommun, skola, nyckeltal or data source is referenced anywhere in this story's output.
      No domain model, no database client, no fixture, no external API call.
- [ ] S02 can add lint, format and test tooling without changing `tsconfig.json`'s strictness
      settings or the path alias; any change needed after this point is an amendment, not an
      assumption.
