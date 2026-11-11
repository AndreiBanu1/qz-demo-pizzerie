import { describe, expect, it } from "vitest";
import { median3 } from "./median.mjs";

describe("median3", () => {
  it("returns the middle value", () => {
    expect(median3([3, 1, 2])).toBe(2);
  });
  it("handles ties", () => {
    expect(median3([5, 5, 9])).toBe(5);
  });
  it("throws unless given exactly 3 values", () => {
    expect(() => median3([1, 2])).toThrow("need exactly 3 runs");
    expect(() => median3([1, 2, 3, 4])).toThrow("need exactly 3 runs");
  });
});
