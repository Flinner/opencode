---
name: cancel
description: Cancel any active mode (autopilot, ralph, team, ecomode)
---

# Skill: cancel

Intelligent cancellation that detects and cancels active opencode modes.

## Usage

```
cancel
```

Or say: "cancelomc", "stopomc"

## Modes Handled

- **Autopilot**: Stops workflow, preserves progress for resume
- **Ralph**: Stops persistence loop
- **Team**: Sends shutdown to all workers, waits for exit, clears state
- **Ecomode**: Stops token-efficient execution

## Team Cancellation (if team active)

1. Send shutdown message to all workers via `team_mailbox_send`
2. Wait for graceful exit (up to 15s)
3. Force kill remaining workers
4. Remove team state directory
5. Clear team mode state

## Cleanup

After cancellation:

- State files cleared from `.opencode/state/`
- Progress preserved where applicable
- Team workers terminated cleanly

## Force Clear All

```
cancel --force
```

Clears all state files and kills all active modes regardless.
