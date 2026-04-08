---
name: analyze
description: Run deep investigation of architecture, bugs, performance issues with structured findings
---

# Skill: analyze

Evidence-driven investigation for ambiguous, causal, evidence-heavy questions.

## Use When

- Runtime bugs and regressions
- Performance / latency / resource behavior
- Architecture / premortem / postmortem analysis
- Config / routing / orchestration behavior
- Dependency analysis or impact assessment
- "Given this output, trace back the likely causes"

## Do Not Use When

- User wants code changes — use `$ralph` or executor instead
- User wants a full plan — use `$plan` instead
- User wants a quick file lookup — use explore instead

## Core Investigation Contract

1. **Observation** — what was actually observed
2. **Hypotheses** — competing explanations
3. **Evidence For** — what supports each explanation
4. **Evidence Against / Gaps** — what contradicts or is missing
5. **Current Best Explanation** — the leading explanation
6. **Critical Unknown** — the missing fact keeping uncertainty open
7. **Discriminating Probe** — the highest-value next step

## Evidence Strength Hierarchy

1. Controlled reproductions, direct experiments
2. Primary source artifacts (trace events, logs, configs, git history)
3. Multiple independent sources converging
4. Single-source code-path inference
5. Weak circumstantial clues
6. Intuition / speculation

## Falsification Rules

For each hypothesis:

- Collect evidence **for**
- Collect evidence **against**
- State what distinctive prediction it makes
- Identify cheapest probe that would discriminate it

Down-rank when:

- Direct evidence contradicts
- It survives only by adding unverified assumptions
- No distinctive prediction compared with rivals

## Output Format

### Ranked Hypotheses

| Rank | Hypothesis | Confidence      | Evidence Strength    |
| ---- | ---------- | --------------- | -------------------- |
| 1    | ...        | High/Medium/Low | Strong/Moderate/Weak |

### Most Likely Explanation

[With file:line references]

### Critical Unknown

[Single missing fact]

### Recommended Next Step

[Discriminating probe or fix recommendation]
