---
name: doctor
description: Diagnose and fix opencode installation issues
---

# Skill: doctor

Diagnose and fix opencode installation issues.

## Task: Run Installation Diagnostics

### Step 1: Check Plugin Version

```bash
opencode --version
```

### Step 2: Verify Dependencies

```bash
# Check node/bun version
node --version
bun --version

# Check typescript
tsc --version
```

### Step 3: Check Configuration

```bash
# Verify config files exist
ls -la ~/.opencode/
ls -la ./.opencode/

# Check config validity
opencode config get
```

### Step 4: Verify Skill Scanning

Skills should be in:

- `~/.opencode/skills/`
- `./skills/`
- `./.opencode/skills/`

### Step 5: Check Team Subsystem

```bash
# Verify team state directory structure
ls -la .opencode/team/

# Check team tools are registered
opencode team list
```

## Common Issues

### Skills not loading

- Check `skills.paths` in config
- Verify SKILL.md files exist and are valid markdown

### Team tools not working

- Check `.opencode/team/` directory permissions
- Verify state files are readable

### TUI not starting

- Check terminal supports mouse events
- Try running with `--no-tui` flag
