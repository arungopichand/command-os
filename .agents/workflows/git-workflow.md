---
description: Enterprise Git Branching Strategy for COMMAND.OS
---

# Enterprise Git Branching Strategy

This workflow defines the standard operating procedures for managing code changes in the COMMAND.OS repository.

## Branch Hierarchy

1.  **`main` (Stable/Production)**: Contains code that is currently deployed or ready for production. 
    - Only `dev` can merge into `main`.
    - No direct commits are allowed on `main`.
2.  **`dev` (Integration/Development)**: The central integration branch for all ongoing development.
    - All feature branches start from and merge back into `dev`.
    - `dev` should always be in a building/testable state.
3.  **`feature/*` (Feature/Bugfix)**: Isolated environments for specific changes.
    - Format: `feature/<feature-name>` or `bugfix/<issue-number>`.

## Working with Features

### 1. Starting a Feature
To begin work on a new component or task, ensure you are on `dev` and pull the latest changes:
// turbo
```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### 2. Ongoing Development
Make frequent, atomic commits with descriptive messages:
```bash
git add .
git commit -m "feat: [component] description of change"
```

### 3. Merging to Dev
Once the feature is complete and verified, merge it into `dev`:
// turbo
```bash
git checkout dev
git pull origin dev
git merge feature/your-feature-name
git push origin dev
git branch -d feature/your-feature-name
```

## Promoting to Production (Main)

When a set of features in `dev` is ready for a parallel "Live" run, promote `dev` to `main`:
// turbo
```bash
git checkout main
git merge dev
git push origin main
git checkout dev
```
