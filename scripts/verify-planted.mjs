// Checks that every id in audit/planted-issues.json has a `PLANTED P-xx` marker in the source.
// Each id needs its own `PLANTED` token, so `PLANTED P-01, P-03` only counts P-01.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const SCAN = ["src", "index.html", "vite.config.ts", "public/_headers"];
const MARKER = /PLANTED (P-\d{2})\b/g;

/** Maps each planted id to the paths whose text contains `PLANTED <id>`. */
export function findMarkers(files) {
  const found = new Map();
  for (const { path, text } of files) {
    for (const id of new Set([...text.matchAll(MARKER)].map((m) => m[1]))) {
      found.set(id, [...(found.get(id) ?? []), path]);
    }
  }
  return found;
}

function collect(target) {
  const abs = join(root, target);
  if (statSync(abs).isDirectory()) {
    return readdirSync(abs).flatMap((name) => collect(join(target, name)));
  }
  return [{ path: relative(root, abs), text: readFileSync(abs, "utf8") }];
}

function main() {
  const key = JSON.parse(readFileSync(join(root, "audit", "planted-issues.json"), "utf8"));
  const found = findMarkers(SCAN.flatMap(collect));
  const missing = key.map((entry) => entry.id).filter((id) => !found.has(id));
  if (missing.length > 0) {
    console.error(`Missing markers: ${missing.join(", ")}`);
    process.exit(1);
  }
  console.log(`${key.length}/${key.length} planted issues have a marker`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
