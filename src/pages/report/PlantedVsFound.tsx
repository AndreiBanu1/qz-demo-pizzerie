// Spec §8 part 4: the answer key against the findings. The lists come from plantedVsFound(); nothing is filtered out.
import { restaurant } from "../../content/restaurant";
import { copy, type Lang } from "./copy";
import { before, findings, getEvidence, num, planted } from "./data";
import { axeRuleName } from "./evidence-view";
import { PAGES } from "./metrics";
import { plantedVsFound, qaOrManualOnly } from "./planted-vs-found";
import { tapLink } from "./parts";

const findingFor = (plantedId: string) => findings.find((f) => f.planted === plantedId);

/**
 * For a planted issue only the Playwright tests caught, a note on the tool the answer key expected
 * (`expectedDetector` in planted-issues.json), from the before run's own numbers: what axe found on the
 * finding's pages, or how many addresses linkinator followed.
 */
function notes(plantedId: string, lang: Lang): string[] {
  const c = copy[lang];
  const expected = planted.find((p) => p.id === plantedId)?.expectedDetector ?? "";
  const f = findingFor(plantedId);
  const out: string[] = [];
  if (f && /\baxe\b/.test(expected)) {
    for (const page of f.pages === "all" ? PAGES : f.pages) {
      const rules = getEvidence(before, `pages.${page}.axe.rules`) as string[];
      const names = rules.length ? rules.map((r) => axeRuleName(r, c)).join(", ") : c.evidence.none;
      out.push(c.planted.notes.axeMissed({ page: c.evidence.page[page], rules: names }));
    }
    if (/placeholder/i.test(expected)) out.push(c.planted.notes.placeholderName);
  }
  if (/linkinator/i.test(expected) && before.links.broken.length === 0) {
    out.push(c.planted.notes.linkinatorMissed({ checked: String(num(before, "links.checked")) }));
  }
  return out;
}

function Item({ plantedId, lang, withNotes = false }: { plantedId: string; lang: Lang; withNotes?: boolean }) {
  const f = findingFor(plantedId);
  const extra = withNotes ? notes(plantedId, lang) : [];
  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <div className="pt-2.5">
        <span className="font-mono text-sm font-semibold text-muted">{plantedId}</span> <span>{f ? f.text[lang].title : null}</span>
        {extra.length > 0 && <p className="mt-1 text-sm text-muted">{extra.join(" ")}</p>}
      </div>
      {f && (
        <a href={`#${f.id}`} className={`${tapLink} shrink-0 font-mono text-sm`}>
          {f.id}
        </a>
      )}
    </li>
  );
}

export default function PlantedVsFound({ lang }: { lang: Lang }) {
  const c = copy[lang].planted;
  const r = plantedVsFound(planted, findings, qaOrManualOnly(findings));
  const list = (ids: string[], withNotes = false) => (
    <ul className="mt-2 divide-y divide-ink/10">
      {ids.map((id) => (
        <Item key={id} plantedId={id} lang={lang} withNotes={withNotes} />
      ))}
    </ul>
  );
  const box = "mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5 md:p-7";

  return (
    <>
      <p className="mt-4">{c.intro({ count: String(planted.length) })}</p>
      <p className="mt-2">
        <a href={`${restaurant.repoUrl}/blob/main/audit/planted-issues.json`} className={`${tapLink} -ml-3`}>
          {c.answerKey}
        </a>
      </p>

      <div className={box}>
        <h3 className="text-2xl">{c.tools.heading}</h3>
        <p className="mt-1 text-sm text-muted">{c.tools.about}</p>
        {list(r.caughtByTools)}
      </div>

      <div className={box}>
        <h3 className="text-2xl">{c.qaOnly.heading}</h3>
        <p className="mt-1 text-sm text-muted">{c.qaOnly.about}</p>
        {list(r.caughtOnlyByQaOrManual, true)}
      </div>

      <div className={box}>
        <h3 className="text-2xl">{c.notCaught.heading}</h3>
        <p className="mt-1 text-sm text-muted">{c.notCaught.about}</p>
        {r.notCaught.length ? list(r.notCaught) : <p className="mt-2 font-medium">{c.notCaught.empty}</p>}
      </div>

      <div className={box}>
        <h3 className="text-2xl">{c.unplanted.heading}</h3>
        <p className="mt-1 text-sm text-muted">{c.unplanted.about}</p>
        <ul className="mt-2 divide-y divide-ink/10">
          {r.unplanted.map((id) => {
            const f = findings.find((x) => x.id === id)!;
            return (
              <li key={id} className="flex items-start justify-between gap-3 py-2">
                <span className="pt-2.5">{f.text[lang].title}</span>
                <a href={`#${f.id}`} className={`${tapLink} shrink-0 font-mono text-sm`}>
                  {f.id}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
