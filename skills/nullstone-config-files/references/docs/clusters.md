<!-- source: https://docs.nullstone.io/gitops/iac/clusters.html -->
<!-- fetched: 2026-05-25 -->

# `clusters` top-level element

A cluster is a block that represents a set of compute resources used to host a collection of VMS and/or containers.

A cluster has the same schema as a [`block`](https://docs.nullstone.io/gitops/iac/blocks.html).

## Examples

### Fargate Cluster

```yaml
clusters:
  fargate0:
    module: nullstone/aws-fargate
    connections:
      network: network0
```

## Attributes

### `module`

See [`blocks#module`](https://docs.nullstone.io/gitops/iac/blocks.html#module).

### `module_version`

See [`blocks#module_version`](https://docs.nullstone.io/gitops/iac/blocks.html#module_version).

### `vars`

See [`blocks#vars`](https://docs.nullstone.io/gitops/iac/blocks.html#vars).

### `connections`

See [`blocks#connections`](https://docs.nullstone.io/gitops/iac/blocks.html#connections).
