---
name: visual-verdict
description: Structured visual QA verdict for screenshot comparisons
---

# Skill: visual-verdict

Compare generated UI screenshots against reference and return structured verdict.

## Use When

- Task includes visual fidelity requirements
- Need deterministic pass/fail guidance before editing
- Have generated screenshot and reference image(s)

## Inputs

- `reference_images[]` — one or more reference image paths
- `generated_screenshot` — current output image
- `category_hint` — optional category (e.g., `hackernews`, `dashboard`)

## Output Contract

Return **JSON only**:

```json
{
  "score": 0,
  "verdict": "revise",
  "category_match": false,
  "differences": ["..."],
  "suggestions": ["..."],
  "reasoning": "short explanation"
}
```

## Rules

- `score`: integer 0-100
- `verdict`: `pass`, `revise`, or `fail`
- `differences[]`: concrete visual mismatches
- `suggestions[]`: actionable next edits

## Thresholds

- Target pass threshold: **90+**
- If `score < 90`, continue editing and rerun visual-verdict
