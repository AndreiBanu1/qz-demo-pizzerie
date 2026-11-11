import { cpSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateFindings, type Finding } from "./findings";
import planted from "./planted-issues.json";
import { summarize } from "./summarize.mjs";

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
