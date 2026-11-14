import { beforeAll, describe, expect, it } from "vitest";
import { findings } from "../../../audit/findings";
import { copy } from "./copy";
import { after, before, loadSummaries } from "./data";
import { evidenceRows } from "./evidence-view";

// The report reads its summaries lazily, as on the page.
beforeAll(loadSummaries);

const rowsFor = (id: string, lang: "ro" | "en" = "ro") =>
  evidenceRows(findings.find((f) => f.id === id)!.evidence, before, after, copy[lang], lang);

describe("evidenceRows", () => {
  it("keeps every evidence key of every finding", () => {
    for (const f of findings) expect(rowsFor(f.id).flatMap((r) => r.keys).sort()).toEqual([...f.evidence].sort());
  });

  it("merges a failed test across devices into one row, and says it passes now", () => {
    const rows = rowsFor("F-11");
    expect(rows).toHaveLength(3);
    expect(rows[0].before).toBe("links.spec.ts › acasa: every internal link leads to a real page · iPhone 15, Pixel 7, calculator");
    expect(rows.every((r) => r.after === "trece acum")).toBe(true);
  });

  it("reads scalar values from both runs and formats Lighthouse metrics", () => {
    const lcp = rowsFor("F-04", "en").find((r) => r.keys[0] === "pages.acasa.lighthouse.lcpMs")!;
    expect(lcp).toMatchObject({ label: "Home: LCP (Lighthouse)", before: "15.0 s", after: "1.5 s" });
    const csp = rowsFor("F-15").find((r) => r.keys[0] === "pages.acasa.headers.content-security-policy")!;
    expect(csp.before).toBe("lipsește");
    expect(csp.after).toBe(after.pages.acasa.headers["content-security-policy"]);
  });

  it("follows an exposed file into the after run by its path", () => {
    expect(rowsFor("F-16").map((r) => r.after)).toEqual(["nu mai poate fi descărcat", "nu mai poate fi descărcat"]);
  });
});
