import { describe, it, expect } from "vitest";
import { mkdtempSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runAudit } from "./run.mjs";

const fetchImpl = async (url) => {
  if (!String(url).endsWith("/version.json")) throw new Error("unexpected " + url);
  return { ok: true, status: 200, json: async () => ({ commit: "abc", branch: "main" }) };
};
const now = () => new Date("2026-12-01T10:00:00Z");
const target = "before";

describe("runAudit", () => {
  it("runs checks, writes meta and summary", async () => {
    const runsRoot = mkdtempSync(join(tmpdir(), "runs-"));
    const calls = [];
    const checks = [
      async (ctx) => calls.push(["one", ctx.url, ctx.pages.length, ctx.meta.version]),
      async (ctx) => calls.push(["two", ctx.dir]),
    ];
    const summarized = [];
    const res = await runAudit(target, { checks, summarize: async (d) => summarized.push(d), now, fetchImpl, runsRoot });
    expect(res.exitCode).toBe(0);
    expect(calls).toHaveLength(2);
    expect(calls[0][3]).toEqual({ commit: "abc", branch: "main" });
    const dir = join(runsRoot, "2026-12-01-before");
    expect(summarized).toEqual([dir]);
    const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
    expect(meta.version).toEqual({ commit: "abc", branch: "main" });
    expect(meta.runId).toBe("2026-12-01-before");
    expect(meta.startedAt).toBeTruthy();
    expect(meta.finishedAt).toBeTruthy();
    expect(meta.failed).toBeUndefined();
    expect(Object.keys(meta.tools).sort()).toEqual(
      ["@axe-core/playwright", "@playwright/test", "lighthouse", "linkinator", "node-html-parser"],
    );
    expect(existsSync(join(dir, "manual.md"))).toBe(true);
  });

  it("writes summary.json via the summarizer (fake) and a second run gets a counter", async () => {
    const runsRoot = mkdtempSync(join(tmpdir(), "runs-"));
    const { writeFileSync } = await import("node:fs");
    const summarize = async (d) => writeFileSync(join(d, "summary.json"), "{}");
    await runAudit(target, { checks: [], summarize, now, fetchImpl, runsRoot });
    await runAudit(target, { checks: [], summarize, now, fetchImpl, runsRoot });
    expect(readdirSync(runsRoot).sort()).toEqual(["2026-12-01-before", "2026-12-01-before-2"]);
    expect(existsSync(join(runsRoot, "2026-12-01-before", "summary.json"))).toBe(true);
  });

  it("records the failure and writes no summary when a check throws", async () => {
    const runsRoot = mkdtempSync(join(tmpdir(), "runs-"));
    const boom = async () => { throw new Error("Observatory down"); };
    boom.checkPath = "checks/observatory.mjs";
    let summarized = false;
    const res = await runAudit(target, { checks: [boom], summarize: async () => { summarized = true; }, now, fetchImpl, runsRoot });
    expect(res.exitCode).toBe(1);
    expect(summarized).toBe(false);
    const dir = join(runsRoot, "2026-12-01-before");
    const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
    expect(meta.failed).toBe("checks/observatory.mjs: Observatory down");
    expect(existsSync(join(dir, "summary.json"))).toBe(false);
  });

  it("fails the run when version.json cannot be read", async () => {
    const runsRoot = mkdtempSync(join(tmpdir(), "runs-"));
    const bad = async () => ({ ok: false, status: 500, json: async () => ({}) });
    const res = await runAudit(target, { checks: [async () => {}], summarize: async () => {}, now, fetchImpl: bad, runsRoot });
    expect(res.exitCode).toBe(1);
    const meta = JSON.parse(readFileSync(join(runsRoot, "2026-12-01-before", "meta.json"), "utf8"));
    expect(meta.failed).toMatch(/version\.json/);
    expect(existsSync(join(runsRoot, "2026-12-01-before", "summary.json"))).toBe(false);
  });

  it("both: after is not run when before fails", async () => {
    const runsRoot = mkdtempSync(join(tmpdir(), "runs-"));
    const { runBoth } = await import("./run.mjs");
    const res = await runBoth({ checks: [async () => { throw new Error("x"); }], summarize: async () => {}, now, fetchImpl, runsRoot });
    expect(res.exitCode).toBe(1);
    expect(readdirSync(runsRoot)).toEqual(["2026-12-01-before"]);
  });
});
