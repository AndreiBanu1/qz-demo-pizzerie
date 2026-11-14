import { describe, expect, it } from "vitest";
import { shouldSkip } from "./links.mjs";

const origin = "https://pizza-mita.pages.dev";

describe("shouldSkip", () => {
  it("follows the site's own pages", () => {
    expect(shouldSkip(`${origin}/`, origin)).toBe(false);
    expect(shouldSkip(`${origin}/meniu`, origin)).toBe(false);
    expect(shouldSkip(`${origin}/rezervare#top`, origin)).toBe(false);
  });

  it("skips other hosts", () => {
    expect(shouldSkip("https://github.com/AndreiBanu1/qz-demo-pizzerie", origin)).toBe(true);
    expect(shouldSkip("https://pizza-mita-inainte.pages.dev/", origin)).toBe(true);
  });

  it("skips the audit report and its raw data", () => {
    expect(shouldSkip(`${origin}/raport`, origin)).toBe(true);
    expect(shouldSkip(`${origin}/raport/en`, origin)).toBe(true);
    expect(shouldSkip(`${origin}/raport/date/2026-11-14-after/summary.json`, origin)).toBe(true);
  });

  it("does not skip pages that only start with the same letters", () => {
    expect(shouldSkip(`${origin}/raportare`, origin)).toBe(false);
  });

  it("follows links it cannot parse, so linkinator reports them", () => {
    expect(shouldSkip("not a url", origin)).toBe(false);
  });
});
