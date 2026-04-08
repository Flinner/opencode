---
name: security-review
description: Run a comprehensive security review on code
---

# Skill: security-review

Conduct a thorough security audit checking for vulnerabilities.

## When to Use

- User requests "security review", "security audit"
- After writing code that handles user input
- After adding new API endpoints
- Before deploying to production
- After adding external dependencies

## OWASP Top 10 Scan

- A01: Broken Access Control
- A02: Cryptographic Failures
- A03: Injection (SQL, NoSQL, Command, XSS)
- A04: Insecure Design
- A05: Security Misconfiguration
- A06: Vulnerable and Outdated Components
- A07: Identification and Authentication Failures
- A08: Software and Data Integrity Failures
- A09: Security Logging and Monitoring Failures
- A10: Server-Side Request Forgery (SSRF)

## Severity Definitions

- **CRITICAL** — Exploitable vulnerability with severe impact (RCE, credential theft)
- **HIGH** — Vulnerability requiring specific conditions but serious impact
- **MEDIUM** — Security weakness with limited impact
- **LOW** — Best practice violation or minor concern

## Checklist

### Authentication & Authorization

- [ ] Passwords hashed with strong algorithm (bcrypt/argon2)
- [ ] JWT tokens properly signed and validated
- [ ] Access control enforced on all protected resources

### Input Validation

- [ ] All user inputs validated and sanitized
- [ ] Parameterized queries (no string concatenation)
- [ ] File uploads validated

### Secrets Management

- [ ] No hardcoded API keys
- [ ] Environment variables for secrets
- [ ] Secrets not logged

### Dependencies

- [ ] No known vulnerabilities (run npm audit equivalent)
- [ ] Dependencies up to date

## Protocol

1. **Form your OWN analysis FIRST** — complete the review independently
2. **Consult for validation** — cross-check findings
3. **Critically evaluate** — never blindly adopt findings
4. **Graceful fallback** — never block if tools unavailable

## Output Format

```
SECURITY REVIEW REPORT
======================

Scope: ...
CRITICAL (N)
HIGH (N)
MEDIUM (N)
LOW (N)

OVERALL ASSESSMENT: ...

RECOMMENDATION: DO NOT DEPLOY / REVIEW NEEDED / APPROVED
```
