// Small shared pieces of the report. Colours are Tailwind classes only: the site's CSP blocks style attributes.
import type { ReactNode } from "react";
import type { Severity, Status } from "../../../audit/findings";
import type { AreaColour } from "./area-status";
import type { Direction } from "./format";

/** A finding id inside running text, with a non-breaking hyphen so "F-17" never splits across lines. */
export const unbroken = (id: string) => id.replace("-", "\u2011");

/** A link that is a comfortable tap target: at least 44 px high. */
export const tapLink =
  "inline-flex min-h-11 items-center rounded-full px-3 font-semibold underline decoration-tomato/50 underline-offset-4 hover:decoration-tomato focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink";

/** A compact square link for raw files: 44 × 44 px at least. */
export const chipLink =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-ink/20 bg-cream px-3 text-sm font-semibold hover:border-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink";

export const colourClass: Record<AreaColour, string> = {
  rosu: "bg-tomato text-white",
  galben: "bg-crust text-ink",
  verde: "bg-basil text-white",
};

export const severityClass: Record<Severity, string> = {
  critica: "bg-tomato-dark text-white",
  mare: "bg-tomato text-white",
  medie: "bg-crust text-ink",
  mica: "bg-ink/10 text-ink",
};

export const statusClass: Record<Status, string> = {
  fixed: "bg-basil text-white",
  partly: "bg-crust text-ink",
  "not-fixed": "bg-tomato-dark text-white",
  "wont-fix": "bg-ink text-cream",
};

export const directionClass: Record<Direction, string> = {
  better: "text-basil",
  worse: "text-tomato-dark",
  same: "text-muted",
};

export function Badge({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${className}`}>{children}</span>;
}

/** A section heading with a small coloured rule, the report's one decoration. */
export function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-3xl leading-tight md:text-4xl">
      <span aria-hidden="true" className="mb-3 block h-1 w-12 rounded-full bg-tomato" />
      {children}
    </h2>
  );
}
