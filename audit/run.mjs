import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runId } from "./lib/run-dir.mjs";
import { auditedPages, targets } from "./lib/targets.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

/** Ordered list of check modules. Each exports `async run({ url, pages, dir, meta })`. */
export const checkPaths = [
  "checks/playwright.mjs",
  "checks/lighthouse.mjs",
  "checks/seo-html.mjs",
  "checks/links.mjs",
  "checks/headers.mjs",
  "checks/observatory.mjs",
  "checks/exposure.mjs",
  "checks/npm-audit.mjs",
];

const toolPackages = ["lighthouse", "@playwright/test", "@axe-core/playwright", "linkinator", "node-html-parser"];

/** A check function that loads its module lazily; a missing file is a hard error. */
function loadCheck(path) {
  const fn = async (ctx) => {
    const file = join(here, path);
    if (!existsSync(file)) throw new Error(`check not implemented: ${path}`);
    const mod = await import(pathToFileURL(file).href);
    await mod.run(ctx);
  };
  fn.checkPath = path;
  return fn;
}

async function loadSummarize() {
  const mod = await import("./summarize.mjs");
  return mod.summarize;
}

export function toolVersions() {
  const tools = {};
  for (const pkg of toolPackages) {
    try {
      tools[pkg] = JSON.parse(readFileSync(join(root, "node_modules", pkg, "package.json"), "utf8")).version;
    } catch {
      tools[pkg] = "not installed";
    }
  }
  return tools;
}

const msg = (e) => (e instanceof Error ? e.message : String(e));

export async function runAudit(target, opts = {}) {
  const {
    checks = checkPaths.map(loadCheck),
    summarize = async (dir) => (await loadSummarize())(dir),
    now = () => new Date(),
    fetchImpl = globalThis.fetch,
    runsRoot = join(here, "runs"),
  } = opts;
  const url = targets[target];
  if (!url) throw new Error(`unknown target: ${target}`);

  mkdirSync(runsRoot, { recursive: true });
  const startedAt = now();
  const id = runId(startedAt.toISOString().slice(0, 10), target, readdirSync(runsRoot));
  const dir = join(runsRoot, id);
  mkdirSync(dir, { recursive: true });

  const meta = {
    runId: id,
    target,
    url,
    startedAt: startedAt.toISOString(),
    finishedAt: null,
    version: null,
    tools: toolVersions(),
    node: process.version,
    machine: `${os.type()} ${os.arch()} ${os.cpus()[0]?.model ?? "unknown cpu"}`,
  };
  const save = () => writeFileSync(join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");

  let step = "version.json";
  try {
    const res = await fetchImpl(`${url}/version.json`);
    if (!res.ok) throw new Error(`GET ${url}/version.json returned ${res.status}`);
    meta.version = await res.json();

    copyFileSync(join(here, "manual-template.md"), join(dir, "manual.md"));

    for (const check of checks) {
      step = check.checkPath || check.name || "check";
      await check({ url, pages: auditedPages, dir, meta });
    }
    meta.finishedAt = now().toISOString();
    save();
    step = "summarize";
    await summarize(dir);
    return { exitCode: 0, runDir: dir };
  } catch (e) {
    meta.failed = `${step}: ${msg(e)}`;
    meta.finishedAt = now().toISOString();
    save();
    console.error(`Audit ${id} failed. ${meta.failed}`);
    return { exitCode: 1, runDir: dir };
  }
}

/** before, then after in one process; if before fails, after is not run. */
export async function runBoth(opts) {
  const first = await runAudit("before", opts);
  if (first.exitCode !== 0) return first;
  return runAudit("after", opts);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const arg = process.argv[2];
  if (!["before", "after", "both"].includes(arg)) {
    console.error("Usage: node audit/run.mjs <before|after|both>");
    process.exit(2);
  }
  const { exitCode } = arg === "both" ? await runBoth() : await runAudit(arg);
  process.exit(exitCode);
}
