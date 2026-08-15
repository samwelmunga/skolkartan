---
id: E00_S01_T05
title: Verify the type-error build gate and clean-clone reproducibility
status: Pending
story_id: E00_S01
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S01_T02
  - E00_S01_T03
---

# Task: Verify the type-error build gate and clean-clone reproducibility

## Description

The story's central promise is that a fresh clone installs and builds with two commands, and that a
type error cannot get past the build. Neither is proven by the code existing — both have to be
demonstrated. This task carries out those demonstrations and records the outcome of each.

It is deliberately adversarial: it tries to break the build, and it throws away all local state to
check the result does not depend on it. It runs last because it needs the application from
`E00_S01_T02` and the ignore rules from `E00_S01_T03` (a build cannot leave `git status` clean if
`.next/` is not ignored). It does **not** depend on `E00_S01_T04`, which only writes documentation.

Expected output of this task is evidence, not code. If a demonstration fails, the fix belongs here
and must be committed with the evidence of it then passing.

### Demonstration 1 — a type error fails both gates

1. Confirm the tree is clean and `npm run typecheck` and `npm run build` both exit zero.
2. Introduce a deliberate type error in `src/app/page.tsx` — for example, assign the imported
   `siteName` (a `string`) to a `number`:

   ```ts
   const broken: number = siteName;
   ```

   Reference `broken` so it is not dead code eliminated before checking.
3. Run `npm run typecheck`. It must exit **non-zero** and name `src/app/page.tsx` and the type
   error. Capture the output.
4. Run `npm run build`. It must also exit **non-zero**. Capture the output. This is the check that
   matters most: `next build` type-checks by default and this proves that default is intact.
5. Revert the change completely. Run both again; both must exit zero and `git status` must be
   clean.

Record the captured output of steps 3 and 4 in the task's rapport. "It failed as expected" without
the output is not evidence.

### Demonstration 2 — `ignoreBuildErrors` is not set

Confirm by reading `next.config.ts` that there is no `typescript` key and therefore no
`ignoreBuildErrors`. Then search the whole repository (excluding `node_modules/`) for
`ignoreBuildErrors` and confirm there are no hits outside the scrum board's own Markdown.

### Demonstration 3 — clean-slate rebuild

```bash
rm -rf node_modules .next
npm ci
npm run build
```

This must succeed with no prompts and no manual steps. It proves the build does not depend on
leftover local state such as a stale `.next/` cache or a hand-installed package.

### Demonstration 4 — fresh clone into an empty directory

```bash
git clone . /tmp/skolkartan-verify
cd /tmp/skolkartan-verify
node --version        # must satisfy engines.node, i.e. >= 24.18.0
npm ci
npm run build
```

Two commands after the clone, no prompts, no editing. Delete `/tmp/skolkartan-verify` afterwards.
Record the Node version used, which must be the `24.18.0` pinned by `.nvmrc`.

### Demonstration 5 — `npm run start` serves the built output

In the original working copy, after a successful `npm run build`:

1. Run `npm run start`.
2. Fetch the served page (`curl -sS -o /dev/null -w '%{http_code}' http://localhost:3000`) and
   confirm HTTP 200.
3. Fetch the body and confirm it contains the project name rendered by `src/app/page.tsx`.
4. Stop the server.

### Demonstration 6 — a build leaves the working tree clean

Immediately after `npm run build`, `git status --porcelain` must produce **no output**. If it does
not, the offending path is either a build artefact that `E00_S01_T03` failed to ignore, or
`next-env.d.ts` regenerated with different content — in the latter case commit the regenerated
file, in the former fix `.gitignore` here.

### Demonstration 7 — the lockfile is in sync

`npm ci` completing in demonstrations 3 and 4 already proves this, since `npm ci` fails outright
when `package-lock.json` disagrees with `package.json`. Confirm explicitly that neither run emitted
a lockfile warning, and that `git status` shows `package-lock.json` unmodified afterwards.

### Domain constraint

E00 is pure infrastructure. The deliberate type error introduced in demonstration 1 must be
entirely generic — no kommun, skola, nyckeltal or data source, not even in a variable name — and it
must be fully reverted.

## Acceptance Criteria

- [ ] `npm run typecheck` exits non-zero on the deliberate type error and its output names
      `src/app/page.tsx`.
- [ ] `npm run build` exits non-zero on the same deliberate type error.
- [ ] After reverting, both commands exit zero and `git status --porcelain` is empty.
- [ ] `next.config.ts` contains no `typescript` key, and a repository-wide search for
      `ignoreBuildErrors` outside `node_modules/` returns hits only in `project/` Markdown.
- [ ] `rm -rf node_modules .next && npm ci && npm run build` succeeds with no prompts.
- [ ] A clone into an empty temporary directory, followed only by `npm ci && npm run build`,
      succeeds; the temporary directory is deleted afterwards.
- [ ] The Node version used for the clone test is 24.18.0, matching `.nvmrc`.
- [ ] `npm run start` serves the built output and `http://localhost:3000` returns HTTP 200 with a
      body containing the project name.
- [ ] `git status --porcelain` is empty immediately after `npm run build`.
- [ ] Neither `npm ci` run reported lockfile drift, and `package-lock.json` is unmodified
      afterwards.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] Captured console output for each of the seven demonstrations is recorded in the task's
      rapport — outcomes are evidenced, not asserted.
- [ ] No deliberate breakage remains anywhere in the repository; `git log` shows no commit that
      leaves a type error in the tree.
- [ ] Any defect this task uncovered was fixed here and the fix is itself demonstrated, with the
      before-and-after recorded.
- [ ] The temporary clone directory used in demonstration 4 no longer exists.
- [ ] No kommun, skola, nyckeltal or data source is referenced anywhere in this task's output,
      including the reverted deliberate type error.
