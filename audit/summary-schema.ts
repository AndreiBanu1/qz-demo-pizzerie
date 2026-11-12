// The shape of <run>/summary.json, written by audit/summarize.mjs.
// summary.json is the only data source for the published audit report, so every
// value here is read from a raw tool output file of the same run.

export type PageId = "acasa" | "meniu" | "rezervare";

/** The return value of inspectHtml() in audit/checks/seo-html.mjs. */
export type InspectHtmlResult = {
  title: string | null;
  description: string | null;
  h1Count: number;
  lang: string | null;
  canonical: string | null;
  robots: string | null;
  jsonLd: { types: string[]; fields: string[]; parseErrors: number };
  words: number;
};

/** One page's headerReport() from audit/checks/headers.mjs, as recorded. */
export type HeaderReport = Record<string, string | null> & { frameAncestors: boolean };

export type PageSummary = {
  /** Each value is median3 of the 3 Lighthouse runs. Scores are 0–100 integers. */
  lighthouse: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
    lcpMs: number;
    cls: number;
    tbtMs: number;
    bytes: number;
    /** render-blocking-insight's estimated saving in ms; 0 when Lighthouse reports nothing render-blocking. */
    renderBlockingMs: number;
  };
  /** violations: summed over the 3 Playwright projects. rules: sorted, deduplicated rule ids. */
  axe: { violations: number; rules: string[] };
  seo: InspectHtmlResult & { restaurantFieldsMissing: string[] };
  headers: HeaderReport;
};

export type Summary = {
  runId: string;
  target: "before" | "after";
  url: string;
  startedAt: string;
  version: { commit: string; branch: string; builtAt: string };
  tools: Record<string, string>;
  pages: Record<PageId, PageSummary>;
  /**
   * total = passed + failed. Skipped tests are neither: they are counted in
   * `skipped` (an addition to the plan's type) so the report can say how many
   * tests did not run instead of folding them silently into the pass count.
   */
  qa: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    /** title = spec file › describe titles › test title. */
    failures: { title: string; project: string }[];
  };
  security: {
    observatory: { grade: string; score: number };
    /** Of the 6 SECURITY_HEADERS on "/"; x-frame-options also counts when the CSP has frame-ancestors. */
    headersPresent: number;
    /** Only the exposure entries marked exposed (R8): 200, not the SPA fallback, and a .map that parses as JSON. */
    exposed: { path: string; status: number }[];
    npmAudit: { critical: number; high: number; moderate: number; low: number };
  };
  /**
   * broken = status >= 400 or status 0 (could not connect).
   * parent is null for the start page, which linkinator reports with no parent
   * (the plan's type said string).
   */
  links: { checked: number; broken: { url: string; status: number; parent: string | null }[] };
};
