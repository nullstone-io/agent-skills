# Refresh Nullstone IaC docs

Paste this prompt into Claude (or run it yourself) to re-seed `references/docs/` with the latest content from [docs.nullstone.io](https://docs.nullstone.io).

---

You are refreshing the bundled copy of the Nullstone IaC documentation that ships with the `nullstone-config-files` skill.

## Steps

1. Fetch `https://docs.nullstone.io/gitops/iac/overview.html` and extract every link whose path begins with `/gitops/iac/`.
2. For each of those pages — **plus** the overview itself — fetch the page and convert it to clean markdown. Preserve:
   - Headings
   - Code fences (YAML samples are critical — keep them verbatim)
   - Tables
   - Inline links (rewrite to absolute `https://docs.nullstone.io/...` URLs)
   Drop: site chrome, nav, footer, edit-on-github links.
3. Save each page to `references/docs/<slug>.md`, where `<slug>` is the final path segment without `.html`. For example `/gitops/iac/app-capabilities.html` → `references/docs/app-capabilities.md`.
4. At the top of every generated file, add a two-line header:
   ```
   <!-- source: https://docs.nullstone.io/gitops/iac/<slug>.html -->
   <!-- fetched: <YYYY-MM-DD> -->
   ```
5. Overwrite existing files. Do not delete files whose corresponding doc page no longer exists — list them at the end so a human can decide.
6. After writing, print a one-line summary per file (path + heading count) so the user can spot-check.

## Expected pages (as of last refresh)

- overview
- multi-stack
- events
- event-targets
- apps
- app-capabilities
- clusters
- cluster-namespaces
- datastores
- ingresses
- networks
- subdomains
- blocks

If the overview page lists additional `/gitops/iac/` links, include them too.

## Tools

Use `WebFetch` for each page. Batch the fetches in parallel where possible.
