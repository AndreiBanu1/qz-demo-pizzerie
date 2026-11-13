import type { Day, DayHours } from "../content/restaurant";

export type OpenStatus =
  | { open: true; closesAt: string }
  | { open: false; opensAt: string; opensDay: string };

const WEEKDAYS_RO = ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Wall-clock weekday and minutes since midnight in `timeZone`, never the machine's zone. */
function wallClock(now: Date, timeZone: string): { day: Day; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = WEEKDAYS_EN.indexOf(get("weekday")) as Day;
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function openStatus(hours: Record<Day, DayHours>, now: Date, timeZone: string): OpenStatus {
  const { day, minutes } = wallClock(now, timeZone);
  const today = hours[day];
  if (today) {
    if (minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
      return { open: true, closesAt: today.close };
    }
    if (minutes < toMinutes(today.open)) {
      return { open: false, opensAt: today.open, opensDay: "azi" };
    }
  }
  for (let ahead = 1; ahead <= 7; ahead++) {
    const next = ((day + ahead) % 7) as Day;
    const h = hours[next];
    if (h) {
      return { open: false, opensAt: h.open, opensDay: ahead === 1 ? "mâine" : WEEKDAYS_RO[next] };
    }
  }
  throw new Error("No opening hours defined for any day");
}

export function openStatusText(s: OpenStatus): string {
  return s.open
    ? `Deschis acum, până la ${s.closesAt}`
    : `Închis, deschidem ${s.opensDay} la ${s.opensAt}`;
}

/**
 * Today's calendar day in Bucharest, as a date built with the local constructor, so that
 * `checkRoDate` (which reads local getters) sees the same day a person in Bucharest sees.
 */
export function bucharestToday(now: Date): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(get("year"), get("month") - 1, get("day"));
}
