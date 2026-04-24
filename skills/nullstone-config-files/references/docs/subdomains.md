<!-- source: https://docs.nullstone.io/gitops/iac/subdomains.html -->
<!-- fetched: 2026-04-24 -->

# `subdomains` top-level element

A subdomain is a block that represents a DNS subdomain and associated resources.

A subdomain has the same schema as a [`block`](https://docs.nullstone.io/gitops/iac/blocks.html).

## Examples

### AWS Subdomain

```yaml
subdomains:
  api-subdomain:
    module: nullstone/aws-subdomain
    vars:
      create_vanity: false
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
