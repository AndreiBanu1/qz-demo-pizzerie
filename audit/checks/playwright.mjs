import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * R34: the raw results are committed to a public repo, so no local path may leak.
 * In every string (and key) of `value`, a path under `root` becomes repo-relative
 * (`root` itself becomes "."), and any remaining `home` prefix becomes "~".
 * A prefix only matches as a whole path segment: /a/repo-old is not under /a/repo.
 */
export function stripLocalPaths(value, { root: repoRoot = root, home = homedir() } = {}) {
  const rules = [
    [new RegExp(`${escapeRegExp(repoRoot)}/`, "g"), ""],
    [new RegExp(`${escapeRegExp(repoRoot)}(?![\\w.-])`, "g"), "."],
    [new RegExp(`${escapeRegExp(home)}(?![\\w.-])`, "g"), "~"],
  ];
  const swap = (s) => rules.reduce((out, [re, to]) => out.replace(re, to), s);
  const walk = (v) => {
    if (typeof v === "string") return swap(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [swap(k), walk(x)]));
    return v;
  };
  return walk(value);
}

/**
 * Runs the Playwright suite against `url`. Failing tests are data, so a non-zero
 * exit from Playwright is fine; only a missing JSON report is an error.
 */
export async function run({ url, dir }) {
  await new Promise((done, fail) => {
    const child = spawn("npx", ["playwright", "test", "-c", "audit/qa"], {
      cwd: root,
      env: { ...process.env, BASE_URL: url, RUN_DIR: dir },
      stdio: "inherit",
    });
    child.on("error", fail);
    child.on("close", () => done());
  });

  const report = join(dir, "playwright.json");
  if (!existsSync(report)) throw new Error(`Playwright wrote no report at ${report}`);

  const raw = [report, ...readdirSync(dir).filter((f) => /^axe-.*\.json$/.test(f)).map((f) => join(dir, f))];
  for (const file of raw) {
    const clean = stripLocalPaths(JSON.parse(readFileSync(file, "utf8")));
    writeFileSync(`${file}.gz`, gzipSync(JSON.stringify(clean, null, 2)));
    unlinkSync(file);
  }
}
