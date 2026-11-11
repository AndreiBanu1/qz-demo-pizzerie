import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { writeRaw } from "../lib/run-dir.mjs";

/** Audits the dependencies exactly as committed at the deployed commit. */
export async function run({ dir, meta }) {
  const commit = meta.version.commit;
  const tmp = mkdtempSync(join(os.tmpdir(), "npm-audit-"));
  try {
    for (const f of ["package.json", "package-lock.json"]) {
      const content = execFileSync("git", ["show", `${commit}:${f}`], { maxBuffer: 64 * 1024 * 1024 });
      writeFileSync(join(tmp, f), content);
    }
    // npm audit exits non-zero when it finds vulnerabilities, so only stdout matters.
    const res = spawnSync("npm", ["audit", "--package-lock-only", "--json"], {
      cwd: tmp, encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
    });
    let json;
    try {
      json = JSON.parse(res.stdout);
    } catch {
      throw new Error(`npm-audit: stdout is not JSON (exit ${res.status}): ${(res.stderr || res.stdout).slice(0, 300)}`);
    }
    writeRaw(dir, "npm-audit", json);
    return json;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
