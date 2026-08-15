---
id: E00_S02_T03
title: Vitest runner and the assertNever example test
status: Pending
story_id: E00_S02
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on: []
---

# Task: Vitest runner and the assertNever example test

## Description

Install and configure Vitest as the project's test runner, add the utility the first test exercises,
and add that test. Runner and test are one task because a test runner with no test is not verifiable,
and a placeholder test written only to verify the runner is the tautology this story explicitly
rejects.

Assumes `E00_S01` has landed: strict `tsconfig.json` with the `@/*` → `./src/*` path alias, and a
`src/lib/` directory (currently holding only `.gitkeep`). This task puts the first real file there.

Independent of `E00_S02_T01` (Prettier) and `E00_S02_T02` (ESLint) — those may run in parallel.
Add only the dependencies and scripts listed here.

### Why Vitest and not Jest — decided

Native ESM and TypeScript support with no Babel transform layer, a fast watch mode, and config that
shares module resolution with the rest of the toolchain. Jest would need additional transform and
ESM configuration to reach the same place, and that configuration is a maintenance surface with no
compensating benefit here.

### Dependency

Add `vitest` as a **devDependency** with a caret range. Nothing else — in particular **do not** add
`jsdom`, `happy-dom`, `@testing-library/*` or `@vitest/coverage-*`.

### `vitest.config.ts`

At the repository root:

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

Decisions embedded above, each to be recorded as a comment in the file:

- **`environment: 'node'`.** A browser-like environment (`jsdom` or `happy-dom`) is deliberately
  **not** configured. Nothing renders yet. The Epic that first renders a component owns that
  addition, and paying for a DOM shim in every test run until then is waste.
- **Explicit `resolve.alias` rather than `vite-tsconfig-paths`.** There is exactly one alias, and
  reading it from `tsconfig.json` would cost a dependency to save one line. If the alias set ever
  grows past two or three entries, switch to `vite-tsconfig-paths` — note that trigger in the
  comment so the decision has a stated expiry rather than becoming permanent by inertia.
- **No coverage threshold.** There is nothing meaningful to cover in an empty skeleton, and a
  threshold on a near-empty codebase is a number that gets lowered rather than met. Coverage
  remains available on demand via `vitest run --coverage` (which will prompt to install the
  coverage provider) but is not configured and not gated. Record this as a comment in
  `vitest.config.ts` — it is the file where the next person will go looking for it.
- **Tests are colocated** with the code they test, as `<name>.test.ts` beside `<name>.ts`. One
  convention, no parallel `__tests__` tree to keep in sync.

### Globals are off — and that is why `tsconfig.json` stays untouched

`describe`, `it` and `expect` are **imported explicitly from `vitest`** in every test file.
`test.globals` is not enabled. The reason is concrete: enabling globals requires adding
`"vitest/globals"` to `compilerOptions.types` in `tsconfig.json`, and `E00_S01`'s Definition of Done
requires this story to add test tooling **without** modifying `tsconfig.json`. Explicit imports cost
one line per test file and keep that promise. Record the reason in `vitest.config.ts`.

### `src/lib/assertNever.ts`

The utility the example test exercises — small, genuinely useful, entirely domain-free, and
something later Epics will actually reach for when they switch over union types:

```ts
/**
 * Exhaustiveness helper. Call it in the default branch of a switch over a union:
 * if every member is handled, `value` narrows to `never` and this compiles. If a
 * member is added later and left unhandled, the call becomes a type error at the
 * point the case was forgotten.
 *
 * At runtime it throws, so an unexpected value coming from outside the type system
 * (a parsed payload, for instance) fails loudly rather than falling through silently.
 */
export function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${String(value)}`);
}
```

### `src/lib/assertNever.test.ts`

The Epic requires "at least one passing example test". This one is chosen so that a single file
proves four things at once — the runner works, TypeScript compiles inside tests, the `@/` alias
resolves inside Vitest, and strict typing is active in tests. That is a materially better use of the
first test than `expect(1 + 1).toBe(2)`.

Requirements for the test file:

- Imports the utility **through the alias**: `import { assertNever } from '@/lib/assertNever';`.
  Never a relative path — the whole point is to prove the alias resolves under Vitest. A path alias
  that resolves in the build but not in tests is a trap that costs an hour the first time someone
  hits it, and this criterion is what stops that.
- Imports `describe`, `it` and `expect` from `vitest`.
- Case 1 — an exhaustive `switch` over a local, abstract union (for example
  `type Flavour = 'alpha' | 'beta'`) whose default branch calls `assertNever`, asserting the handled
  branches return their expected values. Keep the union abstract: no kommun, skola, nyckeltal or
  data source may appear, and that applies to test fixtures as strictly as to source.
- Case 2 — calling `assertNever` with an unexpected value (cast through `as never`) throws, and the
  thrown message contains the offending value.
- Case 3 — the custom `message` argument is used verbatim when supplied.
- Case 4 — a `// @ts-expect-error` line above a call passing a plainly non-`never` value. This
  proves the type system is live inside test files: if strictness were somehow off, the
  `@ts-expect-error` would itself become an error under `npm run typecheck`, so the criterion is
  self-enforcing.

### Scripts

Add to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

`test` is the single-run, CI-shaped form — it must not enter watch mode, because a CI job that
never exits is worse than one that fails.

### Proving failure is reported

A runner that cannot fail is not a runner. Temporarily change one assertion so it is false, run
`npm run test`, and confirm it exits non-zero and that the output names the failing test by its
`describe`/`it` title. Revert the change and confirm `npm run test` exits zero and `git status` is
clean. Record the failure output in the task's rapport.

## Acceptance Criteria

- [ ] `vitest` is in `devDependencies` with a caret range, and `package-lock.json` is updated and
      committed. No DOM environment package and no coverage provider package is added.
- [ ] `vitest.config.ts` exists at the repository root, sets `test.environment` to `'node'`, sets
      `test.include` to colocated `src/**/*.test.ts`, and maps `@` to `./src` under `resolve.alias`.
- [ ] `vitest.config.ts` carries comments recording: why `node` and not a DOM environment; why an
      explicit alias rather than `vite-tsconfig-paths`, including the trigger for revisiting it;
      why no coverage threshold is set; and why Vitest globals are off.
- [ ] `tsconfig.json` is unchanged by this task — `git diff` against the pre-task tree shows no
      modification to it, and in particular no `"vitest/globals"` entry was added to
      `compilerOptions.types`.
- [ ] `src/lib/assertNever.ts` exists, exports `assertNever(value: never, message?: string): never`,
      throws on call, and includes the doc comment explaining its purpose.
- [ ] `src/lib/assertNever.test.ts` exists and imports the utility as `@/lib/assertNever` — no
      relative import of the module under test appears in the file.
- [ ] `describe`, `it` and `expect` are imported from `vitest` explicitly; no reliance on globals.
- [ ] The test covers all four cases listed above: the exhaustive switch, the throw-on-unexpected
      value with the value present in the message, the custom message, and the `@ts-expect-error`
      call.
- [ ] `package.json` contains exactly the scripts `test` (`vitest run`) and `test:watch`
      (`vitest`), in addition to the scripts already present from `E00_S01`.
- [ ] `npm run test` exits zero on the clean tree and reports at least one passing test.
- [ ] `npm run test` exits non-zero when an assertion is deliberately made false, and the output
      names the failing test; the change is reverted and `npm run test` exits zero again.
- [ ] `npm run test:watch` starts, re-runs on a saved change to `src/lib/assertNever.test.ts`, and
      exits cleanly on interrupt.
- [ ] `npm run typecheck` passes with the test file present, confirming the `@ts-expect-error` line
      is consumed rather than reported as unused.
- [ ] No file created by this task references a kommun, skola, nyckeltal or data source — including
      the union used in the example test, which stays abstract.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] Removing the `resolve.alias` entry from `vitest.config.ts` is shown to make the test fail to
      resolve its import, and the entry is restored — proving the alias criterion is genuinely
      being exercised rather than accidentally satisfied by something else.
- [ ] `npm run build` still passes with the test file present, and the test file does not appear in
      the built output.
- [ ] No Prettier or ESLint package, config file or script was added by this task.
- [ ] The `test` script name is exactly `test`, so `E00_S03` can register it by name without
      renaming or rewrapping it, and `vitest run` does not enter watch mode under CI.
