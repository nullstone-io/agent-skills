<!-- source: https://docs.nullstone.io/gitops/iac/apps.html -->
<!-- fetched: 2026-05-25 -->

# `apps` top-level element

An app is a logical representation of a service or application. There are four types of application patterns: container, serverless, static site, or VM-based. The pattern for an application is defined by the selected Nullstone module as configured in the `module` parameter.

An app has the same schema as a [`block`](https://docs.nullstone.io/gitops/iac/blocks.html) with additional attributes for environment variables and capabilities.

## Examples

### Fargate Container

```yaml
apps:
  api:
    module: nullstone/aws-fargate-service
    vars:
      num_tasks: 1
      cpu: 256
      memory: 512
    environment:
      LOG_LEVEL: info
      BASE_URL: "{{ NULLSTONE_ENV }}.acme.com"
    capabilities:
      - name: postgres
        module: nullstone/aws-postgres-access
        connections:
          postgres: postgres
    connections:
      cluster-namespace: namespace0
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

### `environment`

The `environment` refers to "Custom" environment variables that are injected into an application.

Nullstone injects environment variables into applications by merging environment variables from three sources:

-   [Standard](https://docs.nullstone.io/getting-started/applications/env-variables.html#injected-by-nullstone)
-   [From Capabilities](https://docs.nullstone.io/getting-started/applications/env-variables.html#from-capabilities)
-   [Custom](https://docs.nullstone.io/getting-started/applications/env-variables.html#custom-environment-variables)

When specified in `.nullstone/config.yml`, `environment` overrides any "Custom" env variables configured in the Nullstone UI. When specified in an overrides file, `environment` _appends_ entries to the existing set of environment variables defined in the Nullstone UI or in `.nullstone/config.yml`.

Nullstone supports [Env Var Interpolation](https://docs.nullstone.io/getting-started/applications/env-variables.html#interpolation) in environment variable values. You can interpolate values from any of the three env var sources (Standard, Capabilities, Custom). You may also interpolate multiple environment variables in one value. Example:

```yaml
apps:
  api:
    environment:
      BASE_DOMAIN: "{{ NULLSTONE_ENV }}.acme.com" # "dev.acme.com"
      DASHBOARD_URL: "https://dashboard.{{ BASE_DOMAIN }}" # https://dashboard.dev.acme.com
```

Nullstone also supports [Secret References](https://docs.nullstone.io/getting-started/applications/env-variables.html#reference-existing-secrets) using `secret(...)`. This allows you to manually add a secret to a vault (e.g. AWS Secrets Manager) and inject into your application.

Example:

```yaml
apps:
  api:
    environment:
      STRIPE_API_KEY: "{{ secret(arn:aws:secretsmanager:us-east-1:0123456789012:secret:stripe_api_key) }}"
```

For Kubernetes workloads, Nullstone also supports [`k8s.*` template functions](https://docs.nullstone.io/getting-started/applications/env-variables.html#kubernetes-valuefrom-references) to source values from the downward API, ConfigMaps, resource fields, and files.

Example:

```yaml
apps:
  api:
    environment:
      POD_IP: "{{ k8s.field(v1, status.podIP) }}"
      MY_CONFIG: "{{ k8s.configMap(my-key, my-configmap) }}"
      CPU_LIMIT: "{{ k8s.resourceField(limits.cpu) }}"
```

### `capabilities`

The `capabilities` section acts as "glue" infrastructure for applications. This gives the application access to datastores, third parties, and much more. See [Capabilities](https://docs.nullstone.io/getting-started/applications/capabilities.html) for more information about capabilities.

See [app capabilities](https://docs.nullstone.io/gitops/iac/app-capabilities.html).
