import { describe, expect, it } from "vitest";
import { openStatus, openStatusText } from "./hours";
import { restaurant } from "../content/restaurant";

const TZ = "Europe/Bucharest";
const at = (iso: string, tz = TZ) => openStatus(restaurant.hours, new Date(iso), tz);

describe("openStatus", () => {
  it("is open at 22:30 on a Friday", () => {
    expect(at("2026-11-13T20:30:00Z")).toEqual({ open: true, closesAt: "23:00" });
  });
  it("is closed at 23:30 on a Friday and opens tomorrow", () => {
    expect(at("2026-11-13T21:30:00Z")).toEqual({ open: false, opensAt: "11:00", opensDay: "mâine" });
  });
  it("on Monday (closed all day) opens tomorrow", () => {
    expect(at("2026-11-16T10:00:00Z")).toEqual({ open: false, opensAt: "11:00", opensDay: "mâine" });
  });
  it("on Sunday after closing skips closed Monday and names Tuesday", () => {
    expect(at("2026-11-15T20:30:00Z")).toEqual({ open: false, opensAt: "11:00", opensDay: "marți" });
  });
  it("at 10:59 on a Tuesday opens today", () => {
    expect(at("2026-11-17T08:59:00Z")).toEqual({ open: false, opensAt: "11:00", opensDay: "azi" });
  });
  it("at 23:59 on a Saturday opens Sunday at 12:00", () => {
    expect(at("2026-11-14T21:59:00Z")).toEqual({ open: false, opensAt: "12:00", opensDay: "mâine" });
  });
  it("handles the autumn DST change day (2026-10-25)", () => {
    expect(at("2026-10-25T10:30:00Z")).toEqual({ open: true, closesAt: "22:00" });
  });
  it("handles the spring DST change day (2027-03-28)", () => {
    expect(at("2027-03-28T09:30:00Z")).toEqual({ open: true, closesAt: "22:00" });
  });
  it("treats midnight as a new day (Friday 23:59 -> Saturday 00:00 is closed, opens at 11:00 today)", () => {
    expect(at("2026-11-13T22:00:00Z")).toEqual({ open: false, opensAt: "11:00", opensDay: "azi" });
  });
  it("depends on the given time zone, not the machine (P-08)", () => {
    expect(at("2026-11-13T21:30:00Z", "UTC").open).toBe(true);
    expect(at("2026-11-13T21:30:00Z", "Europe/Bucharest").open).toBe(false);
  });
});

describe("openStatusText", () => {
  it("formats open", () => {
    expect(openStatusText({ open: true, closesAt: "23:00" })).toBe("Deschis acum, până la 23:00");
  });
  it("formats tomorrow", () => {
    expect(openStatusText({ open: false, opensAt: "11:00", opensDay: "mâine" })).toBe("Închis, deschidem mâine la 11:00");
  });
  it("formats a weekday", () => {
    expect(openStatusText({ open: false, opensAt: "11:00", opensDay: "marți" })).toBe("Închis, deschidem marți la 11:00");
  });
  it("formats today", () => {
    expect(openStatusText({ open: false, opensAt: "11:00", opensDay: "azi" })).toBe("Închis, deschidem azi la 11:00");
  });
});
