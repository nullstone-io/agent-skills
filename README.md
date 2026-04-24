# agent-skills

A catalog of [Claude Code skills](https://docs.claude.com/en/docs/claude-code/skills) for using and enhancing [Nullstone](https://nullstone.io).

Each skill is a self-contained package of instructions (and optional scripts or references) that teaches Claude how to perform a specific Nullstone workflow — provisioning infrastructure, authoring modules, deploying apps, managing environments, and so on.

## Repository layout

```
agent-skills/
├── README.md
└── skills/
    ├── _template/           # Starting point for new skills
    │   └── SKILL.md
    └── <skill-name>/
        ├── SKILL.md         # Required: frontmatter + instructions
        ├── scripts/         # Optional: helper scripts
        └── references/      # Optional: reference material loaded on demand
```

Every skill lives in its own directory under `skills/` and must contain a `SKILL.md` with YAML frontmatter:

```markdown
---
name: skill-name
description: One-line description of when Claude should invoke this skill.
---

# Skill body — instructions, examples, steps.
```

The `description` is what Claude reads to decide whether the skill applies to a given request. Be specific about the triggering situation.

## Using a skill

Install a skill by copying its directory into one of:

- `~/.claude/skills/<skill-name>/` — available in every session on your machine
- `.claude/skills/<skill-name>/` — scoped to a single project

Claude Code discovers skills at session start and invokes them via the `Skill` tool when their description matches a user request.

## Contributing a skill

1. Copy `skills/_template/` to `skills/<your-skill-name>/`.
2. Fill in the frontmatter (`name`, `description`) and the body.
3. Keep the skill focused on one workflow. Split broad capabilities into multiple skills.
4. Put large reference material under `references/` and load it on demand from `SKILL.md`, so the main body stays short.
5. Open a PR.
