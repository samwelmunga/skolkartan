---
id: E00_S02
title: Linting, formatting and the test runner
status: Pending
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
tasks:
  - E00_S02_T01
  - E00_S02_T02
  - E00_S02_T03
  - E00_S02_T04
depends_on:
  - E00_S01
---

# Story: Linting, formatting and the test runner

**ID**: E00_S02
**Epic**: E00 — Project Foundation
**Status**: Pending
**Date Added**: 2026-08-15
**Wave**: 2 — needs the application skeleton and `tsconfig.json` from S01. Blocks S03, which
registers these commands as CI checks.

## User Story

As the maintainer of Skolkartan, I want lint, format and test commands that behave identically on
my machine and in CI, so that code quality is enforced by a command rather than by whoever is
paying attention that day.

## Description

S01 delivered a build and a typecheck. This story delivers the remaining two of the four base
commands the Epic requires — `npm run lint` and `npm run test` — plus formatting, which is not in
the Epic DoD but is the thing that stops lint output being drowned in whitespace noise.

### Division of responsibility — decision made

**Prettier owns formatting exclusively. ESLint never reports a formatting rule.** The two tools
overlap by default and the overlap produces contradictory autofixes. `eslint-config-prettier` is
therefore loaded **last** in the ESLint config to switch off every stylistic rule. If a diff is
about whitespace, quotes or line width, Prettier decides; if it is about correctness, ESLint
decides.

### ESLint

- Flat config at `eslint.config.mjs` (the array form; `.eslintrc` is not used).
- Composed from `@eslint/js` recommended, `typescript-eslint` type-aware recommended,
  `eslint-config-next`, and `eslint-config-prettier` last.
- Type-aware linting is enabled by pointing typescript-eslint at the project's `tsconfig.json`, so
  rules that need type information actually work. This is slower; it is worth it.
- Ignores mirror `.gitignore`: `node_modules/`, `.next/`, `out/`, plus `project/` — the scrum board
  is Markdown, not source.

`npm run lint` runs `eslint . --max-warnings=0`. **Warnings fail.** A warning that never fails the
build is a comment with extra steps, and a repository that tolerates fifty of them cannot see the
fifty-first.

### Prettier

- `.prettierrc.json` and `.prettierignore`.
- `npm run format` writes; `npm run format:check` verifies and exits non-zero on a diff.
- Only `format:check` is registered as a CI check in S03 — CI must never rewrite files.

### Test runner — Vitest over Jest

Chosen for native ESM and TypeScript support with no Babel layer, a fast watch mode, and config
that shares resolution with the rest of the toolchain. Jest would need extra transform and ESM
configuration to reach the same place.

- `vitest.config.ts`, environment `node`.
- The alias `@/*` → `./src/*` is configured for Vitest as well, so imports look identical in tests
  and in source. Proving this works is an acceptance criterion — a path alias that resolves in the
  build but not in tests is a trap that costs an hour the first time someone hits it.
- A browser-like environment (`jsdom` or `happy-dom`) is **not** configured now. The Epic that
  first renders a component owns that addition.
- **No coverage threshold is set.** There is nothing meaningful to cover in an empty skeleton, and
  a threshold on a near-empty codebase is a number that gets lowered rather than met. Coverage is
  available via `vitest run --coverage` but is not gated. Recorded decision.

### The example test

The Epic requires "at least one passing example test". Rather than a meaningless
`expect(1 + 1).toBe(2)`, the example tests a small, genuinely useful, entirely domain-free
utility: `src/lib/assertNever.ts`, an exhaustiveness helper that throws on an unexpected value.
Later Epics will use it on their union types.

The test therefore proves four things at once: the runner works, TypeScript compiles inside tests,
the `@/` alias resolves in tests, and strict mode is active. That is a better use of the first test
than a tautology.

### Scripts introduced by this story

`lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`.

## Acceptance Criteria

- [ ] `eslint.config.mjs` exists in flat-config form and composes the four layers listed above,
      with `eslint-config-prettier` last.
- [ ] Type-aware typescript-eslint rules are enabled and demonstrably active — a rule requiring
      type information is shown to fire on a deliberate violation.
- [ ] `npm run lint` runs `eslint .` with `--max-warnings=0` and exits zero on the clean tree.
- [ ] A deliberate lint violation makes `npm run lint` exit non-zero and names the file and rule;
      the violation is then removed and lint passes again.
- [ ] `npm run format:check` exits zero on the clean tree and non-zero on a deliberately
      misformatted file.
- [ ] `npm run format` fixes that file and `format:check` then passes.
- [ ] Running `npm run format` immediately after `npm run lint:fix` produces no diff — the two
      tools do not fight.
- [ ] `src/lib/assertNever.ts` exists with a test that passes under `npm run test`.
- [ ] That test imports the utility through the `@/` alias, proving alias resolution inside Vitest.
- [ ] `npm run test` exits non-zero when a test is made to fail, and the failure names the test.
- [ ] `npm run test:watch` starts and re-runs on file change.

## Definition of Done

- [ ] All acceptance criteria are met and all four base commands — `lint`, `typecheck`, `test`,
      `build` — exist and pass on a clean tree.
- [ ] The Prettier-owns-formatting decision and the no-coverage-threshold decision are written
      down where the next reader will find them.
- [ ] The lint ignore list does not silently exclude `src/` or `scripts/`; anything excluded is
      excluded on purpose and the reason is stated.
- [ ] No kommun, skola, nyckeltal or data source is referenced anywhere in this story's output —
      including in test fixtures, which must stay abstract.
- [ ] S03 can register `lint`, `typecheck`, `test` and `build` as CI checks by name without
      renaming or rewrapping any of them.
