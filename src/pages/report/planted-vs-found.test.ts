import { describe, expect, it } from "vitest";
import { findings as published, type Finding } from "../../../audit/findings";
import planted from "../../../audit/planted-issues.json";
import { plantedVsFound, qaOrManualOnly } from "./planted-vs-found";

const copy = { title: "", what: "", why: "", fix: "" };
const make = (id: Finding["id"], plantedId: Finding["planted"], evidence: string[], evidenceFiles: string[] = []): Finding => ({
  id,
  severity: "medie",
  area: "qa",
  pages: "all",
  planted: plantedId,
  evidence,
  evidenceFiles,
  screenshots: [],
  status: "fixed",
  fixCommit: "abc1234",
  wontFix: null,
  text: { ro: copy, en: copy },
});

describe("plantedVsFound", () => {
  it("splits planted issues into caught by tools, caught only by QA, and not caught", () => {
    const fs = [
      make("F-01", "P-01", ["pages.acasa.lighthouse.lcpMs"]),
      make("F-02", "P-06", ["qa.failures.9", "qa.failures.44"]),
    ];
    const answerKey = [{ id: "P-01" }, { id: "P-06" }, { id: "P-12" }];
    expect(plantedVsFound(answerKey, fs, qaOrManualOnly(fs))).toEqual({
      caughtByTools: ["P-01"],
      caughtOnlyByQaOrManual: ["P-06"],
      notCaught: ["P-12"],
      unplanted: [],
    });
  });

  it("lists findings nobody planted", () => {
    const fs = [make("F-17", null, ["qa.failures.23"])];
    expect(plantedVsFound([], fs, []).unplanted).toEqual(["F-17"]);
  });

  it("treats evidence from manual.md as manual-only", () => {
    expect(qaOrManualOnly([make("F-03", "P-03", ["pages.acasa.axe.rules"], ["manual.md"])])).toEqual(["F-03"]);
    expect(qaOrManualOnly([make("F-03", "P-03", ["pages.acasa.axe.rules", "qa.failures.0"])])).toEqual([]);
  });

  it("on the published data: P-05 and P-15 land with the QA-only catches, and nothing is missed", () => {
    const result = plantedVsFound(planted, published, qaOrManualOnly(published));
    expect(result.caughtOnlyByQaOrManual).toEqual(["P-05", "P-06", "P-07", "P-08", "P-15"]);
    expect(result.caughtByTools).toEqual(["P-01", "P-02", "P-03", "P-04", "P-09", "P-10", "P-11", "P-12", "P-13", "P-14"]);
    expect(result.notCaught).toEqual([]);
    expect(result.unplanted).toEqual(["F-07", "F-17", "F-18"]);
  });
});
