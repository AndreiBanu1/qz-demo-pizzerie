import type { Area, Finding } from "../../../audit/findings";

export type AreaColour = "rosu" | "galben" | "verde";

/** The five areas, in the order the report shows them. */
export const AREAS: readonly Area[] = ["speed", "accessibility", "qa", "seo", "security"];

/**
 * The colour of one area. Red when a finding there is critica or mare, yellow when one is medie,
 * green otherwise. "before" looks at every finding; "after" only at the ones still open
 * (status not "fixed", and a deliberate "wont-fix" left out).
 */
export function areaStatus(findings: Finding[], area: Area, which: "before" | "after"): AreaColour {
  const here = findings.filter(
    (f) => f.area === area && (which === "before" || (f.status !== "fixed" && f.status !== "wont-fix")),
  );
  if (here.some((f) => f.severity === "critica" || f.severity === "mare")) return "rosu";
  if (here.some((f) => f.severity === "medie")) return "galben";
  return "verde";
}
