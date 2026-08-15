---
id: E00_S04_T01
title: Author the CI workflow file
status: Pending
story_id: E00_S04
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on: []
---

# Task: Author the CI workflow file

## Description

Create `.github/workflows/ci.yml` — the single GitHub Actions workflow for the repository. This
task is **file authoring only**. It does not push, does not run the workflow remotely, and does not
touch any GitHub setting; T04 does the first remote run and T05 configures the gate. That split is
deliberate so this task is fully verifiable offline, inside a worktree, with no remote configured.

### The file

Write exactly this content:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  checks:
    name: checks
    runs-on: ubuntu-24.04
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run ci
```

### Decisions already made — do not re-litigate

**"Exactly one execution step" means one step that executes project checks.** There are two `run`
steps: `npm ci` installs dependencies, `npm run ci` executes every check. Do not attempt to collapse
these into one. The rule being protected is that the workflow contains **no list of individual
checks** — not that it contains one `run:` line.

**Job id and job name are both `checks`, deliberately.** The status-check context that branch
protection matches on is the job's `name` when one is set, and the job id otherwise. Making them
identical removes the classic failure mode where T05 cannot find the check in the required-checks
picker because the workflow advertises a different string than expected. Do not rename either half.

**`runs-on: ubuntu-24.04`, not `ubuntu-latest`.** Two reasons. First, `latest` is a moving target
that can change the runner image under the project without a commit. Second, and concretely: the
literal string `ubuntu-latest` contains the substring `test`, which would make the
no-individual-checks verification below produce a false positive forever. Pinning removes both
problems at once.

**`node-version-file: .nvmrc`, never a hard-coded version.** One file states the Node version
(currently 24.18.0). `cache: npm` is on so `npm ci` does not re-download the tree on every run.

**`npm ci`, not `npm install`.** If `package-lock.json` has drifted from `package.json`, that is a
defect worth failing on, not something CI should quietly repair.

**No secrets, and no `env:` block.** The workflow must run to completion on a clean clone of a
public or private repository with zero configured secrets. A later Epic that needs a credential adds
it then, with its own story.

**`timeout-minutes: 15`** on the job. The current check suite runs in well under a minute; 15
minutes is generous headroom for a cold cache while still killing a hung check long before it burns
the runner budget.

### Verifying no individual checks are listed

The story forbids `lint`, `typecheck`, `test` and `build` from appearing in the workflow file. Verify
with a case-insensitive substring search, which is stricter than word-boundary matching and is what
the acceptance criterion means:

```
grep -Eio 'lint|typecheck|test|build' .github/workflows/ci.yml
```

This must produce **no output** and exit non-zero. With the file exactly as written above it does;
if you have altered the content and this now matches, the alteration is the defect, not the check.

### YAML validity

Confirm the file parses before relying on it. Either of these is acceptable evidence:

```
node -e "const {readFileSync}=require('fs');require('yaml')" # only if a YAML lib is present
python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml')); print('ok')"
```

Do **not** add a YAML parser as a project dependency just to run this check — use `python3`, which
is present on macOS and on the GitHub runner, or `gh workflow view` once T04 has pushed.

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` exists and its content matches the block above.
- [ ] The workflow declares one job whose id is `checks` and whose `name` is also `checks`.
- [ ] `on:` triggers are `push` to `main` and `pull_request` targeting `main`, and nothing else.
- [ ] `concurrency.group` is keyed on the workflow and the ref, and `cancel-in-progress` is `true`.
- [ ] `timeout-minutes` is set on the job.
- [ ] The steps are, in order: `actions/checkout@v4`, `actions/setup-node@v4` with
      `node-version-file: .nvmrc` and `cache: npm`, `npm ci`, `npm run ci`.
- [ ] `grep -Eio 'lint|typecheck|test|build' .github/workflows/ci.yml` produces no output.
- [ ] The file contains no `secrets.` reference, no `env:` block and no hard-coded Node version.
- [ ] The file parses as valid YAML, evidenced by a parser run whose output is recorded.
- [ ] No kommun, skola, nyckeltal or data source is referenced in the file.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] The `ubuntu-24.04` pin, the job-id-equals-job-name decision, and the two-`run`-steps
      clarification are recorded where the next reader will find them.
- [ ] No file outside `.github/workflows/ci.yml` is created or modified by this task.
- [ ] `npm run ci` still passes locally on the working tree after the change.
