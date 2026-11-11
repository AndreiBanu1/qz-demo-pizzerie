import { describe, expect, it } from "vitest";
import { headerReport } from "./headers.mjs";
import { isExposed } from "./exposure.mjs";
import { run as runObservatory } from "./observatory.mjs";

describe("headerReport", () => {
  it("reads the CSP, frame-ancestors, and nulls for missing headers", () => {
    const r = headerReport(new Headers({ "content-security-policy": "default-src 'self'; frame-ancestors 'none'" }));
    expect(r["content-security-policy"]).toBe("default-src 'self'; frame-ancestors 'none'");
    expect(r.frameAncestors).toBe(true);
    expect(r["x-content-type-options"]).toBeNull();
    expect(r["x-robots-tag"]).toBeNull();
    expect(r["access-control-allow-origin"]).toBeNull();
  });
  it("reports frameAncestors false without a CSP and records CORS", () => {
    const r = headerReport(new Headers({ "access-control-allow-origin": "*", "x-robots-tag": "noindex" }));
    expect(r.frameAncestors).toBe(false);
    expect(r["access-control-allow-origin"]).toBe("*");
    expect(r["x-robots-tag"]).toBe("noindex");
  });
});

describe("isExposed", () => {
  it("is false for a 200 SPA fallback", () => {
    expect(isExposed({ path: "/assets/a.js.map", status: 200, body: '<div id="root"></div>' })).toBe(false);
  });
  it("is true for a 200 JSON map", () => {
    expect(isExposed({ path: "/assets/a.js.map", status: 200, body: '{"version":3}' })).toBe(true);
  });
  it("is false for a 404", () => {
    expect(isExposed({ path: "/.env", status: 404, body: "nope" })).toBe(false);
  });
  it("is true for a 200 /.env without id=root", () => {
    expect(isExposed({ path: "/.env", status: 200, body: "SECRET=1" })).toBe(true);
  });
  it("is false for a 200 map that is not JSON", () => {
    expect(isExposed({ path: "/a.js.map", status: 200, body: "not json" })).toBe(false);
  });
});

describe("observatory host guard", () => {
  it("throws for a host that is not ours, without calling fetch", async () => {
    let called = false;
    const fetchFn = async () => { called = true; };
    await expect(runObservatory({ url: "https://example.com", dir: "/tmp/x", fetchFn })).rejects.toThrow(/not one of/);
    expect(called).toBe(false);
  });
});
