// The report's data module, read through import.meta.glob exactly as the pages read it.
import { beforeAll, describe, expect, it } from "vitest";
import reportRun from "../../../audit/report-run.json";
import { after, before, loadSummaries, reportProblems } from "./data";
import { axeTotal, lighthouseMetrics, missingHeaders, seoChecks } from "./metrics";

// The report reads its summaries lazily, as on the page.
beforeAll(loadSummaries);

describe("report data", () => {
  it("reads the two runs named in report-run.json", () => {
    expect(before.runId).toBe(reportRun.before);
    expect(after.runId).toBe(reportRun.after);
    expect(before.target).toBe("before");
    expect(after.target).toBe("after");
  });

  it("validateFindings has nothing to say about the published findings", () => {
    expect(reportProblems()).toEqual([]);
  });

  it("knows how to show every Lighthouse metric the summaries have", () => {
    expect(() => lighthouseMetrics(before)).not.toThrow();
    expect(lighthouseMetrics(before)).toEqual(lighthouseMetrics(after));
  });

  it("finds only HSTS missing after the fixes", () => {
    expect(missingHeaders(after)).toEqual(["strict-transport-security"]);
  });

  it("runs its own SEO checks: none pass before, all pass after", () => {
    expect(seoChecks(before)).toEqual({ passed: 0, total: 20 });
    expect(seoChecks(after)).toEqual({ passed: 20, total: 20 });
  });

  it("sums axe violations over the pages", () => {
    expect(axeTotal(before)).toBe(12);
    expect(axeTotal(after)).toBe(0);
  });
});
