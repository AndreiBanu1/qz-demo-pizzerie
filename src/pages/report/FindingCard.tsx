// Spec §8 part 3: one finding with its evidence, raw files, screenshots, fix commit(s) and status.
import type { Finding } from "../../../audit/findings";
import { restaurant } from "../../content/restaurant";
import { copy, type Lang, type ReportCopy } from "./copy";
import { after, before } from "./data";
import { evidenceRows } from "./evidence-view";
import { Badge, chipLink, severityClass, statusClass } from "./parts";

/** Where Task 18 publishes a run's raw files. Each path segment is encoded (screenshot names hold ă, â). */
export const rawUrl = (runId: string, file: string) =>
  `/raport/date/${runId}/${file.split("/").map(encodeURIComponent).join("/")}`;

type FileGroup = { label: string; items: { text: string; aria: (run: string) => string; file: string }[] };

/** Lighthouse runs and axe devices of one page are grouped, so a finding with many files stays short. */
function groupFiles(files: string[], c: ReportCopy): FileGroup[] {
  const groups = new Map<string, FileGroup>();
  const add = (key: string, label: string, item: FileGroup["items"][number]) => {
    if (!groups.has(key)) groups.set(key, { label, items: [] });
    groups.get(key)!.items.push(item);
  };
  for (const file of files) {
    const lh = /^lighthouse-(\w+)-(\d+)\.json\.gz$/.exec(file);
    const axe = /^axe-(\w+)-([\w-]+)\.json\.gz$/.exec(file);
    if (lh) {
      const group = c.findings.rawGroup.lighthouse({ page: c.evidence.page[lh[1] as "acasa"] ?? lh[1] });
      add(`lh-${lh[1]}`, group, { text: lh[2], file, aria: (run) => c.findings.rawGroup.run({ n: lh[2], run, group }) });
    } else if (axe) {
      const group = c.findings.rawGroup.axe({ page: c.evidence.page[axe[1] as "acasa"] ?? axe[1] });
      const device = c.evidence.device[axe[2]] ?? axe[2];
      add(`axe-${axe[1]}`, group, { text: device, file, aria: (run) => c.findings.rawGroup.device({ device, run, group }) });
    } else {
      add(file, file, { text: "", file, aria: (run) => `${file}, ${run}` });
    }
  }
  return [...groups.values()];
}

function RawFiles({ files, c }: { files: string[]; c: ReportCopy }) {
  const runs = [
    { word: c.findings.run.before, id: before.runId },
    { word: c.findings.run.after, id: after.runId },
  ];
  return (
    <ul className="mt-2 space-y-3">
      {groupFiles(files, c).map((g) => (
        <li key={g.label}>
          <p className="text-sm font-medium [overflow-wrap:anywhere]">{g.label}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            {runs.map((run) => (
              <span key={run.id} className="flex flex-wrap items-center gap-1.5">
                {g.items.length > 1 || g.items[0].text ? (
                  <>
                    <span className="mr-1 text-xs uppercase tracking-wide text-muted">{run.word}</span>
                    {g.items.map((it) => (
                      <a key={it.file} href={rawUrl(run.id, it.file)} aria-label={it.aria(run.word.toLowerCase())} className={chipLink}>
                        {it.text}
                      </a>
                    ))}
                  </>
                ) : (
                  <a href={rawUrl(run.id, g.items[0].file)} aria-label={g.items[0].aria(run.word.toLowerCase())} className={chipLink}>
                    {run.word}
                  </a>
                )}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Screenshots({ shots, c }: { shots: string[]; c: ReportCopy }) {
  // Two shots from the same device get a running number, so every link reads differently.
  const base = shots.map((s) => {
    const device = /-(iphone-15|pixel-7|desktop)\//.exec(s)?.[1];
    return c.findings.screenshot({ device: device ? c.evidence.device[device] : s });
  });
  const labels = base.map((l, i) =>
    base.filter((x) => x === l).length > 1 ? `${l} · ${base.slice(0, i + 1).filter((x) => x === l).length}` : l,
  );
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {shots.map((s, i) => (
        <li key={s}>
          <a href={rawUrl(before.runId, `screenshots/${s}`)} className={chipLink}>
            {labels[i]}
          </a>
        </li>
      ))}
    </ul>
  );
}

const sub = "mt-5 text-sm font-sans font-semibold uppercase tracking-[0.12em] text-tomato-dark";

export default function FindingCard({ finding: f, lang }: { finding: Finding; lang: Lang }) {
  const c = copy[lang];
  const t = f.text[lang];
  const pages = f.pages === "all" ? c.findings.labels.allPages : f.pages.map((p) => c.evidence.page[p]).join(", ");
  const commits = [...(f.alsoCommits ?? []), ...(f.fixCommit ? [f.fixCommit] : [])];

  return (
    <article id={f.id} aria-labelledby={`${f.id}-titlu`} className="scroll-mt-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5 md:p-7">
      <p className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-semibold text-muted">{f.id}</span>
        <Badge className={severityClass[f.severity]}>
          <span className="sr-only">{c.findings.labels.severity}: </span>
          {c.findings.severity[f.severity]}
        </Badge>
        <Badge className={statusClass[f.status]}>
          <span className="sr-only">{c.findings.labels.status}: </span>
          {c.findings.status[f.status]}
        </Badge>
      </p>
      <h3 id={`${f.id}-titlu`} className="mt-3 text-2xl leading-snug">
        {t.title}
      </h3>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-muted">{c.findings.labels.area}</dt>
        <dd>{c.areas[f.area].name}</dd>
        <dt className="text-muted">{c.findings.labels.pages}</dt>
        <dd>{pages}</dd>
      </dl>

      <h4 className={sub}>{c.findings.labels.what}</h4>
      <p className="mt-1">{t.what}</p>
      <h4 className={sub}>{c.findings.labels.why}</h4>
      <p className="mt-1">{t.why}</p>
      <h4 className={sub}>{c.findings.labels.fix}</h4>
      <p className="mt-1">{t.fix}</p>

      <h4 className={sub}>{c.findings.labels.evidence}</h4>
      <ul className="mt-2 divide-y divide-ink/10 rounded-2xl bg-cream/60 px-4">
        {evidenceRows(f.evidence, before, after, c, lang).map((row) => (
          <li key={row.keys[0]} className="py-3 text-sm">
            <p className="font-medium">{row.label}</p>
            <p className="font-mono text-xs text-muted [overflow-wrap:anywhere]">{row.keys.join(", ")}</p>
            <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
              <dt className="text-muted">{c.findings.run.before}</dt>
              <dd className="[overflow-wrap:anywhere]">{row.before}</dd>
              <dt className="text-muted">{c.findings.run.after}</dt>
              <dd className="font-semibold [overflow-wrap:anywhere]">{row.after}</dd>
            </dl>
          </li>
        ))}
      </ul>

      <h4 className={sub}>{c.findings.labels.rawFiles}</h4>
      <RawFiles files={f.evidenceFiles} c={c} />

      {f.screenshots.length > 0 && (
        <>
          <h4 className={sub}>{c.findings.labels.screenshots}</h4>
          <Screenshots shots={f.screenshots} c={c} />
        </>
      )}

      {f.wontFix ? (
        <>
          <h4 className={sub}>{c.findings.labels.wontFix}</h4>
          <p className="mt-1">{f.wontFix[lang]}</p>
        </>
      ) : (
        commits.length > 0 && (
          <>
            <h4 className={sub}>{c.findings.labels.fixOnGitHub}</h4>
            {commits.length > 1 && <p className="mt-1 text-sm">{c.findings.labels.severalCommits}</p>}
            <ul className="mt-1 flex flex-wrap gap-2">
              {commits.map((sha) => (
                <li key={sha}>
                  <a href={`${restaurant.repoUrl}/commit/${sha}`} className={`${chipLink} font-mono`}>
                    {c.findings.commit({ sha })}
                  </a>
                </li>
              ))}
            </ul>
            {commits.length > 1 && f.commitsNote && <p className="mt-2 text-sm">{f.commitsNote[lang]}</p>}
          </>
        )
      )}
    </article>
  );
}
