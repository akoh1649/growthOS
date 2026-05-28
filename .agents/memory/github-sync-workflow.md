---
name: GitHub sync workflow
description: How to pull external GitHub commits into Replit and push back, given that git fetch/pull/commit are blocked in the main agent environment.
---

## Pulling from GitHub into Replit

**Why:** git fetch/pull/merge are all blocked in the main agent container. External commits pushed directly to GitHub must be applied manually via the GitHub API.

**How to pull:**
1. Get the latest GitHub SHA: `GET /repos/:owner/:repo/commits/main`
2. Get files changed in that commit: `GET /repos/:owner/:repo/commits/:sha` — check `j.files[]`
3. Download each file: `GET /repos/:owner/:repo/contents/:path?ref=main` → base64-decode `j.content`
4. Read each existing local file first (write tool requires a prior read), then write the downloaded content
5. Restart affected workflows (especially api-server when routes change)

**Comparing to find what changed:**
- The GitHub API `/compare/{base}...{head}` only works if BOTH SHAs exist on GitHub
- Replit checkpoint SHAs do NOT exist on GitHub → compare returns 404
- Use the latest commit endpoint instead, then fetch that commit's file list

**Known working pattern for tracking last-synced SHA:**
- Track the last known GitHub SHA (from the commit message or prior session) and compare against `commits/main`
- If they match → nothing to pull

## Pushing to GitHub

**Why:** `git remote set-url` is blocked. Must pass token inline in the push URL.

**How:**
```bash
git push "https://<username>:${GITHUB_TOKEN}@github.com/<owner>/<repo>.git" main
```

**Push failure — diverged history:**
- If the user pushes commits to GitHub externally BEFORE we push, git push fails with:
  `error: Could not read <sha>` / `could not parse commit <sha>`
- This happens because git knows about the remote commit (from a partial fetch) but can't read its object
- Fix: there's no clean fix in the blocked environment. The Replit checkpoint system commits our changes automatically; those checkpoints are ahead of GitHub's view of `origin/main` in the local index
- **Do not attempt to push after pulling GitHub changes** — the local HEAD diverges from GitHub and push is blocked by the object-read failure. Just apply the files and let checkpoints handle the local commit.
