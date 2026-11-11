// The audit findings, hand-written after the first run of the weak site.
// Each finding points at evidence keys in that run's summary.json; the published
// report fails to build when validateFindings() returns anything.
import type { PageId, Summary } from "./summary-schema";
import { getEvidence } from "./summarize.mjs";

export type Severity = "critica" | "mare" | "medie" | "mica";
export type Area = "speed" | "accessibility" | "qa" | "seo" | "security";

type Copy = { title: string; what: string; why: string; fix: string };

export type Finding = {
  id: `F-${string}`;
  severity: Severity;
  area: Area;
  pages: PageId[] | "all";
  planted: `P-${string}` | null;
  /** getEvidence keys, at least one. */
  evidence: string[];
  /** Raw file names in the run dir, e.g. "lighthouse-meniu-2.json.gz". */
  evidenceFiles: string[];
  screenshots: string[];
  /** Filled in Phase C. */
  fixCommit: string | null;
  wontFix: { ro: string; en: string } | null;
  text: { ro: Copy; en: Copy };
};

export const findings: Finding[] = [];

const SEVERITIES: readonly string[] = ["critica", "mare", "medie", "mica"];
const ID_PATTERN = /^F-\d{2}$/;
const CEDILLA = /[şţŞŢ]/;
const COPY_FIELDS = ["title", "what", "why", "fix"] as const;

/** Returns one message per problem, each containing the finding id. [] means valid. */
export function validateFindings(findings: Finding[], before: Summary, planted: { id: string }[]): string[] {
  const out: string[] = [];
  const plantedIds = new Set(planted.map((p) => p.id));
  const seen = new Set<string>();

  for (const f of findings) {
    const id = f.id;
    if (!ID_PATTERN.test(id)) out.push(`${id}: id must match F-NN (two digits)`);
    if (seen.has(id)) out.push(`${id}: duplicate id`);
    seen.add(id);

    if (!SEVERITIES.includes(f.severity)) out.push(`${id}: invalid severity "${f.severity}"`);

    if (f.evidence.length === 0) out.push(`${id}: no evidence (at least one key is required)`);
    for (const key of f.evidence) {
      try {
        getEvidence(before, key);
      } catch (e) {
        out.push(`${id}: unknown evidence key ${key} (${e instanceof Error ? e.message : String(e)})`);
      }
    }

    if (f.planted !== null && !plantedIds.has(f.planted)) {
      out.push(`${id}: planted id ${f.planted} is not in the answer key`);
    }

    for (const lang of ["ro", "en"] as const) {
      for (const field of COPY_FIELDS) {
        const value = f.text[lang][field];
        if (value.trim() === "") out.push(`${id}: text.${lang}.${field} is empty`);
        else if (lang === "ro" && CEDILLA.test(value)) {
          out.push(`${id}: text.ro.${field} uses cedilla diacritics (ş/ţ); use comma-below (ș/ț)`);
        }
      }
    }

    if (f.wontFix !== null) {
      for (const lang of ["ro", "en"] as const) {
        if (f.wontFix[lang].trim() === "") out.push(`${id}: wontFix.${lang} is empty`);
      }
    }
  }
  return out;
}
