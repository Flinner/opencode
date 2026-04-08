---
name: git-master
description: Git expert for atomic commits, rebasing, and history management
---

# Skill: git-master

Git expert routing for complex git operations.

## Use When

- Need atomic commits with conventional format
- Interactive rebasing required
- Branch management
- History cleanup
- Style detection from repo history

## Common Operations

### Atomic Commits

Commit related changes together with meaningful messages:

```
git add -p  # stage changes interactively
git commit -m "fix(auth): resolve token refresh race

The token refresh callback was being called multiple times when
concurrent requests hit the expiry threshold. Added a mutex lock
to ensure only one refresh runs at a time.

Fixes: #1234"
```

### Rebasing

```bash
# Interactive rebase of last 5 commits
git rebase -i HEAD~5

# Rebase onto main
git rebase main

# Continue after resolving conflicts
git rebase --continue
```

### Branch Management

```bash
# Create feature branch
git checkout -b feature/new-auth

# Update from main
git fetch origin main
git rebase origin/main

# Delete merged branch
git branch -d feature/new-auth
```

## Conventions

- Use conventional commit format: `type(scope): message`
- Types: fix, feat, docs, style, refactor, test, chore
- Keep commits atomic — one logical change per commit
- Write meaningful messages: what and why, not just what
