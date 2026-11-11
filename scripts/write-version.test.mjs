import { describe, expect, it } from "vitest";
import { versionInfo } from "./write-version.mjs";

describe("versionInfo", () => {
  it("reads commit and branch from the Cloudflare Pages env vars", () => {
    expect(
      versionInfo(
        { CF_PAGES_COMMIT_SHA: "abc123", CF_PAGES_BRANCH: "before" },
        () => "2026-11-10T10:00:00.000Z",
      ),
    ).toEqual({ commit: "abc123", branch: "before", builtAt: "2026-11-10T10:00:00.000Z" });
  });

  it("still reads the old COMMIT_REF and BRANCH env vars", () => {
    expect(
      versionInfo({ COMMIT_REF: "abc123", BRANCH: "before" }, () => "2026-11-10T10:00:00.000Z"),
    ).toEqual({ commit: "abc123", branch: "before", builtAt: "2026-11-10T10:00:00.000Z" });
  });
});
