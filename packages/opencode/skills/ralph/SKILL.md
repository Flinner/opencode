---
name: ralph
description: Persistent execution mode - work until verified complete
---

# Skill: ralph

Persistent execution mode that keeps working until the task is verified complete.

## Use When

- User says "ralph", "keep going", "don't stop until done"
- Task requires multiple iterations
- Want autonomous execution without stopping

## Behavior

Ralph loops until done:

1. Do the work
2. Verify the work
3. If issues found → fix them
4. Loop until verified complete or max iterations

## Ralph + Team

Ralph can delegate to `$team` for parallel work:

- Use team for independent tasks that can run concurrently
- Ralph coordinates and verifies the overall result

## Ralph + Ultrawork

Ultrawork enables max parallelism within Ralph:

- Spawn multiple agents in parallel
- Each agent works on separate tasks
- Ralph verifies combined results

## Termination

Ralph stops when:

- Task is verified complete
- User says "stop" or "cancel"
- Max iterations reached (default: 10)
- Fundamental issue found that requires human input

## State

Ralph state saved to `.opencode/state/ralph-state.json`:

- Current phase
- Iteration count
- Task description
- Last verification result

Resume supported — re-run `$ralph` to continue from where it stopped.
