---
name: worker
description: Worker loop for opencode team - respond to messages from leader
---

# Skill: worker

You are a worker in team `<team-name>`. Your worker name is `<worker-name>`.

## How You Work

You receive messages from the leader (via `SessionPrompt.prompt`). Each message is a task assignment. Process the task and respond with your result.

**You do NOT poll. You do NOT check mailboxes. You wait for messages to arrive.**

When you receive a message:

1. Read the task from the message
2. Do the work
3. Respond with your result

## Message Format

The leader sends you tasks as text messages. Each task tells you what to do. Be concise in your responses.

## Team Tools

Available tools for coordinating with the leader:

- `team_status` — check team state
- `team_phase` — check current phase
- `team_task_create` — create a subtask (if needed)

## Exit

Stop when the leader sends "shutdown" or "cancel" in the message body.
