# Instructions for you — E00_S04_T02: Turn on the merge gate

This needs you to change a GitHub repository setting. The agent has stopped and is waiting.

**Why the agent cannot do this:** branch protection changes how your repository behaves for
everyone, including you. Some of the options below decide whether you can override the gate on your
own project. That is your call.

**Prerequisite already met:** `E00_S04_T01` pushed the workflow and it has reported a check named
**`checks`** on `main`. That is why this comes now — GitHub only offers a check in the picker after
it has seen it report at least once.

**Repository:** https://github.com/samwelmunga/skolkartan (public, default branch `main`)

---

## Step 1 — Open branch protection

1. Open the repository on github.com.
2. **Settings → Branches**.
3. Next to **Branch protection rules**, click **Add branch protection rule**. If a rule for `main`
   already exists, click **Edit** instead.

---

## Step 2 — Configure the rule

**Branch name pattern:** `main`

### Required — the gate itself

- **Require a pull request before merging**

  This stops changes landing on `main` without a PR, which is where the check gets to block.
  Underneath it you will see **Require approvals** — leave this **unticked**. You are the only
  maintainer and GitHub will not let you approve your own pull request, so requiring an approval
  would lock you out of your own repository.

- **Require status checks to pass before merging**

  In the search box that appears, type `checks` and select it. It must be the entry named exactly
  **`checks`** — lower case, no prefix. If nothing appears, the workflow has not reported recently
  enough; tell the agent rather than typing the name manually.

- **Require branches to be up to date before merging**

  Appears once you tick status checks. A PR must be current with `main` before merging, so the check
  result reflects the code that will actually land rather than a stale snapshot.

### Your decision — how strict to be with yourself

- **Do not allow bypassing the above settings**

  Ticking this applies the rules to administrators too, so **you** cannot push straight to `main` or
  merge past a red check.

  **Recommendation: tick it.** The point of this story is that an agreed rule cannot be bypassed by
  forgetting. Leaving yourself an override makes the gate advisory. Keeping an escape hatch is a
  legitimate choice — just say so, because it gets written down either way.

### Leave unticked

Signed commits, linear history, deployment environments, merge queue. None is needed here, and each
adds a way for the pipeline to fail for reasons unrelated to the checks.

---

## Step 3 — Save

Click **Create** (or **Save changes**).

---

## Alternative — command line

```
gh api -X PUT repos/samwelmunga/skolkartan/branches/main/protection \
  --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["checks"] },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null
}
JSON
```

Set `"enforce_admins": false` instead if you want to keep an override for yourself.

---

## What happens next

Tell the agent you are done. It will verify by reading the rule back:

```
gh api repos/samwelmunga/skolkartan/branches/main/protection
```

**Then be aware:** from now on you cannot push directly to `main`. Every change goes via a pull
request. That is the gate working as designed.

The next task deliberately breaks the build once on a throwaway branch to prove the gate blocks a
merge. You will see one red pull request appear and then be cleaned up — that is expected.
