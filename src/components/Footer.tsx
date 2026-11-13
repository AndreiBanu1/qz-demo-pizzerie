import { Link } from "react-router-dom";
import { restaurant } from "../content/restaurant";
import { WEEK } from "./HoursTable";

/** Days in a row with the same hours collapse into one line, e.g. „Marți–joi: 11:00–22:00”. */
function hoursSummary(): string[] {
  const groups: { first: string; last: string; text: string }[] = [];
  for (const { day, name } of WEEK) {
    const h = restaurant.hours[day];
    const text = h ? `${h.open}–${h.close}` : "închis";
    const prev = groups[groups.length - 1];
    if (prev && prev.text === text) prev.last = name;
    else groups.push({ first: name, last: name, text });
  }
  return groups.map((g) =>
    g.first === g.last ? `${g.first}: ${g.text}` : `${g.first}–${g.last.toLowerCase()}: ${g.text}`,
  );
}

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink text-cream">
      <div className="gingham h-3.5" aria-hidden="true" />
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold tracking-tight">{restaurant.name}</p>
          <p className="mt-2 text-cream/75">
            {restaurant.street}, {restaurant.town}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-sans font-semibold uppercase tracking-[0.14em] text-crust">Telefon</h2>
          <a href={restaurant.phoneHref} className="mt-2 inline-block py-1 font-medium underline underline-offset-4">
            {restaurant.phoneDisplay}
          </a>
          <h2 className="mt-6 text-sm font-sans font-semibold uppercase tracking-[0.14em] text-crust">Program</h2>
          <ul className="mt-2 space-y-1 text-cream/75">
            {hoursSummary().map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-sans font-semibold uppercase tracking-[0.14em] text-crust">Pe site</h2>
          <ul className="mt-1">
            <li>
              <Link to="/meniu" className="inline-block py-1.5 underline underline-offset-4">
                Meniu
              </Link>
            </li>
            <li>
              <Link to="/rezervare" className="inline-block py-1.5 underline underline-offset-4">
                Rezervă o masă
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-5xl px-4 py-4 text-xs text-cream/60">Fotografii: Pexels</p>
      </div>
    </footer>
  );
}
