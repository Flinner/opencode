---
name: deep-interview
description: Socratic deep interview with ambiguity gating before execution
argument-hint: "<idea or vague description>"
---

# Skill: deep-interview

Intent-first Socratic clarification before planning or implementation.

## Use When

- Request is broad, ambiguous, or missing concrete acceptance criteria
- User says "deep interview", "interview me", "ask me everything"
- Want to avoid misaligned implementation from underspecified requirements

## Do Not Use When

- Request already has concrete file/symbol targets and clear acceptance criteria
- User explicitly asks to skip planning and execute immediately
- A complete PRD/plan already exists

## Depth Profiles

- **Quick** (`--quick`): target ambiguity <= 0.30, max 5 rounds
- **Standard** (default): target ambiguity <= 0.20, max 12 rounds
- **Deep** (`--deep`): target ambiguity <= 0.15, max 20 rounds

## Execution Policy

- Ask ONE question per round (never batch)
- Ask about intent and boundaries before implementation detail
- Gather codebase facts via explore before asking user about internals
- Re-score ambiguity after each answer
- Do not hand off while ambiguity remains above threshold

## Interview Dimensions

- **Intent Clarity** — why the user wants this
- **Outcome Clarity** — what end state they want
- **Scope Clarity** — how far the change should go
- **Constraint Clarity** — technical or business limits
- **Success Criteria Clarity** — how completion will be judged

## Phases

### Phase 0: Preflight Context

1. Derive task slug from request
2. Check for existing context snapshots
3. Create context snapshot

### Phase 1: Socratic Interview Loop

1. Generate next question targeting weakest dimension
2. Score ambiguity after each answer
3. Report progress
4. Continue until ambiguity <= threshold or max rounds

### Phase 2: Crystallize Artifacts

Write execution-ready spec to `.opencode/specs/`.

## Execution Bridge

After clarification, offer handoff to:

- `$plan` — consensus planning
- `$autopilot` — full autonomous execution
- `$ralph` — persistent sequential execution
- `$team` — coordinated parallel execution
