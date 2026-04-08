---
name: team
description: Spawn a coordinated team of parallel worker agents for complex multi-part tasks using native opencode child sessions
---

# Skill: team

Leader-coordinated team of parallel worker agents using opencode child sessions + shared task queue.

## Team Model

- **Leader** (you): Coordinates the team, creates tasks, advances phases
- **Workers** (child sessions): Claim and execute tasks from the shared queue via tools

## Phase Pipeline

```
team-plan    → task breakdown
team-prd     → scope + acceptance criteria
team-exec    → implementation (workers claim tasks here)
team-verify  → evidence collection
team-fix     → bounded remediation (max 3 loops)
        ↓ (if all verified)
complete
```

## Tools (Leader)

| Tool               | Purpose                     |
| ------------------ | --------------------------- |
| `team_create`      | Create team with N workers  |
| `team_task_create` | Add tasks to team queue     |
| `team_phase`       | Get or advance phase        |
| `team_status`      | Full team dump              |
| `team_spawn`       | Spawn worker child sessions |
| `team_shutdown`    | Graceful shutdown           |

## Tools (Workers)

| Tool                   | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `team_task_claim`      | Atomically claim pending task             |
| `team_task_transition` | Update task status (claim token required) |
| `team_mailbox_list`    | Check for leader/worker messages          |
| `team_mailbox_send`    | Send message to leader or broadcast       |
| `team_worker_register` | Register with team on startup             |

## Invocation

```
$team N:role "task description"
```

Example:

```
$team 3:executor "implement REST API"
```

## Flow

```
Leader: team_create task_description="build REST API" worker_count=3 worker_role=executor
  → Creates team, returns team name

Leader: team_task_create team_name=<team> subject="auth" description="..."
Leader: team_task_create team_name=<team> subject="users" description="..."

Leader: team_spawn team_name=<team> count=3 role=executor
  → Spawns 3 worker child sessions

Leader: team_phase team_name=<team> action=advance to=team-exec
  → Workers begin claiming tasks

Workers: team_task_claim → implement → team_task_transition → team_mailbox_send

Leader: team_phase team_name=<team> action=advance to=team-verify
Leader: team_status team_name=<team>

Leader: team_shutdown team_name=<team>
```

## Task Lifecycle

```
pending → in_progress (claim) → completed
                              → failed
```

Tasks use claim tokens for race-condition safety. Store token from `team_task_claim` and pass to `team_task_transition`.

## State

Team state persisted in `.opencode/team/<team-name>/`:

- `manifest.json` - team config + phase
- `tasks.json` - shared task queue
- `workers.json` - registered workers
- `mailbox/` - per-worker message queues
- `events.jsonl` - append-only event log

## Notes

- Each worker is an opencode child session with parentID
- Workers poll mailbox for messages from leader
- Phase transitions are logged and broadcast via event bus
- Workers use opencode tools for all coordination (no tmux)
