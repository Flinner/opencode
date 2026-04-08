---
name: worker
description: Persistent worker loop that claims and executes team tasks until the team signals shutdown
---

# Skill: worker

Run as a persistent worker in a team. Continuously polls the mailbox for tasks, claims and executes them, and reports results back to the leader.

## Usage

```
$worker team-name=WORKER_NAME team=TEAM_NAME
```

This skill runs a persistent loop. It does not return until the team signals shutdown or all tasks are complete.

## Worker Loop

```
LOOP:
  1. team_mailbox_list — check for messages from leader
  2. If shutdown message → EXIT
  3. team_task_claim → try to claim a pending task
  4. If no task claimed → wait → LOOP
  5. Execute the task (use tools, make changes)
  6. team_task_transition → mark completed/failed
  7. Send result to leader via team_mailbox_send
  8. LOOP
```

## Claim Safety

Tasks use optimistic locking:
- `expected_version=1` for the first claim attempt
- If claim fails (already claimed), read the task's `claimVersion` from the result and retry with that version
- Always store the `claimToken` returned — it's required to transition or release

## Message Types

Workers receive messages via mailbox from:
- **leader**: Phase change notifications, shutdown signals
- **other workers**: Coordination messages (e.g., "I'm working on X, don't claim it")

## Exit Conditions

- Leader sends a message containing "shutdown"
- All tasks in the team are completed or failed
- Worker receives a cancellation signal

## Example Worker Session

```
session started as worker-1 (child of leader session)

$worker team-name=worker-1 team=team-abc123

team_mailbox_list team_name=team-abc123 worker=worker-1
  → No pending messages

team_task_claim team_name=team-abc123 task_id=<id> worker=worker-1 expected_version=1
  → Claimed task. Token: abc123. Subject: "auth endpoints"

[...implement auth endpoints...]

team_task_transition team_name=team-abc123 task_id=<id> from=in_progress to=completed claim_token=abc123 result="Implemented POST /login, /register, /logout with JWT"

team_mailbox_send team_name=team-abc123 from_worker=worker-1 to_worker=leader body="Task <id> completed: auth endpoints"

team_mailbox_list → no messages → try to claim next task
```

## Best Practices

- Send heartbeat messages to the leader periodically (every ~30 seconds)
- If an error occurs mid-task, use `team_task_transition` with `to=failed` and include the error message
- Keep task results concise — the leader will synthesize results across all workers
- Mark messages as notified/delivered so the leader knows you've seen them
