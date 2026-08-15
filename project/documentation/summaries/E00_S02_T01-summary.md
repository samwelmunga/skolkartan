# Execution Summary — E00_S02_T01

**Task**: Prettier configuration and format scripts
**Story**: E00_S02 — Linting, formatting and the test runner
**Epic**: E00 — Project Foundation
**Status**: Passed
**Date started / completed**: 2026-08-16 / 2026-08-16
**Plan**: `/Users/samwelmunga/Desktop/Projects/skolkartan/project/documentation/plans/E00_S02_T01-plan.md`

## Verdict

All ten acceptance criteria pass and the Definition of Done is met. Prettier 3.9.6 is installed,
configured and wired to `format` and `format:check`. `format:check` is green on the clean tree, red
on a deliberate misformat, and green again after `format` — with the file restored byte-identically,
proven by SHA-256.

Two deviations from the task text, both additions to `.prettierignore`, both forced by evidence
gathered during the task rather than assumed up front. Both are described in full below.

## Execution environment

The ambient shell Node is 20.10.0, below `engines.node` (`>=24.18.0`). Every `npm` and `npx` command
below ran under Node 24.18.0 via `nvm`.

```
$ source ~/.nvm/nvm.sh && nvm use 24.18.0 && node -v && npm -v
v24.18.0
11.16.0
```

Git worktree isolation is unavailable in this harness, so work happened directly in the main working
directory. **No mutating git command was run.** The deliberate misformat was reverted by
`npm run format` itself — which is the point of the criterion — and the pre-edit file was preserved
by `cp` to `/tmp` so its hash could be compared, never by `git checkout`.

---

## What was built

Three files touched, no more:

| File | Change |
|---|---|
| `.prettierrc.json` | new — the six options the task specifies, verbatim |
| `.prettierignore` | new — the five required entries plus three reasoned additions |
| `package.json` | `prettier: ^3.9.6` in `devDependencies`; scripts `format` and `format:check` appended after `typecheck` |
| `package-lock.json` | +17 lines, `prettier` at `3.9.6` |

Nothing under `src/` changed. `tsconfig.json`, `next.config.ts`, `.gitignore` and `next-env.d.ts`
were not modified. No ESLint package, no Vitest package, no config file for either, no third script.

### Version

```
$ npm view prettier dist-tags --json
{ "next": "4.0.0-alpha.13", "latest": "3.9.6" }
```

`^3.9.6` was installed. `4.0.0-alpha.13` exists but the task asks for "whichever 3.x is current", and
a prerelease is not it.

```
$ node -p '"prettier devDep range: " + require("./package.json").devDependencies.prettier'
prettier devDep range: ^3.9.6
$ node -p 'require("./package-lock.json").packages["node_modules/prettier"].version'
3.9.6
$ npm ls prettier --depth=0
skolkartan@0.1.0 /Users/samwelmunga/Desktop/Projects/skolkartan
└── prettier@3.9.6
```

### Scripts — exactly the four that existed, plus exactly two

```
$ node -p 'JSON.stringify(require("./package.json").scripts,null,2)'
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "typecheck": "tsc --noEmit",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

The name is exactly `format:check`, so `E00_S03` can register it without rewrapping.

---

## Decisions and deviations

### Deviation 1 — `next-env.d.ts` is excluded, and the exclusion is load-bearing

The task's `.prettierignore` listing does not mention `next-env.d.ts`. It has to, and this was
proven rather than argued.

`next-env.d.ts` is tracked, carries the banner `// NOTE: This file should not be edited`, and its two
`import` statements use **double quotes**. With `singleQuote: true`, Prettier rewrites them. The
question is whether Next.js rewrites them back. It does:

```
$ shasum -a 256 next-env.d.ts
1862ac4bbbc5192d4bf562161df66ea547ed3e67173100656ab606ae9797db2b  next-env.d.ts

$ npx prettier --write next-env.d.ts
next-env.d.ts 24ms

$ git diff -- next-env.d.ts
-import "./.next/types/routes.d.ts";
-import "./.next/types/root-params.d.ts";
+import './.next/types/routes.d.ts';
+import './.next/types/root-params.d.ts';

$ npm run build
BUILD_PROBE_EXIT=0

$ git diff -- next-env.d.ts
(empty — the build reverted Prettier's change)

$ shasum -a 256 next-env.d.ts
1862ac4bbbc5192d4bf562161df66ea547ed3e67173100656ab606ae9797db2b  next-env.d.ts
```

Same hash as before Prettier touched it. So without the exclusion the tree oscillates: `npm run
format` makes it single-quoted, `npm run build` makes it double-quoted, and `format:check` is
**red after every single build** — including in CI, where `E00_S03` registers it. That is precisely
the class of failure `endOfLine: "lf"` exists to prevent, arriving through a different door.

The task's own Definition of Done requires `git status` to be clean after `npm run format` on the
committed tree, and its acceptance criteria require `format:check` to exit zero on the clean tree.
Formatting `next-env.d.ts` breaks both the moment anyone builds. The exclusion is the only option
that satisfies the task's stated intent: the alternatives are to abandon `singleQuote` (a rule the
task sets explicitly) or to edit a file Next.js tells you not to edit.

**Verified as fixed** — `format:check` is green immediately after a build:

```
$ npm run build
BUILD_EXIT=0
$ npm run format:check
Checking formatting...
All matched files use Prettier code style!
FORMAT_CHECK_AFTER_BUILD_EXIT=0
$ git diff --stat -- next-env.d.ts
NEXT_ENV_UNCHANGED_BY_BUILD
```

### Deviation 2 — `.claude/` and `.agents/` are excluded

Both directories are **tracked in git** (327 files are tracked in total; these two hold 256 of them —
124 Markdown, 33 JSON, 6 HTML, 4 YAML, 2 JS). A probe run with only the five required entries in
`.prettierignore` showed exactly what `npm run format` would have rewritten:

```
$ npx prettier --list-different .
PROBE1_EXIT=1
$ wc -l < probe.txt
147
$ cut -d/ -f1 probe.txt | sort | uniq -c | sort -rn
  73 .claude
  73 .agents
   1 next-env.d.ts
```

146 agent-harness files, and `next-env.d.ts`. **Zero files under `src/`, `docs/` or the repository
root configs.**

Reformatting the harness in a commit about the application's toolchain would be a large diff in
files this task has no mandate over, authored and rewritten by tooling outside this repository's
source conventions — the same reasoning the task itself applies to `project/`. Excluded, with the
reason stated in the file.

### Decision — nothing in the authored tree needed reformatting

The task says: "Run `npm run format` once over the tree that `E00_S01` left behind and commit the
result." It was run. The result is that **nothing moved**:

```
$ npm run format
> prettier --write .

.prettierrc.json 9ms (unchanged)
docs/decisions.md 26ms (unchanged)
next.config.ts 15ms (unchanged)
package.json 1ms (unchanged)
src/app/layout.tsx 5ms (unchanged)
src/app/page.tsx 2ms (unchanged)
src/app/site-metadata.ts 1ms (unchanged)
tsconfig.json 2ms (unchanged)
FORMAT_EXIT=0
```

E00_S01's files were hand-written in a Prettier-compatible style — single quotes, semicolons,
2-space indent, under 100 columns — so there is no reformatting commit. Eight files are the entire
formattable surface of this repository today.

**To answer the question directly**: there was no reformatting to commit versus configure around.
The only two things Prettier would have rewritten were `next-env.d.ts` and the agent harness, and
both were configured around, deliberately and with reasons written into `.prettierignore` — not
because the diff was inconvenient, but because in both cases another tool owns the file and would
have undone the change.

### Confirmed, not assumed — Prettier 3 reads `.gitignore` by default

Since 3.0 the default ignore path is `.gitignore` **and** `.prettierignore`. The probe above shows no
`node_modules/`, `.next/` or `out/` entries even though the run predated nothing — they are excluded
twice over. The three entries remain in `.prettierignore` anyway: the task requires them, and this
story's stated preference is configuration that is readable rather than implied. If `.gitignore` is
ever narrowed, `.prettierignore` still holds.

Files with no Prettier parser (`.sh`, `.py`, `.csv`, `.nvmrc`, `.jenga-version`, `tsconfig.tsbuildinfo`)
are skipped silently during directory expansion. No `--ignore-unknown` flag is needed and none was
added.

---

## Verification — every acceptance criterion, with real output

### 1. `prettier` in `devDependencies` with a caret range; lockfile updated

```
$ git diff --stat -- package.json package-lock.json
 package-lock.json | 17 +++++++++++++++++
 package.json      |  5 ++++-
 2 files changed, 21 insertions(+), 1 deletion(-)
```

Range `^3.9.6`, lockfile resolves `3.9.6`. See the version block above. **Pass.**

### 2. `.prettierrc.json` sets the six options — and they are behaviourally active

Exit-zero on a config file proves nothing, so the options were exercised against probe input.

```
$ npx prettier --find-config-path src/app/page.tsx
.prettierrc.json
```

Probe A — `printWidth`, `semi`, `singleQuote`, `endOfLine` (input has CRLF line endings):

```
--- INPUT ---
const f = async (a) => { const o = { alpha: "one", beta: "two", gamma: "three", delta: "four", epsilon: "five" }
return o }

--- OUTPUT ---
const f = async (a) => {
  const o = { alpha: 'one', beta: 'two', gamma: 'three', delta: 'four', epsilon: 'five' };
  return o;
};

input  CR=2
output CR=0
longest output line = 90
```

Probe B — `trailingComma: "all"`, `arrowParens: "always"`, and `printWidth` wrapping at 100:

```
--- INPUT ---
const o = { alphaAlphaAlpha: 1, betaBetaBetaBeta: 2, gammaGammaGamma: 3, deltaDeltaDelta: 4, epsilonEpsilon: 5 }
const g = x => x
function h(aLongParameterName, anotherLongParameterName, aThirdEvenLongerParameterName) { return 1 }

--- OUTPUT ---
const o = {
  alphaAlphaAlpha: 1,
  betaBetaBetaBeta: 2,
  gammaGammaGamma: 3,
  deltaDeltaDelta: 4,
  epsilonEpsilon: 5,
};
const g = (x) => x;
function h(aLongParameterName, anotherLongParameterName, aThirdEvenLongerParameterName) {
  return 1;
}
```

Every one of the six is visible in the output: the 110-column object wrapped while the 90-column
signature did not (`printWidth: 100`), semicolons were added (`semi`), `"one"` became `'one'`
(`singleQuote`), `epsilonEpsilon: 5,` carries a trailing comma (`trailingComma: "all"`), `x =>`
became `(x) =>` (`arrowParens: "always"`), and both CR bytes were stripped (`endOfLine: "lf"`).
**Pass.**

### 3. `.prettierignore` excludes the five entries, each with a stated reason

```
$ cat .prettierignore
# Build output and installed dependencies — not authored files.
node_modules/
.next/
out/

# Generated by npm; reformatting it produces enormous, meaningless diffs.
package-lock.json

# The scrum board is hand-maintained Markdown with deliberate line breaks, not source code.
project/

# Regenerated by `next build` on every run and marked "should not be edited". Prettier rewrites its
# imports to single quotes; the next build rewrites them straight back to double quotes. Formatting
# it would leave `format:check` red after every build, including in CI.
next-env.d.ts

# Agent harness, versioned here but authored and rewritten outside this repository's source
# conventions. Formatting it would produce a 146-file diff that no one owns and the harness undoes.
.claude/
.agents/
```

All five required entries present, each under a comment giving its reason; the three additions carry
reasons too. **Pass.**

### 4. `.prettierignore` does not exclude `src/` or `scripts/`

Negative check:

```
$ grep -nE '^(src|scripts)/?' .prettierignore
GREP_SRC_SCRIPTS_IN_IGNORE_EXIT=1   # no match — correct
```

Positive check — Prettier actually reaches both. `src/` is checked and passes; a temporary
deliberately-malformed file at `scripts/probe.ts` is seen and rejected, proving the path that
`E00_S03` will create is not pre-emptively excluded:

```
$ npx prettier --check src/
Checking formatting...
All matched files use Prettier code style!
PRETTIER_SEES_SRC_EXIT=0

$ mkdir -p scripts && printf 'export const  x   =1\n' > scripts/probe.ts
$ npx prettier --check scripts/probe.ts
Checking formatting...
[warn] scripts/probe.ts
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
PRETTIER_SEES_SCRIPTS_EXIT=1        # it sees and rejects it — correct

$ rm -rf scripts && ls -d scripts
ls: scripts: No such file or directory
```

The probe directory was removed. **Pass.**

### 5. `package.json` contains exactly `format` and `format:check` in addition to S01's four

See the scripts block above — six scripts, the original four unchanged and in their original order.
**Pass.**

### 6. `npm run format:check` exits zero on the clean tree

```
$ npm run format:check
> skolkartan@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
FORMAT_CHECK_CLEAN_EXIT=0
```

**Pass.**

### 7. A deliberate misformat makes `format:check` exit non-zero and name the file

`src/app/page.tsx` was byte-identical to HEAD first, and copied aside so its hash could be compared:

```
$ shasum -a 256 src/app/page.tsx /tmp/t01-page.orig
5587268839d2c10f417d71cb2b167603166b57272d97fdad6e3a7d6af8766bd7  src/app/page.tsx
5587268839d2c10f417d71cb2b167603166b57272d97fdad6e3a7d6af8766bd7  /tmp/t01-page.orig
$ git diff --stat -- src/app/page.tsx
PAGE_MATCHES_HEAD_BEFORE_EDIT
```

The misformat collapses all indentation, swaps to double quotes and drops the semicolons — three
different rules at once, so the check is not passing on a technicality:

```
$ git diff --stat -- src/app/page.tsx
 src/app/page.tsx | 16 ++++++++--------
 1 file changed, 8 insertions(+), 8 deletions(-)

$ npm run format:check
Checking formatting...
[warn] src/app/page.tsx
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
FORMAT_CHECK_MISFORMATTED_EXIT=1
```

Non-zero, and it names `src/app/page.tsx`. **Pass.**

### 8. `npm run format` rewrites it, `format:check` passes again, and the tree is identical

```
$ npm run format
> prettier --write .
...
src/app/page.tsx 2ms          <- no "(unchanged)" — this one was rewritten
...
FORMAT_FIX_EXIT=0

$ npm run format:check
Checking formatting...
All matched files use Prettier code style!
FORMAT_CHECK_AFTER_FIX_EXIT=0

$ shasum -a 256 src/app/page.tsx /tmp/t01-page.orig
5587268839d2c10f417d71cb2b167603166b57272d97fdad6e3a7d6af8766bd7  src/app/page.tsx
5587268839d2c10f417d71cb2b167603166b57272d97fdad6e3a7d6af8766bd7  /tmp/t01-page.orig

$ git diff --stat -- src/app/page.tsx
PAGE_DIFF_VS_HEAD_EMPTY
```

Identical hash, empty diff against HEAD. Prettier's idea of correct formatting for this file is
byte-for-byte what E00_S01 committed — which is the strongest available evidence that the config and
the existing codebase agree. **Pass.**

### 9. `format:check` reports no file under `project/`

```
$ npx prettier --list-different . | grep -c '^project/'
0
$ npx prettier --check project/PROJECT_SUMMARY.md
Checking formatting...
All matched files use Prettier code style!
CHECK_PROJECT_FILE_EXIT=0
```

And the exclusion is load-bearing, not vacuous — 37 board files would be rewritten without it:

```
$ npx prettier --ignore-path /dev/null --list-different project/ | head -5
project/board/epics/E00_project-foundation.md
project/board/epics/E01_data-source-catalogue.md
project/board/stories/E00_S01_application-skeleton-and-typescript-configuration.md
project/board/stories/E00_S03_extensible-ci-check-registry.md
project/board/stories/E00_S04_ci-pipeline-and-merge-gate.md
COUNT_IF_NOT_IGNORED=37
```

**Pass.**

### 10. No kommun, skola, nyckeltal or data source in anything this task wrote

```
$ grep -rniE 'kommun|skola|skol[^k]|nyckeltal|siris|skolverket|kolada|scb' \
    .prettierrc.json .prettierignore package.json
DOMAIN_GREP_EXIT=1   # no match
```

`.prettierrc.json` is six formatting options. `.prettierignore` is paths and comments about build
tooling. The `package.json` diff is one dependency line and two script lines. The only domain-adjacent
string anywhere near this task is the pre-existing package name `skolkartan`, which is the project's
own name, was not introduced here, and is not a kommun, a skola, a nyckeltal or a data source.
**Pass.**

**Ten of ten pass.**

## Definition of Done

- [x] All acceptance criteria met.
- [x] **`npm run format` twice in succession produces no diff on the second run.** Measured
      differentially, because the harness writes into this working directory:

      ```
      $ git status --porcelain > before.txt
      $ npm run format
      FORMAT_2ND_EXIT=0
      $ git status --porcelain > after.txt
      $ diff before.txt after.txt
      SECOND_FORMAT_RUN_PRODUCED_NO_DIFF
      ```

      Corroborated by the run log itself: every one of the eight files reports `(unchanged)`.
- [x] **`git status` clean after `npm run format` on the committed tree.** Final state:

      ```
      $ git status --porcelain
       M package-lock.json                                    <- this task
       M package.json                                         <- this task
       M project/PROJECT_SUMMARY.md                           <- pre-existing, scrum master's
       M project/logs/events.json                             <- this task's session log entries
      ?? .claude/skills/index/scripts/__pycache__/            <- pre-existing harness noise
      ?? .prettierignore                                      <- this task
      ?? .prettierrc.json                                     <- this task
      ?? project/documentation/plans/E00_S02_T01-plan.md      <- this task
      ?? project/queue/                                       <- pre-existing harness noise
      ```

      No entry under `src/`, no entry for `next-env.d.ts`, no entry for `.claude/` or `.agents/`
      content. Running `format` contributed nothing to this list. The two pre-existing entries were
      present before this task started, as `E00_S01_T05` recorded.
- [x] **`npm run typecheck` and `npm run build` still pass.**

      ```
      $ npm run typecheck
      > tsc --noEmit
      FINAL_TYPECHECK_EXIT=0

      $ npm run build
      > next build
      ▲ Next.js 16.3.1 (Turbopack)
      ✓ Compiled successfully in 217ms
        Running TypeScript ...
        Finished TypeScript in 189ms ...
      ✓ Generating static pages using 4 workers (3/3) in 332ms

      Route (app)
      ┌ ○ /
      └ ○ /_not-found

      FINAL_BUILD_EXIT=0
      ```
- [x] **No ESLint or Vitest package, config file or script was added.**

      ```
      $ node -p '...deps+devDeps filtered on /eslint|vitest|jest/i'
      []
      $ node -p '...script names filtered on /lint|test/i'
      []
      $ ls eslint.config.mjs .eslintrc* vitest.config.ts
      (eval): no matches found
      ```
- [x] **`format:check` is named exactly `format:check`** — see the scripts block.
- [x] **`tsconfig.json` untouched** — `git diff --stat -- tsconfig.json` is empty. E00_S02_T03's note
      that Vitest globals stay off specifically so this file is never modified in this story is
      preserved.

## Commits

None. Worktree isolation is unavailable in this harness and the orchestrator commits on the
developer's behalf, so no mutating git command was run. Files ready to be committed:

```
.prettierrc.json                                    (new)
.prettierignore                                     (new)
package.json                                        (modified)
package-lock.json                                   (modified)
project/documentation/plans/E00_S02_T01-plan.md     (new)
project/documentation/summaries/E00_S02_T01-summary.md (new)
project/board/tasks/E00_S02_T01_prettier-configuration-and-format-scripts.md (front-matter)
project/logs/events.json                            (session log entries)
```

---

## What E00_S02_T02 (ESLint) needs to know

**1. Load `eslint-config-prettier` last. It is not optional and there is now something for it to
turn off.** The config in place sets `singleQuote`, `semi`, `trailingComma`, `arrowParens` and
`printWidth` explicitly. `@eslint/js` recommended and `eslint-config-next` between them enable rules
that will contradict at least `singleQuote` and `semi`. If both tools have opinions, `lint:fix` and
`format` will undo each other and the story's own criterion — "running `npm run format` immediately
after `npm run lint:fix` produces no diff" — cannot pass.

**2. Your `eslint.config.mjs` will itself be formatted by `format:check`, and it is not excluded.**
`.prettierignore` deliberately does not exclude repository-root config files. Run `npm run format`
after writing it, or `format:check` goes red and you will have broken my criterion 6 rather than
your own. The same applies to T03's `vitest.config.ts`.

**3. Do not add `next-env.d.ts` to ESLint's ignores by copying my `.prettierignore` wholesale, and do
not remove it from mine.** My reason for excluding it is specific to formatting: `next build`
rewrites its quote style. ESLint's ignore list should be decided on ESLint's own merits. But if you
lint it, be aware the file is regenerated on every build and any autofix you apply to it is
temporary.

**4. `.claude/` and `.agents/` are tracked and hold 256 files, 124 of them Markdown.** The story tells
you to mirror `.gitignore` plus `project/` in ESLint's ignores. `.gitignore` does not cover these two
directories, and they contain 2 `.js` files that ESLint will otherwise pick up. Decide deliberately;
I excluded them from Prettier and stated why in `.prettierignore`.

**5. Prettier 3 reads `.gitignore` as well as `.prettierignore` by default.** ESLint flat config does
**not** read `.gitignore` — it only honours the `ignores` key (or `@eslint/compat`'s
`includeIgnoreFile`). So an entry that is redundant in my file is mandatory in yours. `node_modules/`
is the exception: ESLint ignores it by default.

**6. Do not add a `format` or `format:check` script, and do not reorder `scripts`.** They are
appended after `typecheck`; append yours after mine and the `package.json` diff stays reviewable.

## What E00_S02_T03 (Vitest) needs to know

**1. `vitest.config.ts` is not excluded from Prettier.** Run `npm run format` before you finish.

**2. The `@/*` alias has no `baseUrl` to lean on.** TypeScript 7 removed `baseUrl` (E00_S01_T02's
recorded deviation); `paths` alone anchors to the tsconfig directory. Most Vitest alias guides tell
you to add `baseUrl` — under TypeScript 7 that is a hard TS5102 error. Resolve `@/` in
`vitest.config.ts` with an explicit `resolve.alias` entry instead, and do not touch `tsconfig.json`.

**3. `src/lib/` is currently empty.** `src/lib/assertNever.ts` and its test are yours to create, and
they will be formatted by `format:check` like anything else under `src/`.

## Notes for the tester

- **Run everything under Node 24.18.0.** On the ambient Node 20.10.0 you will get failures that mean
  nothing.
- The single most valuable thing to re-run is the misformat cycle (criteria 7 and 8). It is fully
  self-reverting: `npm run format` restores `src/app/page.tsx` to its committed bytes, hash
  `5587268839d2c10f417d71cb2b167603166b57272d97fdad6e3a7d6af8766bd7`.
- Second most valuable is the `next-env.d.ts` interaction. To confirm the exclusion is still
  necessary rather than cargo-cult, comment `next-env.d.ts` out of `.prettierignore`, run
  `npm run format`, then `npm run build`, then `npm run format:check` — it should go red. Restore the
  line afterwards.
- `git status` in this working copy carries pre-existing harness noise
  (`project/PROJECT_SUMMARY.md`, `project/queue/`, `.claude/.../__pycache__/`). It was there before
  this task and is not mine. The meaningful cleanliness check is that no entry appears under `src/`
  and none appears for `next-env.d.ts`.
- `docs/decisions.md` was **not** appended to by this task. E00_S01_T05 left an outstanding
  recommendation to record the `baseUrl` deviation there; the Prettier-owns-formatting decision is
  the story's DoD item, not this task's, and T02 is the natural place for it since it is T02 that
  enacts the other half. Flagged rather than silently done.

## Outstanding

1. **The Prettier-owns-formatting decision is not yet in `docs/decisions.md`.** The story's DoD
   requires it to be "written down where the next reader will find them". It is currently in this
   summary and in the story file. `E00_S02_T02` enacts the other half of the decision
   (`eslint-config-prettier` last) and should append the entry covering both halves.
2. **`next-env.d.ts` and the harness exclusions are recorded only in `.prettierignore` comments.**
   That is the right place for someone reading the ignore file, but a reader of `docs/decisions.md`
   will not find them. Worth one line when item 1 is written.
3. **`npm audit` still reports 6 vulnerabilities, 1 critical**, all reachable only through
   `@jenga-ai/agent`, all `No fix available`. Adding `prettier` changed nothing here. Still
   `E00_S04`'s decision.
