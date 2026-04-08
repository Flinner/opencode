---
name: trace
description: Show agent flow trace timeline and summary
---

# Skill: trace

Display the flow trace showing how skills, agents, and tools interacted during the session.

## Objective

Show chronological event timeline and aggregate statistics.

## When to Use

- Understanding how a complex task was decomposed
- Debugging unexpected tool usage patterns
- Reviewing skill-to-skill delegation chains

## Output Format

### Timeline

Chronological event list showing:

- Skill activations
- Mode transitions
- Tool usage patterns
- Agent delegations

### Summary

- Skill fire counts
- Keywords detected
- Mode transitions
- Tool performance

## What Gets Traced

- Skill invocations (`$team`, `$ralph`, etc.)
- Mode changes (planning → execution → review)
- Tool calls (with timing)
- Agent delegations

## Usage

```
trace
```

Shows the current session trace by default.

## Interpretation

- **Flow patterns**: keyword → skill → agent chains
- **Bottlenecks**: slow tools or repeated operations
- **Mode transitions**: how execution style changed
