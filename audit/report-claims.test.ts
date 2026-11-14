// Claims the published report (src/pages/report) makes, checked against the report runs' raw files.
// Lives here, not in src/, because it reads the gzipped files with Node.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { beforeAll, describe, expect, it } from "vitest";
import { after, before, loadSummaries } from "../src/pages/report/data";
import { getEvidence } from "./evidence.mjs";
import { findings } from "./findings";
import { PAGES, SECURITY_HEADERS, missingHeaders } from "../src/pages/report/metrics";
import { SECURITY_HEADERS as AUDITED_HEADERS } from "./checks/headers.mjs";
import reportRun from "./report-run.json";
import type { Summary } from "./summary-schema";

// The report reads its summaries lazily, as on the page.
beforeAll(loadSummaries);

const runDir = (id: string) => join(import.meta.dirname, "runs", id);
type Lhr = {
  categories: Record<string, { auditRefs: { id: string; weight: number }[] }>;
  audits: Record<string, { score: number | null; details?: { items?: { sourceLocation?: { url?: string } }[] } }>;
};
const lhr = (id: string, page: string, n: number): Lhr =>
  JSON.parse(gunzipSync(readFileSync(join(runDir(id), `lighthouse-${page}-${n}.json.gz`))).toString("utf8"));
/** Audits that count towards a category and didn't fully pass. */
const failing = (l: Lhr, category: string) =>
  l.categories[category].auditRefs.filter((r) => r.weight > 0 && l.audits[r.id].score !== null && l.audits[r.id].score! < 1).map((r) => r.id);

describe("the report's security header list", () => {
  it("is the audit's list, and agrees with headersPresent in both runs", () => {
    expect([...SECURITY_HEADERS]).toEqual(AUDITED_HEADERS);
    for (const s of [before, after]) expect(SECURITY_HEADERS.length - missingHeaders(s).length).toBe(s.security.headersPresent);
    expect(missingHeaders(after)).toEqual(["strict-transport-security"]);
  });
});

describe("the scorecard notes are true for the after run's raw Lighthouse files", () => {
  for (const page of PAGES) {
    for (const n of [1, 2, 3]) {
      it(`${page} run ${n}: SEO loses points only on is-crawlable (the deliberate noindex)`, () => {
        expect(failing(lhr(reportRun.after, page, n), "seo")).toEqual(["is-crawlable"]);
      });

      // The scorecard's favicon note shows only while the after score is below the before score.
      it(`${page} run ${n}: best practices loses no points, or only on a console error for the missing favicon`, () => {
        const l = lhr(reportRun.after, page, n);
        const lost = failing(l, "best-practices");
        if (lost.length === 0) return;
        expect(lost).toEqual(["errors-in-console"]);
        const urls = (l.audits["errors-in-console"].details?.items ?? []).map((i) => i.sourceLocation?.url ?? "");
        expect(urls.length).toBeGreaterThan(0);
        for (const url of urls) expect(new URL(url).pathname).toBe("/favicon.ico");
      });

      it(`${page} run ${n}: before, best practices lost nothing (the favicon request got the SPA page)`, () => {
        expect(failing(lhr(reportRun.before, page, n), "best-practices")).toEqual([]);
      });
    }
  }
});

// R61: the finding texts are hand-written prose, and some quote measured figures from the before run.
// Each such figure is declared here against its evidence key(s) in the report's before summary, with the
// rounding the prose uses. The test fails when the prose holds a figure nobody declared, when a declared
// figure is missing from either language, or when the summary no longer gives that figure.
// Number words ("toate trei paginile", "trei dispozitive") are counts of pages and devices, not measurements.
type Declared = { id: string; figure: string; keys: string[]; rounding: string; value: (v: number[]) => string };
const n = (v: unknown) => Number(v);
const whole = (v: number[]) => String(Math.round(v[0]));
const FIGURES: Declared[] = [
  {
    id: "F-03",
    figure: "0",
    keys: ["pages.acasa.seo.words", "pages.meniu.seo.words", "pages.rezervare.seo.words"],
    rounding: "exact; the same on every page",
    value: (v) => (v.every((x) => x === v[0]) ? String(v[0]) : "differs by page"),
  },
  { id: "F-04", figure: "15", keys: ["pages.acasa.lighthouse.lcpMs"], rounding: "ms to whole seconds", value: (v) => String(Math.round(v[0] / 1000)) },
  { id: "F-04", figure: "23", keys: ["pages.meniu.lighthouse.bytes"], rounding: "bytes to whole MB (1 MB = 10^6 bytes)", value: (v) => String(Math.round(v[0] / 1e6)) },
  {
    id: "F-12",
    figure: "814",
    keys: ["pages.acasa.lighthouse.renderBlockingMs", "pages.meniu.lighthouse.renderBlockingMs", "pages.rezervare.lighthouse.renderBlockingMs"],
    rounding: "the lowest of the three pages, whole ms",
    value: (v) => String(Math.round(Math.min(...v))),
  },
  {
    id: "F-12",
    figure: "835",
    keys: ["pages.acasa.lighthouse.renderBlockingMs", "pages.meniu.lighthouse.renderBlockingMs", "pages.rezervare.lighthouse.renderBlockingMs"],
    rounding: "the highest of the three pages, whole ms",
    value: (v) => String(Math.round(Math.max(...v))),
  },
  { id: "F-15", figure: "55", keys: ["security.observatory.score"], rounding: "exact", value: whole },
  { id: "F-18", figure: "2", keys: ["security.npmAudit.critical"], rounding: "exact", value: whole },
  { id: "F-18", figure: "1", keys: ["security.npmAudit.high"], rounding: "exact", value: whole },
  { id: "F-18", figure: "3", keys: ["security.npmAudit.moderate"], rounding: "exact", value: whole },
];
/** Digits in the prose that are not measurements, with the reason. None today. */
const EXEMPT: { id: string; figure: string; reason: string }[] = [];
/** Measured values the prose quotes without digits. */
const WORDS: { id: string; text: { ro: string; en: string }; key: string; value: (v: unknown) => string }[] = [
  { id: "F-15", text: { ro: "nota C", en: "a C grade" }, key: "security.observatory.grade", value: (v) => `${v}` },
  { id: "F-06", text: { ro: "„Home”", en: "“Home”" }, key: "pages.acasa.seo.title", value: (v) => `${v}` },
];

const proseOf = (id: string, lang: "ro" | "en") => {
  const f = findings.find((x) => x.id === id)!;
  return [...Object.values(f.text[lang]), ...(f.wontFix ? [f.wontFix[lang]] : [])].join("\n");
};
const figuresIn = (text: string) => [...text.matchAll(/\d+(?:[.,]\d+)?/g)].map((m) => m[0]);
const values = (s: Summary, keys: string[]) => keys.map((k) => n(getEvidence(s, k)));

describe("measured figures in the finding texts (R61)", () => {
  for (const f of findings) {
    for (const lang of ["ro", "en"] as const) {
      it(`${f.id} ${lang}: every figure in the text is declared against the before summary`, () => {
        const undeclared = figuresIn(proseOf(f.id, lang)).filter(
          (fig) => !FIGURES.some((d) => d.id === f.id && d.figure === fig) && !EXEMPT.some((e) => e.id === f.id && e.figure === fig),
        );
        expect(undeclared).toEqual([]);
      });
    }
  }

  for (const d of FIGURES) {
    it(`${d.id} "${d.figure}" (${d.keys.join(", ")}, ${d.rounding}) matches ${reportRun.before} and is in both languages`, () => {
      expect(before.runId).toBe(reportRun.before);
      expect(d.value(values(before, d.keys))).toBe(d.figure);
      for (const lang of ["ro", "en"] as const) expect(figuresIn(proseOf(d.id, lang))).toContain(d.figure);
    });
  }

  for (const w of WORDS) {
    it(`${w.id} quotes ${w.key} as "${w.text.ro}" / "${w.text.en}", and the before summary agrees`, () => {
      const v = w.value(getEvidence(before, w.key));
      for (const lang of ["ro", "en"] as const) {
        expect(proseOf(w.id, lang)).toContain(w.text[lang]);
        expect(w.text[lang]).toContain(v);
      }
    });
  }
});
