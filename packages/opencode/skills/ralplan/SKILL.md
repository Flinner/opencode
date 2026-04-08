---
name: ralplan
description: Iterative planning with planner/architect/critic loop
---

# Skill: ralplan

Consensus planning with Planner → Architect → Critic loop until agreement.

## Use When

- User says "ralplan", "plan --consensus", "consensus planning"
- Want multi-perspective validation before execution
- High-stakes project needing expert review

## RALPLAN-DR Structure

Every plan must include:

### Principles (3-5)

Core guiding principles for the decision

### Decision Drivers (top 3)

Key factors driving the decision

### Viable Options (>= 2)

With bounded pros/cons for each

### Invalidation Rationale

Why alternatives were rejected (if only one option)

### Pre-mortem (Deliberate mode only)

3 failure scenarios for high-risk decisions

### Expanded Test Plan

Coverage: unit / integration / e2e / observability

## Loop

1. **Planner** creates initial plan + RALPLAN-DR summary
2. **Architect** reviews for architectural soundness
3. **Critic** evaluates against quality criteria
4. **Re-review loop** — max 5 iterations until Critic approves
5. Output final plan with ADR

## Modes

### Short (default)

Bounded structure, faster iteration

### Deliberate

For high-risk decisions (auth, security, data migration, production incidents)
Includes pre-mortem and expanded test plan

## Output

Final plan includes:

- RALPLAN-DR summary
- ADR (Decision, Drivers, Alternatives, Why chosen, Consequences, Follow-ups)
- Implementation steps
- Verification steps
