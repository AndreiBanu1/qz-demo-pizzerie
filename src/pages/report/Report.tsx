// The audit report, spec §8 in order: owner summary, scorecard, findings, planted vs found, method and limits.
// Loaded as its own chunk (ReportRoute.tsx), so the restaurant pages don't carry the audit data.
import type { Finding, Severity } from "../../../audit/findings";
import { Link } from "react-router-dom";
import { restaurant } from "../../content/restaurant";
import { pageMeta } from "../../lib/page-meta";
import { AREAS, areaStatus } from "./area-status";
import { copy, type Lang } from "./copy";
import { after, before, findings, num, str } from "./data";
import FindingCard, { rawUrl } from "./FindingCard";
import { formatRunDate, formatValue } from "./format";
import { PAGES, axeTotal } from "./metrics";
import { Badge, SectionTitle, colourClass, statusClass, tapLink, unbroken } from "./parts";
import PlantedVsFound from "./PlantedVsFound";
import Scorecard from "./Scorecard";

export { loadSummaries } from "./data";

const SEVERITY_ORDER: Severity[] = ["critica", "mare", "medie", "mica"];
const short = (sha: string) => sha.slice(0, 7);
/** The first sentence of a finding's fix, for the owner summary. */
const firstSentence = (text: string) => text.split(/(?<=[.!?])\s+/)[0];

/** The 3–5 problems that matter most: highest severity first, the deliberate won't-fix left out. */
function topFindings(): Finding[] {
  return findings
    .filter((f) => f.status !== "wont-fix")
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) || a.id.localeCompare(b.id))
    .slice(0, 5);
}

/** `sub` qualifies the figure and sits under it; `more` builds on the explanation and follows it. */
function Tile({ label, b, a, lang, sub, explain, more }: { label: string; b: string; a: string; lang: Lang; sub?: string; explain: string; more?: string }) {
  const c = copy[lang];
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
      <dt className="font-semibold">{label}</dt>
      <dd className="mt-2">
        <span className="flex items-end gap-3 font-display text-4xl font-semibold leading-none tabular-nums">
          <span className="flex flex-col">
            <span className="text-muted">{b}</span>
            <span className="mt-1 font-sans text-xs font-medium uppercase tracking-wide text-muted">{c.beforeWord}</span>
          </span>
          <span aria-hidden="true" className="pb-5 text-2xl text-muted">
            →
          </span>
          <span className="flex flex-col">
            <span className="text-ink">{a}</span>
            <span className="mt-1 font-sans text-xs font-medium uppercase tracking-wide text-muted">{c.afterWord}</span>
          </span>
        </span>
        {sub && <span className="mt-3 block text-sm">{sub}</span>}
        <span className="mt-2 block text-sm text-muted">{explain}</span>
        {more && <span className="mt-2 block text-sm">{more}</span>}
      </dd>
    </div>
  );
}

function OwnerSummary({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const s = c.summary;
  const count = (status: Finding["status"]) => findings.filter((f) => f.status === status).length;
  const stats = [
    { label: s.stats.found, n: findings.length },
    { label: s.stats.fixed, n: count("fixed") },
    { label: s.stats.partly, n: count("partly") },
    { label: s.stats.notFixed, n: count("not-fixed") },
    { label: s.stats.wontFix, n: count("wont-fix") },
  ].filter((x, i) => i === 0 || x.n > 0);

  const speedKey = "pages.meniu.lighthouse.performance";
  const speedB = num(before, speedKey);
  const weight = (x: typeof before) => formatValue(num(x, "pages.meniu.lighthouse.bytes"), "bytes", lang);
  const qaTotal = before.qa.total === after.qa.total ? s.tiles.qa.outOf({ total: String(before.qa.total) }) : undefined;

  return (
    <section id="summary" aria-labelledby="summary-title" className="mt-10">
      <SectionTitle id="summary-title">{s.heading}</SectionTitle>
      {/* Equal columns, so the tiles stay one even row at 390 px (three today, at most five). */}
      <dl className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(6.25rem,1fr))] gap-2 sm:gap-3">
        {stats.map((x) => (
          <div key={x.label} className="flex flex-col justify-between rounded-2xl bg-white px-3 py-3 shadow-sm ring-1 ring-ink/5 sm:px-4">
            <dt className="text-sm leading-snug text-muted">{x.label}</dt>
            <dd className="font-display text-3xl font-semibold tabular-nums">{x.n}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-8 text-2xl">{s.topHeading}</h3>
      <ol className="mt-3 space-y-3">
        {topFindings().map((f) => (
          <li key={f.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
            <Badge className={statusClass[f.status]}>{c.findings.status[f.status]}</Badge>
            <p className="mt-2 font-semibold">{f.text[lang].title}</p>
            <p className="mt-1 text-sm text-ink/85">{f.text[lang].why}</p>
            <p className="mt-1 text-sm text-ink/85">
              <span className="font-semibold">{s.fixLabel}</span> {firstSentence(f.text[lang].fix)}
            </p>
            <a href={`#${f.id}`} className={`${tapLink} -ml-3 text-sm`}>
              {s.details({ id: f.id })}
            </a>
          </li>
        ))}
      </ol>

      <h3 className="mt-8 text-2xl">{s.areasHeading}</h3>
      <table className="mt-3 w-full border-collapse text-sm md:text-base">
        <caption className="sr-only">{s.areasTable.caption}</caption>
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="pb-2 text-left font-semibold">
              {s.areasTable.area}
            </th>
            <th scope="col" className="px-1 pb-2 text-center font-semibold">
              {s.areasTable.before}
            </th>
            <th scope="col" className="pb-2 pl-1 text-center font-semibold">
              {s.areasTable.after}
            </th>
          </tr>
        </thead>
        <tbody>
          {AREAS.map((area) => {
            const b = areaStatus(findings, area, "before");
            const a = areaStatus(findings, area, "after");
            return (
              <tr key={area} className="border-t border-ink/10">
                <th scope="row" className="py-2.5 pr-2 text-left font-medium">
                  {c.areas[area].name}
                  <span className="block text-xs font-normal text-muted">{c.areas[area].about}</span>
                </th>
                <td className="px-1 py-2.5 text-center">
                  <Badge className={colourClass[b]}>{c.colours[b]}</Badge>
                </td>
                <td className="py-2.5 pl-1 text-center">
                  <Badge className={colourClass[a]}>{c.colours[a]}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {s.legend.map((p) => (
        <p key={p} className="mt-2 text-sm text-muted">
          {p}
        </p>
      ))}

      <h3 className="mt-8 text-2xl">{s.headlineHeading}</h3>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <Tile
          lang={lang}
          label={s.tiles.speed.label}
          b={String(speedB)}
          a={String(num(after, speedKey))}
          sub={s.tiles.speed.weight({ before: weight(before), after: weight(after) })}
          explain={s.tiles.speed.explain}
          more={speedB >= 90 ? s.tiles.speed.alreadyHigh : undefined}
        />
        <Tile
          lang={lang}
          label={s.tiles.qa.label}
          b={String(num(before, "qa.failed"))}
          a={String(num(after, "qa.failed"))}
          sub={qaTotal}
          explain={s.tiles.qa.explain}
        />
        <Tile
          lang={lang}
          label={s.tiles.observatory.label}
          b={str(before, "security.observatory.grade")}
          a={str(after, "security.observatory.grade")}
          explain={s.tiles.observatory.explain}
        />
        <Tile
          lang={lang}
          label={s.tiles.axe.label}
          b={String(axeTotal(before))}
          a={String(axeTotal(after))}
          sub={s.tiles.axe.scope}
          explain={s.tiles.axe.explain}
        />
      </dl>

      <nav aria-labelledby="toc-title" className="report-toc mt-8">
        <h3 id="toc-title" className="text-lg">
          {s.tocHeading}
        </h3>
        <ul className="mt-1 flex flex-wrap gap-x-2">
          {[
            ["#scorecard", c.scorecard.heading],
            ["#findings", c.findings.heading],
            ["#planted", c.planted.heading],
            ["#method", c.method.heading],
          ].map(([href, text]) => (
            <li key={href}>
              <a href={href} className={`${tapLink} -ml-3 mr-1`}>
                {text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

function Method({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const m = c.method;
  const findingNoindex = findings.find((f) => f.status === "wont-fix" && f.evidence.some((k) => k.endsWith(".seo.robots")));
  const runs = [
    { label: m.run.before, word: c.beforeWord, s: before },
    { label: m.run.after, word: c.afterWord, s: after },
  ];
  const sameTools = JSON.stringify(before.tools) === JSON.stringify(after.tools);
  const toolList = (tools: Record<string, string>) => (
    <ul className="mt-1 list-disc pl-5">
      {Object.entries(tools).map(([name, version]) => (
        <li key={name}>
          <span className="font-mono text-sm">{name}</span> {version}
        </li>
      ))}
    </ul>
  );
  const h3 = "mt-8 text-2xl";

  return (
    <section id="method" aria-labelledby="method-title" className="mt-16">
      <SectionTitle id="method-title">{m.heading}</SectionTitle>

      <h3 className={h3}>{m.runsHeading}</h3>
      <ul className="mt-2 space-y-4">
        {runs.map(({ label, s }) => (
          <li key={s.runId}>
            <p className="font-semibold">{label}</p>
            <p>{m.runLine({ date: formatRunDate(s.startedAt, c.months) })}</p>
            <p className="flex flex-wrap gap-x-6">
              <a href={s.url} className={`${tapLink} -ml-3 [overflow-wrap:anywhere]`}>
                {s.url.replace(/^https:\/\//, "")}
              </a>
              <a href={`${restaurant.repoUrl}/commit/${s.version.commit}`} className={`${tapLink} -ml-3 font-mono text-sm`}>
                {m.deployed({ sha: short(s.version.commit) })}
              </a>
            </p>
          </li>
        ))}
      </ul>

      <h3 className={h3}>{m.devicesHeading}</h3>
      <ul className="mt-2 list-disc space-y-2 pl-5">
        {m.devices.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>

      <h3 className={h3}>{m.toolsHeading}</h3>
      {sameTools ? (
        <>
          <p className="mt-2">{m.toolsSame}</p>
          {toolList(after.tools)}
        </>
      ) : (
        runs.map(({ label, s }) => (
          <div key={s.runId}>
            <p className="mt-2">{m.toolsPerRun({ run: label })}</p>
            {toolList(s.tools)}
          </div>
        ))
      )}
      <ul className="mt-2 list-disc pl-5">
        {m.toolsOnline.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>

      <h3 className={h3}>{m.limitsHeading}</h3>
      <ul className="mt-2 list-disc space-y-2 pl-5">
        <li>{m.limits.lab}</li>
        <li>{m.limits.median}</li>
        {findingNoindex && <li>{m.limits.noindex({ id: unbroken(findingNoindex.id) })}</li>}
        <li>{m.limits.manual}</li>
        <li>{m.limits.iphone}</li>
        <li>{m.limits.hsts}</li>
        <li>{m.limits.activeSecurity}</li>
        <li>{m.limits.notAudited}</li>
      </ul>

      <h3 className={h3}>{m.psiHeading}</h3>
      <p className="mt-2">{m.psiAbout}</p>
      <ul className="mt-1">
        {PAGES.map((p) => (
          <li key={p}>
            <a
              href={`https://pagespeed.web.dev/report?url=${encodeURIComponent(after.url + pageMeta[p].path)}`}
              className={`${tapLink} -ml-3`}
            >
              {m.psiLink({ page: c.evidence.page[p] })}
            </a>
          </li>
        ))}
      </ul>

      <h3 className={h3}>{m.rawHeading}</h3>
      <p className="mt-2">{m.rawAbout}</p>
      <ul className="mt-1">
        {runs.flatMap(({ word, s }) => [
          <li key={`${s.runId}-summary`}>
            <a href={rawUrl(s.runId, "summary.json")} className={`${tapLink} -ml-3`}>
              {m.rawSummary({ run: word })}
            </a>
          </li>,
          <li key={`${s.runId}-github`}>
            <a href={`${restaurant.repoUrl}/tree/main/audit/runs/${s.runId}`} className={`${tapLink} -ml-3`}>
              {m.rawGitHub({ run: word })}
            </a>
          </li>,
        ])}
      </ul>
    </section>
  );
}

export default function Report({ lang }: { lang: Lang }) {
  const c = copy[lang];
  return (
    <div className="report-root mx-auto max-w-3xl px-4 pb-4 pt-6 md:pt-10">
      <header>
        <p className="report-switch flex justify-end">
          <Link to={c.switchTo.path} hrefLang={c.switchTo.lang} lang={c.switchTo.lang} className={`${tapLink} -mr-3 text-sm`}>
            {c.switchTo.label}
          </Link>
        </p>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-tomato-dark">{c.kicker}</p>
        <h1 className="mt-2 text-5xl leading-[1.02] md:text-6xl">{c.h1}</h1>
        {c.lead.map((p) => (
          <p key={p} className="mt-4 text-lg text-ink/85">
            {p}
          </p>
        ))}
        <p className="mt-4 font-semibold">{c.checkYourself}</p>
        <ul className="flex flex-wrap gap-x-2">
          <li>
            <a href={before.url} className={`${tapLink} -ml-3 mr-1`}>
              {c.links.before}
            </a>
          </li>
          <li>
            <a href={after.url} className={`${tapLink} -ml-3 mr-1`}>
              {c.links.after}
            </a>
          </li>
          <li>
            <a href={restaurant.repoUrl} className={`${tapLink} -ml-3`}>
              {c.links.repo}
            </a>
          </li>
          <li>
            <a href={c.pdfHref} className={`${tapLink} -ml-3`}>
              {c.links.pdf}
            </a>
          </li>
        </ul>
      </header>

      <OwnerSummary lang={lang} />

      <section id="scorecard" aria-labelledby="scorecard-title" className="mt-16">
        <SectionTitle id="scorecard-title">{c.scorecard.heading}</SectionTitle>
        <p className="mt-4">
          {c.scorecard.intro({
            before: formatRunDate(before.startedAt, c.months),
            after: formatRunDate(after.startedAt, c.months),
          })}
        </p>
        <h3 className="mt-6 text-xl">{c.scorecard.termsHeading}</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>{c.scorecard.terms.lcp}</li>
          <li>{c.scorecard.terms.cls}</li>
          <li>{c.scorecard.terms.tbt}</li>
          <li>{c.scorecard.terms.csp}</li>
        </ul>
        <p className="mt-3">{c.scorecard.lighthouse}</p>
        <p className="mt-2 text-sm text-muted">{c.scorecard.rounding}</p>
        <Scorecard lang={lang} />
      </section>

      <section id="findings" aria-labelledby="findings-title" className="mt-16">
        <SectionTitle id="findings-title">{c.findings.heading}</SectionTitle>
        {c.findings.intro.map((p) => (
          <p key={p} className="mt-4">
            {p}
          </p>
        ))}
        <h3 className="mt-6 text-xl">{c.findings.rubricHeading}</h3>
        <dl className="mt-2 space-y-2">
          {SEVERITY_ORDER.map((sev) => (
            <div key={sev} className="flex flex-wrap items-baseline gap-x-2">
              <dt className="shrink-0 font-semibold">{c.findings.severity[sev]}:</dt>
              <dd>{c.findings.rubric[sev]}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 space-y-6">
          {findings.map((f) => (
            <FindingCard key={f.id} finding={f} lang={lang} />
          ))}
        </div>
      </section>

      <section id="planted" aria-labelledby="planted-title" className="mt-16">
        <SectionTitle id="planted-title">{c.planted.heading}</SectionTitle>
        <PlantedVsFound lang={lang} />
      </section>

      <Method lang={lang} />
    </div>
  );
}
