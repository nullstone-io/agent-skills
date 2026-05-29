# AGENTS.md

Instructions for AI agents working in this repo.

## What this repo is

A catalog of Claude Code skills for Nullstone, distributed as a Claude Code plugin (`nullstone-skills`) via the marketplace defined in [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json).

Each skill lives at `skills/<skill-name>/SKILL.md` (with optional `scripts/` and `references/` subdirectories). `skills/_template/` is a contributor scaffold, not a real skill.

## Adding a new skill

When you create a new skill, you MUST also register it. The plugin manifest enumerates skill directories explicitly — skills that aren't listed do not ship.

1. Copy `skills/_template/` to `skills/<your-skill-name>/`.
2. Fill in the SKILL.md frontmatter (`name`, `description`, and `metadata.version` set to the current catalog version — see `_template/`) and body.
3. **Register the skill in [.claude-plugin/plugin.json](.claude-plugin/plugin.json)** by adding `"./skills/<your-skill-name>"` to the `skills` array.
4. Add a CHANGELOG.md entry under `[Unreleased]` describing the new skill (see [VERSIONING.md](VERSIONING.md) for the SemVer rules — a new skill is a MINOR bump).

A new skill is not "done" until it's registered in `plugin.json`. A PR that adds `skills/<name>/` without updating the manifest should not merge.

## Editing an existing skill

- Behavior-changing edits (rule changes, trigger narrowing, removed references) require a CHANGELOG.md entry. See [VERSIONING.md](VERSIONING.md) for what counts as MINOR vs MAJOR.
- Pure docs/example refreshes are PATCH and still need a CHANGELOG entry.

## Things to avoid

- Do not register `skills/_template/` in `plugin.json` — its frontmatter is a placeholder and would match unrelated requests.
- Do not put runtime CLI workflows (e.g. `nullstone up`, `nullstone launch`) into the `nullstone-config-files` skill — that skill is scoped to authoring `.nullstone/` YAML.
