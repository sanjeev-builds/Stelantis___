# Contributing Guide

This document explains exactly how the 5-person team collaborates on this repository during the hackathon. Read this before your first commit — it complements the [README](README.md#git-workflow).

## Core Rule

**No one commits directly to `main`.** All changes reach `main` through reviewed Pull Requests, via `integration`.

## Branch Model

```
feature branch (per developer)
        │  PR
        ▼
   team branch (frontend / backend / ai)
        │  PR
        ▼
     integration
        │  PR
        ▼
        main
```

## Step-by-Step: Making a Change

1. **Sync before you start:**
   ```bash
   git checkout <team-branch>
   git pull origin <team-branch>
   ```
2. **Create a feature branch off your team branch:**
   ```bash
   git checkout -b <team-branch>/<yourname>-<short-feature>
   # e.g. git checkout -b backend/priya-auth-endpoint
   ```
3. **Work, then commit in small, logical chunks** using [Conventional Commits](https://www.conventionalcommits.org/) (see README for the full list of types):
   ```bash
   git add .
   git commit -m "feat(backend): add JWT auth middleware"
   ```
4. **Stay in sync while you work** (do this at least once a day, or before opening a PR):
   ```bash
   git fetch origin
   git merge origin/<team-branch>
   ```
5. **Push your feature branch:**
   ```bash
   git push origin <team-branch>/<yourname>-<short-feature>
   ```
6. **Open a Pull Request** on GitHub into your **team branch** (not `main`). Fill out the PR template completely.
7. **Request review** from at least one teammate — ideally the owner of the folder you touched.
8. **Address feedback**, push follow-up commits to the same branch.
9. **Merge once approved.** Delete the feature branch after merge to keep things tidy.

## Who Merges Into `integration` and `main`

The `integration` branch owner (see README team table) is responsible for opening and merging:
- `frontend → integration`
- `backend → integration`
- `ai → integration`
- `integration → main`

These merges also go through PRs and should only happen once the receiving branch has been smoke-tested locally or in a preview deployment.

## Code Review Checklist

Before approving a PR, check:
- [ ] Code runs locally / builds without errors
- [ ] No secrets, API keys, or `.env` files committed
- [ ] Follows existing folder structure and naming conventions
- [ ] Commit messages follow the convention
- [ ] No unrelated files changed (formatting-only diffs, stray `node_modules`, etc.)
- [ ] PR description explains the "why," not just the "what"

## Reporting Bugs / Requesting Features

Use the issue templates in `.github/ISSUE_TEMPLATE/` — do not open a blank issue.

## Communication

- Announce in the team chat before touching shared/root-level config files (`docker-compose.yml`, `package.json`, `requirements.txt`, CI config).
- If you're about to be offline for more than a couple hours, push your work-in-progress branch first (even if incomplete) so it isn't lost.
- If you break something on a shared branch, say so immediately — don't quietly force-push over it. See the README's [Emergency Recovery](README.md#emergency-recovery) section.
