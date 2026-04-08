---
name: pipeline
description: Configurable pipeline orchestrator for sequencing stages
---

# Skill: pipeline

Configurable pipeline orchestrator that sequences stages.

## Default Pipeline

```
RALPLAN (consensus planning) → team-exec (workers) → ralph-verify
```

## Stage Interface

Every stage implements:

- `name`: stage identifier
- `run(ctx)`: execute stage, return StageResult
- `canSkip?`: whether stage can be skipped

## Built-in Stages

| Stage        | Description                                   |
| ------------ | --------------------------------------------- |
| ralplan      | Consensus planning — skips if artifacts exist |
| team-exec    | Team worker execution                         |
| ralph-verify | Ralph verification loop                       |

## Configuration

| Parameter          | Default  | Description                    |
| ------------------ | -------- | ------------------------------ |
| maxRalphIterations | 10       | Verification iteration ceiling |
| workerCount        | 2        | Number of team workers         |
| agentType          | executor | Agent type for workers         |

## State Management

Pipeline state persists via mode system at `.opencode/state/pipeline-state.json`.

Resume supported from last incomplete stage.
