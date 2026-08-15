---
id: E00_S03_T01
title: The check registry module and typecheck coverage for scripts/
status: Pending
story_id: E00_S03
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on: []
---

# Task: The check registry module and typecheck coverage for scripts/

## Description

Create `scripts/ci/checks.ts` — the registry itself — and make `tsconfig.json` cover `scripts/**/*`
so a malformed registry entry is a **type error** rather than a runtime surprise.

This is the file every later Epic edits and the only one. E01 appends `validate:kallor` to it, E02
appends its migration checks, E09 appends its freshness checks. Everything else in this story exists
to serve this array.

Assumes `E00_S01` and `E00_S02` have landed: `tsconfig.json` exists in strict mode with `noEmit:
true` and the `@/*` → `./src/*` alias; `package.json` has the scripts `dev`, `build`, `start`,
`typecheck`, `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`.

This task creates the `scripts/` directory for the first time. `E00_S02_T01` and `E00_S02_T02`
already guaranteed that neither `.prettierignore` nor `eslint.config.mjs` excludes it, so the new
files are linted and format-checked from the moment they exist.

**Scope boundary.** This task writes `scripts/ci/checks.ts` and edits `tsconfig.json`. It does
**not** write the runner (`E00_S03_T02`), does not add the `ci` script, and does not create `docs/`.

### `scripts/ci/checks.ts`

Two exports and nothing else. No side effects, no I/O, no `console`, no imports from `src/` and no
use of the `@/` alias — the registry must stay loadable by a plain Node process that has never
touched the Next.js build.

```ts
export type Check = {
  /** Stable kebab-case identifier, e.g. "typecheck". Unique across the registry. */
  id: string;
  /** One line, printed in the summary output. */
  description: string;
  /** An npm script name, invoked as `npm run <command>`. */
  command: string;
  /** The Epic that registered this check, e.g. "E00", "E01". */
  owner: string;
};

export const checks: Check[] = [
  {
    id: 'lint',
    description: 'ESLint over the whole repository, warnings treated as failures',
    command: 'lint',
    owner: 'E00',
  },
  {
    id: 'typecheck',
    description: 'TypeScript strict-mode check over src/ and scripts/, no emit',
    command: 'typecheck',
    owner: 'E00',
  },
  {
    id: 'test',
    description: 'Vitest run over the whole test suite',
    command: 'test',
    owner: 'E00',
  },
  {
    id: 'build',
    description: 'Next.js production build',
    command: 'build',
    owner: 'E00',
  },
];
```

**Order is cheapest-first**: lint and typecheck return in seconds, test in tens of seconds, build
last because it is the slowest and its type errors have already been surfaced by `typecheck`. Since
the runner is fail-slow every check runs regardless, so this ordering only decides the order the
results are reported in — but a reader scanning the output top-down should meet the cheap failures
first. Record that reason in a comment above the array.

**No field is optional and none may be added here.** If a later Epic needs a fifth field, that is an
amendment to `E00_S03`, not a quiet edit.

### The four base checks are registered, not special-cased

The story's whole design rests on this: `lint`, `typecheck`, `test` and `build` are ordinary
registry entries with no privileged status. The extension mechanism is therefore exercised by the
project's own checks on every single run, instead of being a second-class add-on that quietly rots
until E01 discovers it does not work. Nothing in this task or the next may treat these four ids
specially.

### `format:check` is deliberately not registered — recorded decision

`E00_S02` states that of `format` and `format:check`, only `format:check` would ever be a CI check
(CI must never rewrite files). `E00_S03`'s acceptance criteria nonetheless fix the registry at
**exactly four** entries and do not list it.

`E00_S03` is authoritative for the registry's contents, so the registry gets four entries and
`format:check` is **not** added by this task. Record this in a comment next to the array with its
reason: adding it later is a one-line registration through the documented procedure, which is a
better demonstration of the mechanism than another entry that shipped with it. Do not add it here on
your own initiative — that is a story amendment.

### `tsconfig.json`

Two edits, both required by later tasks in this story:

1. **`include` must cover `scripts/**/*`.** Next.js scaffolds an `include` array and will rewrite
   `tsconfig.json` on `next build`; add the entry explicitly, then run `npm run build` and confirm
   the entry survived. If Next strips it, add it back and record the behaviour in a comment.
2. **`compilerOptions.allowImportingTsExtensions: true`.** `E00_S03_T02` imports the registry as
   `import { checks } from './checks.ts'` with an explicit extension, because Node's type stripping
   requires the real filename in the specifier. This option is only legal alongside `noEmit: true`,
   which `E00_S01` already set.

Do **not** touch any strictness option, the `@/*` path alias, `moduleResolution`, or
`typescript.ignoreBuildErrors`. `E00_S01`'s Definition of Done requires that this story adds its
files without changing those; if you believe one must change, stop and raise it as an amendment.

Note the side effect and accept it deliberately: because `scripts/**/*` is now in the project,
`next build` type-checks it too, so a broken registry fails both `npm run typecheck` and
`npm run build`. That is desirable. It does **not** mean Next bundles the scripts — nothing under
`src/app/` imports them, so they never enter a route.

### Domain constraint

E00 is pure infrastructure. No file created or modified by this task may reference a kommun, skola,
nyckeltal or data source — including the `description` strings, which describe tooling only.

## Acceptance Criteria

- [ ] `scripts/ci/checks.ts` exists and exports exactly two things: the type `Check` and the const
      `checks`.
- [ ] `Check` has exactly the four required fields `id`, `description`, `command` and `owner`, all
      `string`, each carrying a doc comment.
- [ ] `checks` is typed `Check[]` and contains exactly four entries, in this declared order: `lint`,
      `typecheck`, `test`, `build`.
- [ ] Every entry has `owner: 'E00'`, a unique kebab-case `id`, and a `command` that is present in
      `package.json`'s `scripts` (verified by reading both files side by side).
- [ ] `scripts/ci/checks.ts` contains no `import` statement, no `console` call, no file or process
      access, and no use of the `@/` alias.
- [ ] A comment above the array records the cheapest-first ordering reason and the decision not to
      register `format:check`.
- [ ] `tsconfig.json`'s `include` contains `scripts/**/*`, and the entry is still present after
      running `npm run build`.
- [ ] `tsconfig.json` sets `compilerOptions.allowImportingTsExtensions: true`.
- [ ] `git diff` on `tsconfig.json` shows changes to `include` and `allowImportingTsExtensions`
      only — no strictness option, path alias or `moduleResolution` value is modified.
- [ ] `npm run typecheck` exits zero on the clean tree.
- [ ] Temporarily changing one entry's `owner` from `'E00'` to `0` makes **both** `npm run typecheck`
      and `npm run build` exit non-zero, naming `scripts/ci/checks.ts`; the change is reverted and
      both pass again. The observed error output is recorded in the task's rapport.
- [ ] Temporarily adding an unknown field such as `severity: 'high'` to one entry also fails
      `npm run typecheck`; it is reverted.
- [ ] `npm run lint`, `npm run format:check`, `npm run test` and `npm run build` all exit zero with
      the new file present.
- [ ] No file created or modified by this task references a kommun, skola, nyckeltal or data source.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] `git status` is clean after running `npm run format` and `npm run build` — no generated or
      reformatted file is left uncommitted.
- [ ] The four base checks carry no marker, flag or naming convention that a later entry could not
      also carry — there is nothing in this file that distinguishes an E00 check from an E01 check
      other than the `owner` value.
- [ ] `scripts/ci/checks.ts` is the only file in the repository that enumerates checks; grepping for
      the four ids finds them in `package.json` (as script names) and in this file, nowhere else.
- [ ] `E00_S03_T02` can import `{ checks }` from `./checks.ts` and `E01_S01` can register its
      validator by appending one object literal, with no other change to this file's shape.
