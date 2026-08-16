# E00_S03_T01 — Plan

## Goal

A registry a later Epic appends one entry to, and a runner that executes it. No privileged path for
the four base checks.

## Approach

- `scripts/ci/checks.ts` — `Check` type + ordered `checks` array, four entries, `owner: "E00"`.
- `scripts/ci/run-checks.ts` — pre-flight guards (duplicate `id`, `command` not a package.json
  script) that exit non-zero before running anything; then fail-slow execution of every entry via
  `npm run <command>`; summary line per check; exit non-zero if any failed. Success is
  `status === 0` only — `typecheck` exits 2.
- `scripts/ci/run-checks.test.ts` — unit tests for both guards, via an exported `validateRegistry`.
- `tsconfig.json`: add `scripts/**/*` to `include`. `vitest.config.ts`: add `scripts/**/*.test.ts`.
- `package.json`: add `"ci"`.
- `docs/ci-checks.md`: descriptor, two-step registration, fail-slow, do-not-edit-workflows, and
  E01's `validate:kallor` as a worked example.

## Execution decision

Try `node scripts/ci/run-checks.ts` on Node 24's built-in type stripping first (`.nvmrc` pins
24.18.0). Only add `tsx` if that fails. Record the outcome in a comment in the runner either way.

## Throwaway proof

Add `example-validator.ts` (no file under `docs/` is zero bytes) + `validate:example` script + a
fifth entry with `owner: "E00-throwaway"`; show 5 checks green; break it, show it FAILs while the
other four still run and the run exits non-zero; remove all three, show 4 checks green and a clean
`git status`.

## Risks

- Type stripping is erase-only: registry and runner must stay in erasable syntax, and relative
  imports need the real `.ts` extension.
- `scripts/` is not excluded by `.prettierignore` or eslint `ignores`, and `lint` runs
  `--max-warnings=0`, so the new files must be lint- and format-clean.

## Notes

Prior interrupted session left the tree mid-proof (steps 1–2 done, five entries in the registry).
Verify what is there rather than rewrite it, then carry out steps 3–5.
