// Spec §8 part 2: before, after and the computed difference, side by side.
import type { Finding } from "../../../audit/findings";
import type { Summary } from "../../../audit/summary-schema";
import { copy, type Lang } from "./copy";
import { after, before, findings, getEvidence, num, str } from "./data";
import { direction, formatDiff, formatValue, gradeDirection, type Direction, type Unit } from "./format";
import { PAGES, SECURITY_HEADERS, lighthouseMetrics, lighthouseUnit, missingHeaders, npmAuditTotal, seoChecks } from "./metrics";
import { directionClass, unbroken } from "./parts";

/** `dir` null: a change that is neither better nor worse in itself, shown without a word. */
type Row = { id: string; label: string; note?: string; before: string; after: string; diff: string; dir: Direction | null };

/** A finding chosen by what its evidence points at, so notes cite the right id without typing it. */
function findingWith(test: (key: string) => boolean): Finding | undefined {
  return findings.find((f) => f.evidence.some(test));
}
const failedTestKey = (prefix: string) => (key: string) => {
  if (!key.startsWith("qa.failures.")) return false;
  const v = getEvidence(before, key) as { title?: string } | null;
  return typeof v?.title === "string" && v.title.startsWith(prefix);
};

function numericRow(id: string, label: string, b: number, a: number, unit: Unit, higherIsBetter: boolean, lang: Lang, note?: string): Row {
  const diff = a - b;
  return {
    id,
    label,
    note,
    before: formatValue(b, unit, lang),
    after: formatValue(a, unit, lang),
    diff: formatDiff(diff, unit, lang),
    dir: direction(diff, unit, lang, higherIsBetter),
  };
}

function pageRows(page: (typeof PAGES)[number], lang: Lang): Row[] {
  const c = copy[lang].scorecard;
  const noindex = findingWith((k) => k.endsWith(".seo.robots") || k.endsWith(".x-robots-tag"));
  const notFound = findingWith(failedTestKey("not-found.spec.ts"));
  const rows = lighthouseMetrics(before).map((m) => {
    const key = `pages.${page}.lighthouse.${m}`;
    const b = num(before, key);
    const a = num(after, key);
    const { unit, higherIsBetter } = lighthouseUnit(m);
    let note: string | undefined;
    // Both notes are checked against the raw Lighthouse files in audit/report-claims.test.ts.
    if (m === "seo" && a < 100 && noindex?.status === "wont-fix") note = c.notes.seo({ id: unbroken(noindex.id) });
    if (m === "bestPractices" && a < b && notFound) note = c.notes.bestPractices({ id: unbroken(notFound.id) });
    return numericRow(key, c.lighthouseRows[m], b, a, unit, higherIsBetter, lang, note);
  });
  const axeKey = `pages.${page}.axe.violations`;
  rows.push(numericRow(axeKey, c.axeRow, num(before, axeKey), num(after, axeKey), "count", false, lang));
  return rows;
}

function siteRows(lang: Lang): Row[] {
  const c = copy[lang].scorecard;
  const out = (s: Summary, a: number) => c.outOf({ a: String(a), b: String(s.qa.total) });
  const qaDiff = after.qa.passed - before.qa.passed;
  const gradeB = str(before, "security.observatory.grade");
  const gradeA = str(after, "security.observatory.grade");
  const gradeDir = gradeDirection(gradeB, gradeA);
  const headersOf = (s: Summary) => c.outOf({ a: String(num(s, "security.headersPresent")), b: String(SECURITY_HEADERS.length) });
  const headersDiff = num(after, "security.headersPresent") - num(before, "security.headersPresent");
  const missing = missingHeaders(after);
  const seoB = seoChecks(before);
  const seoA = seoChecks(after);
  const seoOf = (r: { passed: number; total: number }) => c.outOf({ a: String(r.passed), b: String(r.total) });
  const emptyPages = findingWith((k) => k === "links.checked");
  const brokenLink = findingWith(failedTestKey("links.spec.ts"));

  return [
    {
      id: "qa",
      label: c.rows.qa,
      before: out(before, num(before, "qa.passed")),
      after: out(after, num(after, "qa.passed")),
      diff: formatDiff(qaDiff, "count", lang),
      dir: direction(qaDiff, "count", lang, true),
    },
    { id: "obs-grade", label: c.rows.observatoryGrade, before: gradeB, after: gradeA, diff: c.direction[gradeDir], dir: gradeDir },
    numericRow(
      "obs-score",
      c.rows.observatoryScore,
      num(before, "security.observatory.score"),
      num(after, "security.observatory.score"),
      "count",
      true,
      lang,
      c.notes.observatoryScore,
    ),
    {
      id: "headers",
      label: c.rows.headers,
      note: missing.length
        ? c.notes.headersMissing({ names: missing.map((h) => copy[lang].evidence.headerNames[h] ?? h).join("; ") })
        : undefined,
      before: headersOf(before),
      after: headersOf(after),
      diff: formatDiff(headersDiff, "count", lang),
      dir: direction(headersDiff, "count", lang, true),
    },
    numericRow("exposed", c.rows.exposed, before.security.exposed.length, after.security.exposed.length, "count", false, lang),
    numericRow("npm-audit", c.rows.npmAudit, npmAuditTotal(before), npmAuditTotal(after), "count", false, lang),
    {
      id: "seo-checks",
      label: c.rows.seoChecks,
      note: c.notes.seoChecks,
      before: seoOf(seoB),
      after: seoOf(seoA),
      diff: formatDiff(seoA.passed - seoB.passed, "count", lang),
      dir: direction(seoA.passed - seoB.passed, "count", lang, true),
    },
    {
      ...numericRow("links-checked", c.rows.linksChecked, num(before, "links.checked"), num(after, "links.checked"), "count", true, lang),
      // linkinator is named here for the first time, so the note always explains it.
      note: [
        c.notes.linkinator,
        emptyPages && num(before, "links.checked") < num(after, "links.checked") ? c.notes.linksChecked({ id: unbroken(emptyPages.id) }) : "",
      ]
        .filter(Boolean)
        .join(" "),
      // More addresses followed is not "better" in itself, so it gets no word.
      dir: null,
    },
    numericRow(
      "links-broken",
      c.rows.linksBroken,
      before.links.broken.length,
      after.links.broken.length,
      "count",
      false,
      lang,
      brokenLink && before.links.broken.length === 0 ? c.notes.linksBroken({ id: unbroken(brokenLink.id) }) : undefined,
    ),
  ];
}

function Rows({ rows, lang }: { rows: Row[]; lang: Lang }) {
  const words = copy[lang].scorecard.direction;
  return (
    <>
      {rows.map((r) => (
        <tr key={r.id} className="border-t border-ink/10 align-top">
          <th scope="row" className="py-2.5 pr-2 text-left font-medium">
            {r.label}
            {r.note && <span className="mt-1 block text-xs font-normal leading-snug text-muted">{r.note}</span>}
          </th>
          <td className="px-1 py-2.5 text-right tabular-nums">{r.before}</td>
          <td className="px-1 py-2.5 text-right font-semibold tabular-nums">{r.after}</td>
          <td className="py-2.5 pl-1 text-right tabular-nums">
            <span className={`font-semibold ${directionClass[r.dir ?? "same"]}`}>{r.diff}</span>
            {r.dir && r.id !== "obs-grade" && <span className="block text-xs text-muted">{words[r.dir]}</span>}
          </td>
        </tr>
      ))}
    </>
  );
}

export default function Scorecard({ lang }: { lang: Lang }) {
  const c = copy[lang].scorecard;
  const pageName = copy[lang].evidence.page;
  return (
    <table className="mt-6 w-full table-fixed border-collapse text-sm md:text-base">
      <caption className="sr-only">{c.caption}</caption>
      <colgroup>
        <col className="w-[40%]" />
        <col className="w-[19%]" />
        <col className="w-[19%]" />
        <col className="w-[22%]" />
      </colgroup>
      <thead>
        <tr className="text-xs uppercase tracking-wide text-muted">
          <th scope="col" className="pb-2 text-left font-semibold">
            {c.cols.what}
          </th>
          <th scope="col" className="px-1 pb-2 text-right font-semibold">
            {c.cols.before}
          </th>
          <th scope="col" className="px-1 pb-2 text-right font-semibold">
            {c.cols.after}
          </th>
          <th scope="col" className="pb-2 pl-1 text-right font-semibold">
            {c.cols.diff}
          </th>
        </tr>
      </thead>
      {PAGES.map((p) => (
        <tbody key={p}>
          <tr>
            <th colSpan={4} scope="rowgroup" className="pb-1 pt-6 text-left font-display text-xl font-semibold">
              {c.pageGroup({ page: pageName[p] })}
            </th>
          </tr>
          <Rows rows={pageRows(p, lang)} lang={lang} />
        </tbody>
      ))}
      <tbody>
        <tr>
          <th colSpan={4} scope="rowgroup" className="pb-1 pt-6 text-left font-display text-xl font-semibold">
            {c.siteGroup}
          </th>
        </tr>
        <Rows rows={siteRows(lang)} lang={lang} />
      </tbody>
    </table>
  );
}
