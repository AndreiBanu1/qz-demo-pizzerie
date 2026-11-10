import { describe, expect, it } from "vitest";
import { versionInfo } from "./write-version.mjs";

describe("versionInfo", () => {
  it("reads commit and branch from the Netlify env vars", () => {
    expect(
      versionInfo({ COMMIT_REF: "abc123", BRANCH: "before" }, () => "2026-11-10T10:00:00.000Z"),
    ).toEqual({ commit: "abc123", branch: "before", builtAt: "2026-11-10T10:00:00.000Z" });
  });
});
