# Instructions for you — E00_S04_T02: Create the GitHub remote and enable Actions

This task needs three things only you can do. The agent has stopped and is waiting.

**Why the agent cannot do this:** creating the repository means choosing its name, its owner and
whether it is public or private. Those are your decisions, not the agent's.

**Current state, verified:** this project is a local git repository on branch `main` with **no
remote configured at all**. The `gh` CLI is installed and you are already logged in as
`samwelmunga`, with token scopes `repo` and `workflow` — enough for everything below.

---

## Step 1 — Create the GitHub repository and add it as a remote

Pick **one** of the two routes.

### Route A — command line (fastest)

From the project directory:

```
gh repo create skolkartan --private --source=. --remote=origin
```

- Change `skolkartan` if you want a different name.
- Swap `--private` for `--public` if you want it public. For a personal research tool, private is
  the sensible default, and it is the one assumed elsewhere in this Epic.
- To put it under an organisation instead of your personal account, use `ORGNAME/skolkartan` as the
  name.

This creates the repository and wires it up as `origin` in one step. It does **not** push yet —
that is intentional, the agent handles the first push in a later task.

### Route B — web interface

1. Go to https://github.com/new
2. Enter the repository name (`skolkartan` unless you prefer otherwise).
3. Choose Private or Public.
4. **Do not** tick "Add a README", "Add .gitignore" or "Choose a license". The repository already
   has content and an initialised remote will cause a conflict on the first push.
5. Click **Create repository**.
6. Back in the project directory, run the command GitHub shows you, which will look like:

   ```
   git remote add origin https://github.com/<your-account>/skolkartan.git
   ```

---

## Step 2 — Confirm GitHub Actions is enabled

New repositories normally have Actions on by default, but account-level and organisation-level
policies can override that, so please confirm rather than assume.

1. Open the repository on github.com.
2. Go to **Settings → Actions → General**.
3. Under **Actions permissions**, make sure it is set to **Allow all actions and reusable
   workflows**.
4. Click **Save** if you changed anything.

If you are in an organisation and the option is greyed out, the policy is set at the organisation
level and an organisation owner has to change it. Tell the agent if you hit this — it changes how
the rest of the story proceeds.

---

## Step 3 — Confirm the default branch is `main`

The workflow only triggers on `main`, and branch protection later in this story targets `main`.

In **Settings → General → Default branch**, confirm it reads `main`. If the repository was created
from the local repo in Step 1 it will already be correct.

---

## What happens next

Once you have done the above, tell the agent you are done. It will verify by running:

```
git remote -v
gh repo view --json name,visibility,defaultBranchRef
gh api repos/{owner}/{repo}/actions/permissions
```

If any of those disagree with what you expect, the agent will come back to you rather than
proceeding.

**Not yet needed:** branch protection. That comes later in this story as a separate task
(`E00_S04_T05`), with its own instructions file, because GitHub can only offer the `checks` job in
the required-status-checks picker after that job has reported at least once. Setting it up now would
mean typing the check name blind. Please do not configure it early.
