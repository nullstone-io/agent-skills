# Changelog

All notable changes to this repo are documented here. Versioning follows [SemVer](https://semver.org/spec/v2.0.0.html) — see [VERSIONING.md](VERSIONING.md).

## 0.2.0 (2026-05-29)

- Package the catalog as a Claude Code plugin (`nullstone-skills`) with a marketplace at `.claude-plugin/marketplace.json`. Users can now install all skills with `/plugin marketplace add nullstone-io/agent-skills` followed by `/plugin install nullstone-skills@nullstone`. Skills are explicitly enumerated in `plugin.json` so `skills/_template/` does not load as a live skill.
- Add `AGENTS.md` documenting the rule that new skills must be registered in `.claude-plugin/plugin.json`.
- Conform skills to the [Agent Skills open standard](https://agentskills.io/specification): add `license` and `metadata.version` frontmatter, and tighten CI validation to the spec's `name` (1–64 chars, lowercase/hyphen, matches directory) and `description` (≤1024 chars) rules. The same `SKILL.md` now installs unmodified across the ~30 tools that support the standard (Claude Code, OpenAI Codex, Cursor, Gemini CLI, …).
- Document cross-tool install via [skills.sh](https://www.skills.sh/) (`npx skills add nullstone-io/agent-skills`) alongside the Claude Code plugin and manual copy.

## 0.1.0 (2026-04-24)

- Initial catalog scaffold: `skills/_template/`, `README.md`, contribution guide.
- Skill: `nullstone-config-files` — teaches Claude to produce schema-valid Nullstone IaC YAML with a consistent style. Bundles the 0.1 schema, a snapshot of docs.nullstone.io/gitops/iac, three canonical examples, and a `scripts/refresh-docs.md` prompt.
