---
id: E00_S01_T01
title: Install the Next.js toolchain and define package.json scripts
status: Passed
story_id: E00_S01
epic_id: E00
date_created: 2026-08-15
date_started: 2026-08-15
date_completed: 2026-08-15
depends_on: []
---

# Task: Install the Next.js toolchain and define package.json scripts

## Description

Turn the repository's near-empty `package.json` into a real application manifest: the Next.js,
React and TypeScript dependencies, the four scripts this story introduces, and the `engines.node`
declaration that agrees with `.nvmrc`.

This task installs and declares. It writes **no** `tsconfig.json`, **no** `next.config.ts` and
**no** file under `src/` — `E00_S01_T02` owns all of those. Consequently `npm run build` and
`npm run typecheck` are **expected to fail** at the end of this task, and that is not a defect.
The acceptance criteria below deliberately do not require them to pass.

### Starting state

`package.json` currently contains exactly this:

```json
{
  "dependencies": {
    "@jenga-ai/agent": "^1.0.1"
  }
}
```

There is no `name`, no `private` flag, no `scripts` block and no `engines` block. `.nvmrc` pins
`24.18.0`. `package-lock.json` exists and `node_modules/` is installed.

### Manifest metadata

Add the following top-level fields:

- `"name": "skolkartan"`
- `"version": "0.1.0"`
- `"private": true` — this is a personal research tool and must never be publishable to npm.

Do **not** add a `"type"` field. Next.js resolves `next.config.ts` on its own and setting
`"type": "module"` changes how every `.js` file in the repository is interpreted, which is a
larger decision than this task should make silently.

### Dependencies

Install into `dependencies` with caret ranges:

- `next` — must be a version that supports a TypeScript config file (`next.config.ts`), i.e.
  Next 15 or later. Install the current latest.
- `react`
- `react-dom`

Install into `devDependencies` with caret ranges:

- `typescript`
- `@types/node`
- `@types/react`
- `@types/react-dom`

Concretely:

```bash
npm install next@latest react@latest react-dom@latest
npm install --save-dev typescript @types/node @types/react @types/react-dom
```

Verify the installed Next.js major version is 15 or higher (`npm ls next`) before continuing. If
the current latest is older than 15, stop and raise it rather than silently downgrading the
`next.config.ts` decision recorded in the story.

### `@jenga-ai/agent` stays

`@jenga-ai/agent` remains in `dependencies` untouched. It belongs to the agent harness, not to the
application, and must never be imported from `src/`. Do not move it to `devDependencies`, do not
remove it, and do not add a comment about it here — `E00_S01_T04` records why it is present.

### Scripts

Add exactly these four, and no others. `lint`, `format`, `format:check`, `test` and `test:watch`
arrive in `E00_S02`; `ci` arrives in `E00_S03`. Sibling tasks are editing `package.json` in
parallel worktrees, so every extra line here is somebody else's merge conflict.

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "typecheck": "tsc --noEmit"
}
```

`typecheck` runs `tsc --noEmit` so a type error can be found in about a second without paying for
a full `next build`. Both must fail on a type error; `E00_S01_T05` proves that.

### Engines

```json
"engines": {
  "node": ">=24.18.0"
}
```

This is chosen to agree with `.nvmrc`. Two files stating the Node version that disagree is worse
than one file stating it, so any future bump must change both.

### Lockfile policy

`package-lock.json` is committed and must be in sync with `package.json`. CI (`E00_S04`) runs
`npm ci`, not `npm install`, so a drifted lockfile fails the build rather than being silently
repaired. Commit the lockfile changes produced by the installs above in the same commit as the
`package.json` changes.

### Domain constraint

E00 is pure infrastructure. No kommun, skola, nyckeltal or data source may appear in any file this
task creates or modifies.

## Acceptance Criteria

- [ ] `package.json` declares `"name": "skolkartan"`, `"version"`, and `"private": true`.
- [ ] `package.json` has no `"type"` field.
- [ ] `next`, `react` and `react-dom` appear in `dependencies` with caret ranges.
- [ ] `typescript`, `@types/node`, `@types/react` and `@types/react-dom` appear in
      `devDependencies` with caret ranges.
- [ ] `npm ls next` reports an installed Next.js version of 15 or higher.
- [ ] `@jenga-ai/agent` is still present in `dependencies` with its original caret range and has
      not been moved or removed.
- [ ] `package.json` contains exactly the four scripts `dev`, `build`, `start` and `typecheck`,
      with the commands given above and no additional scripts.
- [ ] `package.json` declares `"engines": { "node": ">=24.18.0" }`, matching the `24.18.0` in
      `.nvmrc`.
- [ ] `package-lock.json` is updated and committed, and `npm ci` on a removed `node_modules/`
      completes without error or warning about lockfile drift.
- [ ] No file created or modified by this task references a kommun, skola, nyckeltal or data
      source.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] `rm -rf node_modules && npm ci` succeeds from a clean state with no prompts.
- [ ] No `tsconfig.json`, `next.config.ts` or file under `src/` was created by this task.
- [ ] The four script names are exactly `dev`, `build`, `start` and `typecheck`, so `E00_S03` can
      register `typecheck` and `build` as CI checks by name without renaming or rewrapping them.
- [ ] It is recorded in the task's rapport that `npm run build` and `npm run typecheck` do not yet
      pass, and that `E00_S01_T02` is what makes them pass.
