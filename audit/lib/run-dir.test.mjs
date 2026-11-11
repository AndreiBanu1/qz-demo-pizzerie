import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runId, writeRaw, readRaw } from "./run-dir.mjs";

describe("runId", () => {
  it("builds date-target", () => {
    expect(runId("2026-12-01", "before", [])).toBe("2026-12-01-before");
  });
  it("adds a counter when the id exists", () => {
    expect(runId("2026-12-01", "before", ["2026-12-01-before"])).toBe("2026-12-01-before-2");
    expect(runId("2026-12-01", "before", ["2026-12-01-before", "2026-12-01-before-2"])).toBe("2026-12-01-before-3");
  });
  it("ignores other targets and dates", () => {
    expect(runId("2026-12-01", "after", ["2026-12-01-before"])).toBe("2026-12-01-after");
  });
});

describe("writeRaw/readRaw", () => {
  it("round-trips an object through .json.gz", () => {
    const dir = mkdtempSync(join(tmpdir(), "raw-"));
    const data = { a: 1, b: ["ș", "ț"], c: { d: null } };
    const file = writeRaw(dir, "sample", data);
    expect(file.endsWith("sample.json.gz")).toBe(true);
    expect(readRaw(dir, "sample")).toEqual(data);
  });
  it("creates nested directories", () => {
    const dir = mkdtempSync(join(tmpdir(), "raw-"));
    writeRaw(dir, "sub/x", [1]);
    expect(readRaw(dir, "sub/x")).toEqual([1]);
  });
});
