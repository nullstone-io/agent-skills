<!-- source: https://docs.nullstone.io/gitops/iac/overview.html -->
<!-- fetched: 2026-05-25 -->

# Infrastructure as Code

You can use the Nullstone UI to configure your applications and infrastructure, but there are times when you want to configure in code. Placing configuration in code allows you to automate configuration, track infrastructure changes in version control, and share configuration with your team.

## Pipeline and Workflow

Having configuration in code allows you to correlate infrastructure changes with code changes. As an example, let's say you are adding a new feature that requires the use of new infrastructure. In the same commit or PR, you can add both the configuration to the IaC (infrastructure as code) file and the code for the new feature. As the PR is opened, a preview environment is created and launched. Because the configuration is in the IaC file, the preview environment will be configured with the new infrastructure. You can test the new feature in the preview environment and ensure it works as expected.

## IaC Files

There are two types of Nullstone IaC files that are placed in `.nullstone/` directory of your repository.

-   `.nullstone/config.yml` - Used as a primary source of configuration
-   Overrides file - Used to override configuration per environment from `nullstone/config.yml` or from the Nullstone UI.

An overrides file is either named `previews.yml` (for all preview environments) or `<env-name>.yml` (for a specific environment override). Nullstone GitOps runs a synchronization per environment so the effective config will be a merge of `config.yml` and the env-specific overrides file. If you change a `previews.yml` in a pull request, it will only affect the preview environment(s) that are synced on that branch.

TIP

You can manage multiple stacks from a single repository using stack-specific subdirectories (e.g. `.nullstone/stacks/<stack-name>/config.yml`). See [Multi-Stack Configuration](https://docs.nullstone.io/gitops/iac/multi-stack.html) for details.

Using with AI agents

If you're editing `.nullstone/*.yml` with Claude or another AI agent, install the [`nullstone-config-files` skill](https://docs.nullstone.io/ai/skills/nullstone-config-files.html) alongside the [Nullstone MCP server](https://docs.nullstone.io/ai/mcp-server/overview.html). The skill teaches the agent the style rules and overlay semantics described here; the MCP lets it resolve modules and their categories on the fly.

The format of the IaC file is similar to a docker-compose file. An example is shown below.

```yaml
version: "0.1"

apps:
  acme-api:
    vars:
      num_tasks: 1
      cpu: 256
      memory: 512
    environment:
      DATABASE_URL: "{{ POSTGRES_URL }}"
      ANOTHER_VAR: abc123
```

## Auto-complete/validation in editor

Nullstone supports auto-completion and validation in your editor.

We publish a JSON schema (it applies to YAML as well) to [schemastore.org](https://www.schemastore.org/json/).

The following editors are supported:

-   Android Studio
-   CLion
-   Emacs via [eglot](https://github.com/joaotavora/eglot)
-   IntelliJ IDEA
-   JSONBuddy
-   Neovim via [SchemaStore.nvim](https://github.com/b0o/SchemaStore.nvim)
-   PhpStorm
-   PyCharm
-   ReSharper
-   Rider
-   RubyMine
-   SublimeText via [LSP-json](https://packagecontrol.io/packages/LSP-json),[LSP-yaml](https://packagecontrol.io/packages/LSP-yaml)
-   Visual Studio
-   Visual Studio Code ([YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml),[TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml),[JSON](https://marketplace.visualstudio.com/items?itemName=remcohaszing.schemastore))
-   Visual Studio for Mac
-   WebStorm

If you want to download the JSON schema file directly, you can find it on our open-source repository [nullstone-io/iac](https://github.com/nullstone-io/iac/tree/master/.schema).
