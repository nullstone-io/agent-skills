<!-- source: https://docs.nullstone.io/gitops/iac/apps.html -->
<!-- fetched: 2026-11-24 -->

# `apps` top-level element

An app is a logical representation of a service or application. There are four types of application patterns: container, serverless, static site, or VM-based. The pattern for an application is defined by the selected Nullstone module as configured in the `module` parameter.

An app has the same schema as a [`block`](https://docs.nullstone.io/gitops/iac/blocks.html) with additional attributes for environment variables, capabilities, and build configuration.

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

### Build configuration with a preview override

**`.nullstone/config.yml`**

```yaml
apps:
  api:
    module: nullstone/aws-fargate-service
    build:
      builder: nullstone
      nullstone:
        dockerfile: ./docker/Dockerfile
        docker_context: .
```

**`.nullstone/previews.yml`**

```yaml
apps:
  api:
    build:
      nullstone:
        dockerfile: ./docker/preview.Dockerfile
```

## Attributes

### `module`

See [`blocks#module`](https://docs.nullstone.io/gitops/iac/blocks.html#module).

### `module_version`

See [`blocks#module_version`](https://docs.nullstone.io/gitops/iac/blocks.html#module-version).

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

### `build`

The `build` section sets the [build configuration](https://docs.nullstone.io/getting-started/deployment/automatic-build.html#build-configuration) of the application: which builder builds it, and that builder's settings. Every key is optional.

```yaml
apps:
  api:
    build:
      builder: nullstone
      nullstone:
        dockerfile: Dockerfile
        docker_context: .
```

<table tabindex="0"><thead><tr><th>Key</th><th>Description</th></tr></thead><tbody><tr><td><code>builder</code></td><td>Which builder builds the application: <code>manual</code>, <code>nullstone</code>, or <code>github-actions</code>.</td></tr><tr><td><code>nullstone</code></td><td>Settings of the Nullstone builder.</td></tr><tr><td><code>github-actions</code></td><td>Settings of the GitHub Actions builder.</td></tr></tbody></table>

Each builder's settings go under the key named after the builder.

**`nullstone`**

<table tabindex="0"><thead><tr><th>Key</th><th>Used by</th><th>Default</th></tr></thead><tbody><tr><td><code>dockerfile</code></td><td>Container applications</td><td><code>Dockerfile</code></td></tr><tr><td><code>docker_context</code></td><td>Container applications</td><td><code>.</code></td></tr><tr><td><code>build_dir</code></td><td>Static sites</td><td><code>./</code></td></tr><tr><td><code>install_deps_cmd</code></td><td>Static sites</td><td><code>npm ci</code></td></tr><tr><td><code>build_cmd</code></td><td>Static sites</td><td><code>npm run build</code></td></tr><tr><td><code>publish_dir</code></td><td>Static sites</td><td><code>./dist</code></td></tr></tbody></table>

**`github-actions`**

<table tabindex="0"><thead><tr><th>Key</th><th>Description</th><th>Default</th></tr></thead><tbody><tr><td><code>workflow_filename</code></td><td>The workflow that builds the application.</td><td><code>.github/workflows/build.yml</code></td></tr><tr><td><code>initiate_workflow</code></td><td>Nullstone starts the workflow with a <code>workflow_dispatch</code>. When <code>false</code>, Nullstone waits for a run that the repository started.</td><td><code>true</code></td></tr><tr><td><code>workflow_inputs</code></td><td>Extra inputs passed to the workflow when Nullstone starts it, as a map of name to value.</td><td>none</td></tr><tr><td><code>perform_push</code></td><td>Reserved. Leave it unset: the workflow pushes the artifact itself.</td><td><code>false</code></td></tr></tbody></table>

The kind of artifact the application deploys (a container image, static site assets, or a zip file) is not a setting. It comes from the application's `module`.

#### How files combine

When specified in `.nullstone/config.yml`, `build` declares the whole build configuration. A key that is left out takes the default of the application's module, not the value that was set before.

When specified in an overrides file, `build` changes only the keys it names. The other keys keep the value from `.nullstone/config.yml`. `workflow_inputs` are combined by input name.

If only an overrides file declares `build`, its keys are laid over the application's default build configuration (Application > Template).

#### What a sync does

A sync writes the build configuration of the application in each environment it syncs. The change applies to the next build and does not need an infrastructure update.

While a file declares `build` for an application, every sync writes those values again. The Nullstone UI shows them, but an edit made in the UI lasts only until the next sync, so make the change in the file.

If you remove `build` from every file, the settings stay as they are. From then on the build configuration is edited in the Nullstone UI.

An application with no `build` in any file is left alone.

#### Validation

A sync fails when a `build` setting would never be used:

-   Settings of a builder other than the one in effect. For example, a `nullstone` section when `builder` is `github-actions` or `manual`.
-   A `nullstone` setting that the application's module does not read. For example, `dockerfile` on a static site.
-   The `nullstone` builder on an application that deploys a zip file. The Nullstone builder does not build zip packages.

The `nullstone` and `github-actions` builders need the application to have a repository.

Run [`nullstone iac test`](https://docs.nullstone.io/getting-started/cli/docs.html#iac-test) to see these errors, and the build configuration changes a sync would make, before you push.
