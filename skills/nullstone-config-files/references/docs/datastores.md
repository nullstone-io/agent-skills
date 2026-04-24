<!-- source: https://docs.nullstone.io/gitops/iac/datastores.html -->
<!-- fetched: 2026-04-24 -->

# `datastores` top-level element

A datastore is a block that represents a service that holds data. This is a broad category and includes many types of datastores including:

* relational databases (e.g. postgres, mysql)
* nosql databases (e.g. mongodb, dynamodb)
* cache and key/value stores (e.g. redis, consul)
* message queues (e.g. kafka, sqs)
* object stores (e.g. s3, file volumes)
* secret managers (e.g. vault)
* log/metric providers (e.g. datadog, splunk, sumologic)

A datastore has the same schema as a [block](https://docs.nullstone.io/gitops/iac/blocks.html).

## Examples

### RDS Postgres

```yaml
datastores:
  db:
    module: nullstone/aws-rds-postgres
    connections:
      network: network0
    vars:
      postgres_version: "16"
      high_availability: false
      enforce_ssl: false
      enable_public_access: false
      instance_class: "db.t3.medium"
      backup_retention_period: 1
      allocated_storage: 50
```

### S3 Bucket

```yaml
datastores:
  objects:
    module: nullstone/aws-s3-bucket
    vars:
      server_side_encryption: true
      versioning: true
      public_read_only: false
```

## Attributes

### `module`

See [blocks#module](https://docs.nullstone.io/gitops/iac/blocks.html#module).

### `module_version`

See [blocks#module_version](https://docs.nullstone.io/gitops/iac/blocks.html#module_version).

### `vars`

See [blocks#vars](https://docs.nullstone.io/gitops/iac/blocks.html#vars).

### `connections`

See [blocks#connections](https://docs.nullstone.io/gitops/iac/blocks.html#connections).
