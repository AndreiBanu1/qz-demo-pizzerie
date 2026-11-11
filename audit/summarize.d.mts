import type { Summary } from "./summary-schema";

export function summarize(dir: string): Summary;
/** Throws `unknown evidence key: <key>` for a missing path; returns null for a present null. */
export function getEvidence(summary: Summary, key: string): unknown;
