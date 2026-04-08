---
name: worker
description: Persistent worker loop for opencode team - claim and execute tasks until team shutdown
---

# Skill: worker

Persistent worker loop for opencode teams. Run in a child session spawned by `team_spawn`.

## Identity

You are a worker in team `<team-name>`. Your worker name is `<worker-name>`.

## Startup

1. Read inbox: `team_mailbox_list team_name=<team-name> worker=<worker-name>`
2. Send ACK to leader: `team_mailbox_send team_name=<team-name> from_worker=<worker-name> to_worker=leader body="ACK: <worker-name> initialized"`

## Worker Loop

```
LOOP:
  1. team_mailbox_list — check for messages from leader
  2. If shutdown/abort message → EXIT
  3. team_task_claim — try to claim a pending task
  4. If no task claimed → sleep 10 → LOOP
  5. Do the work
  6. team_task_transition — mark completed or failed
  7. team_mailbox_send — report result to leader
  8. LOOP
```

## Claim Safety

- Use `expected_version=1` for first claim attempt
- If claim fails (already claimed by another worker), retry by re-reading tasks and trying again
- Always store the `claimToken` from `team_task_claim` — required for `team_task_transition`

## Exit Conditions

- Leader sends message containing "shutdown"
- All tasks completed or failed
- Cancellation signal from parent session

## Example Worker Session

```
$worker team-name=worker-1 team=team-abc123

team_mailbox_list team_name=team-abc123 worker=worker-1
  → No pending messages

team_task_claim team_name=team-abc123 task_id=<id> worker=worker-1 expected_version=1
  → Claimed. Token: abc123. Subject: "auth endpoints"

[... implement auth endpoints ...]

team_task_transition team_name=team-abc123 task_id=<id> from=in_progress to=completed claim_token=abc123 result="Done"

team_mailbox_send team_name=team-abc123 from_worker=worker-1 to_worker=leader body="Task <id> completed"

team_mailbox_list → try next task
```

## Best Practices

- Send heartbeat messages to leader periodically (every ~30s)
- If error mid-task: `team_task_transition ... to=failed error="..."`
- Keep results concise — leader synthesizes across workers
- Mark messages delivered after reading them
