<!-- source: https://docs.nullstone.io/gitops/iac/app-capabilities.html -->
<!-- fetched: 2026-05-25 -->

# `app.capabilities` element

The `capabilities` section acts as "glue" infrastructure for applications. This gives the application access to datastores, third parties, and much more. See [Capabilities](https://docs.nullstone.io/getting-started/applications/capabilities.html) for more information about capabilities.

## Examples

### Postgres Access

```yaml
apps:
  api:
    capabilities:
      - name: postgres
        module: nullstone/aws-postgres-access
        connections:
          postgres: postgres
```

### Rails SECRET\_KEY\_BASE

```yaml
apps:
  api:
    capabilities:
      - name: rails-cookies
        module: nullstone/rails-cookies
```

## Attributes

### `module`

See [`blocks#module`](https://docs.nullstone.io/gitops/iac/blocks.html#module).

### `module_version`

See [`blocks#module_version`](https://docs.nullstone.io/gitops/iac/blocks.html#module_version).

### `namespace`

The `namespace` attribute provides a method of distinguishing capabilities that conflict on a single application. The given namespace value will be used as a prefix for all environment variables created by the capability.

For example, you want your application to have "Postgres Access" to two different databases. Normally, if you added two capabilities for postgres access, the `POSTGRES_...` environment variables would collide and Nullstone would ignore one set.

To resolve this, add a `namespace` attribute to at least one of the capabilities. In the following example, `db2` will have a prefix on all its environment variables. (e.g. `DB2_POSTGRES_URL`)

```yaml
apps:
  api:
    capabilities:
      db1:
        module: nullstone/aws-postgres-access
        connections:
          postgres: db1
      db2:
        module: nullstone/aws-postgres-access
        namespace: db2
        connections:
          postgres: db2
```

### `vars`

See [`blocks#vars`](https://docs.nullstone.io/gitops/iac/blocks.html#vars).

### `connections`

The `connections` section is used to connect the capability to another block. A capability uses connections to gain critical information for infrastructure configuration from a dependent block.

Let's take an example where a developer attaches a "Postgres Access" capability to the application. The "Postgres Access" module relies on a connection `postgres` to know where to configure the database cluster for this application. Normally, a human would have to manually configure this information for each environment. Instead, this connection provides a way for Nullstone to dynamically inject the correct information.

A connection reference is a "pointer" to a Nullstone block by name. In the example below, the "postgres" connection is defined in the `nullstone/aws-postgres-access` module and refers to the "db" datastore block.

```yaml
apps:
  api:
    capabilities:
      - name: postgres
        module: nullstone/aws-postgres-access
        connections:
          postgres: db 

datastores:
  db:
    # ...
```
