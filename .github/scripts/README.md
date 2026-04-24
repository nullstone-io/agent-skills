# CI tooling

Node scripts run by the workflows in `.github/workflows/`. They are also
runnable locally against your checkout.

## Setup

```bash
cd .github/scripts
yarn install
```

## Scripts

| Script | Purpose |
|---|---|
| `yarn validate` | Validate SKILL.md frontmatter for every skill, plus every example YAML under `nullstone-config-files/references/examples/` against the bundled schema. |
| `yarn check-drift` | Fetch `nullstone-io/iac` upstream schemas and fail if they differ from the bundled copy. |
| `yarn refresh-docs` | Re-fetch `docs.nullstone.io/gitops/iac/*` and overwrite bundled markdown. |

Override the upstream branch for drift checks:

```bash
UPSTREAM_BRANCH=main yarn check-drift
```
