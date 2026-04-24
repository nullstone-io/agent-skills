#!/usr/bin/env node
// Refresh bundled Nullstone IaC docs from docs.nullstone.io.
//
// For each slug under /gitops/iac/, fetches the rendered page, extracts the
// article body, converts it to markdown, and writes
// skills/nullstone-config-files/references/docs/<slug>.md with a header.
//
// The slug list is derived from the overview page's outbound links (plus the
// overview itself), so new pages are picked up automatically.
//
// Exit code: 0 unless a fatal error occurs (fetch/parse failure). The caller
// detects content changes via `git diff`.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as cheerio from "cheerio";
import TurndownService from "turndown";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const DOCS_DIR = join(ROOT, "skills", "nullstone-config-files", "references", "docs");
const BASE = "https://docs.nullstone.io";
const BASE_PATH = "/gitops/iac";
const OVERVIEW = `${BASE}${BASE_PATH}/overview.html`;

const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  fence: "```",
});
turndown.keep(["table", "thead", "tbody", "tr", "th", "td"]);

// VitePress wraps code blocks in <div class="language-<lang>"> with an inner
// <pre><code>. Without a rule, turndown emits an orphan language label and an
// indented block. This rule produces proper fenced code.
turndown.addRule("vitepress-codeblock", {
  filter(node) {
    return (
      node.nodeName === "DIV" &&
      typeof node.className === "string" &&
      /(^|\s)language-/.test(node.className)
    );
  },
  replacement(_content, node) {
    const lang = (node.className.match(/language-([\w-]+)/) || [])[1] || "";
    const code = node.querySelector("code");
    const text = (code ? code.textContent : node.textContent) || "";
    return `\n\n\`\`\`${lang === "plaintext" ? "" : lang}\n${text.replace(/\n+$/, "")}\n\`\`\`\n\n`;
  },
});

async function fetchText(url) {
  const resp = await fetch(url, { headers: { "User-Agent": "nullstone-agent-skills-refresh" } });
  if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
  return resp.text();
}

async function discoverSlugs() {
  const html = await fetchText(OVERVIEW);
  const $ = cheerio.load(html);
  const slugs = new Set(["overview"]);
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const m = href && href.match(/^\/?(?:https?:\/\/[^/]+)?\/gitops\/iac\/([^/?#]+)\.html(?:[?#].*)?$/);
    if (m) slugs.add(m[1]);
  });
  return [...slugs].sort();
}

async function pageToMarkdown(url) {
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  let body = $("main").first();
  if (body.length === 0) body = $("div.content").first();
  if (body.length === 0) body = $("body").first();
  if (body.length === 0) throw new Error(`${url}: could not locate content body`);
  // Drop site chrome and the permalink anchors VitePress injects into headings.
  body.find("nav, header, footer, .VPDocFooter, .VPDocAside").remove();
  body.find("a.header-anchor").remove();

  let md = turndown.turndown(body.html() ?? "");

  // Collapse the zero-width-space anchor residue some themes still leave
  // behind: e.g. `# Foo [\u200b](#foo)` -> `# Foo`
  md = md.replace(/^(#+\s+.*?)\s*\[\u200B?\]\(#[^)]+\)\s*$/gm, "$1");

  // Rewrite relative links to absolute docs.nullstone.io URLs so the bundled
  // markdown remains navigable outside the site context.
  md = md.replace(/\]\(\.\/([^)]+)\)/g, (_m, p) => `](${BASE}${BASE_PATH}/${p})`);
  md = md.replace(/\]\((\/[^)#][^)]*)\)/g, (_m, p) => `](${BASE}${p})`);

  md = md.replace(/\n{3,}/g, "\n\n").trim() + "\n";
  return md;
}

async function writePage(slug) {
  const url = `${BASE}/gitops/iac/${slug}.html`;
  const body = await pageToMarkdown(url);
  const today = new Date().toISOString().slice(0, 10);
  const header = `<!-- source: ${url} -->\n<!-- fetched: ${today} -->\n\n`;
  const out = join(DOCS_DIR, `${slug}.md`);
  const next = header + body;
  const existing = existsSync(out) ? readFileSync(out, "utf8") : null;
  if (existing === next) return false;
  writeFileSync(out, next, "utf8");
  return true;
}

async function main() {
  mkdirSync(DOCS_DIR, { recursive: true });
  let slugs;
  try {
    slugs = await discoverSlugs();
  } catch (e) {
    console.error(`FAIL: could not fetch overview: ${e.message}`);
    process.exit(1);
  }

  const changed = [];
  const failed = [];
  for (const slug of slugs) {
    try {
      if (await writePage(slug)) {
        changed.push(slug);
        console.log(`UPDATED: ${slug}`);
      } else {
        console.log(`UNCHANGED: ${slug}`);
      }
    } catch (e) {
      failed.push(slug);
      console.error(`FAIL: ${slug}: ${e.message}`);
    }
  }

  console.log(`\nsummary: ${changed.length} updated, ${slugs.length - changed.length - failed.length} unchanged, ${failed.length} failed`);
  process.exit(failed.length ? 1 : 0);
}

await main();
