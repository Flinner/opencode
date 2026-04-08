---
name: ai-slop-cleaner
description: Cleanup/refactor workflow that preserves behavior and raises code quality
---

# Skill: ai-slop-cleaner

Reduce bloat from AI-generated code with regression-tests-first, smell-by-smell cleanup.

## Use When

- Code works but feels bloated, noisy, repetitive, or over-abstracted
- User asks to "cleanup", "refactor", or "deslop"
- Follow-up left duplicate code, dead code, or unnecessary wrappers
- Need disciplined cleanup without broad rewrites

## Procedure

### 1. Lock Behavior with Regression Tests First

- Identify behavior that must not change
- Add or run targeted regression tests before editing

### 2. Create Cleanup Plan Before Code

- List specific smells to remove
- Order from safest to riskiest
- Do not start coding until plan is explicit

### 3. Categorize Issues

- **Duplication** — repeated logic, copy-paste branches
- **Dead code** — unused code, unreachable branches
- **Needless abstraction** — pass-through wrappers, single-use helpers
- **Boundary violations** — leaky responsibilities, wrong-layer imports
- **Missing tests** — behavior not locked

### 4. Execute Passes One Smell at a Time

- Pass 1: Dead code deletion
- Pass 2: Duplicate removal
- Pass 3: Naming/error handling cleanup
- Pass 4: Test reinforcement

### 5. Run Quality Gates

- Regression tests stay green
- Lint passes
- Typecheck passes
- Diff stays minimal

### 6. Finish with Report

```
AI SLOP CLEANUP REPORT
======================

Scope: [files or feature]
Behavior Lock: [tests added/run]
Cleanup Plan: [smells and order]

Passes Completed:
1. Dead code deletion
2. Duplicate removal
3. Naming/error handling cleanup
4. Test reinforcement

Quality Gates:
- Regression tests: PASS/FAIL
- Lint: PASS/FAIL
- Typecheck: PASS/FAIL

Changed Files: [list]
Remaining Risks: [none or deferred]
```
