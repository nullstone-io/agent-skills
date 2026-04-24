<!-- source: https://docs.nullstone.io/gitops/iac/blocks.html -->
<!-- fetched: 2026-04-24 -->

# `blocks` Top-Level Element

## Attributes

### `module`

The `module` attribute references a Nullstone module registered in the [Nullstone registry](https://app.nullstone.io/registry).

- In `.nullstone/config.yml`, `module` is required for every defined application.
- In overrides files, `module` is optional and can override the selected module.

The `vars` and `connections` schema is loaded from the chosen `module`. Validation occurs using this schema in both the `vars` and `connections` sections.

### `module_version`

The `module_version` attribute enables selection of a specific published module version from the registry. When unspecified, it defaults to `"latest"`. Nullstone retrieves the latest published version based on [semver](https://semver.org).

Schema validation of `vars` and `connections` updates when the effective module version changes.

### `vars`

The `vars` section is used to provide configuration for this block. Available variables depend on the selected `module` and `module_version`. Check the "Inputs" tab for any module version in the registry to see available variables (example: [nullstone/aws-network@0.7.8](https://app.nullstone.io/registry/modules/nullstone/aws-network/inputs?version=0.7.8)).

Variables without default values must be specified in either `.nullstone/config.yml` or an overrides file.

### `connections`

The `connections` section is used to connect one block to another block. Blocks leverage connections to obtain critical infrastructure configuration data from dependent blocks.

Rather than manually providing cloud-provider-specific values, connections allow Nullstone to inject correct information. For example, a Kubernetes app needs cluster and namespace details — the `nullstone/aws-fargate-service` module's `cluster-namespace` connection references the appropriate cluster-namespace block by name.

Cross-stack connections use the format `<stack-name>.<block-name>`:

```yaml
apps:
  api:
    module: nullstone/aws-fargate-service
    connections:
      cluster-namespace: namespace0

cluster-namespaces:
  namespace0:
    # ...
```

```yaml
subdomains:
  api-subdomain:
    connections:
      domain: global.acme-domain
```
