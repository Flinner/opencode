---
name: code-review
description: Run a comprehensive code review
---

# Skill: code-review

Conduct a thorough code review for quality, security, and maintainability.

## When to Use

- User requests "review this code", "code review"
- Before merging a pull request
- After implementing a major feature
- User wants quality assessment

## Review Categories

### Security

- Hardcoded secrets, injection risks, XSS, CSRF
- OWASP Top 10

### Code Quality

- Function size, complexity, nesting depth
- Naming, documentation, error handling

### Performance

- Algorithm efficiency, N+1 queries, caching

### Best Practices

- Proper patterns, DRY principle
- Testability

### Maintainability

- Duplication, coupling

## Severity Rating

- **CRITICAL** — Security vulnerability (must fix before merge)
- **HIGH** — Bug or major code smell (should fix before merge)
- **MEDIUM** — Minor issue (fix when possible)
- **LOW** — Style/suggestion (consider fixing)

## Protocol

1. **Form your OWN review FIRST** — complete the review independently
2. **Consult for validation** — cross-check findings
3. **Critically evaluate** — never blindly adopt external findings
4. **Graceful fallback** — never block if tools unavailable

## Checklist

### Security

- [ ] No hardcoded secrets
- [ ] All user inputs sanitized
- [ ] SQL/NoSQL injection prevention
- [ ] XSS prevention
- [ ] Authentication/authorization properly enforced

### Code Quality

- [ ] Functions < 50 lines
- [ ] No deeply nested code (> 4 levels)
- [ ] Clear, descriptive naming
- [ ] No duplicate logic

### Best Practices

- [ ] Error handling present
- [ ] Tests for critical paths

## Output Format

```
CODE REVIEW REPORT
==================

Files Reviewed: N
Total Issues: N

CRITICAL (N)
HIGH (N)
MEDIUM (N)
LOW (N)

RECOMMENDATION: APPROVE / REQUEST CHANGES
```

## Approval Criteria

- **APPROVE** — No CRITICAL or HIGH issues
- **REQUEST CHANGES** — CRITICAL or HIGH issues present
- **COMMENT** — Only LOW/MEDIUM issues
