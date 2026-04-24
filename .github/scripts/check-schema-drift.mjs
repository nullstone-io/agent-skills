#!/usr/bin/env node
// Compare bundled Nullstone IaC schema files against upstream nullstone-io/iac.
//
// Fails (exit 1) if any schema file under
// skills/nullstone-config-files/references/schema/ differs from the upstream
// file at the same basename in nullstone-io/iac/.schema/ on the branch named
// by UPSTREAM_BRANCH (default: master).
//
// Intent: force a deliberate catalog release when upstream changes — never a
// silent drift. To update the bundle: copy upstream in, bump CHANGELOG, open PR.

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const SCHEMA_DIR = join(ROOT, "skills", "nullstone-config-files", "references", "schema");
const UPSTREAM_BRANCH = process.env.UPSTREAM_BRANCH ?? "master";
const UPSTREAM_BASE = `https://raw.githubusercontent.com/nullstone-io/iac/${UPSTREAM_BRANCH}/.schema`;

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function main() {
  if (!existsSync(SCHEMA_DIR)) {
    console.error(`no schema dir at ${SCHEMA_DIR}`);
    process.exit(1);
  }

  let drift = false;
  const files = readdirSync(SCHEMA_DIR)
    .filter((f) => /^config\..+\.json$/.test(f))
    .sort();

  for (const name of files) {
    const local = readFileSync(join(SCHEMA_DIR, name));
    const url = `${UPSTREAM_BASE}/${name}`;
    let upstream;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
      upstream = Buffer.from(await resp.arrayBuffer());
    } catch (e) {
      console.error(`FAIL: ${name}: could not fetch ${url}: ${e.message}`);
      drift = true;
      continue;
    }

    if (sha256(local) === sha256(upstream)) {
      console.log(`OK:   ${name} matches upstream`);
    } else {
      drift = true;
      console.error(
        `DRIFT: ${name} differs from upstream\n` +
          `  local    sha256 ${sha256(local)} (${local.length} bytes)\n` +
          `  upstream sha256 ${sha256(upstream)} (${upstream.length} bytes)\n` +
          `  upstream URL: ${url}`,
      );
    }
  }

  process.exit(drift ? 1 : 0);
}

await main();
