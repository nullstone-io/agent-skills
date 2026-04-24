---
name: nullstone-config-files
description: Use when creating or editing Nullstone IaC YAML files under `.nullstone/` — adding or wiring apps, datastores, networks, domains, subdomains, ingresses, clusters, cluster-namespaces; setting `vars`, `environment`, `connections`, or `capabilities`; configuring `events`. Triggers on file paths `.nullstone/config.yml`, `.nullstone/<env>.yml`, `.nullstone/previews.yml`, and anything under `.nullstone/stacks/<stack>/`.
---

# nullstone-config-files

Produces schema-valid Nullstone IaC YAML with a consistent style, using the Nullstone MCP to resolve modules before emitting blocks.

## When to use

- Any edit to a file under `.nullstone/` (single-stack or multi-stack).
- Creating a new `.nullstone/` directory from scratch.
- The user asks to "add <thing> to Nullstone", "wire up a database", "set an env var for the app", "add a capability", "override for preview/staging", "add a Slack notification on deploy".
- The user mentions a Nullstone block type (app, datastore, cluster, cluster namespace, network, domain, subdomain, ingress) in the context of config files.

## When NOT to use

- Authoring a Terraform module itself (module source code, not consumption).
- Nullstone CLI invocations (`nullstone up`, `nullstone launch`) — those are runtime, not config.
- UI-only configuration that is explicitly not being moved into `.nullstone/`.

## File layout and precedence

Two layouts. **Stack-scoped wins exclusively** — if any stack-scoped file exists for a stack, global files are ignored for that stack.

**Global** (applies to any stack hooked up via GitOps):
- `.nullstone/config.yml` — base
- `.nullstone/<env>.yml` — overlay for a specific env
- `.nullstone/previews.yml` — overlay for all preview envs

**Stack-scoped** (directory name must match the stack name):
- `.nullstone/stacks/<stack>/config.yml` — base
- `.nullstone/stacks/<stack>/<env>.yml` — overlay
- `.nullstone/stacks/<stack>/previews.yml` — overlay for previews

Overlay semantics:
- `module` is optional in overlays — include it only when changing the module.
- `vars` / `connections` in overlays **replace** the matching fields from the base.
- `environment` in overlays **appends** to (does not replace) the base set.

## Authoring workflow

When adding a new block, follow these steps in order:

1. **Resolve the module.** Use the `nullstone` MCP:
   - `modules_find` to discover candidates when the user describes what they want ("postgres", "static site", "fargate cluster").
   - `modules_describe` on the chosen module to read its `category`, expected `vars`, `connections`, and `capabilities`.
2. **Place the block under the correct top-level key** based on the module category:

   | Module category     | Top-level key         |
   |---------------------|-----------------------|
   | `app`               | `apps`                |
   | `datastore`         | `datastores`          |
   | `network`           | `networks`            |
   | `domain`            | `domains`             |
   | `subdomain`         | `subdomains`          |
   | `ingress`           | `ingresses`           |
   | `cluster`           | `clusters`            |
   | `cluster-namespace` | `cluster_namespaces`  |
   | _other / generic_   | `blocks`              |

3. **Emit the block** using the style rules below.
4. **Sanity-check** against `references/schema/config.0.1.json` before finishing.

If `modules_find` / `modules_describe` are unavailable, ask the user to confirm the module source and category rather than guessing — placing a block under the wrong top-level key silently breaks Nullstone.

## Style rules (canonical output)

Apply these to every block you write. Deviate only on explicit user request.

### Field order inside a block

```
module
module_version
connections
vars
environment       # apps only
capabilities      # apps only
```

### Top-level key order in the document

```
events
domains
subdomains
ingresses
apps
datastores
cluster_namespaces
clusters
networks
blocks
```

Rationale: `events` is orthogonal and always sits at the top. The rest is a dependency order — consumers appear above providers so a reader sees the "what" before the "how". Within each top-level map, order member keys alphabetically unless a natural grouping is clearer.

### `module_version`

Omit unless the user explicitly asks to pin a version.

### Capabilities

Use the **map** form — the key is the capability's name:

```yaml
capabilities:
  postgres:
    module: nullstone/aws-postgres-access
    connections:
      postgres: db
```

For colliding capabilities on the same app (e.g. two postgres accesses), add a `namespace` to prefix the injected env vars — see [references/docs/app-capabilities.md](references/docs/app-capabilities.md). Only drop to the array form (`- name: ...`) on explicit user request.

### Connection targets

Default to **string, shortest form**. Omit `<stack>.` / `<env>.` segments that match the file's own scope.

| Situation                                   | Form                                  |
|---------------------------------------------|---------------------------------------|
| Same stack, same env                        | `block-name`                          |
| Same stack, different env                   | `env-name.block-name`                 |
| Different stack, same env                   | `stack-name.block-name`               |
| Different stack, different env              | `stack-name.env-name.block-name`      |
| Shared infra in `global` stack/`global` env | `global.global.block-name`            |

Only use the object form (`{ block_name, env_name, stack_name }`) if the user explicitly asks for it.

### YAML conventions

- `version: "0.1"` as a quoted string, always present at the top.
- 2-space indent. No trailing whitespace. Final newline.
- Quote strings that contain template interpolation: `"{{ NULLSTONE_ENV }}.acme.com"`.
- Version numbers that are "number-like" strings (e.g. `postgres_version: "16"`) stay quoted.

## Overlay rules

When writing an overlay (`<env>.yml` / `previews.yml`):

- Include **only fields that differ from the base**. Do not repeat values that match.
- Omit `module` unless changing it.
- `environment` entries are additive — use the overlay only for vars you want to add or change for that env.

## Schema and version selection

The authoritative schema is bundled at `references/schema/config.<version>.json`. Select by the YAML's `version:` key. Today only `0.1` exists. When a new version ships, drop `config.0.2.json` alongside and select based on the document's `version:` — the skill does not need to fork.

For editor / schemastore integration details, see [references/docs/overview.md](references/docs/overview.md).

## Examples (ground truth)

Read these to calibrate style before emitting output:

- [references/examples/global-config.yml](references/examples/global-config.yml) — full single-stack baseline
- [references/examples/global-previews.yml](references/examples/global-previews.yml) — overlay pattern (diffs only)
- [references/examples/stack-scoped-config.yml](references/examples/stack-scoped-config.yml) — multi-stack + cross-stack connection

## References (load on demand)

- Schema: [references/schema/config.0.1.json](references/schema/config.0.1.json)
- Overview & file conventions: [references/docs/overview.md](references/docs/overview.md), [references/docs/multi-stack.md](references/docs/multi-stack.md)
- Block shared schema: [references/docs/blocks.md](references/docs/blocks.md)
- Per-top-level docs: [apps](references/docs/apps.md), [app-capabilities](references/docs/app-capabilities.md), [datastores](references/docs/datastores.md), [networks](references/docs/networks.md), [clusters](references/docs/clusters.md), [cluster-namespaces](references/docs/cluster-namespaces.md), [subdomains](references/docs/subdomains.md), [ingresses](references/docs/ingresses.md)
- Events: [references/docs/events.md](references/docs/events.md), [references/docs/event-targets.md](references/docs/event-targets.md)
- Refresh bundled docs: [scripts/refresh-docs.md](scripts/refresh-docs.md)
