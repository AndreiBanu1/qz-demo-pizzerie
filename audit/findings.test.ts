import { cpSync, existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findings, indexIdentity, isIndexKey, stillPresentInAfter, validateFindings, type Finding } from "./findings";
import type { Summary } from "./summary-schema";
import planted from "./planted-issues.json";
import { getEvidence, summarize } from "./summarize.mjs";

const dir = mkdtempSync(join(tmpdir(), "findings-"));
cpSync(new URL("./fixtures/run-complete", import.meta.url).pathname, dir, { recursive: true });
const before = summarize(dir);

const text = { title: "Titlu", what: "Ce", why: "De ce", fix: "Reparatie" };
const en = { title: "Title", what: "What", why: "Why", fix: "Fix" };

function make(over: Partial<Finding> = {}): Finding {
  return {
    id: "F-01",
    severity: "mare",
    area: "speed",
    pages: "all",
    planted: "P-01",
    evidence: ["pages.acasa.lighthouse.performance"],
    evidenceFiles: [],
    screenshots: [],
    status: "fixed",
    fixCommit: "abc1234",
    wontFix: null,
    text: { ro: { ...text }, en: { ...en } },
    ...over,
  };
}

const run = (fs: Finding[]) => validateFindings(fs, before, planted);
// The after summary: the same shape, with everything fixed.
const after: Summary = {
  ...before,
  target: "after",
  qa: { ...before.qa, failures: [] },
  security: { ...before.security, exposed: [] },
};
const runAfter = (fs: Finding[], a: Summary = after) => validateFindings(fs, before, planted, a);

describe("validateFindings", () => {
  it("accepts a valid finding", () => {
    expect(run([make()])).toEqual([]);
  });

  it("reports a finding with no evidence, naming its id", () => {
    const msgs = run([make({ id: "F-07", evidence: [] })]);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain("F-07");
    expect(msgs[0]).toContain("no evidence");
  });

  it("reports an unknown evidence key", () => {
    const msgs = run([make({ evidence: ["pages.acasa.nope"] })]);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain("F-01");
    expect(msgs[0]).toContain("unknown evidence key");
    expect(msgs[0]).toContain("pages.acasa.nope");
  });

  it("reports cedilla diacritics in RO text", () => {
    const msgs = run([make({ text: { ro: { ...text, what: "Pagina ţine şi" }, en: { ...en } } })]);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain("F-01");
    expect(msgs[0]).toContain("diacritics");
  });

  it("does not flag comma-below diacritics", () => {
    expect(run([make({ text: { ro: { ...text, what: "Școală și țară" }, en: { ...en } } })])).toEqual([]);
  });

  it("reports a duplicate id", () => {
    const msgs = run([make(), make()]);
    expect(msgs.some((m) => m.includes("F-01") && m.includes("duplicate"))).toBe(true);
  });

  it("reports a planted id not in the answer key", () => {
    const msgs = run([make({ planted: "P-99" })]);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain("F-01");
    expect(msgs[0]).toContain("P-99");
  });

  it("accepts planted: null", () => {
    expect(run([make({ planted: null })])).toEqual([]);
  });

  it("reports empty text in each of the four fields, in RO and EN", () => {
    for (const lang of ["ro", "en"] as const) {
      for (const field of ["title", "what", "why", "fix"] as const) {
        const f = make();
        f.text[lang][field] = "  ";
        const msgs = run([f]);
        expect(msgs).toHaveLength(1);
        expect(msgs[0]).toContain("F-01");
        expect(msgs[0]).toContain(`text.${lang}.${field}`);
      }
    }
  });

  it("reports an id that is not F-NN", () => {
    for (const id of ["F-1", "F-001", "G-01", "F-ab"]) {
      const msgs = run([make({ id: id as Finding["id"] })]);
      expect(msgs.some((m) => m.includes(id) && m.includes("F-NN")), id).toBe(true);
    }
  });

  it("reports an invalid severity", () => {
    const msgs = run([make({ severity: "grava" as Finding["severity"] })]);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain("F-01");
    expect(msgs[0]).toContain("severity");
  });

  it("accepts a wontFix with both languages", () => {
    expect(run([make({ status: "wont-fix", fixCommit: null, wontFix: { ro: "Intenționat", en: "Deliberate" } })])).toEqual([]);
  });

  it("accepts a commitsNote with both languages next to alsoCommits", () => {
    expect(run([make({ alsoCommits: ["def5678"], commitsNote: { ro: "De ce", en: "Why" } })])).toEqual([]);
  });

  it("reports a commitsNote without alsoCommits, with an empty language, or with cedilla diacritics", () => {
    expect(run([make({ commitsNote: { ro: "De ce", en: "Why" } })])[0]).toContain("no alsoCommits");
    expect(run([make({ alsoCommits: ["def5678"], commitsNote: { ro: "De ce", en: " " } })])[0]).toContain("commitsNote.en is empty");
    expect(run([make({ alsoCommits: ["def5678"], commitsNote: { ro: "Aşa", en: "Why" } })])[0]).toContain("commitsNote.ro");
  });

  it("reports cedilla diacritics in wontFix.ro", () => {
    const msgs = run([make({ status: "wont-fix", fixCommit: null, wontFix: { ro: "Intenţionat", en: "Deliberate" } })]);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain("F-01");
    expect(msgs[0]).toContain("wontFix.ro");
  });

  it("reports a wontFix missing a language", () => {
    for (const wontFix of [{ ro: "Intenționat", en: "" }, { ro: " ", en: "Deliberate" }]) {
      const msgs = run([make({ status: "wont-fix", fixCommit: null, wontFix })]);
      expect(msgs).toHaveLength(1);
      expect(msgs[0]).toContain("F-01");
      expect(msgs[0]).toContain("wontFix");
    }
  });
});

describe("validateFindings, status and the after summary (R9, R55, R56)", () => {
  it("reports a finding with neither fixCommit nor wontFix", () => {
    const msgs = run([make({ fixCommit: null })]);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain("F-01");
    expect(msgs[0]).toContain("fixCommit");
  });

  it('accepts a finding with no fixCommit when its status is "not-fixed" (R9)', () => {
    expect(run([make({ fixCommit: null, status: "not-fixed" })])).toEqual([]);
  });

  it("reports an invalid status, and a status that contradicts wontFix", () => {
    expect(run([make({ status: "done" as Finding["status"] })])[0]).toContain("invalid status");
    expect(run([make({ status: "wont-fix" })])[0]).toContain("wontFix");
    expect(run([make({ wontFix: { ro: "Intenționat", en: "Deliberate" } })])[0]).toContain("wontFix");
  });

  it("accepts a valid finding against the after summary", () => {
    expect(runAfter([make()])).toEqual([]);
  });

  it("reports a scalar evidence key unknown to the after summary", () => {
    const broken = structuredClone(after);
    delete (broken.pages.acasa.lighthouse as Partial<Summary["pages"]["acasa"]["lighthouse"]>).lcpMs;
    const msgs = runAfter([make({ evidence: ["pages.acasa.lighthouse.lcpMs"] })], broken);
    expect(msgs).toEqual([expect.stringContaining("F-01")]);
    expect(msgs[0]).toContain("in the after summary");
  });

  it("does not look up index keys in the after summary", () => {
    const f = make({ evidence: ["qa.failures.0", "security.exposed.0.path"] });
    expect(run([f])).toEqual([]);
    expect(runAfter([f])).toEqual([]);
  });

  it("reports an index key that cannot be resolved in the before summary", () => {
    for (const key of ["qa.failures.99", "security.exposed.5.path"]) {
      const msgs = run([make({ evidence: [key] })]);
      expect(msgs).toHaveLength(1);
      expect(msgs[0]).toContain("F-01");
      expect(msgs[0]).toContain("before summary");
      expect(msgs[0]).toContain(key);
    }
  });

  it("matches an index key by identity in the after summary", () => {
    const moved: Summary = {
      ...after,
      qa: { ...after.qa, failures: [{ ...before.qa.failures[1] }, { ...before.qa.failures[0] }] },
      security: { ...after.security, exposed: [{ ...before.security.exposed[0] }] },
    };
    expect(indexIdentity(before, "qa.failures.0")).toContain(before.qa.failures[0].title);
    expect(stillPresentInAfter(before, moved, "qa.failures.0")).toBe(true);
    expect(stillPresentInAfter(before, moved, "security.exposed.0.path")).toBe(true);
    expect(stillPresentInAfter(before, after, "qa.failures.0")).toBe(false);
    expect(stillPresentInAfter(before, after, "security.exposed.0.status")).toBe(false);
  });
});

describe("the findings of the report's runs (audit/report-run.json)", () => {
  const reportRun = JSON.parse(readFileSync(new URL("./report-run.json", import.meta.url), "utf8")) as { before: string; after: string };
  const runDir = new URL(`./runs/${reportRun.before}/`, import.meta.url).pathname;
  const readSummary = (id: string) => JSON.parse(readFileSync(new URL(`./runs/${id}/summary.json`, import.meta.url), "utf8")) as Summary;
  const beforeSummary = readSummary(reportRun.before);
  const afterSummary = readSummary(reportRun.after);

  it("come from a before and an after run of the same date", () => {
    expect(beforeSummary.target).toBe("before");
    expect(afterSummary.target).toBe("after");
    expect(reportRun.before.slice(0, 10)).toBe(reportRun.after.slice(0, 10));
  });

  // The scorecard intro says: the same day, the same computer, the same tools.
  it("come from the same computer, Node and tool versions", () => {
    const meta = (id: string) => JSON.parse(readFileSync(new URL(`./runs/${id}/meta.json`, import.meta.url), "utf8"));
    const [b, a] = [meta(reportRun.before), meta(reportRun.after)];
    expect(a.machine).toBe(b.machine);
    expect(a.node).toBe(b.node);
    expect(a.tools).toEqual(b.tools);
    expect(afterSummary.tools).toEqual(beforeSummary.tools);
  });

  it("are valid against the real before and after summary.json", () => {
    expect(validateFindings(findings, beforeSummary, planted, afterSummary)).toEqual([]);
  });

  it("are numbered F-01… in severity order, critica first", () => {
    const order = ["critica", "mare", "medie", "mica"];
    findings.forEach((f, i) => expect(f.id).toBe(`F-${String(i + 1).padStart(2, "0")}`));
    const ranks = findings.map((f) => order.indexOf(f.severity));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("name raw files and screenshots that exist in the run dir", () => {
    for (const f of findings) {
      for (const file of f.evidenceFiles) expect(existsSync(join(runDir, file)), `${f.id} ${file}`).toBe(true);
      for (const file of f.screenshots) expect(existsSync(join(runDir, "screenshots", file)), `${f.id} ${file}`).toBe(true);
    }
  });

  it("point each qa.failures key at a failure of the matching spec", () => {
    const specs: Record<string, string[]> = {
      "F-01": ["no-sideways-scroll.spec.ts › rezervare", "reservation.spec.ts › inputs are at least 16 px"],
      "F-02": ["call.spec.ts", "keyboard.spec.ts"],
      "F-05": ["opening-status.spec.ts"],
      "F-08": ["axe.spec.ts › meniu"],
      "F-09": ["reservation.spec.ts › every field has a label", "reservation.spec.ts › a valid reservation"],
      "F-10": ["axe.spec.ts › acasa", "axe.spec.ts › rezervare"],
      "F-11": ["links.spec.ts"],
      "F-17": ["not-found.spec.ts"],
    };
    for (const f of findings) {
      for (const key of f.evidence.filter((k) => k.startsWith("qa.failures."))) {
        const { title } = getEvidence(beforeSummary, key) as { title: string };
        expect(specs[f.id]?.some((s) => title.startsWith(s)), `${f.id} ${key}: ${title}`).toBe(true);
      }
    }
  });

  it("give every planted issue in the answer key exactly one finding", () => {
    for (const { id } of planted) {
      expect(findings.filter((f) => f.planted === id).map((f) => f.id), id).toHaveLength(1);
    }
    expect(findings.filter((f) => f.planted !== null)).toHaveLength(planted.length);
  });

  it("point F-12 (P-02) at the render-blocking time of every page (R33)", () => {
    const f12 = findings.find((f) => f.id === "F-12");
    expect(f12?.planted).toBe("P-02");
    for (const page of ["acasa", "meniu", "rezervare"]) {
      expect(f12?.evidence).toContain(`pages.${page}.lighthouse.renderBlockingMs`);
    }
  });

  it("mark only the deliberate noindex as won't fix, with no fixCommit; every other finding has one", () => {
    expect(findings.filter((f) => f.wontFix !== null).map((f) => f.id)).toEqual(["F-07"]);
    expect(findings.filter((f) => f.status === "wont-fix").map((f) => f.id)).toEqual(["F-07"]);
    expect(findings.find((f) => f.id === "F-07")?.fixCommit).toBeNull();
    for (const f of findings.filter((f) => f.id !== "F-07")) expect(f.fixCommit, f.id).toMatch(/^[0-9a-f]{7}$/);
  });

  it("keep the earlier commit of F-15 as alsoCommits (R54)", () => {
    const f15 = findings.find((f) => f.id === "F-15");
    expect(f15?.fixCommit).toBe("bcb0a0f");
    expect(f15?.alsoCommits).toEqual(["a32b3db"]);
  });

  it("keep the deliberate noindex in place on the after site", () => {
    const f07 = findings.find((f) => f.id === "F-07");
    for (const key of f07?.evidence ?? []) {
      expect(getEvidence(afterSummary, key), key).toBe("noindex");
    }
  });

  // A finding is "fixed" only when the problem is gone in the after summary and every
  // scalar moved the right way. Each evidence key needs a rule, so a new key can't slip by.
  const SCORES = ["performance", "accessibility", "seo", "bestPractices"];
  const LOWER = ["lcpMs", "cls", "bytes", "renderBlockingMs", "tbtMs"];
  const GRADES = ["F", "E", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
  function movedRight(key: string, b: unknown, a: unknown): boolean {
    const last = key.split(".").pop() as string;
    if (key.includes(".lighthouse.")) {
      if (SCORES.includes(last)) return (a as number) > (b as number);
      if (LOWER.includes(last)) return (a as number) < (b as number);
    }
    if (key.endsWith(".axe.rules")) return (a as string[]).length < (b as string[]).length && (a as string[]).every((r) => (b as string[]).includes(r));
    if (key.endsWith(".seo.restaurantFieldsMissing")) return (a as string[]).length === 0 && (b as string[]).length > 0;
    if (key.endsWith(".seo.jsonLd.types")) return (a as string[]).length >= (b as string[]).length;
    if (key.endsWith(".seo.words")) return (a as number) > (b as number);
    if (key.endsWith(".seo.h1Count")) return a === 1;
    if (key.endsWith(".seo.title") || key.endsWith(".seo.description")) return typeof a === "string" && a.length > 0 && a !== "Home" && a !== b;
    if (key.endsWith(".seo.lang")) return a === "ro";
    if (key === "links.checked") return (a as number) > (b as number);
    if (key.includes(".headers.")) return last === "frameAncestors" ? a === true : typeof a === "string" && a.length > 0;
    if (key === "security.headersPresent" || key === "security.observatory.score") return (a as number) > (b as number);
    if (key === "security.observatory.grade") return GRADES.indexOf(a as string) > GRADES.indexOf(b as string);
    if (key.startsWith("security.npmAudit.")) return (a as number) <= (b as number);
    throw new Error(`no direction rule for evidence key ${key}`);
  }

  it('mark a finding "fixed" only when the after summary shows it', () => {
    for (const f of findings.filter((f) => f.status === "fixed")) {
      for (const key of f.evidence) {
        if (isIndexKey(key)) {
          expect(stillPresentInAfter(beforeSummary, afterSummary, key), `${f.id} ${key} is still there after`).toBe(false);
        } else {
          const b = getEvidence(beforeSummary, key);
          const a = getEvidence(afterSummary, key);
          expect(movedRight(key, b, a), `${f.id} ${key}: ${JSON.stringify(b)} -> ${JSON.stringify(a)}`).toBe(true);
        }
      }
    }
  });

  it('leave a finding marked "partly" or "not-fixed" only when something is still there', () => {
    for (const f of findings.filter((f) => f.status === "partly" || f.status === "not-fixed")) {
      const stillThere = f.evidence.some((key) =>
        isIndexKey(key)
          ? stillPresentInAfter(beforeSummary, afterSummary, key)
          : !movedRight(key, getEvidence(beforeSummary, key), getEvidence(afterSummary, key)),
      );
      expect(stillThere, f.id).toBe(true);
    }
  });
});
