import { Link } from "react-router-dom";
import CallButton from "../components/CallButton";
import CategoryChips, { CATEGORIES } from "../components/CategoryChips";
import MenuItem from "../components/MenuItem";
import { menu } from "../content/menu";

export default function Menu() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="pb-4 pt-8">
        <h1 className="text-5xl md:text-6xl">Meniu</h1>
        <p className="mt-2 max-w-prose text-muted">Pizza la cuptor, paste, deserturi și ceva de băut. Prețurile sunt în lei.</p>
      </div>
      <CategoryChips />
      {CATEGORIES.map((c) => (
        <section key={c.id} id={c.id} aria-labelledby={`${c.id}-titlu`} className="scroll-mt-16 pt-8">
          <h2 id={`${c.id}-titlu`} className="text-3xl">
            {c.label}
          </h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {menu
              .filter((item) => item.category === c.label)
              .map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
          </ul>
        </section>
      ))}
      <section aria-labelledby="comanda-titlu" className="mt-12 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-ink/5">
        <h2 id="comanda-titlu" className="text-2xl">
          Ți-e deja foame?
        </h2>
        <p className="mt-1 text-muted">Sună-ne sau rezervă o masă.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <CallButton />
          <Link
            to="/rezervare"
            className="inline-flex items-center justify-center rounded-full border-2 border-ink px-6 py-3 font-semibold transition-colors hover:bg-ink hover:text-cream"
          >
            Rezervă o masă
          </Link>
        </div>
      </section>
    </div>
  );
}
