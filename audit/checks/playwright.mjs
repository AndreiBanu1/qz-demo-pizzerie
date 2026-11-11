import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

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
    writeFileSync(`${file}.gz`, gzipSync(readFileSync(file)));
    unlinkSync(file);
  }
}
