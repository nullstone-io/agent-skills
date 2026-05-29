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

## Installing

These skills follow the [Agent Skills open standard](https://agentskills.io/specification), so the same `SKILL.md` works unmodified in every tool that supports it (Claude Code, OpenAI Codex, Cursor, Gemini CLI, and ~30 others). Pick whichever channel fits your agent.

### Claude Code (recommended)

This repo is published as a Claude Code plugin via its own marketplace, which gives you versioned install and upgrade across the whole catalog:

```
/plugin marketplace add nullstone-io/agent-skills
/plugin install nullstone-skills@nullstone
```

Skills are then namespaced as `nullstone-skills:<skill-name>` and invoked automatically by Claude Code when their description matches a user request. To upgrade after a new release, run `/plugin marketplace update nullstone` then `/reload-plugins` (or enable auto-update for the marketplace).

### Any other tool (cross-tool installer)

[skills.sh](https://www.skills.sh/) installs Agent Skills into Claude Code, Codex, Cursor, and other compatible agents from one command:

```
npx skills add nullstone-io/agent-skills
```

### Manual

To pull in a single skill without any installer, copy its directory into the location your tool reads skills from — for Claude Code that is:

- `~/.claude/skills/<skill-name>/` — available in every session on your machine
- `.claude/skills/<skill-name>/` — scoped to a single project

## Contributing a skill

1. Copy `skills/_template/` to `skills/<your-skill-name>/`.
2. Fill in the frontmatter (`name`, `description`) and the body.
3. Register the new skill directory in `.claude-plugin/plugin.json` under `skills` so it ships with the plugin. (`_template/` is intentionally not registered.)
4. Keep the skill focused on one workflow. Split broad capabilities into multiple skills.
5. Put large reference material under `references/` and load it on demand from `SKILL.md`, so the main body stays short.
6. Open a PR.
