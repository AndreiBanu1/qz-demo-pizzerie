import { restaurant } from "../content/restaurant";
import { openStatus, openStatusText } from "../lib/hours";

export default function OpeningStatus() {
  const status = openStatus(restaurant.hours, new Date(), "UTC"); // PLANTED P-08: UTC instead of Bucharest time
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
