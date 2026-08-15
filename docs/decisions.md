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
