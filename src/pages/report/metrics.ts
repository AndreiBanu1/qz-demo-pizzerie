// What the scorecard compares, and the derived counts it needs. Every value is read from a summary.
import type { PageId, PageSummary, Summary } from "../../../audit/summary-schema";
import { num } from "./data";
import type { Unit } from "./format";

export const PAGES: readonly PageId[] = ["acasa", "meniu", "rezervare"];

type LighthouseMetric = keyof PageSummary["lighthouse"];

/** How each Lighthouse metric is shown. A metric missing here fails the build, so none is left out silently. */
const LIGHTHOUSE: Record<LighthouseMetric, { unit: Unit; higherIsBetter: boolean }> = {
  performance: { unit: "score", higherIsBetter: true },
  accessibility: { unit: "score", higherIsBetter: true },
  seo: { unit: "score", higherIsBetter: true },
  bestPractices: { unit: "score", higherIsBetter: true },
  lcpMs: { unit: "seconds", higherIsBetter: false },
  cls: { unit: "cls", higherIsBetter: false },
  tbtMs: { unit: "ms10", higherIsBetter: false },
  bytes: { unit: "bytes", higherIsBetter: false },
  renderBlockingMs: { unit: "ms", higherIsBetter: false },
};

export function lighthouseUnit(metric: string): { unit: Unit; higherIsBetter: boolean } {
  const spec = LIGHTHOUSE[metric as LighthouseMetric];
  if (!spec) throw new Error(`report: no display rule for Lighthouse metric "${metric}"`);
  return spec;
}

/** Every metric the summary has, in the summary's own order. */
export function lighthouseMetrics(summary: Summary): LighthouseMetric[] {
  const metrics = Object.keys(summary.pages.acasa.lighthouse) as LighthouseMetric[];
  for (const m of metrics) lighthouseUnit(m);
  return metrics;
}

/**
 * The six headers summary.security.headersPresent counts (audit/checks/headers.mjs SECURITY_HEADERS;
 * audit/report-claims.test.ts keeps the two lists equal). x-frame-options also counts when the CSP has frame-ancestors.
 */
export const SECURITY_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
] as const;

/** Security headers missing on the home page, the page headersPresent is measured on. */
export function missingHeaders(summary: Summary): string[] {
  const h = summary.pages.acasa.headers;
  return SECURITY_HEADERS.filter((name) => h[name] === null && !(name === "x-frame-options" && h.frameAncestors));
}

/** Pages that must carry the Restaurant structured data (spec §4.3). */
const JSON_LD_PAGES: readonly PageId[] = ["acasa", "meniu"];

/**
 * The report's own SEO checks over the no-JS HTML, per page: a title of its own (present and unique),
 * a description, exactly one H1, lang "ro", a canonical link and words in the raw HTML; plus a complete,
 * parseable Restaurant block on the pages that need one.
 */
export function seoChecks(summary: Summary): { passed: number; total: number } {
  const titles = PAGES.map((p) => summary.pages[p].seo.title);
  const results: boolean[] = [];
  for (const p of PAGES) {
    const s = summary.pages[p].seo;
    results.push(
      !!s.title && titles.filter((t) => t === s.title).length === 1,
      !!s.description,
      s.h1Count === 1,
      s.lang === "ro",
      !!s.canonical,
      s.words > 0,
    );
    if (JSON_LD_PAGES.includes(p)) {
      results.push(s.jsonLd.parseErrors === 0 && s.jsonLd.types.includes("Restaurant") && s.restaurantFieldsMissing.length === 0);
    }
  }
  return { passed: results.filter(Boolean).length, total: results.length };
}

/** axe violations summed over the pages (each page's figure is already summed over the three devices). */
export function axeTotal(summary: Summary): number {
  return PAGES.reduce((sum, p) => sum + num(summary, `pages.${p}.axe.violations`), 0);
}

export function npmAuditTotal(summary: Summary): number {
  return (["critical", "high", "moderate", "low"] as const).reduce((s, k) => s + num(summary, `security.npmAudit.${k}`), 0);
}
