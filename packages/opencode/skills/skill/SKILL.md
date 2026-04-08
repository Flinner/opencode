---
name: skill
description: Guide on creating and using custom skills
---

# Skill: skill

Guide for creating and using custom skills in opencode.

## What is a Skill?

A skill is a Markdown file (SKILL.md) that defines:

- When to activate (description/triggers)
- What to do (workflow steps)
- How to execute (tool usage)

## Skill Location

Skills are scanned from:

- `~/.opencode/skills/`
- `./skills/`
- `./.opencode/skills/`
- `{package}/skills/`

## Skill Format

```markdown
---
name: my-skill
description: What this skill does
---

# Skill: my-skill

[Detailed workflow description]

## When to Use

[Activation criteria]

## Steps

1. [Step 1]
2. [Step 2]

## Tool Usage

[Which tools to use and when]
```

## Skill Discovery

Skills are auto-discovered by scanning for `SKILL.md` files.

To manually trigger a skill:

```
$skill-name <arguments>
```

## Examples

### Custom Debug Skill

```markdown
---
name: debug-route
description: Debug a specific route handler
---

# Skill: debug-route

1. Find route file
2. Add debug logging
3. Test endpoint
4. Review logs
5. Remove debug logging
```

## Best Practices

- Keep descriptions clear and actionable
- Include specific activation keywords
- Document tool usage
- Provide examples
