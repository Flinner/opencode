---
name: team
description: Spawn a coordinated team of parallel worker agents for complex multi-part tasks
---

# Skill: team

Spawn a leader-coordinated team of parallel worker agents to accomplish a complex task.

## Usage

```
$team N:role "task description"
```

Examples:
- `$team 3:executor "implement user authentication"`
- `$team 5:executor "fix all TypeScript errors"`
- `$team 2:verifier "audit the security implementation"`

## How It Works

### Team Model

- **Leader** (you): Coordinates the team, creates tasks, advances phases
- **Workers** (child sessions): Claim and execute tasks from the shared queue

### Phase Pipeline

The team follows a staged pipeline:

```
team-plan    → analyst, planner       → task breakdown
team-prd     → product-manager      → scope + acceptance criteria
team-exec    → executor (parallel)  → implementation
team-verify  → verifier              → evidence collection
team-fix     → executor              → bounded remediation (max 3 loops)
        ↓ (if all verified)
complete
```

### Tool Summary

Use these tools in order:

1. **team_create** — Create the team with N workers of a given role
2. **team_task_create** — Create individual tasks (one per discrete unit of work)
3. **team_phase advance to=team-prd** — Move to requirements phase
4. **team_phase advance to=team-exec** — Move to execution (workers claim tasks here)
5. **team_phase advance to=team-verify** — Move to verification
6. **team_status** — Check team state at any time

### Worker Tool Reference

Workers (in their own sessions) use:
- **team_task_claim** — Claim a pending task (atomically)
- **team_task_transition** — Mark task completed/failed
- **team_mailbox_list** — Check for leader messages
- **team_mailbox_send** — Send status to leader or other workers
- **team_worker_register** — Register with the team on startup

### Task Lifecycle

```
pending → in_progress (claim) → completed
                              → failed
         ↑______ (release) ___|
```

Tasks use claim tokens for race-condition safety. Store the token from `team_task_claim` and pass it to `team_task_transition`.

### Team Commands

| Command | Description |
|---------|-------------|
| `$team N:role "desc"` | Start team with N workers |
| `team_status team_name=X` | Full team dump |
| `team_phase team_name=X action=get` | Current phase info |
| `team_phase team_name=X action=advance to=team-exec` | Advance phase |

### Example Flow

```
You (leader): $team 3:executor "build REST API"

You: team_create task_description="build REST API" worker_count=3 worker_role=executor
  → Creates team team-abc123

You: team_task_create team_name=team-abc123 subject="auth endpoints" description="POST /login, POST /register, POST /logout"
You: team_task_create team_name=team-abc123 subject="user endpoints" description="GET /users/:id, PUT /users/:id"
You: team_task_create team_name=team-abc123 subject="product endpoints" description="CRUD for /products"

You: team_phase team_name=team-abc123 action=advance to=team-exec reason="Tasks created, ready to execute"

Workers (3x): team_task_claim → implement → team_task_transition

You: team_phase team_name=team-abc123 action=advance to=team-verify reason="All tasks completed"
```

## Notes

- Teams persist state in `.opencode/team/<team-name>/`
- Each worker is a child session of the leader session
- Workers poll mailbox for messages from the leader
- Use `team_status` to monitor progress at any time
- Phase transitions are logged and broadcast via the event bus
