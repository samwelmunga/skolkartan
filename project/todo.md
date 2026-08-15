# Todo

Queued by `/jenga E00` on 2026-08-15. Ordering follows the story chain
E00_S01 → E00_S02 → E00_S03 → E00_S04 → E00_S05.

## E00_S01 — Application skeleton and TypeScript configuration

- [ ] Install the Next.js toolchain and define package.json scripts: E00_S01_T01
- [ ] Strict TypeScript configuration and App Router skeleton: E00_S01_T02
- [ ] Harden .gitignore for build artefacts: E00_S01_T03
- [ ] Record the toolchain decisions in docs/decisions.md: E00_S01_T04
- [ ] Verify the type-error build gate and clean-clone reproducibility: E00_S01_T05

## E00_S02 — Linting, formatting and the test runner

- [ ] Prettier configuration and format scripts: E00_S02_T01
- [ ] ESLint flat config with type-aware rules and lint scripts: E00_S02_T02
- [ ] Vitest runner and the assertNever example test: E00_S02_T03
- [ ] Toolchain interop proof and base-command sweep: E00_S02_T04

## E00_S03 — Extensible CI check registry

- [ ] The check registry module and typecheck coverage for scripts/: E00_S03_T01
- [ ] Fail-slow check runner and the npm run ci entry point: E00_S03_T02
- [ ] Pre-flight registry validation guard with unit tests: E00_S03_T03
- [ ] Document the registration mechanism in docs/ci-checks.md: E00_S03_T04
- [ ] Throwaway example validator — add, pass, fail, remove: E00_S03_T05

## E00_S04 — CI pipeline and merge gate

- [ ] Author the CI workflow file: E00_S04_T01
- [ ] Create the GitHub remote and enable Actions: E00_S04_T02
- [ ] Reproduce the three deliberate breakages locally: E00_S04_T03
- [ ] Push the workflow and observe the first green run on main: E00_S04_T04
- [ ] Configure branch protection so a red run blocks the merge: E00_S04_T05
- [ ] Prove the gate blocks all three deliberate breakages: E00_S04_T06
- [ ] Prove the check registry extends through the real pipeline: E00_S04_T07
- [ ] Document the pipeline and the merge gate in docs/ci-checks.md: E00_S04_T08
- [ ] Clean up the demonstrations and close out the story: E00_S04_T09

## E00_S05 — README and documentation skeleton

- [ ] docs/ skeleton — index page and the domain-term decision record: E00_S05_T01
- [ ] Write README.md from clone to checks: E00_S05_T02
- [ ] Verify the README against a clean clone: E00_S05_T03
- [ ] E00 closing sweep — Definition of Done and domain-leakage review: E00_S05_T04
