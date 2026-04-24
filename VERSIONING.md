# Versioning and release process

This repo publishes a catalog of Claude Code skills for Nullstone. Customers install a specific release tag, so the version contract below determines when consumers must expect behavior change.

## SemVer applied to skills

Think of each skill as a public API whose "consumers" are Claude agents acting on customer repos.

| Change type | Example | Bump |
|---|---|---|
| New skill added | `nullstone-deploy-app` introduced | MINOR |
| Existing skill: new optional trigger, new reference doc, clarifying rewrite | docs refresh, new example file, non-behavior edits | PATCH |
| Existing skill: style-rule change, frontmatter description tightened, trigger narrowed | switch capabilities from map to array form, change connection shorthand rule | MINOR |
| Existing skill: removed, renamed, or a rule inverted such that previously valid output becomes wrong | rename `nullstone-config-files` → `nullstone-iac-files`; change "omit module_version" to "always pin" | MAJOR |
| Bundled schema: new version (e.g. `config.0.2.json`) added alongside | additive | MINOR |
| Bundled schema: existing version's file replaced with a backwards-incompatible revision | customer YAML breaks validation | MAJOR |

**Rule of thumb:** if a customer regenerates a YAML file with the same prompt and gets a meaningfully different output, that's at least MINOR. If it breaks their existing file, that's MAJOR.

## Release process

1. Land all changes on `master` via PR. Every PR updates `CHANGELOG.md` under `[Unreleased]`.
2. When ready to cut a release, in a single commit:
   - Move entries from `[Unreleased]` into a new `[X.Y.Z] — YYYY-MM-DD` section.
   - Update the compare/release links at the bottom of `CHANGELOG.md`.
3. Tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"` and push.
4. GitHub Release notes are copied from the new CHANGELOG section.

## Pre-1.0 caveat

While on `0.x.y`, MINOR bumps may carry breaking changes. The `CHANGELOG.md` is authoritative — read it before upgrading.
