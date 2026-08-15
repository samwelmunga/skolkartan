---
id: E00_S05_T03
title: Verify the README against a clean clone
status: Pending
story_id: E00_S05
epic_id: E00
date_created: 2026-08-15
date_started: null
date_completed: null
depends_on:
  - E00_S05_T02
---

# Task: Verify the README against a clean clone

## Description

Prove that `README.md` works for someone who has never run this project. The developer's own working
directory is contaminated by definition — `node_modules/`, `.next/`, a warm nvm shell, environment
variables set weeks ago. None of that exists for a newcomer, and the only honest test is a clone into
an empty directory followed by the README's instructions and **nothing else**.

This task changes no configuration and adds no dependency. Its only permitted output is a fix to
`README.md` when the clone exposes a gap, plus the evidence recorded in the rapport.

### The run

Perform this in a fresh shell, in a temporary directory outside the repository:

```bash
TMP="$(mktemp -d)"
cd "$TMP"
git clone <source> skolkartan
cd skolkartan
```

For `<source>`, prefer the GitHub remote configured during `E00_S04`
(`git remote get-url origin` in the working repository gives it). If no remote is reachable, clone
from the local repository path instead — `git clone /Users/samwelmunga/Desktop/Projects/skolkartan`.
Either is a valid clean clone; `git clone` never copies `node_modules/` or `.next/`. State in the
rapport which source was used.

Then execute, in order, **only** what the README's Getting started and Checks sections instruct:

1. `nvm use` — confirm it selects the version in `.nvmrc` (24.18.0) without being told the number.
2. `npm ci` — confirm it completes with no error and no interactive prompt.
3. `npm run dev` — confirm the dev server starts, then confirm `http://localhost:3000` returns HTTP
   200 and renders the placeholder page. `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000`
   is sufficient evidence. Stop the server afterwards.
4. `npm run build` — confirm it exits zero. This also discharges E00's Definition-of-Done item about
   a fresh clone building, which `E00_S05_T04` will cite rather than repeat.
5. `npm run ci` — confirm it runs every registered check and exits zero.

Record, for each step: the exact command, the exit code, and the salient output (the Node version
selected, the HTTP status, the check summary lines). "It worked" is not evidence.

### What counts as a failure

Any of the following means the README is wrong, not that the environment is unusual:

- A step needs a command the README does not mention (an extra install, an env file, a flag).
- A step needs prior knowledge the README does not state (which port, which Node version, that the
  page is intentionally near-empty).
- A command in the README does not exist or errors.
- The order in the README does not work as written.

When that happens: **fix `README.md` in the working repository**, not in the temporary clone.
Then delete the temporary directory, create a new one, and **re-run the whole sequence from step 1**.
A partial re-run does not prove anything, because the fix may itself have introduced an assumption.
Repeat until a clone runs end to end untouched.

Do not fix the problem by changing a script, a config file or the application. If the repository is
genuinely broken rather than merely undocumented, that is a defect in `E00_S01`–`E00_S04` and must be
raised as such rather than papered over in the README.

### Cleanup

Delete the temporary directory when finished (`rm -rf "$TMP"`). Confirm afterwards that
`git status` in the working repository shows either a clean tree or only the intended `README.md`
change — nothing from the clone experiment may leak back.

## Acceptance Criteria

- [ ] A clone into a directory created by `mktemp -d`, outside the working repository, has been
      performed, and the clone source is recorded.
- [ ] `nvm use` in the clone selects Node 24.18.0 from `.nvmrc` without the version being supplied
      manually.
- [ ] `npm ci` in the clone exits zero with no interactive prompt and no manual step.
- [ ] `npm run dev` in the clone serves `http://localhost:3000` with HTTP 200, and the recorded
      evidence includes the status code.
- [ ] `npm run build` in the clone exits zero.
- [ ] `npm run ci` in the clone runs every registered check and exits zero, and the recorded evidence
      includes the per-check summary lines.
- [ ] Every command executed during the run appears in `README.md`; no command was invented,
      substituted or supplemented from memory.
- [ ] Any gap found is fixed in `README.md` in the working repository, and the full sequence is then
      re-run from step 1 in a **new** temporary directory until it passes untouched.
- [ ] The temporary directory is deleted and no artefact of it remains in the working repository.

## Definition of Done

- [ ] All acceptance criteria are met.
- [ ] The rapport records, per step, the command, the exit code and the salient output — not a
      summary assertion that the run succeeded.
- [ ] The rapport states how many clean-clone attempts were needed and what was fixed between them;
      "first attempt passed" is a valid and expected answer once the README is right.
- [ ] No file other than `README.md` was modified by this task.
- [ ] If the clone revealed a defect in the repository rather than in the README, it is written up in
      the rapport and attributed to the owning story (`E00_S01`–`E00_S04`) rather than worked around.
- [ ] `E00_S05_T04` can cite this task's evidence for E00's fresh-clone Definition-of-Done item
      instead of repeating the clone.
