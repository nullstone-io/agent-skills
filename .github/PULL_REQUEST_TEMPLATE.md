## Summary

<!-- What does this PR change, and why? 1-2 sentences. -->

## Type of change

- [ ] New skill
- [ ] Enhancement to an existing skill (style rule, new reference, description tightening)
- [ ] Bug fix
- [ ] Docs refresh (bundled `references/docs/*.md`)
- [ ] Schema bump (new `config.<version>.json` added or existing one updated)
- [ ] CI / tooling only

## Checklist

- [ ] Updated `CHANGELOG.md` under `[Unreleased]` with a user-facing line.
- [ ] New skill: registered in `.claude-plugin/plugin.json` `skills` (unregistered skills don't ship).
- [ ] If behavior changed: version bump follows [VERSIONING.md](../VERSIONING.md) (MINOR for style rules, MAJOR for breaking changes).
- [ ] Version is in sync across `plugin.json`, the `marketplace.json` plugin entry, and each changed skill's `SKILL.md` `metadata.version` (mismatches mean users' `/plugin marketplace update` won't fetch the change).
- [ ] `references/examples/*.yml` validate against the bundled schema.
- [ ] SKILL.md frontmatter follows the [Agent Skills spec](https://agentskills.io/specification) (name matches directory; description ≤ 1024 chars).
- [ ] CI passes (`yarn validate`).

## Test plan

<!-- How did you verify the change? For skill content: what prompts / file edits did Claude handle correctly after the change? -->
