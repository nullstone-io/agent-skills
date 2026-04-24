#!/usr/bin/env node
// Validate every skill in skills/ against repo conventions.
//
// Checks per skill directory (skills/<name>/, excluding names starting with `_`):
//   1. SKILL.md exists with valid YAML frontmatter.
//   2. Frontmatter has `name` (matching directory) and `description` (<= 500 chars).
//   3. For `nullstone-config-files`: every references/examples/*.yml validates
//      against references/schema/config.<version>.json (picked by the YAML's
//      `version:` key).
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
const MAX_DESCRIPTION_LEN = 500;
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
  if (fm.name !== dirName) {
    fail(`${rel}: frontmatter.name (${JSON.stringify(fm.name)}) must match directory (${JSON.stringify(dirName)})`);
  }
  if (typeof fm.description !== "string" || fm.description.trim() === "") {
    fail(`${rel}: frontmatter.description is required`);
  } else if (fm.description.length > MAX_DESCRIPTION_LEN) {
    fail(`${rel}: frontmatter.description is ${fm.description.length} chars; max ${MAX_DESCRIPTION_LEN}`);
  }

  if (dirName === "nullstone-config-files") {
    validateConfigExamples(skillDir);
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

  process.exit(failures ? 1 : 0);
}

main();
