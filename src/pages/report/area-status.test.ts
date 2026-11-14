import { describe, expect, it } from "vitest";
import { findings as published, type Finding } from "../../../audit/findings";
import { AREAS, areaStatus } from "./area-status";

const base: Finding = {
  id: "F-01",
  severity: "mare",
  area: "speed",
  pages: "all",
  planted: "P-01",
  evidence: ["pages.acasa.lighthouse.performance"],
  evidenceFiles: [],
  screenshots: [],
  status: "not-fixed",
  fixCommit: null,
  wontFix: null,
  text: { ro: { title: "", what: "", why: "", fix: "" }, en: { title: "", what: "", why: "", fix: "" } },
};
const make = (over: Partial<Finding>): Finding => ({ ...base, ...over });

describe("areaStatus", () => {
  it("is red before when a speed finding is mare, and green after once it is fixed", () => {
    expect(areaStatus([make({})], "speed", "before")).toBe("rosu");
    expect(areaStatus([make({ status: "fixed", fixCommit: "abc1234" })], "speed", "after")).toBe("verde");
  });

  it("is red for critica, yellow for medie, green for mica or nothing", () => {
    expect(areaStatus([make({ severity: "critica" })], "speed", "before")).toBe("rosu");
    expect(areaStatus([make({ severity: "medie" })], "speed", "before")).toBe("galben");
    expect(areaStatus([make({ severity: "mica" })], "speed", "before")).toBe("verde");
    expect(areaStatus([], "speed", "before")).toBe("verde");
  });

  it("only looks at the asked area", () => {
    expect(areaStatus([make({ area: "seo" })], "speed", "before")).toBe("verde");
  });

  it("after: counts partly and not-fixed findings, and leaves out won't-fix", () => {
    expect(areaStatus([make({ status: "partly" })], "speed", "after")).toBe("rosu");
    expect(areaStatus([make({ status: "not-fixed", severity: "medie" })], "speed", "after")).toBe("galben");
    expect(areaStatus([make({ status: "wont-fix", wontFix: { ro: "x", en: "x" } })], "speed", "after")).toBe("verde");
  });

  it("before: a won't-fix finding still counts (it was on the site)", () => {
    expect(areaStatus([make({ area: "seo", status: "wont-fix" })], "seo", "before")).toBe("rosu");
  });

  it("gives the published findings red or yellow before and green after in every area", () => {
    expect(AREAS.map((a) => areaStatus(published, a, "before"))).toEqual(["rosu", "rosu", "rosu", "rosu", "galben"]);
    expect(AREAS.map((a) => areaStatus(published, a, "after"))).toEqual(["verde", "verde", "verde", "verde", "verde"]);
  });
});
