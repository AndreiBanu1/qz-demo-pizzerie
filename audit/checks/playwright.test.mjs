import { describe, expect, it } from "vitest";
import { stripLocalPaths } from "./playwright.mjs";

const opts = { root: "/Users/someone/work/repo", home: "/Users/someone" };

describe("stripLocalPaths (R34)", () => {
  it("makes paths under the repo root repo-relative, in nested strings and keys", () => {
    const report = {
      config: { rootDir: "/Users/someone/work/repo/audit/qa", configFile: "/Users/someone/work/repo/audit/qa/playwright.config.ts" },
      suites: [{ file: "x.spec.ts", stack: "Error\n    at /Users/someone/work/repo/audit/qa/x.spec.ts:12:3" }],
      byPath: { "/Users/someone/work/repo/audit/runs/r/screenshots": 1 },
      count: 3,
      ok: true,
      none: null,
    };
    expect(stripLocalPaths(report, opts)).toEqual({
      config: { rootDir: "audit/qa", configFile: "audit/qa/playwright.config.ts" },
      suites: [{ file: "x.spec.ts", stack: "Error\n    at audit/qa/x.spec.ts:12:3" }],
      byPath: { "audit/runs/r/screenshots": 1 },
      count: 3,
      ok: true,
      none: null,
    });
  });

  it("turns the repo root itself into . and any other home path into ~", () => {
    expect(stripLocalPaths("cwd /Users/someone/work/repo", opts)).toBe("cwd .");
    expect(stripLocalPaths("/Users/someone/.cache/ms-playwright/webkit", opts)).toBe("~/.cache/ms-playwright/webkit");
    expect(stripLocalPaths("/Users/someone", opts)).toBe("~");
  });

  it("matches whole path segments only", () => {
    expect(stripLocalPaths("/Users/someone/work/repo-old/a.ts", opts)).toBe("~/work/repo-old/a.ts");
    expect(stripLocalPaths("/Users/someone2/x", opts)).toBe("/Users/someone2/x");
  });

  it("leaves no home path in the output", () => {
    const out = JSON.stringify(stripLocalPaths({ a: ["/Users/someone/work/repo/x", "/Users/someone/y"] }, opts));
    expect(out).not.toContain("/Users/someone");
  });
});
