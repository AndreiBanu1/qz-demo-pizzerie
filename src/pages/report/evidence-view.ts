// Turns a finding's evidence key into a label and its before and after values, read from the summaries.
import { isIndexKey, stillPresentInAfter } from "../../../audit/findings";
import type { Summary } from "../../../audit/summary-schema";
import type { ReportCopy, Lang } from "./copy";
import { getEvidence } from "./data";
import { formatValue } from "./format";
import { lighthouseUnit } from "./metrics";

export type EvidenceRow = { keys: string[]; label: string; before: string; after: string };

type PageName = keyof ReportCopy["evidence"]["page"];

/** An axe rule id in plain words: "poze fără descriere text", or with `withId` "poze fără descriere text (image-alt)". */
export function axeRuleName(id: string, c: ReportCopy, withId = false): string {
  const plainName = c.evidence.axeRuleNames[id];
  if (!plainName) return id;
  return withId ? `${plainName} (${id})` : plainName;
}

function plain(v: unknown, c: ReportCopy): string {
  if (v === null || v === undefined) return c.evidence.missing;
  if (typeof v === "boolean") return v ? c.evidence.yes : c.evidence.no;
  if (Array.isArray(v)) return v.length ? v.join(", ") : c.evidence.none;
  if (typeof v === "string") return v === "" ? c.evidence.missing : v;
  return String(v);
}

function label(key: string, c: ReportCopy): string {
  const e = c.evidence;
  const m = /^pages\.(\w+)\.(lighthouse|axe|seo|headers)\.(.+)$/.exec(key);
  if (m) {
    const [, page, group, field] = m;
    const pageName = e.page[page as PageName] ?? page;
    let what: string;
    if (group === "lighthouse") {
      const name = c.scorecard.lighthouseRows[field as keyof ReportCopy["scorecard"]["lighthouseRows"]] ?? field;
      what = e.lighthouse({ metric: name });
    } else if (group === "axe") what = field === "rules" ? e.axeRules : e.axeViolations;
    else if (group === "seo") what = e.seo[field] ?? field;
    else what = field === "frameAncestors" ? e.frameAncestors : e.header({ name: field });
    return `${pageName}: ${what}`;
  }
  if (key.startsWith("qa.failures.")) return e.failedTest;
  if (/^security\.exposed\.\d+\.path$/.test(key)) return e.exposedPath;
  if (/^security\.exposed\.\d+\.status$/.test(key)) return e.exposedStatus;
  const npm = /^security\.npmAudit\.(critical|high|moderate|low)$/.exec(key);
  if (npm) return e.npmAudit({ level: e.npmLevels[npm[1] as keyof typeof e.npmLevels] });
  const fixed: Record<string, string> = {
    "security.observatory.grade": e.observatoryGrade,
    "security.observatory.score": e.observatoryScore,
    "security.headersPresent": e.headersPresent,
    "links.checked": e.linksChecked,
  };
  return fixed[key] ?? key;
}

function value(summary: Summary, key: string, c: ReportCopy, lang: Lang): string {
  const v = getEvidence(summary, key);
  const lh = /^pages\.\w+\.lighthouse\.(\w+)$/.exec(key);
  if (lh && typeof v === "number") return formatValue(v, lighthouseUnit(lh[1]).unit, lang);
  // axe rule ids in plain words, with the id kept so the raw file can be matched.
  if (/\.axe\.rules$/.test(key) && Array.isArray(v) && v.length) return v.map((id) => axeRuleName(id, c, true)).join("; ");
  if (key.startsWith("qa.failures.") && v && typeof v === "object") {
    const { title, project } = v as { title: string; project: string };
    return `${title} · ${c.evidence.device[project] ?? project}`;
  }
  return plain(v, c);
}

/**
 * Scalar keys are read from both summaries. Index keys (qa.failures.N, security.exposed.N…) only exist in
 * the before summary; in the after one the same test or file is looked up by identity.
 */
export function evidenceRow(key: string, before: Summary, after: Summary, c: ReportCopy, lang: Lang): EvidenceRow {
  const b = value(before, key, c, lang);
  let a: string;
  if (isIndexKey(key)) {
    const still = stillPresentInAfter(before, after, key);
    a = key.startsWith("qa.failures.")
      ? still
        ? c.evidence.stillFails
        : c.evidence.passesNow
      : still
        ? c.evidence.stillThere
        : c.evidence.goneNow;
  } else a = value(after, key, c, lang);
  return { keys: [key], label: label(key, c), before: b, after: a };
}

/**
 * The evidence of one finding, in order. Failed Playwright tests that differ only by device are shown as
 * one row ("title · iPhone 15, Pixel 7"), keeping every key; the after value says which still fail, if any.
 */
export function evidenceRows(keys: string[], before: Summary, after: Summary, c: ReportCopy, lang: Lang): EvidenceRow[] {
  const rows: EvidenceRow[] = [];
  const tests = new Map<string, { row: EvidenceRow; devices: string[]; failing: string[] }>();
  for (const key of keys) {
    const v = key.startsWith("qa.failures.") ? (getEvidence(before, key) as { title?: string; project?: string } | null) : null;
    if (!v?.title || !v.project) {
      rows.push(evidenceRow(key, before, after, c, lang));
      continue;
    }
    const device = c.evidence.device[v.project] ?? v.project;
    const still = stillPresentInAfter(before, after, key);
    const group = tests.get(v.title);
    if (group) {
      group.row.keys.push(key);
      group.devices.push(device);
      if (still) group.failing.push(device);
    } else {
      const row: EvidenceRow = { keys: [key], label: c.evidence.failedTest, before: "", after: "" };
      tests.set(v.title, { row, devices: [device], failing: still ? [device] : [] });
      rows.push(row);
    }
  }
  for (const [title, { row, devices, failing }] of tests) {
    row.before = `${title} · ${devices.join(", ")}`;
    row.after = failing.length ? `${c.evidence.stillFails} · ${failing.join(", ")}` : c.evidence.passesNow;
  }
  return rows;
}
