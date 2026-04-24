<!-- source: https://docs.nullstone.io/gitops/iac/cluster-namespaces.html -->
<!-- fetched: 2026-04-24 -->

# `cluster_namespaces` top-level element

A cluster namespace is a block that represents an isolated separation of compute resources within a [cluster](https://docs.nullstone.io/gitops/iac/cluster-namespaces.html).

A cluster namespace has the same schema as a [`block`](https://docs.nullstone.io/gitops/iac/blocks.html).

## Examples

### Fargate Cluster Namespace

```yaml
cluster_namespaces:
  namespace0:
    module: nullstone/aws-fargate-namespace
    connections:
      cluster: fargate0
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
