// Publishes the raw files of the two runs the report is built on (audit/report-run.json) as dist/raport/date/<runId>/…,
// each run laid out exactly as it is in audit/runs, so the report's links resolve.
// Then checks every /raport/date/… link in the built report pages against those files and fails the build if one is missing.
import { cpSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const reportRun = JSON.parse(readFileSync(join(ROOT, "audit", "report-run.json"), "utf8"));

for (const runId of [reportRun.before, reportRun.after]) {
  const from = join(ROOT, "audit", "runs", runId);
  if (!existsSync(join(from, "summary.json"))) throw new Error(`copy-runs: ${from} has no summary.json`);
  cpSync(from, join(DIST, "raport", "date", runId), { recursive: true });
  console.log(`copied run ${runId}`);
}

const countFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? countFiles(join(dir, e.name)) : 1), 0);

const reportPages = ["raport.html", "raport/en.html"];
const decodeEntities = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
const missing = [];
let checked = 0;
for (const page of reportPages) {
  const html = readFileSync(join(DIST, page), "utf8");
  const hrefs = [...html.matchAll(/\shref="([^"]*)"/g)].map((m) => decodeEntities(m[1]));
  for (const href of hrefs) {
    // Local files the report links to: the raw runs and the two PDFs.
    if (!href.startsWith("/raport/date/") && !/^\/raport\/[^/]+\.pdf$/.test(href)) continue;
    checked++;
    const path = join(DIST, ...decodeURIComponent(href.split(/[?#]/)[0]).split("/").filter(Boolean));
    if (!existsSync(path) || !statSync(path).isFile()) missing.push(`${page}: ${href}`);
  }
}
if (missing.length) {
  console.error(`copy-runs: ${missing.length} report link(s) point at a file that isn't in dist:\n- ${missing.join("\n- ")}`);
  process.exit(1);
}
console.log(`copy-runs OK: ${checked} report links checked, ${countFiles(join(DIST, "raport", "date"))} raw files published`);
