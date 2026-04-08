---
name: web-clone
description: Clone a website from URL with visual and functional verification
---

# Skill: web-clone

Clone a target website from its URL.

## Use When

- User provides target URL and wants site replicated as working code
- User says "clone site", "clone website", "copy webpage"

## Scope

### Included

- Layout structure (header, nav, content, sidebar, footer)
- Typography (font families, sizes, weights)
- Colors, spacing, borders
- Core interactions (nav links, buttons, form elements)
- Responsive layout patterns

### Excluded

- Backend API integration
- Authentication flows
- Dynamic/personalized content
- Multi-page crawling
- Third-party widgets (maps, embeds)

## Prerequisites

Browser automation tools required:

- `browser_navigate`
- `browser_snapshot`
- `browser_take_screenshot`
- `browser_evaluate`
- `browser_wait_for`

## Workflow

### Pass 1 — Extract

1. Navigate to target URL
2. Capture accessibility snapshot
3. Take full-page screenshot
4. Extract DOM + computed styles
5. Catalog interactive elements

### Pass 2 — Build Plan

1. Identify page regions
2. Map components and styles
3. Extract design tokens
4. Define file structure

### Pass 3 — Generate Clone

1. Scaffold directory structure
2. Implement design tokens
3. Build layout shell
4. Implement components
5. Wire up interactions

### Pass 4 — Verify

1. Serve clone locally
2. Visual comparison (screenshot diff)
3. Structural verification (landmarks)
4. Functional spot-check

### Pass 5 — Iterate

Fix issues, re-verify, loop until pass or max 5 iterations.

## Verification

Visual pass threshold: **score >= 85**

## Legal Notice

Only clone sites you own or have explicit permission to replicate.
