---
name: tdd
description: Test-Driven Development enforcement - write tests first, always
---

# Skill: tdd

## The Iron Law

**NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST**

Write code before test? DELETE IT. Start over. No exceptions.

## Red-Green-Refactor Cycle

### 1. RED: Write Failing Test

- Write test for the NEXT piece of functionality
- Run test — MUST FAIL
- If it passes, your test is wrong

### 2. GREEN: Minimal Implementation

- Write ONLY enough code to pass the test
- No extras. No "while I'm here."
- Run test — MUST PASS

### 3. REFACTOR: Clean Up

- Improve code quality
- Run tests after EVERY change
- Must stay green

### 4. REPEAT

- Next failing test
- Continue cycle

## Enforcement Rules

| If You See                     | Action                                 |
| ------------------------------ | -------------------------------------- |
| Code written before test       | STOP. Delete code. Write test first.   |
| Test passes on first run       | Test is wrong. Fix it to fail first.   |
| Multiple features in one cycle | STOP. One test, one feature.           |
| Skipping refactor              | Go back. Clean up before next feature. |

## Protocol

1. **Form your OWN test strategy FIRST** — design tests independently
2. **Consult for validation** — use `$code-review` or similar for cross-check
3. **Critically evaluate** — never blindly adopt external suggestions
4. **Graceful fallback** — never block if external tools unavailable

## When to Consult

- Complex domain logic requiring comprehensive test coverage
- Edge case identification for critical paths
- Test architecture for large features

## When to Skip

- Simple unit tests
- Well-understood testing patterns
- Time-critical TDD cycles

## Remember

The discipline IS the value. Shortcuts destroy the benefit.
