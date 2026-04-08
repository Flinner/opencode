---
name: configure-notifications
description: Configure opencode notifications
---

# Skill: configure-notifications

Configure notification settings for opencode.

## Platforms

### Discord

- Webhook URL
- Channel for notifications

### Slack

- Webhook URL
- Channel for notifications

### Telegram

- Bot token
- Chat ID

## Configuration Steps

1. Identify current notification state
2. Ask which platform user wants to configure
3. Collect platform-specific values
4. Write to `~/.opencode/config.json`

## Cross-Cutting Settings

- **Verbosity**: minimal / session / agent / verbose
- **Idle cooldown**: seconds before idle notification
- **Events**: which events trigger notifications

## Verification

After configuration, verify by triggering a test notification.
