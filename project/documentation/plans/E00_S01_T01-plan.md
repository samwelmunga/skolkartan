# Execution Plan — E00_S01_T01

**Task**: Install the Next.js toolchain and define package.json scripts
**Story**: E00_S01 — Application skeleton and TypeScript configuration
**Epic**: E00 — Project Foundation
**Date**: 2026-08-15

## Objective

Turn the near-empty `package.json` into a real application manifest: metadata, Next/React/TypeScript
dependencies, exactly four scripts, and an `engines.node` declaration that agrees with `.nvmrc`.
No `tsconfig.json`, no `next.config.ts`, no files under `src/` — those belong to `E00_S01_T02`.

## Scope boundary

| Owned by this task | Owned elsewhere |
|---|---|
| `package.json` (metadata, deps, 4 scripts, engines) | `tsconfig.json`, `next.config.ts`, `src/**` — `E00_S01_T02` |
| `package-lock.json` | `.gitignore` — `E00_S01_T03` |
| this plan + summary | `docs/decisions.md` — `E00_S01_T04` |
| task front-matter for `E00_S01_T01` | ESLint / Prettier / Vitest — `E00_S02` |

Sibling agents are editing the same working directory. Files outside the "Owned" column are not
touched, and no git write commands are run.

## Steps

1. Read task, story, epic and `PROJECT_SUMMARY.md`. (done)
2. Confirm a Node 24.18.0 runtime is available so installs happen under the runtime `.nvmrc` and
   `engines.node` both name. The ambient shell is Node 20.10.0; `nvm` has 24.18.0 installed, so all
   npm commands are run through `nvm use 24.18.0`. Installing under a runtime that violates the
   declared `engines` range would emit `EBADENGINE` warnings and produce a lockfile built by the
   wrong npm major.
3. Install runtime dependencies with caret ranges:
   `npm install next@latest react@latest react-dom@latest`.
4. Install dev dependencies with caret ranges:
   `npm install --save-dev typescript @types/node @types/react @types/react-dom`.
5. Run `npm ls next` and assert the installed major is >= 15. If it is not, stop and raise it rather
   than silently invalidating the `next.config.ts` decision recorded in the story.
6. Edit `package.json` to add `name`, `version`, `private`, the four scripts and `engines`. Confirm
   no `"type"` field is present and `@jenga-ai/agent` is still in `dependencies` at `^1.0.1`.
7. Verify: `rm -rf node_modules && npm ci` from a clean state, checking for prompts, errors and any
   lockfile-drift warning.
8. Verify `npm run dev`/`build`/`start`/`typecheck` resolve as script names. `build` and `typecheck`
   are expected to fail because `tsconfig.json` and `src/` do not exist yet — that is the documented
   handoff to `E00_S01_T02`, not a defect, and the acceptance criteria deliberately do not require
   them to pass.
9. Write the execution summary, recording the expected `build`/`typecheck` failure and its cause.
10. Update task front-matter to `status: Passed` with start/completion dates.

## Risks and mitigations

- **Concurrent edits to `package.json`.** Siblings T02/T03/T04 could touch the same file. Mitigation:
  read `package.json` immediately before writing, add only the fields this task owns, and re-read
  after the installs so npm's own rewrites are picked up rather than overwritten.
- **`next@latest` may be Next 16, not 15.** The criterion is ">= 15", so 16 satisfies it. Verified
  with `npm ls next` rather than assumed.
- **Ambient Node is 20.10.0.** Mitigated by running every npm command under nvm 24.18.0.
- **`npm ci` deletes `node_modules/`,** which siblings may be reading. Accepted: it is an explicit
  Definition-of-Done item, it is run once, and it restores the tree immediately.

## Verification commands

```
node -v && npm -v
npm ls next
npm pkg get name version private type scripts engines dependencies devDependencies
rm -rf node_modules && npm ci
npm run typecheck   # expected to fail — no tsconfig.json yet (E00_S01_T02)
npm run build       # expected to fail — no src/ yet (E00_S01_T02)
```

## Domain constraint

E00 is pure infrastructure. None of the project's domain terms — municipality, school, metric or
data-source concepts — appear in any file this task creates or modifies. Checked by grepping the
produced files before completion.
