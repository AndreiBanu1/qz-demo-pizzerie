import { cpSync, existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findings, validateFindings, type Finding } from "./findings";
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
    fixCommit: null,
    wontFix: null,
    text: { ro: { ...text }, en: { ...en } },
    ...over,
  };
}

const run = (fs: Finding[]) => validateFindings(fs, before, planted);

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
    expect(run([make({ wontFix: { ro: "Intenționat", en: "Deliberate" } })])).toEqual([]);
  });

  it("reports a wontFix missing a language", () => {
    for (const wontFix of [{ ro: "Intenționat", en: "" }, { ro: " ", en: "Deliberate" }]) {
      const msgs = run([make({ wontFix })]);
      expect(msgs).toHaveLength(1);
      expect(msgs[0]).toContain("F-01");
      expect(msgs[0]).toContain("wontFix");
    }
  });
});

describe("the findings of the first run (2026-11-12-before)", () => {
  const runDir = new URL("./runs/2026-11-12-before/", import.meta.url).pathname;
  const beforeSummary = JSON.parse(readFileSync(join(runDir, "summary.json"), "utf8")) as Summary;

  it("are valid against the real summary.json", () => {
    expect(validateFindings(findings, beforeSummary, planted)).toEqual([]);
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

  it("mark only the deliberate noindex as won't fix, and leave every fixCommit empty", () => {
    expect(findings.filter((f) => f.wontFix !== null).map((f) => f.id)).toEqual(["F-07"]);
    expect(findings.every((f) => f.fixCommit === null)).toBe(true);
  });
});
