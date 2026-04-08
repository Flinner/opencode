---
name: hud
description: Show OMX orchestration status (ralph, ultrawork, team, turns)
---

# Skill: hud

Show current OMX orchestration status and mode information.

## Status Display

Shows active modes, turn counts, and activity:

```
[Team] ralph:3/10 | turns:42
[Team] ralph:3/10 | ultrawork | team:3 workers | turns:42 | last:5s ago
```

## Presets

| Preset  | Description                              |
| ------- | ---------------------------------------- |
| minimal | ralph iterations + turn count            |
| focused | Default — includes activity, team, modes |
| full    | All elements including pipeline status   |

## What Gets Shown

- **Ralph**: iteration count and max (e.g., ralph:3/10)
- **Ultrawork**: active when parallel agents running
- **Team**: worker count when team active
- **Turns**: session turn count
- **Last activity**: time since last action
- **Pipeline**: current stage when in pipeline mode

## Usage

```bash
# Show current HUD
hud

# With specific preset
hud --preset=minimal
hud --preset=full

# Live updating
hud --watch
```

## State Files

HUD reads from `.opencode/state/`:

- `ralph-state.json` — Ralph iteration
- `team-state.json` — Team workers
- `autopilot-state.json` — Autopilot phase
- `.opencode/metrics.json` — Turn counts
