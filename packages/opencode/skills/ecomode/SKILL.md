---
name: ecomode
description: Token-efficient model routing modifier
---

# Skill: ecomode

Token-efficient model routing. This is a **MODIFIER**, not a standalone execution mode.

## What Ecomode Does

Overrides default model selection to prefer cheaper tiers:

| Default Tier | Ecomode Override                     |
| ------------ | ------------------------------------ |
| THOROUGH     | STANDARD, THOROUGH only if essential |
| STANDARD     | LOW first, STANDARD if needed        |
| LOW          | LOW — no change                      |

## What Ecomode Does NOT Do

- **Persistence** — use `$ralph`
- **Parallel Execution** — use `$team` or `$ultrawork`
- **Delegation Enforcement** — always active via core

## Combining with Other Modes

| Combination     | Effect                           |
| --------------- | -------------------------------- |
| `ecomode ralph` | Ralph loop with cheaper agents   |
| `ecomode team`  | Team with cost-optimized workers |

## Routing Rules

**ALWAYS prefer lower tiers. Only escalate when genuinely required.**

| Decision | Rule                                                              |
| -------- | ----------------------------------------------------------------- |
| DEFAULT  | Start with LOW tier for most tasks                                |
| UPGRADE  | Escalate to STANDARD when LOW fails or needs multi-file reasoning |
| AVOID    | THOROUGH — only for planning/critique if essential                |

## Agent Selection in Ecomode

```
// PREFERRED
delegate(role="executor", tier="LOW")
delegate(role="explore", tier="LOW")

// FALLBACK — Only if LOW fails
delegate(role="executor", tier="STANDARD")

// AVOID — Only for planning/critique
delegate(role="planner", tier="THOROUGH")
```
