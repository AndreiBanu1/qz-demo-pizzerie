import { describe, expect, it } from "vitest";
import { allStrings, copy, type ReportCopy } from "./copy";

/** Device names are the only digits copy.ts may hold; every figure arrives as a template argument. */
const ALLOWED = ["iPhone 15", "Pixel 7"];
const withoutAllowed = (s: string) => ALLOWED.reduce((acc, name) => acc.split(name).join(""), s);

function shape(v: unknown): unknown {
  if (typeof v === "function") return "fn";
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)]));
  return typeof v;
}

describe("report copy", () => {
  for (const lang of ["ro", "en"] as const) {
    it(`${lang}: types no number of its own`, () => {
      const withDigits = allStrings(copy[lang]).filter((s) => /\d/.test(withoutAllowed(s)));
      expect(withDigits).toEqual([]);
    });

    it(`${lang}: has no empty string`, () => {
      expect(allStrings(copy[lang]).filter((s) => s.trim() === "")).toEqual([]);
    });
  }

  it("uses comma-below ș/ț in Romanian, never the cedilla forms", () => {
    expect(allStrings(copy.ro).filter((s) => /[şţŞŢ]/.test(s))).toEqual([]);
  });

  it("has the same keys in both languages", () => {
    expect(shape(copy.en)).toEqual(shape(copy.ro));
  });

  it("explains LCP, CLS, TBT and CSP, and axe, each in one sentence", () => {
    for (const lang of ["ro", "en"] as const) {
      const c: ReportCopy = copy[lang];
      for (const [term, text] of [
        ["LCP", c.scorecard.terms.lcp],
        ["CLS", c.scorecard.terms.cls],
        ["TBT", c.scorecard.terms.tbt],
        ["CSP", c.scorecard.terms.csp],
        ["axe", c.summary.tiles.axe.explain],
      ]) {
        expect(text.startsWith(term), `${lang} ${term}`).toBe(true);
        expect(text.replace(/\.$/, "").includes(". "), `${lang} ${term} is one sentence`).toBe(false);
      }
    }
  });

  it("puts „de” before Romanian numbers from twenty on", () => {
    expect(copy.ro.summary.tiles.qa.outOf({ total: "80" })).toBe("din 80 de teste");
    expect(copy.ro.summary.tiles.qa.outOf({ total: "15" })).toBe("din 15 teste");
    expect(copy.ro.planted.intro({ count: "15" })).toContain("cele 15 probleme");
  });
});
