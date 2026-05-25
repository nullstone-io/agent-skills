<!-- source: https://docs.nullstone.io/gitops/iac/multi-stack.html -->
<!-- fetched: 2026-05-25 -->

# Multi-Stack Configuration

By default, Nullstone uses a single `.nullstone/` directory to manage configuration for a single stack. However, you can configure multiple stacks from a single repository by organizing configuration files into stack-specific subdirectories.

This is especially useful for teams using a monorepo to manage all infrastructure, where each stack may have different architectures and configurations.

## Directory Structure

To configure multiple stacks, create a `stacks/` directory inside `.nullstone/` with a subdirectory for each stack.

```
.nullstone/
  stacks/
    stack1/
      config.yml
      previews.yml
      staging.yml
    stack2/
      config.yml
      production.yml
```

Each stack directory uses the same file conventions as the default `.nullstone/` directory:

-   `config.yml` - Primary source of configuration for the stack
-   `previews.yml` - Overrides for all preview environments
-   `<env-name>.yml` - Overrides for a specific environment

The directory name (e.g. `stack1`, `stack2`) must match the name of the stack in Nullstone.

## Example

Suppose you have two stacks: `web-app` running on Kubernetes and `api` running on Fargate.

```
.nullstone/
  stacks/
    web-app/
      config.yml
      previews.yml
    api/
      config.yml
      staging.yml
      production.yml
```

Each stack has its own `config.yml` with independent configuration:

**`.nullstone/stacks/web-app/config.yml`**

```yaml
version: "0.1"

apps:
  web-app:
    module: nullstone/aws-eks-app
    vars:
      replicas: 2
      cpu: "500m"
      memory: "512Mi"
    environment:
      API_URL: "https://api.example.com"
```

**`.nullstone/stacks/api/config.yml`**

```yaml
version: "0.1"

apps:
  api:
    module: nullstone/aws-fargate-service
    vars:
      num_tasks: 2
      cpu: 512
      memory: 1024
    environment:
      DATABASE_URL: "{{ POSTGRES_URL }}"
```

## Single-stack vs Multi-stack

You do not need to use multi-stack configuration if you only manage one stack. The default `.nullstone/config.yml` continues to work as before.

<table tabindex="0"><thead><tr><th>Layout</th><th>Configuration Path</th></tr></thead><tbody><tr><td>Single stack (default)</td><td><code>.nullstone/config.yml</code></td></tr><tr><td>Multi-stack</td><td><code>.nullstone/stacks/&lt;stack-name&gt;/config.yml</code></td></tr></tbody></table>

TIP

Multi-stack configuration can be used alongside the default single-stack layout. If a stack does not have a matching directory under `.nullstone/stacks/`, Nullstone falls back to the root `.nullstone/` configuration.
