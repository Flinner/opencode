---
name: swarm
description: N coordinated agents on shared task list
---

# Skill: swarm

Compatibility alias for `$team`. Routes to the team skill's staged pipeline.

## Usage

```
swarm N:role "task description"
swarm "task description"
```

## Behavior

Same as `$team` — invoke team skill with the same arguments.

## Team Workflow

1. **Leader** creates team and tasks
2. **Workers** spawn and claim tasks via `team_task_claim`
3. Workers execute and report via `team_task_transition`
4. Leader monitors via `team_status` and `team_phase`
5. Graceful shutdown via `team_shutdown`

See `$team` for full documentation.
