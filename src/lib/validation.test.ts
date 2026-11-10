import { describe, expect, it } from "vitest";
import { checkName, checkRoDate, checkRoPhone, timeSlots } from "./validation";

describe("checkRoPhone", () => {
  it.each(["0712 345 678", "0712.345.678", "+40 712 345 678", "0040712345678"])("accepts %s", (s) => {
    expect(checkRoPhone(s)).toEqual({ ok: true, value: "+40712345678" });
  });
  it("accepts a landline", () => {
    expect(checkRoPhone("021 123 4567")).toEqual({ ok: true, value: "+40211234567" });
  });
  it.each(["07123456789", "07a2345678", ""])("rejects %j with a Romanian message", (s) => {
    const r = checkRoPhone(s);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message.length).toBeGreaterThan(0);
  });
});

describe("checkRoDate", () => {
  const today = new Date(2026, 10, 10); // 2026-11-10
  it("accepts a valid date and returns ISO", () => {
    expect(checkRoDate("20.11.2026", today)).toEqual({ ok: true, value: "2026-11-20" });
  });
  it("accepts today", () => {
    expect(checkRoDate("10.11.2026", today)).toEqual({ ok: true, value: "2026-11-10" });
  });
  it.each([
    ["31.02.2027", "impossible"],
    ["09.11.2026", "past"],
    ["11.01.2027", "more than 60 days ahead"],
    ["16.11.2026", "Monday"],
    ["", "empty"],
    ["2026-11-20", "wrong format"],
  ])("rejects %s (%s)", (s) => {
    const r = checkRoDate(s, today);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message.length).toBeGreaterThan(0);
  });
});

describe("checkName", () => {
  it("trims and accepts 2-60 characters", () => {
    expect(checkName("  Ana ")).toEqual({ ok: true, value: "Ana" });
  });
  it("rejects too short and too long", () => {
    expect(checkName(" A ").ok).toBe(false);
    expect(checkName("x".repeat(61)).ok).toBe(false);
  });
});

describe("timeSlots", () => {
  it("lists half-hour slots until 1 h before closing", () => {
    const s = timeSlots({ open: "11:00", close: "23:00" });
    expect(s[0]).toBe("11:00");
    expect(s[s.length - 1]).toBe("22:00");
    expect(s).toHaveLength(23);
  });
});
