// How the report rounds and writes numbers. The same rule is used for a value and for its difference.
//   scores: whole numbers, as summary.json stores them (the median of 3 Lighthouse runs, already rounded)
//   LCP: seconds with one decimal, as Lighthouse shows it (15010 ms → 15,0 s)
//   TBT: milliseconds rounded to the nearest 10, as Lighthouse shows it (4 ms → 0 ms)
//   other times (render-blocking estimate): whole milliseconds
//   CLS: two decimals
//   page weight: decimal units, MB with one decimal from 1 MB up, otherwise whole kB (1 kB = 1000 bytes)
// Romanian uses a decimal comma, English a decimal point. Negative numbers get a real minus sign (−).
// Formatting is done by hand, not with Intl, so the server and every browser produce the same text.
import type { Lang } from "./copy";

export type Unit = "score" | "seconds" | "ms" | "ms10" | "cls" | "bytes" | "count";

const decimal = (s: string, lang: Lang) => (lang === "ro" ? s.replace(".", ",") : s);

/** The absolute value, rounded and with its unit. */
function magnitude(value: number, unit: Unit, lang: Lang): string {
  const v = Math.abs(value);
  switch (unit) {
    case "seconds":
      return `${decimal((v / 1000).toFixed(1), lang)} s`;
    case "ms":
      return `${Math.round(v)} ms`;
    case "ms10":
      return `${Math.round(v / 10) * 10} ms`;
    case "cls":
      return decimal(v.toFixed(2), lang);
    case "bytes":
      return v >= 1e6 ? `${decimal((v / 1e6).toFixed(1), lang)} MB` : `${Math.round(v / 1e3)} kB`;
    default:
      return String(Math.round(v));
  }
}

/** True when the value rounds to zero in its unit. */
function roundsToZero(value: number, unit: Unit, lang: Lang): boolean {
  return /^0([.,]0+)?( |$)/.test(magnitude(value, unit, lang));
}

export function formatValue(value: number, unit: Unit, lang: Lang): string {
  const m = magnitude(value, unit, lang);
  return value < 0 && !roundsToZero(value, unit, lang) ? `−${m}` : m;
}

/** after − before, signed: "+29", "−13,5 s"; "0" when it rounds to nothing. */
export function formatDiff(diff: number, unit: Unit, lang: Lang): string {
  if (roundsToZero(diff, unit, lang)) return magnitude(0, unit, lang);
  return `${diff > 0 ? "+" : "−"}${magnitude(diff, unit, lang)}`;
}

export type Direction = "better" | "worse" | "same";

/** Better or worse, judged on the rounded difference so the word always matches the number shown. */
export function direction(diff: number, unit: Unit, lang: Lang, higherIsBetter: boolean): Direction {
  if (roundsToZero(diff, unit, lang)) return "same";
  return diff > 0 === higherIsBetter ? "better" : "worse";
}

/** Mozilla HTTP Observatory grades, worst to best. */
const GRADES = ["F", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];

export function gradeDirection(before: string, after: string): Direction {
  const b = GRADES.indexOf(before);
  const a = GRADES.indexOf(after);
  if (b === -1 || a === -1 || a === b) return "same";
  return a > b ? "better" : "worse";
}

/** A run's start time in Bucharest time, as day, month name, year and HH:MM. */
export function formatRunDate(iso: string, months: readonly string[]): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${Number(get("day"))} ${months[Number(get("month")) - 1]} ${get("year")}, ${get("hour")}:${get("minute")}`;
}
