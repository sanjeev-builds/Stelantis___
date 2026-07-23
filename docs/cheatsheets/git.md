# Git Cheat Sheet

Full workflow is in the root [README.md](../../README.md#git-workflow) — this is just the fast lookup.

```bash
# Start work
git checkout <team-branch>
git pull origin <team-branch>
git checkout -b <team-branch>/<yourname>-<feature>

# Stay in sync (do this often)
git fetch origin
git merge origin/<team-branch>

# Save work
git add .
git commit -m "feat(scope): summary"
git push origin <your-branch>

# Undo
git restore <file>              # discard unstaged changes to a file
git restore --staged <file>     # unstage but keep changes
git reset --soft HEAD~1         # undo last commit, keep changes staged
git revert <commit>             # undo a pushed commit safely (new commit)

# Inspect
git status
git log --oneline -10
git diff                        # unstaged changes
git diff --staged               # staged changes

# Stash (save work without committing)
git stash -u                    # include untracked files
git stash list
git stash pop

# Recover (see README Emergency Recovery for the full version)
git reflog
git checkout -b recovery-branch <commit-hash>
```

**Never:** `git push --force` on `main`/`frontend`/`backend`/`ai`/`integration`. Use `--force-with-lease` on your own feature branch only, and only if truly needed.
