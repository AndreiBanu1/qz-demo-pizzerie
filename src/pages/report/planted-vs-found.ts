import type { Finding } from "../../../audit/findings";

export type PlantedVsFound = {
  caughtByTools: string[];
  caughtOnlyByQaOrManual: string[];
  /** Planted ids with no finding. Always shown in the report, never hidden. */
  notCaught: string[];
  /** Finding ids with no planted id: real problems nobody planted. */
  unplanted: string[];
};

/**
 * Findings caught only by the Playwright suite or by hand: every evidence key is under `qa.`,
 * or the only raw file is manual.md.
 */
export function qaOrManualOnly(findings: Finding[]): string[] {
  return findings
    .filter(
      (f) =>
        (f.evidence.length > 0 && f.evidence.every((k) => k.startsWith("qa."))) ||
        (f.evidenceFiles.length > 0 && f.evidenceFiles.every((file) => file === "manual.md")),
    )
    .map((f) => f.id);
}

/** Compares the answer key with the findings. A planted issue counts as caught by tools if any of its findings is not QA-only. */
export function plantedVsFound(planted: { id: string }[], findings: Finding[], qaOnlyIds: string[]): PlantedVsFound {
  const qaOnly = new Set(qaOnlyIds);
  const out: PlantedVsFound = { caughtByTools: [], caughtOnlyByQaOrManual: [], notCaught: [], unplanted: [] };
  for (const { id } of planted) {
    const mine = findings.filter((f) => f.planted === id);
    if (mine.length === 0) out.notCaught.push(id);
    else if (mine.every((f) => qaOnly.has(f.id))) out.caughtOnlyByQaOrManual.push(id);
    else out.caughtByTools.push(id);
  }
  out.unplanted = findings.filter((f) => f.planted === null).map((f) => f.id);
  return out;
}
