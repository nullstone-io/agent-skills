# Versioning and release process

This repo publishes a catalog of Claude Code skills for Nullstone. Customers install a specific release tag, so the version contract below determines when consumers must expect behavior change.

## SemVer applied to skills

Think of each skill as a public API whose "consumers" are Claude agents acting on customer repos.

| Change type                                                                                          | Example                                                                                               | Bump  |
|------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|-------|
| New skill added                                                                                      | `nullstone-deploy-app` introduced                                                                     | MINOR |
| Existing skill: new optional trigger, new reference doc, clarifying rewrite                          | docs refresh, new example file, non-behavior edits                                                    | PATCH |
| Existing skill: style-rule change, frontmatter description tightened, trigger narrowed               | switch capabilities from map to array form, change connection shorthand rule                          | MINOR |
| Existing skill: removed, renamed, or a rule inverted such that previously valid output becomes wrong | rename `nullstone-config-files` → `nullstone-iac-files`; change "omit module_version" to "always pin" | MAJOR |
| Bundled schema: new version (e.g. `config.0.2.json`) added alongside                                 | additive                                                                                              | MINOR |
| Bundled schema: existing version's file replaced with a backwards-incompatible revision              | customer YAML breaks validation                                                                       | MAJOR |

**Rule of thumb:** if a customer regenerates a YAML file with the same prompt and gets a meaningfully different output, that's at least MINOR. If it breaks their existing file, that's MAJOR.

## Release process

1. Land all changes on `master` via PR. Every PR updates `CHANGELOG.md` under `[Unreleased]`.
2. When ready to cut a release, in a single commit:
   - **Bump the version to `X.Y.Z` in all three places so they agree:**
     - `.claude-plugin/plugin.json` → `version`
     - `.claude-plugin/marketplace.json` → the `nullstone-skills` plugin entry's `version`
     - each changed skill's `SKILL.md` → `metadata.version`
   - Move entries from `[Unreleased]` into a new `[X.Y.Z] — YYYY-MM-DD` section.
   - Update the compare/release links at the bottom of `CHANGELOG.md`.
3. Run `yarn validate` in `.github/scripts/`. CI enforces that the three versions match, that the marketplace `source` is `"./"`, and that every skill is registered — a mismatch fails the build.
4. Tag and push: `git tag -a vX.Y.Z -m "Release vX.Y.Z"` then `git push origin master --follow-tags`.
5. GitHub Release notes are copied from the new CHANGELOG section.

### Why the version bump matters

Claude Code's `/plugin marketplace update` detects a release by comparing the plugin `version` it has cached against the one in `marketplace.json`/`plugin.json`. **If that version is unchanged, the update is silently skipped and users never receive the new or changed skill** — even though `master` already has it. Bumping the manifest versions (step 2) is what actually ships the update; the CHANGELOG entry and git tag alone are not enough. CI (`yarn validate`) gates this so a forgotten bump fails the build instead of shipping a dead update.

### Release checklist

- [ ] `plugin.json`, `marketplace.json`, and each changed `SKILL.md` `metadata.version` all set to `X.Y.Z`.
- [ ] New skill (if any) registered in `plugin.json` `skills`.
- [ ] `CHANGELOG.md` `[Unreleased]` rolled into `[X.Y.Z] — YYYY-MM-DD`; compare links updated.
- [ ] `yarn validate` passes locally.
- [ ] Tag `vX.Y.Z` created and pushed with `--follow-tags`.
- [ ] GitHub Release created from the CHANGELOG section.
- [ ] Smoke test: `/plugin marketplace update nullstone` + `/reload-plugins` in a clean Claude Code session picks up the change.

## Pre-1.0 caveat

While on `0.x.y`, MINOR bumps may carry breaking changes. The `CHANGELOG.md` is authoritative — read it before upgrading.
