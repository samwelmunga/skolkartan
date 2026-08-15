# Execution Summary — E00_S01_T01

**Task**: Install the Next.js toolchain and define package.json scripts
**Story**: E00_S01 — Application skeleton and TypeScript configuration
**Epic**: E00 — Project Foundation
**Status**: Passed
**Date started / completed**: 2026-08-15 / 2026-08-15

## What was implemented

`package.json` went from a two-line dependency stub to a real application manifest, and
`package-lock.json` was regenerated to match.

Final `package.json`:

```json
{
  "name": "skolkartan",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  },
  "engines": {
    "node": ">=24.18.0"
  },
  "dependencies": {
    "@jenga-ai/agent": "^1.0.1",
    "next": "^16.3.1",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@types/node": "^26.2.0",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "typescript": "^7.0.2"
  }
}
```

## Files changed

| File | Change |
|---|---|
| `package.json` | metadata, 4 scripts, `engines`, 3 runtime deps, 4 dev deps |
| `package-lock.json` | regenerated; root now records `skolkartan@0.1.0` and the `engines` range |
| `project/documentation/plans/E00_S01_T01-plan.md` | new — execution plan |
| `project/documentation/summaries/E00_S01_T01-summary.md` | new — this file |
| `project/board/tasks/E00_S01_T01_install-next-toolchain-and-define-package-scripts.md` | front-matter status/dates |
| `project/logs/events.json` | appended session-start and sender entries |

No `tsconfig.json`, no `next.config.ts` and no file under `src/` was created. `.gitignore` and
`docs/decisions.md` were not touched — they belong to `E00_S01_T03` and `E00_S01_T04`.

## Decisions made

1. **All npm commands were run under Node 24.18.0 via `nvm`.** The ambient shell in this environment
   is Node 20.10.0, which violates the `engines.node` range this task declares. Installing under it
   would have emitted `EBADENGINE` warnings and produced a lockfile built by npm 10 rather than the
   npm 11 that ships with Node 24. The lockfile in the repository is therefore the one a developer
   following `.nvmrc` will reproduce.
2. **`next@latest` resolved to 16.3.1**, not 15.x. The criterion is ">= 15", so this passes. Next 16
   supports `next.config.ts` natively, so the story's `next.config.ts` decision stands unchanged.
3. **`typescript@latest` resolved to 7.0.2** — the native TypeScript compiler, which is the current
   `latest` dist-tag (verified with `npm view typescript dist-tags`). The task said to install
   `typescript` without pinning, so latest was taken. See the handoff note below, because this is
   the one thing `E00_S01_T02` must be aware of.
4. **`react`/`react-dom` resolved to 19.2.8**, inside Next 16's peer range
   (`^18.2.0 || ^19.0.0`). No peer warnings.
5. **No `"type"` field was added**, per the task.
6. **Exactly four scripts.** `lint`, `format`, `format:check`, `test`, `test:watch` and `ci` were
   deliberately not reserved — they arrive in `E00_S02` and `E00_S03`.
7. **`@jenga-ai/agent` left untouched** at `^1.0.1` in `dependencies`.

## Verification

All commands run from the repository root under Node 24.18.0.

### Runtime

```
$ node -v && npm -v
v24.18.0
11.16.0
```

### `npm ls next` — major >= 15

```
$ npm ls next
skolkartan@ /Users/samwelmunga/Desktop/Projects/skolkartan
└── next@16.3.1
```

### Installed top-level dependencies

```
$ npm ls next react react-dom typescript @types/node @types/react @types/react-dom @jenga-ai/agent --depth=0
skolkartan@0.1.0 /Users/samwelmunga/Desktop/Projects/skolkartan
├── @jenga-ai/agent@1.0.1
├── @types/node@26.2.0
├── @types/react-dom@19.2.4
├── @types/react@19.2.18
├── next@16.3.1
├── react-dom@19.2.8
├── react@19.2.8
└── typescript@7.0.2
```

### Manifest fields (`type` is absent, so npm omits it from the output)

```
$ npm pkg get name version private type scripts engines
{
  "name": "skolkartan",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  },
  "engines": {
    "node": ">=24.18.0"
  }
}
```

### Exactly four scripts, named as `E00_S03` will reference them

```
$ npm run
Lifecycle scripts included in skolkartan@0.1.0:
  start
    next start
available via `npm run`:
  dev
    next dev
  build
    next build
  typecheck
    tsc --noEmit
```

(`start` is listed separately only because npm treats it as a lifecycle script; it is a normal entry
in the `scripts` block.)

### Clean-state `npm ci` — Definition of Done item

```
$ rm -rf node_modules && npm ci
npm warn deprecated prebuild-install@7.1.3: No longer maintained. Please contact the author of the relevant native addon; alternatives are available.

added 106 packages, and audited 107 packages in 12s

16 packages are looking for funding
  run `npm fund` for details

6 vulnerabilities (5 high, 1 critical)

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.
npm warn allow-scripts 3 packages have install scripts not yet covered by allowScripts:
npm warn allow-scripts   @jenga-ai/agent@1.0.1 (postinstall: node scripts/postinstall.js)
npm warn allow-scripts   protobufjs@6.11.6 (postinstall: node scripts/postinstall)
npm warn allow-scripts   sharp@0.32.6 (install: (node install/libvips && node install/dll-copy && prebuild-install) || (node install/can-compile && node-gyp rebuild && node install/dll-copy))
npm warn allow-scripts
npm warn allow-scripts Run `npm approve-scripts --allow-scripts-pending` to review, or `npm approve-scripts <pkg>` to allow.
EXIT=0
```

Exit 0, no prompts, and **no lockfile-drift warning** — which is what the acceptance criterion asks
for. The warnings that do appear are worth reading honestly rather than waving away:

- `deprecated prebuild-install`, the three `allow-scripts` notices and all 6 audit findings trace to
  the pre-existing `@jenga-ai/agent` tree (`sharp@0.32.6`, `protobufjs@6.11.6`), not to
  `next`/`react`/`typescript`. They were present before this task and are unchanged by it.
- `allow-scripts` is informational: `npm ci` still exited 0 and did not block.
- The audit findings are **not** silently accepted as fine. They are out of scope for this task,
  which may not alter `@jenga-ai/agent`, but they are a real finding worth an item on the board.

### `npm run typecheck` — expected to fail

```
$ npm run typecheck; echo "TYPECHECK_EXIT=$?"
> skolkartan@0.1.0 typecheck
> tsc --noEmit

Version 7.0.2
tsc: The TypeScript Compiler - Version 7.0.2

COMMON COMMANDS

  tsc
  Compiles the current project (tsconfig.json in the working directory.)
  ...
TYPECHECK_EXIT=1
```

There is no `tsconfig.json`, so `tsc` printed its help text and exited 1.

### `npm run build` — expected to fail

```
$ npm run build; echo "BUILD_EXIT=$?"
> skolkartan@0.1.0 build
> next build

▲ Next.js 16.3.1 (Turbopack)
✓ Running next.config took 9ms

> Build error occurred
Error: > Couldn't find any `pages` or `app` directory. Please create one under the project root
BUILD_EXIT=1
```

### Rapport: `build` and `typecheck` do not yet pass

Recorded here as required by the Definition of Done. **`npm run build` and `npm run typecheck` both
exit 1 at the end of this task, and this is not a defect.** This task installs and declares only; it
is forbidden from writing `tsconfig.json`, `next.config.ts` or anything under `src/`. `typecheck`
fails because `tsconfig.json` does not exist; `build` fails because no `app/` directory exists.
**`E00_S01_T02` is what makes both pass**, by creating `tsconfig.json`, `next.config.ts`,
`src/app/layout.tsx` and `src/app/page.tsx`. The acceptance criteria for this task deliberately do
not require either command to succeed.

### Working tree

`git status` shows `package.json` and `package-lock.json` modified. The `.next/` directory produced
by the failed build is ignored (`git check-ignore` → `.gitignore:18:.next/`), as is `node_modules/`
(`.gitignore:13:node_modules/`). Other modified paths in `git status` belong to the two sibling
agents working in this directory and were not touched.

### Domain constraint

`package.json` and `package-lock.json` were grepped for the project's domain vocabulary and its data
sources. No matches. The only domain-adjacent string is the mandated package name `skolkartan`.

## Acceptance criteria

| # | Criterion | Result |
|---|---|---|
| 1 | `name`, `version`, `private: true` | Pass |
| 2 | no `"type"` field | Pass |
| 3 | `next`, `react`, `react-dom` in `dependencies`, caret ranges | Pass |
| 4 | `typescript`, `@types/*` in `devDependencies`, caret ranges | Pass |
| 5 | `npm ls next` >= 15 | Pass — 16.3.1 |
| 6 | `@jenga-ai/agent` still in `dependencies` at `^1.0.1` | Pass |
| 7 | exactly the four scripts, exact commands | Pass |
| 8 | `engines.node` `>=24.18.0`, matching `.nvmrc` | Pass |
| 9 | `npm ci` on removed `node_modules/`, no drift warning | Pass |
| 10 | no domain reference in modified files | Pass |

Definition of Done items 2, 3 and 4 verified above. Item 5 (the rapport) is this section.
Commit of `package.json` and `package-lock.json` together is handled by the orchestrator, which
commits on the agent's behalf in this harness.

## Handoff to E00_S01_T02

Read this before writing `tsconfig.json`.

1. **TypeScript is 7.0.2 — the native compiler, not `tsc` 5.x.** This is `typescript@latest` today.
   Two consequences to check while writing `tsconfig.json`:
   - Confirm every option the story specifies is still honoured by TS 7:
     `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`,
     `forceConsistentCasingInFileNames`, `isolatedModules`, `moduleResolution: "bundler"`, `noEmit`,
     and the `baseUrl` + `paths` alias. `baseUrl` in particular has been on a deprecation path in
     recent TypeScript releases — if TS 7 rejects or warns on it, prefer `paths` without `baseUrl`
     (`"@/*": ["./src/*"]` resolves relative to the config file) and record the deviation rather
     than dropping the alias.
   - If TS 7 turns out to be incompatible with Next 16's type-checking, the fix is to pin
     `typescript` to `^5` in `devDependencies` and refresh the lockfile. That is a legitimate
     amendment; do not work around it by setting `typescript.ignoreBuildErrors`, which the story
     forbids outright.
2. **Next is 16.3.1 and builds with Turbopack by default.** `next.config.ts` is resolved natively —
   the build log line `✓ Running next.config took 9ms` confirms Next looks for it. Keep the config
   minimal and typed, with no experimental flags, per the story.
3. **`build` currently fails with `Couldn't find any 'pages' or 'app' directory`.** Because the
   application lives at `src/app/`, Next must be able to find it there — Next supports `src/app/`
   out of the box, so no config change should be needed, but this exact error disappearing is the
   signal that the layout is correct.
4. **Do not add scripts.** The four names are fixed so `E00_S03` can register `typecheck` and
   `build` as CI checks by name. Lint/format/test names belong to `E00_S02`.
5. **Node.** Use `nvm use 24.18.0` (or equivalent) before running anything. The default shell in
   this environment is Node 20.10.0, which is below the declared `engines` floor.
6. **`@jenga-ai/agent` must never be imported from `src/`.**

## Follow-up worth raising with the scrum master

`npm audit` reports 6 vulnerabilities (5 high, 1 critical), all inside the pre-existing
`@jenga-ai/agent` dependency tree — chiefly `sharp@0.32.6` and `protobufjs@6.11.6`. None come from
`next`, `react` or `typescript`. This task is explicitly forbidden from altering `@jenga-ai/agent`,
so nothing was changed. It is a genuine finding and should become a board item rather than being
buried in a summary: either the harness dependency gets upgraded, or the audit exception gets
recorded deliberately before `E00_S04` wires `npm audit` into CI.
