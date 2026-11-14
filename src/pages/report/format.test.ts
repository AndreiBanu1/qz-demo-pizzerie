import { describe, expect, it } from "vitest";
import { direction, formatDiff, formatRunDate, formatValue, gradeDirection } from "./format";

describe("formatValue", () => {
  it("writes LCP in seconds with one decimal, with a decimal comma in Romanian", () => {
    expect(formatValue(15010.0925, "seconds", "ro")).toBe("15,0 s");
    expect(formatValue(783.608, "seconds", "en")).toBe("0.8 s");
  });

  it("rounds TBT to 10 ms, as Lighthouse shows it, and other times to whole ms", () => {
    expect(formatValue(4, "ms10", "ro")).toBe("0 ms");
    expect(formatValue(16, "ms10", "ro")).toBe("20 ms");
    expect(formatValue(828, "ms", "ro")).toBe("828 ms");
  });

  it("writes CLS with two decimals", () => {
    expect(formatValue(0.11423952872596208, "cls", "ro")).toBe("0,11");
    expect(formatValue(0, "cls", "en")).toBe("0.00");
  });

  it("writes page weight in MB from 1 MB up, otherwise whole kB", () => {
    expect(formatValue(23019227, "bytes", "ro")).toBe("23,0 MB");
    expect(formatValue(143405, "bytes", "ro")).toBe("143 kB");
  });
});

describe("formatDiff and direction", () => {
  it("signs the difference with + and a real minus", () => {
    expect(formatDiff(29, "score", "ro")).toBe("+29");
    expect(formatDiff(1504.834 - 15010.0925, "seconds", "ro")).toBe("−13,5 s");
    expect(formatDiff(143405 - 2742201, "bytes", "en")).toBe("−2.6 MB");
  });

  it("shows a difference that rounds to nothing as 0, and calls it the same", () => {
    expect(formatDiff(4, "ms10", "ro")).toBe("0 ms");
    expect(direction(4, "ms10", "ro", false)).toBe("same");
    expect(formatDiff(-0.001, "cls", "ro")).toBe("0,00");
  });

  it("judges better or worse by whether higher is better", () => {
    expect(direction(-13505, "seconds", "ro", false)).toBe("better");
    expect(direction(-4, "score", "ro", true)).toBe("worse");
  });

  it("orders Observatory grades", () => {
    expect(gradeDirection("C", "A+")).toBe("better");
    expect(gradeDirection("A+", "A")).toBe("worse");
    expect(gradeDirection("B", "B")).toBe("same");
  });
});

describe("formatRunDate", () => {
  it("gives the run start in Bucharest time", () => {
    const months = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "noi", "dec"];
    expect(formatRunDate("2026-11-14T05:54:31.883Z", months)).toBe("14 noi 2026, 07:54");
    expect(formatRunDate("2026-07-01T21:30:00Z", months)).toBe("2 iul 2026, 00:30");
  });
});
