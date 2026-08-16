# Decisions

Durable technical decisions taken by this project, with the reasoning behind them. A decision is
recorded here when reversing it by accident is plausible — either because it looks like an
oversight, or because the reason for it is not visible from the code.

Entries are append-only and dated, newest at the bottom. Superseding an entry means adding a new
one that says so, not editing the old one. Each entry names the Epic or Story it came from, states
the decision, gives the reason, and says what would justify revisiting it — a decision log without
a reversal condition turns into a rule nobody dares change.

## 2026-08-15 — `exactOptionalPropertyTypes` is not enabled

**Epic/Story:** E00_S01

**Decision:** TypeScript runs with `strict: true`, and on top of that baseline the project also
enables `noUncheckedIndexedAccess`, `noImplicitOverride` and `forceConsistentCasingInFileNames`.
`exactOptionalPropertyTypes` is deliberately left off. Its absence from `tsconfig.json` is a
choice made when the configuration was written, not a setting that was overlooked. Anyone reading
a strict config and noticing the gap should treat it as intentional and read this entry before
changing it.

**Reason:** `exactOptionalPropertyTypes` interacts badly with the third-party type definitions
that later Epics will pull in. It produces friction at every boundary where an optional property
of ours meets a library's own types, and that friction is paid repeatedly, at each such boundary,
rather than once. Skolkartan is a personal research tool, so the cost of absorbing that friction
outweighs the benefit the option would deliver.

**Revisit if:** the class of mistake this option guards against — the difference between a
property that is absent and a property explicitly set to `undefined` — starts showing up as real
bugs in this codebase; or the third-party surface the project depends on shrinks far enough that
turning the option on is cheap. Either condition makes the original trade-off stale and the
decision worth taking again.

## 2026-08-15 — `@jenga-ai/agent` is a dependency but is never imported

**Epic/Story:** E00_S01

**Decision:** `@jenga-ai/agent` stays declared in `dependencies` in `package.json`. Two rules
follow from that and both matter. It must never be imported from anywhere under `src/` — no
application code may reach for it. And it must not be removed on the grounds that it is unused,
because being unused by the application is its normal, expected state rather than a sign of rot.

**Reason:** the package belongs to the agent harness that operates on this repository, not to the
application the repository builds. Nothing under `src/` will ever import it, which means every
dependency-pruning tool, every unused-dependency audit and every reader skimming `package.json`
will flag it as dead weight and propose deleting it. Recording the reason here is what stops that
proposal being accepted. Note that the story which introduced this decision did not record why the
package sits in `dependencies` rather than `devDependencies`; that rationale was not written down,
and this entry does not invent one.

**Revisit if:** the agent harness stops being used on this repository. At that point the package
genuinely becomes dead weight and the reason for keeping it disappears with the harness.

## 2026-08-15 — the `@/*` alias is declared by `paths` alone, without `baseUrl`

**Epic/Story:** E00_S01

**Decision:** `tsconfig.json` declares the `@/*` alias through `paths` only. `baseUrl` is not set,
and must not be added. With no `baseUrl` present, `paths` anchors to the directory containing
`tsconfig.json`, which is the repository root, so `"@/*": ["./src/*"]` resolves as intended.

**Reason:** TypeScript 7 removed `baseUrl`. Setting it is not a deprecation warning but the hard
error `TS5102`, which fails `npm run typecheck` and `npm run build` outright. Nearly every
Next.js and TypeScript path-alias example still in circulation pairs `paths` with `baseUrl`, so
the natural instinct on seeing this config is that a line is missing. It is not. The alias was
verified to resolve under both `tsc` and Turbopack, and independently re-verified from a clean
clone, where a deliberate probe produced a type error rather than a module-not-found error —
proving resolution succeeded.

**Revisit if:** a future TypeScript release reintroduces `baseUrl`, or the project moves
`tsconfig.json` out of the repository root. The second case matters more: because `paths` is now
anchored to the config file's own directory, moving that file silently changes what `@/*` points
at, with no error to warn about it.

## 2026-08-16 — TypeScript is held at 6.x so that type-aware linting is possible

**Epic/Story:** E00_S02

**Decision:** `typescript` is pinned to `^6.0.3`, not the latest `7.x`. Upgrading to TypeScript 7
is blocked until typescript-eslint supports it, and the two must move together.

**Reason:** typescript-eslint 8.67 — the current release — declares a peer range of
`>=4.8.4 <6.1.0`. TypeScript 7 is the new native compiler and falls outside it, and no
typescript-eslint release supports 7 yet. Installing both is an `ERESOLVE` failure, and forcing it
through with `--legacy-peer-deps` would leave the linter reading a compiler API it was never built
against, where the plausible failure mode is type-aware rules silently degrading to syntactic ones
rather than crashing. That failure is invisible from the outside, which is what makes it worse
than a version conflict. Type-aware linting is the reason this configuration exists —
`no-floating-promises` is precisely the class of bug an ingestion codebase full of async work will
produce — so the project stays one major behind on TypeScript rather than giving it up.

This **supersedes the entry above on `baseUrl`** in one respect only: `baseUrl` was removed in
TypeScript 7, and on 6.x it exists again. It is still deliberately not set. `paths` alone resolves
correctly, the configuration is verified working, and adding `baseUrl` back would have to be undone
at the eventual 7.x upgrade. The reasoning in that entry about `paths` anchoring to the config
file's directory still holds.

**Revisit if:** typescript-eslint publishes a release whose peer range admits TypeScript 7. At that
point upgrade both together and re-run the floating-promise probe recorded in
`eslint.config.mjs`'s header comment, because a green lint run alone does not prove type
information reached the linter.

## 2026-08-16 — ESLint is held at 9.x, not 10.x

**Epic/Story:** E00_S02

**Decision:** `eslint` and `@eslint/js` are pinned to `^9.39.5`. ESLint 10 is installable and its
peer ranges are satisfied, but it does not work here.

**Reason:** under ESLint 10.8.1 every lint run aborted with
`TypeError: scopeManager.addGlobals is not a function`, thrown from ESLint's own
`source-code.js` while finalising a source file. It is an internal API mismatch between ESLint 10
and a scope-manager version reached through the plugin tree, not a fault in this project's config —
the same config runs clean on 9.39.5. Both `typescript-eslint` and `eslint-config-next` advertise
ESLint 10 support in their peer ranges, so npm installs the combination without complaint; the
incompatibility only appears at runtime. That gap between what the peer ranges promise and what
actually runs is the thing to remember here.

**Revisit if:** a later ESLint 10 patch, or a later `eslint-config-next`, resolves the scope-manager
mismatch. Test by installing ESLint 10 and running `npm run lint` — the failure is immediate and
unmistakable, so this is a cheap thing to re-check.
