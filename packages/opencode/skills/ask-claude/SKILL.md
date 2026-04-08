---
name: ask-claude
description: Ask Claude via local CLI and capture reusable artifact
---

# Skill: ask-claude

Use locally installed Claude CLI as external advisor.

## Usage

```
ask-claude <question or task>
```

## Routing

Preferred — local CLI:

```bash
claude -p "<question>"
```

## Artifact Requirement

After execution, save artifact to:

```
.opencode/artifacts/claude-<slug>-<timestamp>.md
```

### Minimum Sections

1. Original user task
2. Final prompt sent to Claude CLI
3. Claude output (raw)
4. Concise summary
5. Action items / next steps

## Missing Binary

If `claude` not found:

1. Explain local Claude CLI is required
2. Ask user to install/configure
3. Provide verification command:

```bash
claude --version
```
