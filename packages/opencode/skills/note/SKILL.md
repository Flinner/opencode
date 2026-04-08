---
name: note
description: Save notes to notepad for context persistence across sessions
---

# Skill: note

Save important context to `.opencode/notepad.md` that survives session compaction.

## Usage

| Command                     | Action                                                  |
| --------------------------- | ------------------------------------------------------- |
| `note <content>`            | Add to Working Memory with timestamp                    |
| `note --priority <content>` | Add to Priority Context (always loaded, 500 char limit) |
| `note --manual <content>`   | Add to MANUAL section (never pruned)                    |
| `note --show`               | Display current notepad contents                        |
| `note --prune`              | Remove entries older than 7 days                        |
| `note --clear`              | Clear Working Memory (keep Priority + MANUAL)           |

## Sections

### Priority Context

- **Always** injected on session start
- Use for critical facts: project type, key files, conventions
- Keep SHORT — eats into context budget (500 char limit)

### Working Memory

- Timestamped session notes
- Auto-pruned after 7 days
- Good for: debugging breadcrumbs, temporary findings

### MANUAL

- Never auto-pruned
- User-controlled permanent notes
- Good for: team contacts, deployment info

## Examples

```
note Found auth bug in UserContext - missing useEffect dependency
note --priority Project uses TypeScript strict mode
note --manual Contact: api-team@company.com for backend questions
note --show
```

## Behavior

1. Creates `.opencode/notepad.md` if missing
2. Parses argument to determine section
3. Appends content with timestamp (Working Memory)
4. Warns if Priority Context exceeds 500 chars
5. Confirms what was saved
