#!/usr/bin/env node
// Validate every skill in skills/ against repo conventions.
//
// Checks per skill directory (skills/<name>/, excluding names starting with `_`):
//   1. SKILL.md exists with valid YAML frontmatter.
//   2. Frontmatter conforms to the Agent Skills open standard
//      (https://agentskills.io/specification): `name` (1–64 chars, lowercase
//      a-z/0-9/hyphens, no leading/trailing/consecutive hyphens, matching the
//      directory) and `description` (1–1024 chars). Optional `metadata` must be
//      a mapping; `metadata.version`, if present, must be a quoted string.
//   3. For `nullstone-config-files`: every references/examples/*.yml validates
//      against references/schema/config.<version>.json (picked by the YAML's
//      `version:` key).
//
// Plugin-manifest checks (these are what make `/plugin marketplace update`
// actually serve a new version to users):
//   4. marketplace.json plugin `version` == plugin.json `version` == each
//      skill's `metadata.version`; the plugin `source` starts with "./" (a bare
//      "." is rejected by Claude Code); and every real skill is registered in
//      plugin.json `skills`, with no dangling registrations.
//
// Exit code: 0 on success, 1 on any validation failure.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import yaml from "js-yaml";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const SKILLS_DIR = join(ROOT, "skills");
// Agent Skills spec limits (https://agentskills.io/specification).
const MAX_NAME_LEN = 64;
const MAX_DESCRIPTION_LEN = 1024;
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n/;

let failures = 0;
const fail = (msg) => {
  console.error(`FAIL: ${msg}`);
  failures++;
};

function parseFrontmatter(path) {
  const text = readFileSync(path, "utf8");
  const m = text.match(FRONTMATTER_RE);
  if (!m) return null;
  try {
    return yaml.load(m[1]) ?? {};
  } catch (e) {
    fail(`${path}: invalid YAML frontmatter: ${e.message}`);
    return null;
  }
}

// The bundled IaC schema uses legacy Draft-04 `id` keys in nested definitions.
// AJV 2020-12 rejects those — strip them before compile. Top-level `$id` is kept.
function stripLegacyIds(node) {
  if (Array.isArray(node)) return node.forEach(stripLegacyIds);
  if (node && typeof node === "object") {
    if (typeof node.id === "string") delete node.id;
    for (const v of Object.values(node)) stripLegacyIds(v);
  }
}

function loadSchemas(schemaDir) {
  const ajv = new Ajv2020.default({ allErrors: true, strict: false });
  addFormats.default(ajv);
  const schemas = new Map();
  if (!existsSync(schemaDir)) return schemas;
  for (const entry of readdirSync(schemaDir)) {
    const m = entry.match(/^config\.(.+)\.json$/);
    if (!m) continue;
    const version = m[1];
    const schema = JSON.parse(readFileSync(join(schemaDir, entry), "utf8"));
    // Preserve top-level $id; strip legacy `id` from nested nodes.
    for (const def of Object.values(schema.definitions ?? {})) stripLegacyIds(def);
    schemas.set(version, ajv.compile(schema));
  }
  return schemas;
}

function validateConfigExamples(skillDir) {
  const examplesDir = join(skillDir, "references", "examples");
  const schemaDir = join(skillDir, "references", "schema");
  if (!existsSync(examplesDir)) return;

  const schemas = loadSchemas(schemaDir);
  const files = readdirSync(examplesDir)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .sort();

  for (const file of files) {
    const path = join(examplesDir, file);
    const rel = relative(ROOT, path).replaceAll("\\", "/");
    let doc;
    try {
      doc = yaml.load(readFileSync(path, "utf8"));
    } catch (e) {
      fail(`${rel}: invalid YAML: ${e.message}`);
      continue;
    }
    if (doc === null || typeof doc !== "object" || Array.isArray(doc)) {
      fail(`${rel}: root is not a mapping`);
      continue;
    }
    const version = doc.version;
    const validate = schemas.get(version);
    if (!validate) {
      fail(`${rel}: no bundled schema for version=${JSON.stringify(version)} (have ${[...schemas.keys()].sort().join(", ") || "<none>"})`);
      continue;
    }
    const ok = validate(doc);
    if (!ok) {
      for (const err of validate.errors ?? []) {
        const where = err.instancePath || "<root>";
        fail(`${rel}: ${where}: ${err.message}`);
      }
    } else {
      console.log(`OK:   ${rel}`);
    }
  }
}

function validateSkill(skillDir) {
  const skillMd = join(skillDir, "SKILL.md");
  const rel = relative(ROOT, skillMd).replaceAll("\\", "/");
  if (!existsSync(skillMd)) {
    fail(`${relative(ROOT, skillDir)}: missing SKILL.md`);
    return;
  }
  const fm = parseFrontmatter(skillMd);
  if (fm === null) {
    fail(`${rel}: missing or invalid frontmatter`);
    return;
  }
  const dirName = skillDir.split(/[\\/]/).pop();
  if (typeof fm.name !== "string" || fm.name === "") {
    fail(`${rel}: frontmatter.name is required`);
  } else {
    if (fm.name.length > MAX_NAME_LEN) {
      fail(`${rel}: frontmatter.name is ${fm.name.length} chars; max ${MAX_NAME_LEN}`);
    }
    if (!NAME_RE.test(fm.name)) {
      fail(`${rel}: frontmatter.name (${JSON.stringify(fm.name)}) must be lowercase alphanumeric and hyphens, with no leading, trailing, or consecutive hyphens`);
    }
    if (fm.name !== dirName) {
      fail(`${rel}: frontmatter.name (${JSON.stringify(fm.name)}) must match directory (${JSON.stringify(dirName)})`);
    }
  }
  if (typeof fm.description !== "string" || fm.description.trim() === "") {
    fail(`${rel}: frontmatter.description is required`);
  } else if (fm.description.length > MAX_DESCRIPTION_LEN) {
    fail(`${rel}: frontmatter.description is ${fm.description.length} chars; max ${MAX_DESCRIPTION_LEN}`);
  }
  if ("metadata" in fm && fm.metadata != null) {
    if (typeof fm.metadata !== "object" || Array.isArray(fm.metadata)) {
      fail(`${rel}: frontmatter.metadata must be a mapping`);
    } else if ("version" in fm.metadata && typeof fm.metadata.version !== "string") {
      fail(`${rel}: frontmatter.metadata.version must be a quoted string (e.g. "0.1.0"), got ${typeof fm.metadata.version}`);
    }
  }

  if (dirName === "nullstone-config-files") {
    validateConfigExamples(skillDir);
  }
}

function loadJson(path) {
  const rel = relative(ROOT, path).replaceAll("\\", "/");
  if (!existsSync(path)) {
    fail(`${rel}: missing`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail(`${rel}: invalid JSON: ${e.message}`);
    return null;
  }
}

// Validate the Claude Code plugin manifests and their consistency with skills/.
// `skillNames` is the list of real (non-`_`) skill directory names.
function validateManifests(skillNames) {
  const before = failures;
  const plugin = loadJson(join(ROOT, ".claude-plugin", "plugin.json"));
  const market = loadJson(join(ROOT, ".claude-plugin", "marketplace.json"));
  if (!plugin || !market) return;

  const version = plugin.version;
  if (typeof version !== "string" || version === "") {
    fail(".claude-plugin/plugin.json: `version` is required and must be a string");
  }

  // marketplace.json must carry an entry for this plugin, with a matching
  // version and a Claude-Code-supported relative `source`.
  const entry = Array.isArray(market.plugins)
    ? market.plugins.find((p) => p && p.name === plugin.name)
    : undefined;
  if (!entry) {
    fail(`.claude-plugin/marketplace.json: no plugin entry named ${JSON.stringify(plugin.name)}`);
  } else {
    if (entry.version !== version) {
      fail(`marketplace.json plugin "${plugin.name}" version (${JSON.stringify(entry.version)}) must match plugin.json version (${JSON.stringify(version)})`);
    }
    if (typeof entry.source !== "string" || !entry.source.startsWith("./")) {
      fail(`marketplace.json plugin "${plugin.name}" source must be a relative path starting with "./" (got ${JSON.stringify(entry.source)}); a bare "." is rejected by Claude Code as an unsupported source type`);
    }
  }

  // Registration must be complete in both directions: every real skill listed,
  // and every listed path present on disk.
  const registered = Array.isArray(plugin.skills) ? plugin.skills.map(String) : [];
  const registeredNames = new Set(registered.map((p) => p.split("/").pop()));
  for (const p of registered) {
    if (!existsSync(join(resolve(ROOT, p), "SKILL.md"))) {
      fail(`plugin.json skills: ${JSON.stringify(p)} has no SKILL.md`);
    }
  }
  for (const name of skillNames) {
    if (!registeredNames.has(name)) {
      fail(`plugin.json skills: skill "${name}" is not registered — add "./skills/${name}" (unregistered skills do not ship)`);
    }
  }

  // The catalog is single-versioned: each skill's metadata.version, if set,
  // must equal the plugin version. A bumped CHANGELOG with a stale skill
  // version means users' update-detection never fires.
  for (const name of skillNames) {
    const v = parseFrontmatter(join(SKILLS_DIR, name, "SKILL.md"))?.metadata?.version;
    if (typeof v === "string" && v !== version) {
      fail(`skills/${name}/SKILL.md metadata.version (${JSON.stringify(v)}) must match the catalog version in plugin.json (${JSON.stringify(version)})`);
    }
  }

  if (failures === before) {
    console.log(`OK:   manifests (catalog version ${version}, ${skillNames.length} skill(s) registered)`);
  }
}

function main() {
  if (!existsSync(SKILLS_DIR)) {
    fail(`skills/ directory not found at ${SKILLS_DIR}`);
    process.exit(1);
  }
  const entries = readdirSync(SKILLS_DIR)
    .filter((n) => !n.startsWith("_"))
    .filter((n) => statSync(join(SKILLS_DIR, n)).isDirectory())
    .sort();

  for (const name of entries) {
    console.log(`--- ${name}`);
    validateSkill(join(SKILLS_DIR, name));
  }

  console.log(`--- manifests`);
  validateManifests(entries);

  process.exit(failures ? 1 : 0);
}

main();
