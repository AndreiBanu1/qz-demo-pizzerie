// Builds <run>/summary.json from the raw tool outputs of one run.
// summary.json is the only data source for the published report, so every value
// is read from a raw file; anything missing or non-finite throws instead of
// being defaulted, and no summary.json is written for a run that throws.
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SECURITY_HEADERS } from "./checks/headers.mjs";
import { restaurantFieldsMissing } from "./checks/seo-html.mjs";
import { median3 } from "./lib/median.mjs";
import { readRaw } from "./lib/run-dir.mjs";
import { auditedPages } from "./lib/targets.mjs";

/** @typedef {import("./summary-schema.ts").Summary} Summary */
/** @typedef {import("./summary-schema.ts").PageSummary} PageSummary */

const LIGHTHOUSE_RUNS = [1, 2, 3];
/** The Playwright projects in audit/qa/playwright.config.ts; axe.spec.ts runs in all three. */
const AXE_PROJECTS = ["iphone-15", "pixel-7", "desktop"];
const ROOT_PAGE = auditedPages.find((p) => p.path === "/").id;

/** [summary field, getter, is a 0–1 category score]. */
const LIGHTHOUSE_METRICS = [
  ["performance", (l) => l.categories?.performance?.score, true],
  ["accessibility", (l) => l.categories?.accessibility?.score, true],
  ["seo", (l) => l.categories?.seo?.score, true],
  ["bestPractices", (l) => l.categories?.["best-practices"]?.score, true],
  ["lcpMs", (l) => l.audits?.["largest-contentful-paint"]?.numericValue, false],
  ["cls", (l) => l.audits?.["cumulative-layout-shift"]?.numericValue, false],
  ["tbtMs", (l) => l.audits?.["total-blocking-time"]?.numericValue, false],
  ["bytes", (l) => l.audits?.["total-byte-weight"]?.numericValue, false],
];

const gz = (name) => `${name}.json.gz`;

/** Every file a complete run has, in the order the checks write them. */
export function expectedFiles(pages = auditedPages) {
  return [
    "meta.json",
    gz("playwright"),
    ...pages.flatMap((p) => AXE_PROJECTS.map((proj) => gz(`axe-${p.id}-${proj}`))),
    ...pages.flatMap((p) => LIGHTHOUSE_RUNS.map((n) => gz(`lighthouse-${p.id}-${n}`))),
    gz("seo-html"),
    gz("links"),
    gz("headers"),
    gz("observatory"),
    gz("exposure"),
    gz("npm-audit"),
  ];
}

function finite(value, file, field) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${file}: ${field} is not a finite number (got ${JSON.stringify(value) ?? "undefined"})`);
  }
  return value;
}

function nonEmptyString(value, file, field) {
  if (typeof value !== "string" || value === "") {
    throw new Error(`${file}: ${field} is not a non-empty string (got ${JSON.stringify(value) ?? "undefined"})`);
  }
  return value;
}

function entryFor(raw, file, pageId) {
  if (!raw || typeof raw !== "object" || !Object.hasOwn(raw, pageId)) {
    throw new Error(`${file}: no entry for ${pageId}`);
  }
  return raw[pageId];
}

function readMeta(dir) {
  const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
  if (meta.failed) throw new Error(`incomplete run: ${meta.failed}`);
  if (meta.target !== "before" && meta.target !== "after") {
    throw new Error(`meta.json: target is ${JSON.stringify(meta.target)}, expected "before" or "after"`);
  }
  for (const k of ["runId", "url", "startedAt"]) nonEmptyString(meta[k], "meta.json", k);
  if (!meta.version || typeof meta.version !== "object") throw new Error("meta.json: version is missing");
  for (const k of ["commit", "branch", "builtAt"]) nonEmptyString(meta.version[k], "meta.json", `version.${k}`);
  if (!meta.tools || typeof meta.tools !== "object") throw new Error("meta.json: tools is missing");
  return meta;
}

/** median3 per metric over the 3 runs; R21: any non-finite value throws first. */
function lighthouseFor(dir, pageId) {
  const runs = LIGHTHOUSE_RUNS.map((n) => {
    const name = `lighthouse-${pageId}-${n}`;
    return { file: gz(name), lhr: readRaw(dir, name) };
  });
  const out = {};
  for (const [field, get, isScore] of LIGHTHOUSE_METRICS) {
    const values = runs.map(({ file, lhr }) => {
      const v = finite(get(lhr), file, field);
      return isScore ? Math.round(v * 100) : v;
    });
    out[field] = median3(values);
  }
  return /** @type {PageSummary["lighthouse"]} */ (out);
}

function axeFor(dir, pageId) {
  let violations = 0;
  const ids = new Set();
  for (const project of AXE_PROJECTS) {
    const name = `axe-${pageId}-${project}`;
    const result = readRaw(dir, name);
    if (!Array.isArray(result?.violations)) throw new Error(`${gz(name)}: violations is not an array`);
    violations += result.violations.length;
    for (const v of result.violations) ids.add(nonEmptyString(v?.id, gz(name), "violations[].id"));
  }
  return { violations, rules: [...ids].sort() };
}

function seoFor(seoHtml, pageId) {
  const file = gz("seo-html");
  const entry = entryFor(seoHtml, file, pageId);
  if (!Array.isArray(entry?.jsonLd?.fields)) throw new Error(`${file}: ${pageId}.jsonLd.fields is not an array`);
  return { ...entry, restaurantFieldsMissing: restaurantFieldsMissing(entry.jsonLd.fields) };
}

function headersFor(headers, pageId) {
  const file = gz("headers");
  const entry = entryFor(headers, file, pageId);
  for (const h of SECURITY_HEADERS) {
    if (!Object.hasOwn(entry, h)) throw new Error(`${file}: ${pageId} has no ${h} field`);
  }
  if (typeof entry.frameAncestors !== "boolean") throw new Error(`${file}: ${pageId}.frameAncestors is not a boolean`);
  return entry;
}

/** x-frame-options also counts when the CSP sets frame-ancestors (the modern replacement). */
function headersPresent(report) {
  return SECURITY_HEADERS.filter(
    (h) => report[h] !== null || (h === "x-frame-options" && report.frameAncestors),
  ).length;
}

/** Calls visit(titlePath, test) for every test in the Playwright JSON reporter tree. */
function walkSuites(suites, path, visit) {
  for (const suite of suites ?? []) {
    const here = [...path, suite.title].filter(Boolean);
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) visit([...here, spec.title], test);
    }
    walkSuites(suite.suites, here, visit);
  }
}

function qaFrom(report) {
  const file = gz("playwright");
  if (Array.isArray(report.errors) && report.errors.length > 0) {
    throw new Error(`${file}: the report has errors: ${report.errors.map((e) => e.message ?? String(e)).join("; ")}`);
  }
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const failures = [];
  walkSuites(report.suites, [], (titles, test) => {
    const project = nonEmptyString(test.projectName, file, "tests[].projectName");
    if (test.status === "expected") passed += 1;
    else if (test.status === "unexpected") {
      failed += 1;
      failures.push({ title: titles.join(" › "), project });
    } else if (test.status === "skipped") skipped += 1;
    else {
      // "flaky" needs retries, and the config sets retries: 0, so it means the setup changed.
      throw new Error(`${file}: test "${titles.join(" › ")}" (${project}) has status ${JSON.stringify(test.status)}`);
    }
  });
  if (passed + failed === 0) throw new Error(`${file}: no tests ran`);
  const st = report.stats ?? {};
  if (st.expected !== passed || st.unexpected !== failed || st.skipped !== skipped || (st.flaky ?? 0) !== 0) {
    throw new Error(
      `${file}: counted ${passed} expected, ${failed} unexpected, ${skipped} skipped, but stats say ` +
        `${st.expected} expected, ${st.unexpected} unexpected, ${st.skipped} skipped, ${st.flaky} flaky`,
    );
  }
  return { total: passed + failed, passed, failed, skipped, failures };
}

function observatoryFrom(raw) {
  const file = gz("observatory");
  return { grade: nonEmptyString(raw?.grade, file, "grade"), score: finite(raw?.score, file, "score") };
}

function exposedFrom(raw) {
  const file = gz("exposure");
  if (!Array.isArray(raw)) throw new Error(`${file}: not an array`);
  return raw
    .filter((e) => e.exposed === true)
    .map((e) => ({ path: nonEmptyString(e.path, file, "path"), status: finite(e.status, file, `${e.path}.status`) }));
}

function npmAuditFrom(raw) {
  const file = gz("npm-audit");
  const v = raw?.metadata?.vulnerabilities;
  const out = {};
  for (const k of ["critical", "high", "moderate", "low"]) out[k] = finite(v?.[k], file, `metadata.vulnerabilities.${k}`);
  return /** @type {Summary["security"]["npmAudit"]} */ (out);
}

function linksFrom(raw) {
  const file = gz("links");
  if (!Array.isArray(raw)) throw new Error(`${file}: not an array`);
  for (const l of raw) finite(l.status, file, `${l.url}.status`);
  const broken = raw
    .filter((l) => l.status >= 400 || l.status === 0)
    .map((l) => ({ url: l.url, status: l.status, parent: l.parent ?? null }));
  return { checked: raw.length, broken };
}

/** Builds the whole summary in memory; throws on anything missing or invalid. */
function build(dir) {
  const missing = expectedFiles().filter((f) => !existsSync(join(dir, f)));
  if (missing.length > 0) throw new Error(`incomplete run: missing ${missing.join(", ")}`);

  const meta = readMeta(dir);
  const seoHtml = readRaw(dir, "seo-html");
  const headers = readRaw(dir, "headers");

  const pages = {};
  for (const { id } of auditedPages) {
    pages[id] = {
      lighthouse: lighthouseFor(dir, id),
      axe: axeFor(dir, id),
      seo: seoFor(seoHtml, id),
      headers: headersFor(headers, id),
    };
  }

  return {
    runId: meta.runId,
    target: meta.target,
    url: meta.url,
    startedAt: meta.startedAt,
    version: { commit: meta.version.commit, branch: meta.version.branch, builtAt: meta.version.builtAt },
    tools: meta.tools,
    pages: /** @type {Summary["pages"]} */ (pages),
    qa: qaFrom(readRaw(dir, "playwright")),
    security: {
      observatory: observatoryFrom(readRaw(dir, "observatory")),
      headersPresent: headersPresent(pages[ROOT_PAGE].headers),
      exposed: exposedFrom(readRaw(dir, "exposure")),
      npmAudit: npmAuditFrom(readRaw(dir, "npm-audit")),
    },
    links: linksFrom(readRaw(dir, "links")),
  };
}

/**
 * Reads the raw files in `dir`, writes `dir/summary.json` atomically (temp file,
 * then rename) and returns the summary. If anything throws, no summary.json is written.
 * @param {string} dir
 * @returns {Summary}
 */
export function summarize(dir) {
  const summary = build(dir);
  const tmp = join(dir, "summary.json.tmp");
  try {
    writeFileSync(tmp, JSON.stringify(summary, null, 2) + "\n");
    renameSync(tmp, join(dir, "summary.json"));
  } catch (e) {
    rmSync(tmp, { force: true });
    throw e;
  }
  return summary;
}

/**
 * Dot-path lookup ("pages.meniu.lighthouse.lcpMs"). A present null is returned as null;
 * a missing segment, or a segment below a non-object, throws.
 * @param {Summary} summary
 * @param {string} key
 * @returns {unknown}
 */
export function getEvidence(summary, key) {
  let cur = /** @type {unknown} */ (summary);
  for (const seg of key.split(".")) {
    if (cur === null || typeof cur !== "object" || !Object.hasOwn(cur, seg)) {
      throw new Error(`unknown evidence key: ${key}`);
    }
    cur = /** @type {Record<string, unknown>} */ (cur)[seg];
  }
  return cur;
}
