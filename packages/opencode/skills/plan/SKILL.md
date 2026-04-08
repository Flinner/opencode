---
name: plan
description: Strategic planning with optional interview workflow
---

# Skill: plan

Create comprehensive, actionable work plans through intelligent interaction.

## Use When

- User wants to plan before implementing — "plan this", "plan the", "let's plan"
- Request is broad or vague and needs scoping
- User wants an existing plan reviewed — "review this plan"
- User wants consensus planning — `$ralplan`

## Do Not Use When

- User wants autonomous end-to-end execution — use `$autopilot` instead
- Task is a single focused fix — skip planning, just do it

## Modes

### Interview Mode (broad/vague requests)

1. Classify the request — broad triggers interview mode
2. Ask one focused question at a time
3. Gather codebase facts via `explore` before asking user about them
4. Build on answers
5. Create plan when user signals readiness

### Direct Mode (detailed requests)

1. Generate comprehensive work plan immediately
2. Optional critic review if requested

### Consensus Mode (`$ralplan`)

1. **Planner** creates initial plan with RALPLAN-DR summary (Principles, Decision Drivers, Options)
2. **Architect** reviews for architectural soundness
3. **Critic** evaluates against quality criteria
4. **Re-review loop** — max 5 iterations until approval
5. **ADR** section in final output (Decision, Drivers, Alternatives, Why chosen, Consequences)

### Review Mode (`$review`)

1. Read plan from `.opencode/plan/<name>.md`
2. Evaluate via critic agent
3. Return verdict: APPROVED, REVISE, or REJECT

## Plan Output Format

Every plan includes:

- Requirements Summary
- Acceptance Criteria (testable)
- Implementation Steps (with file references)
- Risks and Mitigations
- Verification Steps
- For consensus mode: RALPLAN-DR summary + ADR

Plans saved to `.opencode/plans/`.

## Quality Standards

- 80%+ claims cite file/line
- 90%+ criteria are testable
- Right-sized step count (not fixed to 5)
- No vague terms without metrics

## Escalation

- Stop after 5 consensus iterations and present best version
- If user says "just do it" — invoke `$ralph` for execution
