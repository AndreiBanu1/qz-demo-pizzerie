// The report's data: the summaries named in audit/report-run.json, the findings and the answer key.
// Nothing here is typed by hand; every number on the report pages is read from these.
import { findings, validateFindings } from "../../../audit/findings";
import { getEvidence } from "../../../audit/evidence.mjs";
import planted from "../../../audit/planted-issues.json";
import reportRun from "../../../audit/report-run.json";
import type { Summary } from "../../../audit/summary-schema";

// Not eager: each run's summary.json becomes its own small chunk, and only the two named in
// report-run.json are fetched. loadSummaries() must finish before anything reads `before` or `after`;
// loadReport() (ReportRoute.tsx) awaits it, for the prerender and for the browser alike.
const summaries = import.meta.glob<Summary>("/audit/runs/*/summary.json", { import: "default" });

async function summaryFor(runId: string): Promise<Summary> {
  const load = summaries[`/audit/runs/${runId}/summary.json`];
  if (!load) throw new Error(`report: audit/runs/${runId}/summary.json not found (named in audit/report-run.json)`);
  return load();
}

/** Set by loadSummaries(). Imports see the loaded values (ES module live bindings). */
export let before: Summary = undefined as unknown as Summary;
export let after: Summary = undefined as unknown as Summary;
/** An earlier run of the fixed site that `after` replaced, which the method section discloses; null when there is none. */
export let supersededAfter: Summary | null = null;

export async function loadSummaries(): Promise<void> {
  const superseded = (reportRun as { supersededAfter?: string }).supersededAfter;
  [before, after, supersededAfter] = await Promise.all([
    summaryFor(reportRun.before),
    summaryFor(reportRun.after),
    superseded ? summaryFor(superseded) : null,
  ]);
}

export { findings, getEvidence, planted };

/** Reads a number from a summary, so a missing key or a non-number fails loudly instead of showing a wrong figure. */
export function num(summary: Summary, key: string): number {
  const v = getEvidence(summary, key);
  if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(`report: ${key} in ${summary.runId} is not a number`);
  return v;
}

export function str(summary: Summary, key: string): string {
  const v = getEvidence(summary, key);
  if (typeof v !== "string") throw new Error(`report: ${key} in ${summary.runId} is not a string`);
  return v;
}

/** What validateFindings says about the published findings; the build fails unless it is empty. */
export function reportProblems(): string[] {
  return validateFindings(findings, before, planted, after);
}
