---
name: ralph-init
description: Initialize Ralph persistence mode for a task
---

# Skill: ralph-init

Initialize Ralph persistence mode with a task description.

## Use When

- Starting a new Ralph-controlled task
- Want to set up context before Ralph loop begins

## Usage

```
ralph-init <task description>
```

## What It Does

1. Parse task description
2. Create initial state in `.opencode/state/ralph-state.json`
3. Set phase to "init"
4. Prepare for Ralph loop execution

## State Created

```json
{
  "active": true,
  "phase": "init",
  "task": "<description>",
  "iteration": 0,
  "started_at": "<timestamp>"
}
```

## After Init

Once initialized, subsequent `$ralph` invocations will:

- Read the task from state
- Begin execution loop
- Track progress in state file
