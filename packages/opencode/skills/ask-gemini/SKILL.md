---
name: ask-gemini
description: Ask Gemini via local CLI and capture reusable artifact
---

# Skill: ask-gemini

Use locally installed Gemini CLI as external advisor.

## Usage

```
ask-gemini <question or task>
```

## Routing

Preferred — local CLI:

```bash
gemini -p "<question>"
```

## Artifact Requirement

After execution, save artifact to:

```
.opencode/artifacts/gemini-<slug>-<timestamp>.md
```

### Minimum Sections

1. Original user task
2. Final prompt sent to Gemini CLI
3. Gemini output (raw)
4. Concise summary
5. Action items / next steps

## Missing Binary

If `gemini` not found:

1. Explain local Gemini CLI is required
2. Ask user to install/configure
3. Provide verification command:

```bash
gemini --version
```
