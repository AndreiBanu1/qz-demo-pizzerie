import { describe, expect, it } from "vitest";
import { findMarkers } from "./verify-planted.mjs";

describe("findMarkers", () => {
  it("maps each id to the paths that carry its marker", () => {
    const found = findMarkers([{ path: "a.tsx", text: "// PLANTED P-03\n<!-- PLANTED P-12 -->" }]);
    expect(found.get("P-03")).toEqual(["a.tsx"]);
    expect(found.get("P-12")).toEqual(["a.tsx"]);
  });

  it("lists a path once per id and collects several paths", () => {
    const found = findMarkers([
      { path: "a.tsx", text: "PLANTED P-01 and again PLANTED P-01" },
      { path: "b.tsx", text: "{/* PLANTED P-01, PLANTED P-03 */}" },
    ]);
    expect(found.get("P-01")).toEqual(["a.tsx", "b.tsx"]);
    expect(found.get("P-03")).toEqual(["b.tsx"]);
  });

  it("has no entry for an id without a marker", () => {
    expect(findMarkers([{ path: "a.tsx", text: "nothing here" }]).has("P-05")).toBe(false);
  });

  it("does not count PLANTED P-150 as P-15", () => {
    expect(findMarkers([{ path: "a.tsx", text: "// PLANTED P-150" }]).has("P-15")).toBe(false);
  });

  it("counts only the id that follows a PLANTED token", () => {
    const found = findMarkers([{ path: "a.tsx", text: "PLANTED P-01, P-03" }]);
    expect(found.has("P-01")).toBe(true);
    expect(found.has("P-03")).toBe(false);
  });
});
