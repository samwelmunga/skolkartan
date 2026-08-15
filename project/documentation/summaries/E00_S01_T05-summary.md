# Execution Summary — E00_S01_T05

**Task**: Verify the type-error build gate and clean-clone reproducibility
**Story**: E00_S01 — Application skeleton and TypeScript configuration
**Epic**: E00 — Project Foundation
**Status**: Passed
**Date started / completed**: 2026-08-15 / 2026-08-15
**Plan**: `/Users/samwelmunga/Desktop/Projects/skolkartan/project/documentation/plans/E00_S01_T05-plan.md`

## Verdict

All ten acceptance criteria pass. Story `E00_S01`'s Definition of Done is met, with one recorded
deviation (`baseUrl`, forced by TypeScript 7) and four handoffs to later stories. No defect was
found that needed fixing here. No file under `src/`, no config file and no `package*.json` was
changed by this task — this task produced evidence, not code.

**The type-error gate is real and the clean clone builds in two commands.** Both were demonstrated
rather than assumed, and every claim below is backed by the terminal output that produced it.

## Execution environment

The ambient shell Node is 20.10.0, below `engines.node` (`>=24.18.0`). Every `npm` and `node`
command below was run under Node 24.18.0 via `nvm`. Anything run on Node 20 would be misleading and
is not evidence.

```
$ source ~/.nvm/nvm.sh && nvm use 24.18.0 && node -v && npm -v
v24.18.0
11.16.0
```

Git worktree isolation is unavailable in this harness, so work happened directly in the main
working directory. **No mutating git command was run in the project repository** — the deliberate
type error was reverted by file copy, not by `git checkout`. The only clone was into `/tmp`.

## Baseline — the working tree is not empty, and why that matters

Before this task touched anything:

```
$ git status --porcelain
 M project/PROJECT_SUMMARY.md
 M project/logs/events.json
?? .claude/skills/index/scripts/__pycache__/
?? project/queue/
```

None of those five entries is a build artefact. They are agent-harness and board bookkeeping left by
sibling sessions (`project/queue/` and the Python `__pycache__/` belong to the harness;
`PROJECT_SUMMARY.md` and `events.json` are board files). A sixth entry,
`project/documentation/plans/E00_S01_T05-plan.md`, is this task's own plan.

So "`git status --porcelain` is empty after a build" cannot be evaluated literally in the main
working copy without conflating harness noise with build output. It was therefore evaluated **two
ways**, and both are reported:

1. **Differentially in the main working copy** — snapshot before the build, snapshot after, diff
   them. An empty diff proves the build contributes nothing.
2. **Absolutely in the clean clone** — the clone contains only committed content, so
   `git status --porcelain` there is the uncontaminated form of the criterion. This is the one that
   decides pass/fail, and it is genuinely, literally empty.

---

## Demonstration 1 — a type error fails both gates

### Pre-state: both commands exit zero on the clean tree

```
$ npm run typecheck
TYPECHECK_BASELINE_EXIT=0

> skolkartan@0.1.0 typecheck
> tsc --noEmit
```

```
$ npm run build
BUILD_BASELINE_EXIT=0

> skolkartan@0.1.0 build
> next build

▲ Next.js 16.3.1 (Turbopack)
✓ Running next.config.ts took 81ms

  Creating an optimized production build ...
✓ Compiled successfully in 1645ms
  Running TypeScript ...
  Finished TypeScript in 255ms ...
  Collecting page data using 4 workers ...
✓ Generating static pages using 4 workers (3/3) in 298ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```

`src/app/page.tsx` was byte-identical to HEAD before the edit, and a copy was taken so it could be
restored exactly:

```
$ shasum -a 256 src/app/page.tsx /tmp/t05-page.tsx.orig
5587268839d2c10f417d71cb2b167603166b57272d97fdad6e3a7d6af8766bd7  src/app/page.tsx
5587268839d2c10f417d71cb2b167603166b57272d97fdad6e3a7d6af8766bd7  /tmp/t05-page.tsx.orig
$ git diff --stat -- src/app/page.tsx
PAGE_MATCHES_HEAD_BEFORE_EDIT (empty diff above)
```

### The deliberate error

Entirely generic — the identifier is `broken`, and nothing domain-related appears anywhere near it.
It is referenced in the returned JSX so it cannot be eliminated as dead code before the check runs:

```
$ git diff -- src/app/page.tsx
diff --git a/src/app/page.tsx b/src/app/page.tsx
index 3eed40e..df00920 100644
--- a/src/app/page.tsx
+++ b/src/app/page.tsx
@@ -1,11 +1,14 @@
 import { siteName, siteTagline } from '@/app/site-metadata';

+const broken: number = siteName;
+
 export default function Page() {
   return (
     <main>
       <h1>{siteName}</h1>
       <p>{siteTagline}</p>
       <p>Se README.md i repositoryts rot.</p>
+      <p>{broken}</p>
     </main>
   );
 }
```

### `npm run typecheck` fails and names the file

```
$ npm run typecheck
TYPECHECK_ERR_EXIT=1

> skolkartan@0.1.0 typecheck
> tsc --noEmit

src/app/page.tsx(3,7): error TS2322: Type 'string' is not assignable to type 'number'.
```

### `npm run build` fails too — the load-bearing check

```
$ npm run build
BUILD_ERR_EXIT=1

> skolkartan@0.1.0 build
> next build

▲ Next.js 16.3.1 (Turbopack)
✓ Running next.config.ts took 14ms

  Creating an optimized production build ...
✓ Compiled successfully in 451ms
  Running TypeScript ...
src/app/page.tsx(3,7): error TS2322: Type 'string' is not assignable to type 'number'.
Failed to type check.
```

`next build`'s default type-checking is intact. Note again — as `E00_S01_T02` warned — that
Turbopack prints `✓ Compiled successfully` **before** type-checking and therefore prints it in a
build that goes on to fail. `E00_S03` must gate on the exit code, never on that line.

### Reverted, and proven reverted

```
$ cp /tmp/t05-page.tsx.orig src/app/page.tsx
$ shasum -a 256 src/app/page.tsx
5587268839d2c10f417d71cb2b167603166b57272d97fdad6e3a7d6af8766bd7  src/app/page.tsx
$ git diff --stat -- src/app/page.tsx
PAGE_DIFF_VS_HEAD_EMPTY=0
```

The hash matches the pre-edit hash and `git diff` against HEAD is empty, so the file is byte-identical
to the committed version. Both commands pass again:

```
$ npm run typecheck
TYPECHECK_RESTORED_EXIT=0
$ npm run build
BUILD_RESTORED_EXIT=0
$ git status --porcelain
 M project/PROJECT_SUMMARY.md
 M project/logs/events.json
?? .claude/skills/index/scripts/__pycache__/
?? project/documentation/plans/E00_S01_T05-plan.md
?? project/queue/
```

Byte-identical to the baseline snapshot: the deliberate error left no trace.

### The error never entered git history

```
$ git log --oneline -- src/app/page.tsx
5fb2d01 E00_S01_T02: strict TypeScript config and App Router skeleton

$ git log -G"broken" --oneline --all -- src/
NO_COMMIT_UNDER_src_CONTAINS_broken (empty above)

$ git show HEAD:src/app/page.tsx | shasum -a 256
5587268839d2c10f417d71cb2b167603166b57272d97fdad6e3a7d6af8766bd7  -
$ shasum -a 256 src/app/page.tsx
5587268839d2c10f417d71cb2b167603166b57272d97fdad6e3a7d6af8766bd7  src/app/page.tsx
```

One commit has ever touched `page.tsx`, no commit anywhere under `src/` ever contained the word
`broken`, and the working file hashes identically to HEAD's version. This task made no commit at
all.

---

## Demonstration 2 — `ignoreBuildErrors` is not set

```
$ cat next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;

$ grep -n "typescript" next.config.ts ; echo "GREP_EXIT=$?"
GREP_EXIT=1
```

No `typescript` key exists, so no `typescript.ignoreBuildErrors` exists. Repository-wide, excluding
`node_modules/`:

```
$ git grep -n "ignoreBuildErrors" -- . ":(exclude)node_modules" | cut -d: -f1 | sort -u
project/board/stories/E00_S01_application-skeleton-and-typescript-configuration.md
project/board/tasks/E00_S01_T02_strict-typescript-config-and-app-router-skeleton.md
project/board/tasks/E00_S01_T05_verify-build-gate-and-clean-clone-reproducibility.md
project/board/tasks/E00_S03_T01_check-registry-module-and-typecheck-coverage.md
project/documentation/plans/E00_S01_T02-plan.md
project/documentation/summaries/E00_S01_T01-summary.md
project/documentation/summaries/E00_S01_T02-summary.md

$ git grep -ln "ignoreBuildErrors" -- . ":(exclude)node_modules" ":(exclude)project"
NON_PROJECT_HITS_EXIT=1
```

Every hit is Markdown prose under `project/`. Nothing outside `project/` mentions it at all — no
config file, no source file.

---

## Demonstration 3 — clean-slate rebuild

```
$ rm -rf node_modules .next tsconfig.tsbuildinfo
$ ls -d node_modules .next tsconfig.tsbuildinfo
  ls: .next: No such file or directory
  ls: node_modules: No such file or directory
  ls: tsconfig.tsbuildinfo: No such file or directory

$ npm ci
NPM_CI_LOCAL_EXIT=0
npm warn deprecated prebuild-install@7.1.3: No longer maintained. ...
added 106 packages, and audited 107 packages in 15s
16 packages are looking for funding
6 vulnerabilities (5 high, 1 critical)
npm warn allow-scripts 3 packages have install scripts not yet covered by allowScripts:
npm warn allow-scripts   @jenga-ai/agent@1.0.1 (postinstall: node scripts/postinstall.js)
npm warn allow-scripts   protobufjs@6.11.6 (postinstall: node scripts/postinstall)
npm warn allow-scripts   sharp@0.32.6 (install: ...)
npm warn allow-scripts Run `npm approve-scripts --allow-scripts-pending` to review, ...

$ npm run build
CLEAN_SLATE_BUILD_EXIT=0
...
✓ Compiled successfully in 2.4s
  Running TypeScript ...
  Finished TypeScript in 842ms ...
✓ Generating static pages using 4 workers (3/3) in 368ms

Route (app)
┌ ○ /
└ ○ /_not-found
```

`tsconfig.tsbuildinfo` was deleted too, so nothing incremental survived. No prompt, no manual step,
exit 0 throughout. The `allow-scripts` lines are warnings on stderr, not prompts: `npm ci` ran to
completion non-interactively with stdin closed. **This is worth knowing for `E00_S04`** — npm 11
blocks lifecycle scripts by default, so `sharp` and `protobufjs` never ran their install scripts and
the build still succeeded. The application does not depend on them.

---

## Demonstration 4 — fresh clone into an empty directory

```
$ git branch --show-current
main
$ git rev-parse HEAD
5fb2d01012e87bd1d8cda68935b6f3206265589c
$ test -e /tmp/skolkartan-verify-27189 && echo TARGET_EXISTS_ABORT || echo TARGET_ABSENT_OK
TARGET_ABSENT_OK
$ git clone . /tmp/skolkartan-verify-27189
Cloning into '/tmp/skolkartan-verify-27189'...
done.
CLONE_EXIT=0
```

### Node version comes from `.nvmrc`, and satisfies `engines.node`

```
$ cat .nvmrc
24.18.0
$ nvm use                       # reads .nvmrc, no version passed
Found '/tmp/skolkartan-verify-27189/.nvmrc' with version <24.18.0>
Now using node v24.18.0 (npm v11.16.0)
$ node --version
v24.18.0
$ node -p 'require("./package.json").engines.node'
>=24.18.0
$ git rev-parse HEAD
5fb2d01012e87bd1d8cda68935b6f3206265589c
$ git status --porcelain
(empty)
```

`.nvmrc` and `engines.node` agree, and `nvm use` with no argument selects the right version from the
file alone — a developer needs no out-of-band knowledge.

### Two commands, no prompts, no editing

```
$ npm ci
CLONE_NPM_CI_EXIT=0
added 106 packages, and audited 107 packages in 7s
6 vulnerabilities (5 high, 1 critical)

$ npm run build
CLONE_BUILD_EXIT=0

▲ Next.js 16.3.1 (Turbopack)
✓ Running next.config.ts took 758ms
  Creating an optimized production build ...
✓ Compiled successfully in 2.4s
  Running TypeScript ...
  Finished TypeScript in 215ms ...
✓ Generating static pages using 4 workers (3/3) in 298ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```

Both were run with stdin closed (`< /dev/null`); neither blocked. Nothing was edited between the
clone and the successful build.

### The `@/*` alias resolves from a clean clone — independently re-verified

This is the check that closes out `E00_S01_T02`'s forced deviation. `npm run typecheck` was run in
the clone **before any build**, so `.next/types` did not exist:

```
$ ls -d .next
ls: .next: No such file or directory
$ npm run typecheck
CLONE_TYPECHECK_PREBUILD_EXIT=0
```

Exit 0 alone would be weak evidence, so a probe was used that distinguishes "resolved" from
"silently ignored". If `@/app/site-metadata` failed to resolve, TypeScript would report **TS2307
Cannot find module**. It reports **TS2322**, which can only happen if it resolved the alias to the
real module and read the real type of `siteName`:

```
$ cat alias-probe.ts
import { siteName } from '@/app/site-metadata';
export const probe: number = siteName;

$ npm run typecheck
ALIAS_PROBE_EXIT=1
alias-probe.ts(2,14): error TS2322: Type 'string' is not assignable to type 'number'.

$ rm alias-probe.ts && npm run typecheck
AFTER_PROBE_CLEANUP_EXIT=0
$ git status --porcelain
(empty)
```

And Turbopack resolves it too — the prerendered output contains values that only exist inside
`src/app/site-metadata.ts`, imported through `@/`:

```
$ grep -o '<main>.*</main>' .next/server/app/index.html
<main><h1>Skolkartan</h1><p>Applikationsskelett — ingen data ännu.</p><p>Se README.md i repositoryts rot.</p></main>
$ grep -o '<html lang="[a-z]*"' .next/server/app/index.html
<html lang="sv"
```

Two independent resolver implementations, both from a pristine clone, with no `baseUrl`.

### The clone is clean after the build — the absolute criterion

```
$ git status --porcelain
CLONE_STATUS_LINE_COUNT=0

$ git diff --stat -- next-env.d.ts
(empty = next-env.d.ts unchanged by build)

$ ls AGENTS.md CLAUDE.md
ls: AGENTS.md: No such file or directory
ls: CLAUDE.md: No such file or directory

$ git check-ignore -v .next tsconfig.tsbuildinfo
.gitignore:18:.next/	.next
.gitignore:23:*.tsbuildinfo	tsconfig.tsbuildinfo
```

Literally zero lines. `next-env.d.ts` was not modified by the build, `.next/` and
`tsconfig.tsbuildinfo` are ignored by `E00_S01_T03`'s rules, and `npm run build` generated no
`AGENTS.md` or `CLAUDE.md`.

### The clone was deleted

```
$ rm -rf /tmp/skolkartan-verify-27189
$ ls -d /tmp/skolkartan-verify-27189
ls: /tmp/skolkartan-verify-27189: No such file or directory
CLONE_DELETED
$ ls -d /tmp/skolkartan-verify*
no matches found: /tmp/skolkartan-verify*
```

---

## Demonstration 5 — `npm run start` serves the built output

```
$ lsof -ti tcp:3000 ; PORT_3000_FREE
$ npm run start
START_PID=22450

> skolkartan@0.1.0 start
> next start

▲ Next.js 16.3.1
- Local:         http://localhost:3000
- Network:       http://192.168.1.10:3000
✓ Ready in 161ms
✓ Running next.config.ts took 20ms
```

```
$ curl -sS -o /dev/null -w '%{http_code}' http://localhost:3000
200

$ grep -o '<main>.*</main>' page.html
<main><h1>Skolkartan</h1><p>Applikationsskelett — ingen data ännu.</p><p>Se README.md i repositoryts rot.</p></main>

$ grep -o '<html lang="[a-z]*"' page.html
<html lang="sv"

$ grep -o '<title>[^<]*</title>' page.html
<title>Skolkartan</title>
$ grep -o '<meta name="description" content="[^"]*"' page.html
<meta name="description" content="Applikationsskelett — ingen data ännu."
```

HTTP 200, the project name is in the body, `lang="sv"` renders, and the `Metadata` export reaches
`<title>` and `<meta name="description">`. The production server log contains no error and no
warning. Server stopped and port released:

```
$ kill 22450
PORT_3000_RELEASED
$ curl --max-time 5 http://localhost:3000
curl: (7) Failed to connect to localhost port 3000 after 0 ms: Couldn't connect to server
CONNECTION_REFUSED_AS_EXPECTED
```

This closes `E00_S01_T02`'s handoff item 2 — `npm run start` had not previously been exercised.

**Not closed: the browser-console criterion.** `E00_S01_T02` asked this task to confirm in a real
browser that the page produces no console error or warning. This environment has no browser, so
that remains unobserved. What can be said is that the served document is fully static with no
client component, no state and no data fetching, and that neither the dev server nor the production
server logged a hydration or compilation warning. That is inference, not observation, and it is
recorded as outstanding rather than claimed as passed.

---

## Demonstration 6 — a build leaves the working tree clean

**Absolutely, in the clean clone**: `CLONE_STATUS_LINE_COUNT=0` immediately after `npm run build`
(see Demonstration 4). This is the criterion in its uncontaminated form and it passes outright.

**Differentially, in the main working copy**:

```
$ git status --porcelain > before.txt
$ npm run build
BUILD_BASELINE_EXIT=0
$ git status --porcelain > after.txt
$ diff before.txt after.txt
NO_NEW_UNTRACKED_OR_MODIFIED_FROM_BUILD
```

The build added nothing. The five entries that remain are the pre-existing harness and board files
listed in the baseline section, plus this task's own plan.

---

## Demonstration 7 — the lockfile is in sync

`npm ci` aborts outright when `package-lock.json` disagrees with `package.json`, so two successful
`npm ci` runs are the proof. Both exited 0 (`NPM_CI_LOCAL_EXIT=0`, `CLONE_NPM_CI_EXIT=0`), and
neither log mentions the lockfile at all:

```
$ grep -in "lock" /tmp/t05-npmci-local.log ; echo "exit $?"
exit 1                      # no match — no lockfile warning

$ grep -in "lock" /tmp/t05-npmci-clone.log ; echo "exit $?"
exit 1                      # no match — no lockfile warning
```

And neither run modified it:

```
# main working copy
$ git status --porcelain -- package-lock.json package.json
(empty)

# clone, after npm ci
$ git status --porcelain
(empty)
```

---

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | `npm run typecheck` exits non-zero on the deliberate error and names `src/app/page.tsx` | **Pass** | D1: `TYPECHECK_ERR_EXIT=1`, `src/app/page.tsx(3,7): error TS2322` |
| 2 | `npm run build` exits non-zero on the same error | **Pass** | D1: `BUILD_ERR_EXIT=1`, `Failed to type check.` |
| 3 | After reverting, both exit zero and `git status --porcelain` is empty | **Pass** (qualified) | D1: `TYPECHECK_RESTORED_EXIT=0`, `BUILD_RESTORED_EXIT=0`; `page.tsx` hashes identically to HEAD and `git diff` is empty. `git status` is byte-identical to the pre-task baseline; its five entries are pre-existing harness/board files, not this task's and not build output. The absolute form of the check passes in the clone (`CLONE_STATUS_LINE_COUNT=0`) |
| 4 | No `typescript` key in `next.config.ts`; `ignoreBuildErrors` hits only in `project/` Markdown | **Pass** | D2: `GREP_EXIT=1` on `next.config.ts`; all seven repo hits under `project/`, zero outside |
| 5 | `rm -rf node_modules .next && npm ci && npm run build` succeeds with no prompts | **Pass** | D3: `NPM_CI_LOCAL_EXIT=0`, `CLEAN_SLATE_BUILD_EXIT=0`, run with stdin closed |
| 6 | Clone into an empty temp dir + `npm ci && npm run build` succeeds; dir deleted afterwards | **Pass** | D4: `CLONE_NPM_CI_EXIT=0`, `CLONE_BUILD_EXIT=0`, `CLONE_DELETED` |
| 7 | Node version for the clone test is 24.18.0, matching `.nvmrc` | **Pass** | D4: `.nvmrc` = `24.18.0`; `nvm use` selected it from the file; `node --version` = `v24.18.0`; `engines.node` = `>=24.18.0` |
| 8 | `npm run start` serves the built output; HTTP 200 with the project name in the body | **Pass** | D5: `200`, `<h1>Skolkartan</h1>` in the served body |
| 9 | `git status --porcelain` empty immediately after `npm run build` | **Pass** | D6: `CLONE_STATUS_LINE_COUNT=0` in the clone; `NO_NEW_UNTRACKED_OR_MODIFIED_FROM_BUILD` differentially in the main copy |
| 10 | No lockfile drift in either `npm ci`; `package-lock.json` unmodified afterwards | **Pass** | D7: both `npm ci` exit 0, neither log mentions `lock`, `git status` on `package-lock.json` empty in both environments |

Ten of ten pass. Criterion 3 is marked "qualified" rather than silently passed because the literal
phrasing cannot hold in a working directory that the harness itself writes into; the substantive
claim behind it — that reverting restored the tree exactly and that a build dirties nothing — is
proven twice over.

## Definition of Done — this task

- [x] All acceptance criteria met.
- [x] Console output captured for all seven demonstrations, pasted above verbatim.
- [x] No deliberate breakage remains. `page.tsx` hashes identically to `HEAD:src/app/page.tsx`;
      `git log -G"broken" -- src/` is empty; this task made no commit.
- [x] No defect was uncovered that required a fix, so there is no before-and-after to record. Every
      demonstration passed on the first attempt.
- [x] `/tmp/skolkartan-verify-27189` no longer exists.
- [x] No kommun, skola, nyckeltal or data source appears in this task's output. The deliberate error
      used the identifier `broken` and nothing else. The only occurrences of those words in the plan
      and this summary are restatements of the prohibition itself.

---

## Status of the four known issues carried in

### 1. `baseUrl` removed in TypeScript 7 — CONFIRMED, and accepted as a permanent deviation

`E00_S01_T02`'s report is accurate. `tsconfig.json` has no `baseUrl`; `paths` alone is present:

```
$ node -p '...require("./tsconfig.json").compilerOptions...'
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "forceConsistentCasingInFileNames": true,
  "noEmit": true,
  "paths": { "@/*": ["./src/*"] }
}
```

`exactOptionalPropertyTypes` is absent, as the story mandates, and `baseUrl` is `undefined`.

Independently verified in the clean clone that the alias still resolves under both resolvers — the
TS2322-not-TS2307 probe under `tsc` before any build existed, and the prerendered HTML under
Turbopack. See Demonstration 4.

**Disposition: accept and record.** Story acceptance criterion "the path alias `@/*` → `./src/*` is
configured and demonstrably resolves from a file under `src/app/`" is met in full — it never
mentioned `baseUrl`. Only the task-level criterion in `E00_S01_T02` named `baseUrl` literally, and
that option no longer exists in the compiler the project uses. This is a compiler removal, not an
implementation shortcut. It is now recorded in three places (T02's summary, this summary, and the
task files), but **it is not yet in `docs/decisions.md`, which is where a future reader will
actually look.** See Outstanding item 1.

### 2. `npm run dev` generates untracked `AGENTS.md` and `CLAUDE.md` — CONFIRMED, hand to the board

Reproduced from scratch in the disposable clone, so the main working copy was never dirtied:

```
$ git status --porcelain          # clean before dev
(empty)

$ npm run dev -- -p 3100
▲ Next.js 16.3.1 (Turbopack)
- Local:         http://localhost:3100
✓ Ready in 599ms
✓ Generated AGENTS.md and CLAUDE.md for AI agents. Set `agentRules: false` in next.config to disable.
 GET / 200 in 914ms (next.js: 830ms, application-code: 84ms)
DEV_HTTP=200

$ git status --porcelain          # after dev
 M next-env.d.ts
?? AGENTS.md
?? CLAUDE.md
$ ls -la AGENTS.md CLAUDE.md
-rw-r--r--  1 samwelmunga  wheel  678 Aug 15 23:51 AGENTS.md
-rw-r--r--  1 samwelmunga  wheel   11 Aug 15 23:51 CLAUDE.md
```

`npm run build` does not generate them — proven twice, in the clean-slate rebuild and in the clone,
where `ls AGENTS.md CLAUDE.md` reported no such file after a successful build.

**To be precise about the criteria: they hold for `build` and only for `build`.** My criterion 9,
and the story's "`git status` is clean immediately after a build", both name `build`. `npm run dev`
does leave the tree dirty, in three ways, and no criterion in this story covers that.

**Disposition: do not change `.gitignore` here; hand it to the board.** Reasons:

- It is not a defect in the build gate, and nothing in `E00_S01` fails because of it.
- The three available fixes are genuinely different decisions with different owners: committing the
  files is a root-documentation choice (`E00_S05`'s territory); ignoring them edits `E00_S01_T03`'s
  file to hide output that Next explicitly recommends committing; setting `agentRules: false`
  contradicts `E00_S01_T02`'s "minimal `next.config.ts`, no extra keys" mandate. Picking one
  unilaterally inside a verification task would be exactly the kind of quiet scope creep this task
  exists to catch.
- The right time to decide is `E00_S04`, when CI gets a "no uncommitted changes" gate and the
  question becomes load-bearing rather than cosmetic.

**Recommendation for the board:** commit them, or set `agentRules: false`. Ignoring them is the
worst of the three, because an ignored `CLAUDE.md` at the root of a repository that is worked on by
agents is a trap for the next person who tries to add one deliberately.

### 3. `next-env.d.ts` differs between `dev` and `build` — CONFIRMED, and it is self-healing

The committed variant is the `build` variant (`.next/types`). A `dev` run rewrites it to
`.next/dev/types`:

```
$ git diff -- next-env.d.ts        # after npm run dev
-import "./.next/types/routes.d.ts";
-import "./.next/types/root-params.d.ts";
+import "./.next/dev/types/routes.d.ts";
+import "./.next/dev/types/root-params.d.ts";
```

**New finding, not in `E00_S01_T02`'s report: a subsequent `npm run build` restores it
automatically.** Run in the clone immediately after the dev run above:

```
$ npm run build
BUILD_AFTER_DEV_EXIT=0
$ git status --porcelain
?? AGENTS.md
?? CLAUDE.md
$ git diff -- next-env.d.ts
(empty = build restored the committed variant)
```

So the `dev`/`build` divergence is transient and cannot make a clean clone dirty after
`npm run build` — which was the specific risk. The clone was clean after its first build
(`CLONE_STATUS_LINE_COUNT=0`) and clean again after a build that followed a dev run, once the two
`AGENTS.md`/`CLAUDE.md` files were removed. The developer-facing consequence is unchanged and worth
repeating: **never commit the `dev` variant over the `build` variant**, and any CI freshness gate
must run `build`, not `dev`.

### 4. `npm audit` — CONFIRMED unchanged: 6 vulnerabilities, 1 critical, all in `@jenga-ai/agent`

```
$ npm audit
NPM_AUDIT_EXIT=1
protobufjs  <=7.6.2
Severity: critical
Arbitrary code execution in protobufjs - GHSA-xq3m-2v4x-88gg
  (+10 further protobufjs advisories)
No fix available
node_modules/protobufjs
  onnx-proto  *
    onnxruntime-web  <=1.16.0-dev.20230910-24f0893d3c
      @xenova/transformers  >=1.4.3
        @jenga-ai/agent  *

sharp  <0.35.0
Severity: high
sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591
No fix available
node_modules/sharp

6 vulnerabilities (5 high, 1 critical)

$ npm audit --json | (metadata.vulnerabilities)
{ "info": 0, "low": 0, "moderate": 0, "high": 5, "critical": 1, "total": 6 }
advisory roots: ['@jenga-ai/agent', '@xenova/transformers', 'onnx-proto', 'onnxruntime-web', 'protobufjs', 'sharp']
```

Every path terminates at `@jenga-ai/agent`. Nothing comes from `next`, `react`, `react-dom` or
`typescript`, and **all are marked `No fix available`** — so this cannot be resolved by bumping a
version. Out of scope here; flagged for `E00_S04`. See Outstanding item 2.

---

## Files changed

| File | Change |
|---|---|
| `project/documentation/plans/E00_S01_T05-plan.md` | new — execution plan |
| `project/documentation/summaries/E00_S01_T05-summary.md` | new — this file |
| `project/board/tasks/E00_S01_T05_verify-build-gate-and-clean-clone-reproducibility.md` | front-matter `status`/dates |
| `project/board/stories/E00_S01_application-skeleton-and-typescript-configuration.md` | front-matter `status`/dates — story closed |
| `project/logs/events.json` | appended session-start and sender entries |
| `project/queue/.session_handoff.json` | rewritten for this task |

**No file under `src/`, no `tsconfig.json`, no `next.config.ts`, no `.gitignore`, no `package.json`
and no `package-lock.json` was changed.** Confirmed:

```
$ git diff HEAD --stat
 project/PROJECT_SUMMARY.md | 176 +++++++++++++++++++++++++++++++++++++++++++--
 project/logs/events.json   |  81 ++++++++++++++++++++-
```

(`PROJECT_SUMMARY.md` was already modified before this task started — it is the scrum master's file
and this task did not touch it.)

## Commits

None. Git worktree isolation is unavailable in this harness and the orchestrator commits on the
developer's behalf, so every mutating git command was deliberately avoided. The deliberate type
error was reverted by file copy for exactly this reason.

---

## Story E00_S01 — Definition of Done

**Met.** All five tasks now carry `status: Passed`, and each of the story's own criteria is
satisfied by evidence in this summary or a sibling's:

| Story acceptance criterion | Result | Where proven |
|---|---|---|
| Fresh clone on Node 24.18.0 + `npm ci && npm run build`, no manual steps, no prompts | **Pass** | D4, this task |
| `npm run dev` serves the page; `npm run start` serves the built output | **Pass** | `dev` in T02 and again in D4's clone (`DEV_HTTP=200`); `start` in D5 (`200`) |
| `src/app/layout.tsx` and `src/app/page.tsx` exist and render | **Pass** | D5 served body; browser console unobserved — see Outstanding item 3 |
| `tsconfig.json` sets `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `forceConsistentCasingInFileNames`, `noEmit` | **Pass** | Re-read directly above; T02 additionally proved each is behaviourally live |
| `@/*` → `./src/*` configured and demonstrably resolves from `src/app/` | **Pass** | D4, both resolvers, from a clean clone |
| `npm run typecheck` exists, runs `tsc --noEmit`, exits zero on the clean tree | **Pass** | `package.json` scripts block; `TYPECHECK_BASELINE_EXIT=0` |
| Deliberate type error breaks **both** commands, then is removed and both pass | **Pass** | D1 |
| `typescript.ignoreBuildErrors` absent or false | **Pass** | D2 |
| `.gitignore` covers `node_modules/`, `.next/`, `out/`, `*.tsbuildinfo`, `.env*.local`; `git status` clean after a build | **Pass** | T03's `git check-ignore` matrix; D4/D6 for cleanliness |
| `engines.node` consistent with `.nvmrc`; `package-lock.json` committed and in sync | **Pass** | D4 (`>=24.18.0` vs `24.18.0`), D7 |

Story Definition of Done:

- [x] All acceptance criteria met.
- [x] Deleting `node_modules/` and `.next/` and repeating `npm ci && npm run build` reproduces a
      successful build — D3.
- [x] The `exactOptionalPropertyTypes` and `@jenga-ai/agent` decisions are written down where the
      next reader will find them — `docs/decisions.md`, by T04.
- [x] No kommun, skola, nyckeltal or data source anywhere in the story's output. `src/` contains
      four files: `layout.tsx`, `page.tsx`, `site-metadata.ts`, `lib/.gitkeep`. The only Swedish
      strings are the project's own name and the words "application skeleton — no data yet".
- [x] S02 can add lint, format and test tooling without changing `tsconfig.json`'s strictness or the
      path alias — nothing here forces a change, and T02 proved the root `**/*.ts` include already
      reaches a future `scripts/` directory.

`npm run lint` and `npm run test` do not exist, and this task deliberately did not create them:

```
$ npm run lint
NPM_RUN_LINT_EXIT=1
npm error Missing script: "lint"
```

ESLint, Prettier and Vitest arrive in `E00_S02`; `ci` arrives in `E00_S03`. The four scripts this
story promised are the four that exist:

```
$ node -p 'JSON.stringify(require("./package.json").scripts, null, 2)'
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "typecheck": "tsc --noEmit"
}
```

---

## Outstanding

Nothing blocks `E00_S02`. These are carried forward, in priority order:

1. **The `baseUrl` deviation is not in `docs/decisions.md`.** It currently lives only in task
   summaries, which is exactly the "tribal knowledge" the story's DoD warns against. `E00_S02` will
   configure Vitest's resolver and its setup guides will tell it to add `baseUrl`, which is a hard
   TS5102 error under TypeScript 7. **Recommended: add a dated entry to `docs/decisions.md`** —
   "`baseUrl` is not set; TypeScript 7 removed it; `paths` alone anchors to the tsconfig directory;
   do not re-add it." This is a one-paragraph append to a file `E00_S01_T04` deliberately designed
   to be appended to. It is not this task's file to write and was not created here.
2. **Decide whether `npm audit` becomes a CI gate (`E00_S04`).** Six vulnerabilities, one critical,
   all reachable only through `@jenga-ai/agent`, all `No fix available`. If audit is wired in as-is,
   CI is red from its first run. The realistic options are to scope audit to production dependencies
   the application actually imports, to accept a documented allowlist, or to move `@jenga-ai/agent`
   out of the application's dependency graph entirely. A decision is needed before the gate is
   added, not after.
3. **`AGENTS.md` / `CLAUDE.md` on `npm run dev` — needs an owner.** See known-issue 2 above.
   Recommendation: commit them or set `agentRules: false`; ignoring them is the worst option. Not a
   blocker for anything in `E00_S02`.
4. **Browser-console verification remains unobserved.** No browser exists in this environment. The
   page is fully static with no client component and both servers logged clean, so nothing is
   expected — but this is the one story criterion supported by inference rather than observation,
   and it should be spot-checked by a human the first time the app is opened in a browser.

## Notes for the tester

- Everything here is re-runnable. Every command is quoted verbatim with its exit code; nothing
  requires state left behind by this session.
- **Run everything under Node 24.18.0.** On the ambient Node 20.10.0 you will get failures that mean
  nothing.
- The most valuable thing to re-run independently is Demonstration 1 — the build gate is the story's
  central promise, and it is the one thing a future change could silently break.
- If you re-run Demonstration 4, note that `git status --porcelain` in the clone is the meaningful
  cleanliness check. The main working copy carries harness noise that has nothing to do with the
  build.
- Do not run `npm run dev` in the main working copy unless you intend to clean up afterwards: it
  will leave `AGENTS.md` and `CLAUDE.md` untracked and flip `next-env.d.ts`. A subsequent
  `npm run build` fixes `next-env.d.ts`; the two Markdown files must be deleted by hand.
