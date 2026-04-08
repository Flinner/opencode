---
name: autopilot
description: Full autonomous execution from idea to working code
---

# Skill: autopilot

Autopilot takes a brief product idea and autonomously handles the full lifecycle: requirements analysis, technical design, planning, parallel implementation, QA cycling, and multi-perspective validation.

## Use When

- User wants end-to-end autonomous execution from idea to working code
- User says "autopilot", "auto pilot", "autonomous", "build me", "create me", "make me", "full auto", "handle it all"
- Task requires multiple phases: planning, coding, testing, validation
- User wants hands-off execution

## Do Not Use When

- User wants to explore or brainstorm — use `$plan` instead
- User wants a single focused code change — use `$ralph` instead
- Task is a quick fix or bug — use direct executor delegation

## Execution Policy

- Each phase must complete before the next begins
- Parallel execution within phases where possible
- QA cycles repeat up to 5 times; stop if same error persists 3 times
- All validators must approve in validation phase
- If input is too vague, offer/trigger `$deep-interview` first
- Default to concise, evidence-dense progress reporting
- Continue through clear next steps automatically; ask only when materially branching, destructive, or preference-dependent

## Steps

### Phase 0 — Expansion

Turn the user's idea into a detailed spec. If prompt is vague, route to `$deep-interview`.

### Phase 1 — Planning

Create implementation plan from spec using architect + critic agents.

### Phase 2 — Execution

Implement the plan using `$ralph` + `$team` for parallel work.

### Phase 3 — QA

Cycle until tests pass. Repeat up to 5 cycles. Stop if same error repeats 3 times.

### Phase 4 — Validation

Multi-perspective review in parallel:

- Architect: Functional completeness
- `$code-review`: Quality review
- `$security-review`: Vulnerability check

### Phase 5 — Cleanup

Clear mode state on successful completion.

## Tool Usage

- Use `team_*` tools for worker coordination
- Use `ralph` for persistent sequential execution
- Use `team_spawn` for parallel worker spawning
- Use standard tools for file operations, bash, etc.

## Escalation

- Stop when same QA error persists across 3 cycles
- Stop when validation fails after 3 re-validation rounds
- Stop on user "stop", "cancel", "abort"

## Final Checklist

- [ ] All 5 phases completed
- [ ] All validators approved
- [ ] Tests pass
- [ ] Build succeeds
- [ ] User informed of completion
