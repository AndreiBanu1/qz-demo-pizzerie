import { describe, expect, it } from "vitest";
import { leftoverMarkers } from "./verify-no-planted.mjs";

describe("leftoverMarkers", () => {
  it("is empty when no file carries a marker", () => {
    expect(leftoverMarkers([{ path: "a.tsx", text: "const x = 1;" }])).toEqual([]);
  });

  it("lists each leftover id with its paths", () => {
    const left = leftoverMarkers([
      { path: "vite.config.ts", text: "// PLANTED P-14" },
      { path: "public/_headers", text: "# PLANTED P-13" },
    ]);
    expect(left).toEqual([
      ["P-14", ["vite.config.ts"]],
      ["P-13", ["public/_headers"]],
    ]);
  });
});
