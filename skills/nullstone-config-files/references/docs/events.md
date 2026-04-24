<!-- source: https://docs.nullstone.io/gitops/iac/events.html -->
<!-- fetched: 2026-04-24 -->

# `events` top-level element

An event is a way to emit notifications, send webhooks, or trigger tasks as a result of a workspace event.

Events consist of 2 pieces:

1.  a set of event selectors or filters (e.g. which event actions, for which blocks)
2.  a set of targets that serve as a reaction to those events (e.g. slack notification, webhook, etc.)

When added to an IaC file, these events are registered on the environment where GitOps synchronization is performed. You can find these events in the Nullstone UI by navigating to an environment and switching to the "Events" tab. Events registered through GitOps will be labeled with "Managed By" in the UI which indicates that only that repository can edit/remove the event.

## Examples

### Notify Slack for App Deployments

```yaml
events:
  all-deployments:
    actions:
      - app-deployed
    targets:
      slack:
        channels:
          - nullstone
```

### Notify Slack for Needs Approval

```yaml
events:
  all-approvals:
    actions:
      - block-needs-approval
    targets:
      slack:
        channels:
          - nullstone
```

## Attributes

### `actions`

The `actions` element allows a developer to select a set of actions that will trigger the event. If not specified, the event will trigger on _all_ actions.

Available Actions:

-   `app-deployed` - Occurs when an app deployment finishes
-   `app-first-deployed` - Occurs when an app deployment finishes for the first time
-   `block-launched` - Occurs when the infra for a block is initially provisioned
-   `block-updated` - Occurs when the infra for a block is updated
-   `block-destroyed` - Occurs when the infra for a block is destroyed
-   `block-needs-approval` - Occurs when Nullstone requires approval to complete an infra update

### `blocks`

The `blocks` element allows a developer to select a set of blocks in the environment that will trigger the event. Each element refers to the block by name. If not specified, the event will trigger on _all_ blocks.

### `statuses`

The `statuses` element allows a developer to filter to a set of statuses that will trigger the event. If not specified, the event will trigger on _all_ statuses.

Available Statuses:

-   `completed` - Occurs when the action succeeded.
-   `failed` - Occurs when the action failed.
-   `cancelled` - Occurs when a user or the system cancelled the action.
-   `disapproved` - Occurs when a user disapproves the action.

### `targets`

The `targets` element allows a developer to emit a notification, send a webhook, or trigger a task. See [event targets](https://docs.nullstone.io/gitops/iac/event-targets.html) for more information.
