<!-- source: https://docs.nullstone.io/gitops/iac/networks.html -->
<!-- fetched: 2026-05-25 -->

# `networks` top-level element

A network is a block that represents a virtual network and its associated subnets, routes, and base networking components.

A network has the same schema as a [`block`](https://docs.nullstone.io/gitops/iac/blocks.html).

## Examples

### AWS VPC

```yaml
networks:
  network0:
    module: nullstone/aws-network
    vars:
      cidr: "10.0.0.0/16"
      private_subnets:
        - "10.0.1.0/24"
        - "10.0.2.0/24"
        - "10.0.3.0/24"
      public_subnets:
        - "10.0.101.0/24"
        - "10.0.102.0/24"
        - "10.0.103.0/24"
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
