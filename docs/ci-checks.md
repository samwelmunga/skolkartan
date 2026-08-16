# CI checks

Every automated check this project enforces on a merge lives in one ordered list:
`scripts/ci/checks.ts`. `npm run ci` runs that list, and the CI workflow runs `npm run ci` and
nothing else.

This exists so that an Epic that produces a validator — E01's `validate:kallor`, E02's migration
checks, E09's freshness checks — can have it enforced without redesigning the pipeline. Registering
a check is two edits and no design work.

## The descriptor

```ts
export type Check = {
  id: string; // stable kebab-case identifier
  description: string; // one line, printed in the summary
  command: string; // an npm script name, invoked as `npm run <command>`
  owner: string; // the Epic that registered it
};
```

- **`id`** identifies the check in summary output and in the duplicate guard. It is stable: changing
  it breaks the link between a red build and whatever explains the rule.
- **`description`** is one line, shown when the check starts.
- **`command`** is an **npm script name**, not a shell string. The runner invokes it as
  `npm run <command>`. This keeps every check runnable standalone by a developer, keeps quoting and
  shell-portability problems out of the registry, and stops the registry becoming a place where
  inline shell logic accumulates.
- **`owner`** is the Epic that registered the check, e.g. `"E00"`, `"E01"`. When a check fails
  eighteen months from now, the first question is whose rule it is and which Epic's story explains
  it. This matches the project's no-fact-without-provenance convention.

## Registering a check

1. Add the npm script to `package.json`.
2. Append one `Check` entry to `scripts/ci/checks.ts` with your Epic as `owner`.

Nothing else. In particular:

> **`.github/workflows/` contains no list of checks and must not be edited to add one.** The
> workflow has exactly one execution step, `npm run ci`. If you find yourself editing it to add a
> check, stop — that is a sign this mechanism failed and should be amended, not worked around.

### Worked example — E01's `validate:kallor`

`E01_S01` is the first external consumer. Its acceptance criterion "registered in CI through the E00
validator hook and blocks a merge on failure" is satisfied by these two edits and nothing more.

Edit 1, `package.json`:

```json
"validate:kallor": "node scripts/kallor/validate.ts"
```

Edit 2, appended to the `checks` array in `scripts/ci/checks.ts`:

```ts
{
  id: 'validate-kallor',
  description: 'Källregistret validates against its schema',
  command: 'validate:kallor',
  owner: 'E01',
},
```

E02 and E09 register the same way.

## Behaviour

**Validation before execution.** Before running anything, the runner refuses to proceed — exiting
non-zero without running a single check — if two entries share an `id`, or if an entry's `command`
is not a key in `package.json`'s `scripts`. It names the offending entry. This guard is what makes
one-line registration safe: a typo fails loudly instead of silently skipping a check everyone then
believes is running.

**Fail-slow.** The runner executes every check in declared order **even after one fails**, then
exits non-zero if any failed. A pipeline that reports only the first error costs a full
push-and-wait cycle per error.

**Any non-zero exit is a failure.** `npm run typecheck` exits `2`, not `1`. The runner tests for
exit code `0` and treats everything else as failure.

**Output.** A failing check's output is reproduced in full; a passing check's output is suppressed.
Every run ends with one summary line per check — id, owner, PASS/FAIL, duration — and a final count:

```
=== summary
lint         E00            PASS  4.0s
typecheck    E00            PASS  1.0s
test         E00            PASS  0.6s
build        E00            PASS  9.4s
4 checks: 4 passed, 0 failed
```

**No privileged path.** The four base checks are ordinary registry entries. The extension mechanism
is therefore exercised by the project's own checks on every run, rather than being a second-class
add-on that quietly rots.

**Local/CI parity.** `npm run ci` is the single entry point and behaves identically in both places,
so a red build is reproducible locally without pushing.

## Running it

```
npm run ci
```

The runner is executed as `node scripts/ci/run-checks.ts`, relying on Node 24's built-in TypeScript
type stripping, which the `.nvmrc` pin of `24.18.0` guarantees; no `tsx` dependency is used. The
consequence is that `scripts/ci/*.ts` must stay within erasable TypeScript syntax — no enums, no
namespaces, no parameter properties — and relative imports carry their real `.ts` extension.
`tsconfig.json` includes `scripts/**/*`, so `npm run typecheck` type-checks the registry and a
malformed entry is a type error before it ever reaches the runner.

## The pipeline

`.github/workflows/ci.yml` contains one job, `checks`, and one execution step: `npm run ci`. The
workflow triggers on `push` to `main` and on `pull_request` targeting `main`.

Concurrency is grouped by ref with `cancel-in-progress: true` so that a superseding push cancels
the run it made obsolete rather than letting stale results queue up.

Node is set up from `.nvmrc` with the npm cache enabled. Dependencies are installed with `npm ci`
— not `npm install`. Lockfile drift is a defect worth failing on.

> **The workflow has no list of checks and must not be edited to add one.** Its single execution
> step is `npm run ci`. When a new Epic registers a check, only `package.json` and
> `scripts/ci/checks.ts` change; the workflow file stays as-is. That is the point of the
> registry.
