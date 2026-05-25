<!-- source: https://docs.nullstone.io/gitops/iac/blocks.html -->
<!-- fetched: 2026-05-25 -->

# `blocks` top-level element

## Attributes

### `module`

The `module` attribute refers to a Nullstone module that is registered in the [Nullstone registry](https://app.nullstone.io/registry).

-   In `.nullstone/config.yml`, `module` is required for every defined application.
-   In overrides files, `module` is optional and alters the chosen module.

The `vars` and `connections` schema is loaded from the chosen `module`. Validation is performed using this schema in the `vars` and `connections` section.

### `module_version`

The `module_version` attribute allows selection of a specific published version to the module registry. If this value is not specified, `module_version` will default to `"latest"`. Nullstone will look up the latest published version of the module in the registry based on [semver](https://semver.org).

When the effective module version changes, the module schema is pulled from the registry to validate `vars` and `connections`.

### `vars`

The `vars` section is used to provide configuration for this block. The available variables are based on the selected `module`/`module_version`. To view a list of available variables for a module version, visit the "Inputs" tab for a module version in the registry. (Example: [nullstone/aws-network@0.7.8](https://app.nullstone.io/registry/modules/nullstone/aws-network/inputs?version=0.7.8))

If a variable does not have a default value defined in the registry, the variable must be specified. This value can be specified in either `.nullstone/config.yml` or and overrides file.

### `connections`

The `connections` section is used to connect one block to another block. A block uses connections to gain critical information for infrastructure configuration from a dependent block.

Normally, a human would need to provide this configuration through specific values that are specific to the cloud provider or platform. For example, a Kubernetes app needs to know which Kubernetes cluster and which namespace to provision infrastructure.

The Kubernetes app module has a `cluster-namespace` connection that allows Nullstone to inject the correct cluster information based on the environment (e.g. dev, prod, etc.).

A connection reference is a "pointer" to a Nullstone block by name. In the example below, the "cluster-namespace" connection is defined in the `nullstone/aws-fargate-service` module and refers to the "namespace0" cluster-namespace block.

```yaml
apps:
  api:
    module: nullstone/aws-fargate-service
    connections:
      cluster-namespace: namespace0 # namespace0 refers to the cluster-namespace block defined below 

cluster-namespaces:
  namespace0:
    # ...
```

A connection reference may refer to a Nullstone block in another stack. The format for this is `<stack-name>.<block-name>`.

```yaml
subdomains:
  api-subdomain:
    connections:
      domain: global.acme-domain # refers to a domain created in the "global" stack
```
