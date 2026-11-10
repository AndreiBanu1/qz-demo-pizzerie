import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

function git(args) {
  try {
    return execSync(`git ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "unknown";
  }
}

export function versionInfo(env, now = () => new Date().toISOString()) {
  return {
    commit: env.COMMIT_REF || git("rev-parse HEAD"),
    branch: env.BRANCH || git("rev-parse --abbrev-ref HEAD"),
    builtAt: now(),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync("dist", { recursive: true });
  writeFileSync("dist/version.json", JSON.stringify(versionInfo(process.env), null, 2) + "\n");
}
