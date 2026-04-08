---
name: review
description: Reviewer-only pass for plan review
---

# Skill: review

Critic evaluation of an existing plan to preserve writer/reviewer separation.

## Use When

- User says "review this plan" or "/review"
- Need a separate reviewer pass on an existing plan

## Behavior

1. Read plan from `.opencode/plans/`
2. Evaluate via critic agent
3. Verify artifact includes:
   - Cleanup plan (for refactor work)
   - Regression-test coverage or explicit test gap
   - Quality gates
4. Return verdict: APPROVED, REVISE, or REJECT

## Guardrails

- Never write and approve in the same context
- Approval must cite concrete evidence, not claims
- If current context authored the artifact, hand to critic

## Output

```
REVIEW REPORT
=============

Plan: [path]
Files Referenced: [list]

VERDICT: APPROVED / REVISE / REJECT

[Specific feedback]

[If approved: acceptance criteria met]
[If rejected: replanning required]
```
