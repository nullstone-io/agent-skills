---
name: skill-name
description: One-line description of when Claude should invoke this skill. Lead with the trigger ("Use when the user wants to…") so the matcher picks it up reliably.
license: MIT
metadata:
  version: "0.1.0"
---

# Skill name

Short paragraph describing what this skill does and when it applies.

## When to use

- Bullet list of concrete user requests or situations that should trigger this skill.
- Keep each bullet specific — vague triggers cause false matches.

## When NOT to use

- Cases that look similar but belong to a different skill or to default behavior.

## Steps

1. First step — what Claude should do.
2. Second step — include exact commands, flags, or file paths where relevant.
3. Final step — how to report results back to the user.

## Examples

### Example 1 — <short description>

User: "<user request>"

Claude:
- <action>
- <action>

## References

- Link to any `references/` files or external docs loaded on demand.
