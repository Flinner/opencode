---
name: ultraqa
description: Parallel QA execution with verification cycling
---

# Skill: ultraqa

QA cycling workflow — build, test, fix, repeat until passing.

## Use When

- QA phase of autopilot or manual execution
- Need to cycle through build/test/fix until clean
- Want parallel QA across multiple files/components

## Workflow

### 1. Build Phase

```bash
npm run build
# or
bun run build
```

### 2. Test Phase

```bash
npm test
# or
bun test
```

### 3. Fix Phase

- Analyze failures
- Fix issues identified
- Re-run tests

### 4. Loop

Repeat until:

- All tests pass
- Same error persists 3 times (stop — fundamental issue)
- Max iterations reached

## Quality Gates

| Gate      | Requirement             |
| --------- | ----------------------- |
| Build     | Compiles without errors |
| Lint      | No lint errors          |
| Typecheck | No type errors          |
| Tests     | All tests pass          |

## Parallel QA

When using `$team` for QA:

- Spawn workers for different test suites
- Each worker runs subset of tests
- Results aggregated for overall pass/fail

## State

QA state saved to `.opencode/state/ultraqa-state.json`.
