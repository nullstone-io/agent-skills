<!-- source: https://docs.nullstone.io/gitops/iac/event-targets.html -->
<!-- fetched: 2026-05-25 -->

# `event targets` element

The `targets` section enables a developer to emit a notification, send a webhook, and/or trigger a task.

## Examples

### Slack Notification

```yaml
events:
  all-deployments:
    # ...
    targets:
      slack:
        channels:
          - deployments
```

### Webhook

```yaml
events:
  all-deployments:
    # ...
    targets:
      webhook:
        url: https://example.com/webhook
```

## Attributes

### `slack`

The `slack` target allows you to configure notifications to Slack channel(s) when an event occurs.

Before using this, you must connect a Slack workspace to your Nullstone organization. Visit "Integrations" in Nullstone under "global configuration". You can find this in the left pane at the bottom when logged in to Nullstone.

### `slack.channels`

The `channels` section allows a developer to choose a list of Slack channels to send notifications.

TIP

The Nullstone bot must be a member of private channels. Type `/invite @Nullstone` in the Slack channel after configuring the Slack integration.

### `webhook`

The `webhook` target allows you to configure a webhook to send a POST request to a URL when an event occurs.

#### Webhook Payload

Nullstone sends the following payload to the specified URL when an event occurs:

```json
{
  "action": "string: enum(launch-failed, launched, destroy-failed, destroyed, update-failed, updated, first-deployed, first-deploy-failed, deployed, deploy-failed)",
  "eventAction": "string: enum(app-deployed, app-first-deployed, block-launched, block-updated, block-destroyed, block-needs-approval, env-launched, env-destroyed)",
  "eventStatus": "string: enum(failed, completed, cancelled, disapproved)",
  "message": "string",
  "workspace": {
    "uid": "string (uuid)",
    "createdAt": "string (timestamp)",
    "createdBy": "string",
    "status": "string",
    "statusAt": "string (timestamp)",
    "orgName": "string",
    "stackId": "integer",
    "blockId": "integer",
    "envId": "integer",
    "provisionedAt": "string (timestamp)",
    "currentActivity": "string",
    "hasPartialChanges": "boolean",
    "provisionStartedAt": "string (timestamp)"
  },
  "stack": {
    "id": "integer",
    "name": "string",
    "orgName": "string",
    "description": "string",
    "createdAt": "string (timestamp)",
    "updatedAt": "string (timestamp)",
    "providerType": "string",
    "status": "string"
  },
  "block": {
    "id": "integer",
    "name": "string",
    "orgName": "string",
    "moduleSource": "string",
    "createdAt": "string (timestamp)",
    "updatedAt": "string (timestamp)",
    "moduleSourceVersion": "string",
    "type": "string",
    "repo": "string",
    "framework": "string",
    "dnsName": "string",
    "registrar": "string",
    "reference": "string",
    "stackId": "integer",
    "isVerified": "boolean",
    "status": "string",
    "isShared": "boolean",
    "owningRepo": "string"
  },
  "environment": {
    "id": "integer",
    "name": "string",
    "orgName": "string",
    "providerConfig": "object",
    "pipelineOrder": "integer (nullable)",
    "createdAt": "string (timestamp)",
    "updatedAt": "string (timestamp)",
    "stackId": "integer",
    "type": "string",
    "status": "string",
    "contextKey": "string",
    "isProd": "boolean",
    "createdBy": "string"
  },
  "appVersion": "string",
  "module": "string",
  "moduleVersion": "string",
  "initiator": {
    "trigger": {
      "source": "string: enum(manual, github)",
      "event": "string: enum(user, automation, vcs-push, vcs-pull-request-opened, vcs-pull-request-labelled, gitops-enable, gitops-change-branch, env-create)",
    },
    "repoInfo": {},
    "commitInfo": {}
  },
  "targetUrl": "string"
}
```
