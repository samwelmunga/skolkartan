# Execution Plan — E00_S01_T05

**Task**: Verify the type-error build gate and clean-clone reproducibility
**Story**: E00_S01 — Application skeleton and TypeScript configuration
**Epic**: E00 — Project Foundation
**Date**: 2026-08-15

## Objective

Prove, with captured terminal output, the two central promises of story E00_S01:

1. A type error cannot get past either `npm run typecheck` or `npm run build`.
2. A fresh clone installs and builds with two commands and no manual steps.

The deliverable is **evidence**, not code. Nothing here is taken on trust from the four sibling
summaries (`E00_S01_T01`–`T04`); every claim they make that this task's criteria depend on is
re-run independently and the raw output pasted into the summary.

## Scope

**In scope**

- Running the seven demonstrations named in the task file.
- A temporary deliberate type error in `src/app/page.tsx`, fully reverted.
- A throwaway clone under `/tmp`, deleted afterwards.
- Recording the deviations and open findings carried forward from `E00_S01_T02`.
- Writing this plan, the summary, and this task's front-matter.
- Fixing any defect this task uncovers, if the defect is inside E00_S01's boundary.

**Out of scope**

- ESLint, Prettier, Vitest — `E00_S02` owns those. `npm run lint` and `npm run test` do not exist
  and must not be created here.
- Fixing the six `npm audit` vulnerabilities in the `@jenga-ai/agent` tree — noted, not fixed.
- Any domain logic. E00 contains none, and the deliberate type error must be entirely generic.
- Committing. The orchestrator commits on my behalf in this harness.

## Execution environment

- Git worktree isolation is unavailable; work happens directly in the main working directory.
  **No mutating git command is run in the project repository** — no `worktree`, `checkout`,
  `switch`, `branch`, `stash`, `add`, `commit`, `reset`, `clean`. Read-only git only.
- The clean-clone demonstration clones into `/tmp`, never into or over the project directory, and
  the clone is deleted afterwards.
- The ambient shell Node is 20.10.0, below `engines.node` (`>=24.18.0`). **Every npm and node
  command is prefixed with `source ~/.nvm/nvm.sh && nvm use 24.18.0`.** A run on Node 20 produces
  misleading failures and is not evidence of anything.
- HEAD is `5fb2d01`; everything through `E00_S01_T04` is committed.

## Baseline complication — the working tree is not empty

`git status --porcelain` in the main working copy currently reports:

```
 M project/PROJECT_SUMMARY.md
 M project/logs/events.json
?? .claude/skills/index/scripts/__pycache__/
?? project/queue/
```

None of these are build artefacts; they are agent-harness and board bookkeeping produced by
sibling sessions and by this session itself. Criterion "`git status --porcelain` is empty
immediately after `npm run build`" therefore cannot be evaluated literally in the main working
copy without conflating harness noise with build output.

**Method**: evaluate the criterion two ways and report both.

1. **Differential, in the main working copy** — snapshot `git status --porcelain` immediately
   before `npm run build` and immediately after, and diff the two snapshots. An empty diff proves
   the build adds nothing. This isolates the build's contribution.
2. **Absolute, in the clean clone** — the clone contains only committed content, so
   `git status --porcelain` there after `npm run build` must be genuinely, literally empty. This
   is the uncontaminated form of the criterion and is the one that decides pass/fail.

If the clone is dirty after a build, that is a real defect and is fixed here.

## Demonstrations

### D1 — a type error fails both gates

1. Record the pre-state: `git status --porcelain`, `npm run typecheck` exit 0, `npm run build`
   exit 0.
2. Insert into `src/app/page.tsx` a generic error, referenced so it cannot be eliminated as dead
   code:

   ```ts
   const broken: number = siteName;
   ```

   No kommun, skola, nyckeltal or data source in the identifier or anywhere near it.
3. `npm run typecheck` — must exit non-zero and name `src/app/page.tsx`. Capture verbatim.
4. `npm run build` — must exit non-zero. Capture verbatim. This is the load-bearing one: it proves
   `next build`'s default type-checking is intact.
5. Revert `src/app/page.tsx` to its committed content via file write (not `git checkout`, which is
   a mutating command I am barred from). Verify with `git diff --stat` that the file is
   byte-identical to HEAD. Re-run both; both must exit 0.

### D2 — `ignoreBuildErrors` is not set

Read `next.config.ts` and confirm there is no `typescript` key. Then grep the whole repository for
`ignoreBuildErrors`, excluding `node_modules/` and `.next/`, and confirm every hit is inside
`project/` Markdown (board and documentation prose) and none is in a config or source file.

### D3 — clean-slate rebuild

`rm -rf node_modules .next` then `npm ci` then `npm run build`, all under Node 24.18.0. Must
succeed with no prompt and no manual step. Capture exit codes and check the `npm ci` output for
any lockfile warning. `tsconfig.tsbuildinfo` is also removed so nothing incremental survives.

### D4 — fresh clone into an empty directory

```
git clone . /tmp/skolkartan-verify-<pid>
cd /tmp/skolkartan-verify-<pid>
node --version          # must be 24.18.0, matching .nvmrc
npm ci
npm run build
git status --porcelain  # must be empty
```

Then `rm -rf` the clone and prove it is gone. `git clone .` is read-only with respect to the
source repository. Also assert in the clone that `.nvmrc` says `24.18.0` and that the running Node
satisfies `engines.node`.

Additional check inside the clone, since it is the only truly pristine environment available:
**the `@/*` path alias resolves from a clean clone** under both `tsc` (via `npm run typecheck`
before anything has been built, so no `.next/types` exists) and Turbopack (via `npm run build`).
This independently re-tests `E00_S01_T02`'s deviation-1 claim.

### D5 — `npm run start` serves the built output

In the main working copy after a successful build: start `next start` in the background, poll
until it answers, then

- `curl -sS -o /dev/null -w '%{http_code}' http://localhost:3000` → expect `200`;
- fetch the body and confirm it contains the project name rendered by `src/app/page.tsx`;
- stop the server and confirm the port is released.

Port 3000 may be occupied; if so, use an explicit free port via `next start -p <port>` and record
that the port was the only deviation.

### D6 — a build leaves the working tree clean

Per the differential/absolute method above. Specifically confirm `next-env.d.ts` is unmodified
after `npm run build` (the committed variant is the `build` variant referencing `.next/types`),
and that `.next/` and `tsconfig.tsbuildinfo` are ignored.

### D7 — the lockfile is in sync

`npm ci` in D3 and D4 both completing proves it, since `npm ci` aborts when `package-lock.json`
disagrees with `package.json`. Additionally grep both `npm ci` logs for `lock` warnings and
confirm `git status` shows `package-lock.json` unmodified after each.

## Known issues carried in — disposition to determine

| Issue | What I will do |
|---|---|
| `baseUrl` removed in TS 7 (TS5102); `paths` alone | Re-verify alias resolution independently under `tsc` and Turbopack, **and from the clean clone**. Record as a permanent, accepted deviation in the summary so it is not lost when `E00_S02` reads only the story. |
| `npm run dev` writes untracked `AGENTS.md` / `CLAUDE.md` | Confirm empirically that `build` does **not** write them and `dev` does. Decide and state a disposition. Leaning: this is not a build-gate defect, my criteria are about `build`, and the choice between committing / ignoring / `agentRules: false` is a real decision with three defensible answers — so recommend, do not act unilaterally, and hand it to the board. |
| `next-env.d.ts` differs between `dev` and `build` | Confirm the committed variant is the `build` variant and that a clean clone stays clean after `npm run build`. That is the only form of it that can break a criterion. |
| `npm audit`: 6 vulnerabilities, 1 critical, in `@jenga-ai/agent` | Re-run and record the current count. Out of scope to fix; flag for `E00_S04` so someone decides whether audit becomes a CI gate. |

## Risks

- **Running on Node 20 by accident.** Mitigated by prefixing every command and asserting `node -v`
  in the captured output of each demonstration.
- **Leaving the deliberate type error behind.** Mitigated by reverting via an exact file write and
  then proving equality with HEAD via `git diff`, plus a final full-tree check at the end of the
  session. This is the single most damaging possible failure of this task.
- **Clobbering the project with the clone.** Mitigated by cloning to a `/tmp` path that includes
  the shell PID and asserting the target does not exist first.
- **A stray background `next start` surviving the session.** Mitigated by capturing the PID and
  killing it explicitly, then confirming the port is free.
- **Mistaking harness noise for a build artefact.** Mitigated by the differential method and by
  treating the clean clone as the authoritative environment for the cleanliness criterion.

## Steps

1. Write this plan. *(done)*
2. D2 (static, no side effects) — `next.config.ts` and the repository-wide grep.
3. D1 — baseline, break, capture both failures, revert, prove clean.
4. D6 — differential `git status` around a build.
5. D5 — `npm run start` and HTTP 200.
6. D3 — wipe `node_modules`/`.next`, `npm ci`, `npm run build`.
7. D4 — clone to `/tmp`, verify, delete.
8. D7 — lockfile assertions from the D3 and D4 logs.
9. `npm audit` for the record.
10. Final tree check: `git status --porcelain` and `git diff` show no source change from me.
11. Write the summary with every captured output pasted in.
12. Update this task's front-matter; update the story's front-matter **only if** all five tasks
    have passed.
13. Write `project/queue/.session_handoff.json`.

## Failure policy

If a demonstration fails and the defect is inside E00_S01's boundary, fix it here and record the
before-and-after. If it fails and cannot be fixed within boundary, set this task's status to
`Failed`, state exactly what is broken, and leave the story `Pending`. An honest failed
verification is worth more than a green tick that is not true.
