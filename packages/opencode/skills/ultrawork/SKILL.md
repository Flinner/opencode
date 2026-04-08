---
name: ultrawork
description: Maximum parallelism for independent tasks
---

# Skill: ultrawork

Maximum parallelism execution — spawn independent agents for concurrent work.

## Use When

- Multiple independent tasks that can run concurrently
- User says "ultrawork", "parallel", "ulw"
- Want to maximize throughput on parallelizable work

## Behavior

Spawn multiple agents simultaneously, each working on separate tasks:

```
Task A ──┐
Task B ──┼──> Results aggregated
Task C ──┘
```

## Task Decomposition

Break work into N independent units:

1. Identify independent subtasks
2. Spawn agents — one per subtask
3. Wait for all to complete
4. Aggregate results

## Ralph + Ultrawork

Ultrawork is automatically included in `$ralph`:

- Ralph coordinates the work
- Ultrawork enables parallel execution
- Ralph verifies combined results

## Limits

- Reasonable concurrent agent limit (typically 3-5)
- Avoid overwhelming context with too many parallel agents
- Consider task complexity — complex tasks may need dedicated agents

## State

Ultrawork state saved to `.opencode/state/ultrawork-state.json`.
