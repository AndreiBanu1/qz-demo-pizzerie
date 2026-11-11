import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";

/** Run id such as 2026-12-01-before, then 2026-12-01-before-2, and so on. */
export function runId(date, target, existing) {
  const base = `${date}-${target}`;
  if (!existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/** Writes <dir>/<name>.json.gz and returns the file path. */
export function writeRaw(dir, name, data) {
  const file = join(dir, `${name}.json.gz`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, gzipSync(JSON.stringify(data)));
  return file;
}

export function readRaw(dir, name) {
  return JSON.parse(gunzipSync(readFileSync(join(dir, `${name}.json.gz`))).toString("utf8"));
}
