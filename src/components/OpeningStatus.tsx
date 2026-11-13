import { useEffect, useState } from "react";
import { restaurant } from "../content/restaurant";
import { openStatus, openStatusText, type OpenStatus as Status } from "../lib/hours";

export default function OpeningStatus() {
  // The status depends on the visitor's clock, so it is worked out after the page loads.
  // The prerendered HTML has the weekly hours table and no status text, so hydration finds no mismatch.
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    setStatus(openStatus(restaurant.hours, new Date(), restaurant.timeZone));
  }, []);

  if (!status) return <div className="h-8" aria-hidden="true" />;
  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium shadow-sm ring-1 ring-ink/10">
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 rounded-full ${status.open ? "bg-basil" : "bg-tomato"}`}
      />
      {openStatusText(status)}
    </p>
  );
}
