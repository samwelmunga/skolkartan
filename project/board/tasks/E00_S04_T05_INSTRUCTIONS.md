# Instructions for you — E00_S04_T05: Turn on the merge gate

This task needs you to change a GitHub repository setting. The agent has stopped and is waiting.

**Why the agent cannot do this:** branch protection changes how your repository behaves for
everyone, including you. Some of the options below decide whether you can override the gate on your
own project. That is your call, not the agent's.

**Prerequisite already met:** the workflow has run at least once on `main` and reported a check
named **`checks`**. That is why this step comes now and not earlier — GitHub can only offer a check
in the picker after it has seen it report.

---

## Step 1 — Open the branch protection settings

1. Open your repository on github.com.
2. Go to **Settings → Branches**.
3. Next to **Branch protection rules**, click **Add branch protection rule**.
   (If a rule for `main` already exists, click **Edit** on it instead.)

---

## Step 2 — Configure the rule

**Branch name pattern:** type `main`

Then tick the following:

### Required — the gate itself

- [ ] **Require a pull request before merging**

      This is what stops changes landing on `main` without going through a PR, which is where the
      check gets to block. Underneath it you will see **Require approvals** — you can safely leave
      this **unticked**. You are the only maintainer, and GitHub will not let you approve your own
      pull request, so requiring an approval would lock you out of your own repository. The agent
      will record that this was a deliberate choice.

- [ ] **Require status checks to pass before merging**

      Then, in the search box that appears, type `checks` and select it from the results.

      It must be the entry named exactly **`checks`** (lower case, no prefix). If nothing appears in
      the search, the workflow has not reported recently enough — tell the agent rather than typing
      the name in manually.

- [ ] **Require branches to be up to date before merging**

      This appears once you tick the status checks option. It means a PR must be rebased or updated
      on top of the latest `main` before it can merge, so the check result reflects the code that
      will actually land rather than a stale snapshot.

### Your decision — how strict to be with yourself

- [ ] **Do not allow bypassing the above settings**

      Ticking this applies the rules to administrators too, which means **you** cannot push straight
      to `main` or force a merge past a red check.

      **Recommendation: tick it.** The entire point of this story is that a rule the project agreed
      on cannot be bypassed by forgetting. Leaving yourself an override means the gate is advisory.
      If you would rather keep an escape hatch, that is a legitimate choice — just tell the agent,
      because it gets written down either way.

### Leave unticked

Everything else — signed commits, linear history, deployment environments, merge queue. None of it
is needed for this Epic, and each adds a way for the pipeline to fail for reasons unrelated to the
checks.

---

## Step 3 — Save

Click **Create** (or **Save changes**).

---

## Alternative — command line

If you prefer the CLI, this applies the recommended configuration in one call. Replace
`OWNER/REPO`:

```
gh api -X PUT repos/OWNER/REPO/branches/main/protection \
  --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["checks"] },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null
}
JSON
```

Set `"enforce_admins": false` instead if you decided to keep an override for yourself.

---

## What happens next

Tell the agent you are done. It will verify by reading back the protection rule:

```
gh api repos/OWNER/REPO/branches/main/protection
```

and by attempting a direct push to `main` to confirm it is rejected.

**Then be aware of this:** from now on you can no longer push directly to `main`. Every change goes
via a pull request. That is the gate working as designed, and the agent's remaining tasks in this
story assume it.

The next task after this one deliberately breaks the build three times on a throwaway branch to
prove the gate actually blocks a merge. You will see three red pull requests appear and then be
cleaned up — that is expected, not a problem.
