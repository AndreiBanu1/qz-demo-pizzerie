import type { Summary } from "./summary-schema";

/** Throws `unknown evidence key: <key>` for a missing path; returns null for a present null. */
export function getEvidence(summary: Summary, key: string): unknown;
