import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readRaw, writeRaw } from "./lib/run-dir.mjs";
import { getEvidence, summarize } from "./summarize.mjs";

const fixture = (name) => new URL(`./fixtures/${name}`, import.meta.url).pathname;

/** A writable copy of a committed fixture, so summary.json never lands in audit/fixtures. */
function copyOf(name) {
  const dir = mkdtempSync(join(tmpdir(), "summarize-"));
  cpSync(fixture(name), dir, { recursive: true });
  return dir;
}

describe("summarize on run-complete", () => {
  const dir = copyOf("run-complete");
  const s = summarize(dir);

  it("copies the run identity from meta.json", () => {
    expect(s.runId).toBe("2026-12-01-before");
    expect(s.target).toBe("before");
    expect(s.url).toBe("https://pizza-mita-inainte.pages.dev");
    expect(s.startedAt).toBe("2026-12-01T10:00:00.000Z");
    expect(s.version).toEqual({ commit: "abc1234", branch: "inainte", builtAt: "2026-11-30T09:00:00.000Z" });
    expect(s.tools.lighthouse).toBe("13.6.0");
  });

  it("takes the median of 3 Lighthouse runs per metric", () => {
    expect(s.pages.acasa.lighthouse).toEqual({
      performance: 48, accessibility: 81, seo: 67, bestPractices: 74,
      lcpMs: 3000, cls: 0.21, tbtMs: 410, bytes: 2400000, renderBlockingMs: 850,
    });
    expect(s.pages.meniu.lighthouse.performance).toBe(61);
    expect(s.pages.meniu.lighthouse.lcpMs).toBe(2100);
    expect(s.pages.rezervare.lighthouse.lcpMs).toBe(1800);
  });

  it("reads render-blocking time as 0 when the insight passes or is not applicable (R33)", () => {
    expect(s.pages.meniu.lighthouse.renderBlockingMs).toBe(0);
    expect(s.pages.rezervare.lighthouse.renderBlockingMs).toBe(0);
  });

  it("sums axe violations over projects and deduplicates rules", () => {
    expect(s.pages.acasa.axe).toEqual({ violations: 5, rules: ["color-contrast", "html-lang-valid", "image-alt"] });
    expect(s.pages.meniu.axe).toEqual({ violations: 1, rules: ["image-alt"] });
    expect(s.pages.rezervare.axe).toEqual({ violations: 0, rules: [] });
  });

  it("adds restaurantFieldsMissing to the seo-html result", () => {
    expect(s.pages.acasa.seo.title).toBe("Home");
    expect(s.pages.acasa.seo.restaurantFieldsMissing).toHaveLength(9);
    expect(s.pages.meniu.seo.restaurantFieldsMissing).not.toContain("name");
    expect(s.pages.meniu.seo.restaurantFieldsMissing).toHaveLength(7);
  });

  it("keeps each page's header report as recorded", () => {
    expect(s.pages.acasa.headers["access-control-allow-origin"]).toBe("*");
    expect(s.pages.acasa.headers.frameAncestors).toBe(true);
    expect(s.pages.meniu.headers["content-security-policy"]).toBeNull();
  });

  it("counts qa from the Playwright JSON, with skipped tests apart", () => {
    expect(s.qa.passed).toBe(4);
    expect(s.qa.failed).toBe(2);
    expect(s.qa.skipped).toBe(1);
    expect(s.qa.total).toBe(6);
    expect(s.qa.failures).toEqual([
      { title: "axe.spec.ts › acasa: no accessibility violations", project: "iphone-15" },
      { title: "axe.spec.ts › acasa: no accessibility violations", project: "pixel-7" },
    ]);
  });

  it("counts x-frame-options as present when the CSP has frame-ancestors", () => {
    // CSP, HSTS, X-Content-Type-Options, and X-Frame-Options via frame-ancestors.
    expect(s.security.headersPresent).toBe(4);
  });

  it("lists only exposed entries, and reads Observatory and npm audit", () => {
    expect(s.security.exposed).toEqual([{ path: "/assets/index-abc.js.map", status: 200 }]);
    expect(s.security.observatory).toEqual({ grade: "D", score: 30 });
    expect(s.security.npmAudit).toEqual({ critical: 0, high: 0, moderate: 2, low: 1 });
  });

  it("counts status 0 and >= 400 links as broken", () => {
    expect(s.links.checked).toBe(4);
    expect(s.links.broken).toEqual([
      { url: "https://pizza-mita-inainte.pages.dev/poze/lipsa.jpg", status: 404, parent: "https://pizza-mita-inainte.pages.dev/meniu" },
      { url: "https://pizza-mita-inainte.pages.dev/rezervare", status: 0, parent: "https://pizza-mita-inainte.pages.dev/" },
    ]);
  });

  it("writes summary.json equal to the returned object, with no temp file left", () => {
    expect(JSON.parse(readFileSync(join(dir, "summary.json"), "utf8"))).toEqual(s);
    expect(readdirSync(dir).filter((f) => f.includes("summary"))).toEqual(["summary.json"]);
  });
});

describe("summarize refuses an incomplete or invalid run", () => {
  it("throws for the missing Observatory file and writes no summary", () => {
    const dir = copyOf("run-missing-observatory");
    expect(() => summarize(dir)).toThrow("incomplete run: missing observatory.json.gz");
    expect(existsSync(join(dir, "summary.json"))).toBe(false);
  });

  it("throws when meta.json is missing", () => {
    const dir = copyOf("run-complete");
    rmSync(join(dir, "meta.json"));
    expect(() => summarize(dir)).toThrow("incomplete run: missing meta.json");
  });

  it("throws when meta.json records a failed step", () => {
    const dir = copyOf("run-complete");
    const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
    writeFileSync(join(dir, "meta.json"), JSON.stringify({ ...meta, failed: "checks/observatory.mjs: down" }));
    expect(() => summarize(dir)).toThrow(/incomplete run: .*observatory.mjs: down/);
  });

  it("throws on a non-finite Lighthouse metric, naming the file and metric, and writes no summary", () => {
    const dir = copyOf("run-complete");
    const lhr = readRaw(dir, "lighthouse-meniu-2");
    lhr.audits["largest-contentful-paint"].numericValue = null;
    writeRaw(dir, "lighthouse-meniu-2", lhr);
    expect(() => summarize(dir)).toThrow(/lighthouse-meniu-2\.json\.gz.*lcpMs/);
    expect(existsSync(join(dir, "summary.json"))).toBe(false);
    expect(readdirSync(dir).filter((f) => f.includes("summary"))).toEqual([]);
  });

  it("counts a not-applicable render-blocking run as 0 in the median (R33)", () => {
    const dir = copyOf("run-complete");
    for (const n of [1, 3]) {
      const lhr = readRaw(dir, `lighthouse-acasa-${n}`);
      lhr.audits["render-blocking-insight"] = { scoreDisplayMode: "notApplicable", score: null };
      writeRaw(dir, `lighthouse-acasa-${n}`, lhr);
    }
    expect(summarize(dir).pages.acasa.lighthouse.renderBlockingMs).toBe(0);
  });

  it("throws when the render-blocking audit is absent, errored or not in ms (R33)", () => {
    const cases = [
      undefined,
      { scoreDisplayMode: "error", score: null, errorMessage: "trace failed" },
      { scoreDisplayMode: "metricSavings", score: 0, numericValue: 1200, numericUnit: "byte" },
    ];
    for (const audit of cases) {
      const dir = copyOf("run-complete");
      const lhr = readRaw(dir, "lighthouse-rezervare-2");
      if (audit === undefined) delete lhr.audits["render-blocking-insight"];
      else lhr.audits["render-blocking-insight"] = audit;
      writeRaw(dir, "lighthouse-rezervare-2", lhr);
      expect(() => summarize(dir)).toThrow(/lighthouse-rezervare-2\.json\.gz.*renderBlockingMs/);
      expect(existsSync(join(dir, "summary.json"))).toBe(false);
    }
  });

  it("throws on a null category score instead of reading it as 0", () => {
    const dir = copyOf("run-complete");
    const lhr = readRaw(dir, "lighthouse-acasa-1");
    lhr.categories.performance.score = null;
    writeRaw(dir, "lighthouse-acasa-1", lhr);
    expect(() => summarize(dir)).toThrow(/lighthouse-acasa-1\.json\.gz.*performance/);
  });

  it("throws when the Playwright counts disagree with its own stats", () => {
    const dir = copyOf("run-complete");
    const pw = readRaw(dir, "playwright");
    pw.stats.unexpected = 3;
    writeRaw(dir, "playwright", pw);
    expect(() => summarize(dir)).toThrow(/playwright\.json\.gz/);
  });

  it("throws when the Playwright report has top-level errors", () => {
    const dir = copyOf("run-complete");
    const pw = readRaw(dir, "playwright");
    pw.errors = [{ message: "Error: cannot load reservation.spec.ts" }];
    writeRaw(dir, "playwright", pw);
    expect(() => summarize(dir)).toThrow(/cannot load reservation\.spec\.ts/);
  });

  it("throws when seo-html has no entry for an audited page", () => {
    const dir = copyOf("run-complete");
    const seo = readRaw(dir, "seo-html");
    delete seo.rezervare;
    writeRaw(dir, "seo-html", seo);
    expect(() => summarize(dir)).toThrow(/seo-html\.json\.gz.*rezervare/);
  });
});

describe("headersPresent", () => {
  it("does not count x-frame-options when the CSP has no frame-ancestors", () => {
    const dir = copyOf("run-complete");
    const h = readRaw(dir, "headers");
    h.acasa.frameAncestors = false;
    writeRaw(dir, "headers", h);
    expect(summarize(dir).security.headersPresent).toBe(3);
  });

  it("counts x-frame-options once when both it and frame-ancestors are present", () => {
    const dir = copyOf("run-complete");
    const h = readRaw(dir, "headers");
    h.acasa["x-frame-options"] = "DENY";
    writeRaw(dir, "headers", h);
    expect(summarize(dir).security.headersPresent).toBe(4);
  });
});

describe("getEvidence", () => {
  const s = summarize(copyOf("run-complete"));

  it("reads a dot path", () => {
    expect(getEvidence(s, "qa.failed")).toBe(2);
    expect(getEvidence(s, "pages.acasa.lighthouse.lcpMs")).toBe(3000);
  });

  it("throws for a missing segment", () => {
    expect(() => getEvidence(s, "pages.nope")).toThrow("unknown evidence key: pages.nope");
    expect(() => getEvidence(s, "qa.failed.deeper")).toThrow("unknown evidence key: qa.failed.deeper");
  });

  it("returns null for a value that is present but null", () => {
    expect(getEvidence(s, "pages.acasa.seo.description")).toBeNull();
    expect(getEvidence(s, "pages.acasa.headers.x-frame-options")).toBeNull();
  });

  it("throws, not returns null, for a path below a null value", () => {
    expect(() => getEvidence(s, "pages.acasa.seo.description.length")).toThrow("unknown evidence key");
  });
});
