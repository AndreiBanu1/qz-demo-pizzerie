// Regenerates the hand-made run fixtures used by audit/summarize.test.mjs.
// Run: node audit/fixtures/make-fixtures.mjs
// The output under run-complete/ and run-missing-observatory/ is committed.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeRaw } from "../lib/run-dir.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const url = "https://pizza-mita-inainte.pages.dev";

const meta = {
  runId: "2026-12-01-before",
  target: "before",
  url,
  startedAt: "2026-12-01T10:00:00.000Z",
  finishedAt: "2026-12-01T10:20:00.000Z",
  version: { commit: "abc1234", branch: "inainte", builtAt: "2026-11-30T09:00:00.000Z" },
  tools: {
    lighthouse: "13.6.0",
    "@playwright/test": "1.64.1",
    "@axe-core/playwright": "4.14.0",
    linkinator: "8.1.0",
    "node-html-parser": "9.0.7",
  },
  node: "v22.11.0",
  machine: "Darwin arm64 Fixture CPU",
};

/** render-blocking-insight as Lighthouse 13 writes it: a saving in ms, or "notApplicable" (R33). */
const blocking = (ms) =>
  ms === "n/a"
    ? { scoreDisplayMode: "notApplicable", score: null }
    : { scoreDisplayMode: "metricSavings", score: ms > 0 ? 0 : 1, numericValue: ms, numericUnit: "millisecond" };

/** A minimal LHR: only the 4 categories and the 5 audits summarize reads. */
const lhr = ({ perf, a11y, seo, bp, lcp, cls, tbt, bytes, rb }) => ({
  categories: {
    performance: { score: perf },
    accessibility: { score: a11y },
    seo: { score: seo },
    "best-practices": { score: bp },
  },
  audits: {
    "largest-contentful-paint": { numericValue: lcp },
    "cumulative-layout-shift": { numericValue: cls },
    "total-blocking-time": { numericValue: tbt },
    "total-byte-weight": { numericValue: bytes },
    "render-blocking-insight": blocking(rb),
  },
});

// Three runs per page. acasa LCP is 3000 / 2500 / 4000, so the median is 3000.
// Render-blocking: acasa 850 / 820 / 900 (median 850); meniu 0 / 0 / 120, a passing
// insight (median 0); rezervare "notApplicable" in every run, read as 0.
const lighthouse = {
  acasa: [
    lhr({ perf: 0.42, a11y: 0.81, seo: 0.67, bp: 0.74, lcp: 3000, cls: 0.21, tbt: 410, bytes: 2400000, rb: 850 }),
    lhr({ perf: 0.55, a11y: 0.81, seo: 0.67, bp: 0.74, lcp: 2500, cls: 0.18, tbt: 350, bytes: 2400100, rb: 820 }),
    lhr({ perf: 0.48, a11y: 0.81, seo: 0.67, bp: 0.74, lcp: 4000, cls: 0.25, tbt: 520, bytes: 2399900, rb: 900 }),
  ],
  meniu: [
    lhr({ perf: 0.6, a11y: 0.79, seo: 0.7, bp: 0.78, lcp: 2000, cls: 0.05, tbt: 200, bytes: 3100000, rb: 0 }),
    lhr({ perf: 0.62, a11y: 0.79, seo: 0.7, bp: 0.78, lcp: 2200, cls: 0.06, tbt: 210, bytes: 3100000, rb: 0 }),
    lhr({ perf: 0.61, a11y: 0.79, seo: 0.7, bp: 0.78, lcp: 2100, cls: 0.04, tbt: 190, bytes: 3100000, rb: 120 }),
  ],
  rezervare: [
    lhr({ perf: 0.7, a11y: 0.75, seo: 0.67, bp: 0.74, lcp: 1800, cls: 0, tbt: 100, bytes: 900000, rb: "n/a" }),
    lhr({ perf: 0.72, a11y: 0.75, seo: 0.67, bp: 0.74, lcp: 1900, cls: 0, tbt: 110, bytes: 900000, rb: "n/a" }),
    lhr({ perf: 0.71, a11y: 0.75, seo: 0.67, bp: 0.74, lcp: 1700, cls: 0, tbt: 90, bytes: 900000, rb: "n/a" }),
  ],
};

const t = (projectName, status) => ({
  projectName,
  status,
  expectedStatus: status === "skipped" ? "skipped" : "passed",
  results: status === "skipped" ? [] : [{ status: status === "unexpected" ? "failed" : "passed", retry: 0 }],
});

// 4 passed, 2 failed, 1 skipped.
const playwright = {
  config: {},
  suites: [
    {
      title: "axe.spec.ts",
      file: "axe.spec.ts",
      specs: [
        {
          title: "acasa: no accessibility violations",
          file: "axe.spec.ts",
          tests: [t("iphone-15", "unexpected"), t("pixel-7", "unexpected"), t("desktop", "expected")],
        },
      ],
    },
    {
      title: "reservation.spec.ts",
      file: "reservation.spec.ts",
      specs: [],
      suites: [
        {
          title: "rezervare",
          file: "reservation.spec.ts",
          specs: [
            {
              title: "accepts 0712 345 678",
              file: "reservation.spec.ts",
              tests: [t("desktop", "expected"), t("iphone-15", "skipped")],
            },
          ],
        },
      ],
    },
    {
      title: "csp.spec.ts",
      file: "csp.spec.ts",
      specs: [
        {
          title: "no CSP violations",
          file: "csp.spec.ts",
          tests: [t("desktop", "expected"), t("pixel-7", "expected")],
        },
      ],
    },
  ],
  errors: [],
  stats: { startTime: "2026-12-01T10:01:00.000Z", duration: 60000, expected: 4, skipped: 1, unexpected: 2, flaky: 0 },
};

const v = (id) => ({ id, impact: "serious", help: id, nodes: [{ target: ["x"] }] });
const axeResult = (violations) => ({ url, timestamp: "2026-12-01T10:02:00.000Z", violations, passes: [], incomplete: [], inapplicable: [] });
// acasa: 5 violations over 3 projects, 3 distinct rules (color-contrast repeats).
const axe = {
  acasa: {
    "iphone-15": [v("image-alt"), v("color-contrast")],
    "pixel-7": [v("color-contrast")],
    desktop: [v("html-lang-valid"), v("color-contrast")],
  },
  meniu: { "iphone-15": [v("image-alt")], "pixel-7": [], desktop: [] },
  rezervare: { "iphone-15": [], "pixel-7": [], desktop: [] },
};

const shell = {
  title: "Home",
  description: null,
  h1Count: 0,
  lang: "en",
  canonical: null,
  robots: "noindex",
  jsonLd: { types: [], fields: [], parseErrors: 0 },
  words: 4,
};
const seoHtml = {
  acasa: shell,
  meniu: { ...shell, title: "Meniu", jsonLd: { types: ["Restaurant"], fields: ["name", "url"], parseErrors: 0 } },
  rezervare: shell,
};

// acasa has a CSP with frame-ancestors but no X-Frame-Options: 4 of 6 present.
const headers = {
  acasa: {
    "content-security-policy": "default-src 'self'; frame-ancestors 'none'",
    "strict-transport-security": "max-age=31536000",
    "x-content-type-options": "nosniff",
    "x-frame-options": null,
    "referrer-policy": null,
    "permissions-policy": null,
    "x-robots-tag": "noindex",
    "access-control-allow-origin": "*",
    frameAncestors: true,
  },
  meniu: {
    "content-security-policy": null,
    "strict-transport-security": "max-age=31536000",
    "x-content-type-options": null,
    "x-frame-options": null,
    "referrer-policy": null,
    "permissions-policy": null,
    "x-robots-tag": "noindex",
    "access-control-allow-origin": null,
    frameAncestors: false,
  },
  rezervare: {
    "content-security-policy": null,
    "strict-transport-security": null,
    "x-content-type-options": null,
    "x-frame-options": null,
    "referrer-policy": null,
    "permissions-policy": null,
    "x-robots-tag": "noindex",
    "access-control-allow-origin": null,
    frameAncestors: false,
  },
};

const observatory = {
  id: 1,
  details_url: "https://developer.mozilla.org/en-US/observatory/analyze?host=pizza-mita-inainte.pages.dev",
  algorithm_version: 4,
  scanned_at: "2026-12-01T10:15:00.000Z",
  error: null,
  grade: "D",
  score: 30,
  status_code: 200,
  tests_failed: 5,
  tests_passed: 5,
  tests_quantity: 10,
};

// The 200 /.git/config is the SPA fallback (exposed: false), so it must not be listed.
const exposure = [
  { path: "/assets/index-abc.js.map", status: 200, contentType: "application/json", bytes: 1234, exposed: true },
  { path: "/.git/config", status: 200, contentType: "text/html", bytes: 500, exposed: false },
  { path: "/.env", status: 404, contentType: "text/plain", bytes: 9, exposed: false },
];

const npmAudit = {
  auditReportVersion: 2,
  vulnerabilities: {},
  metadata: {
    vulnerabilities: { info: 0, low: 1, moderate: 2, high: 0, critical: 0, total: 3 },
    dependencies: { prod: 10, dev: 20, optional: 0, peer: 0, peerOptional: 0, total: 30 },
  },
};

// 4 checked: one 404 and one 0 (could not connect) are broken.
const links = [
  { url: `${url}/`, status: 200, parent: null },
  { url: `${url}/meniu`, status: 200, parent: `${url}/` },
  { url: `${url}/poze/lipsa.jpg`, status: 404, parent: `${url}/meniu` },
  { url: `${url}/rezervare`, status: 0, parent: `${url}/` },
];

function writeRun(dir, { withObservatory }) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
  for (const [page, runs] of Object.entries(lighthouse)) {
    runs.forEach((r, i) => writeRaw(dir, `lighthouse-${page}-${i + 1}`, r));
  }
  writeRaw(dir, "playwright", playwright);
  for (const [page, byProject] of Object.entries(axe)) {
    for (const [project, violations] of Object.entries(byProject)) {
      writeRaw(dir, `axe-${page}-${project}`, axeResult(violations));
    }
  }
  writeRaw(dir, "seo-html", seoHtml);
  writeRaw(dir, "links", links);
  writeRaw(dir, "headers", headers);
  if (withObservatory) writeRaw(dir, "observatory", observatory);
  writeRaw(dir, "exposure", exposure);
  writeRaw(dir, "npm-audit", npmAudit);
}

writeRun(join(here, "run-complete"), { withObservatory: true });
writeRun(join(here, "run-missing-observatory"), { withObservatory: false });
console.log("fixtures written");
