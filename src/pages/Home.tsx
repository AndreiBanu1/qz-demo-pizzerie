import { Link } from "react-router-dom";
import CallButton from "../components/CallButton";
import HoursTable from "../components/HoursTable";
import OpeningStatus from "../components/OpeningStatus";
import TownMap from "../components/TownMap";
import { heroPhoto } from "../content/menu";
import { restaurant } from "../content/restaurant";

const secondaryButton =
  "inline-flex items-center justify-center rounded-full border-2 border-ink px-6 py-3 text-base font-semibold transition-colors hover:bg-ink hover:text-cream";

export default function Home() {
  return (
    <>
      <section className="mx-auto grid max-w-5xl gap-8 px-4 pb-12 pt-6 md:grid-cols-[1.05fr_1fr] md:items-center md:pt-14">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-tomato-dark">Pizzerie de cartier</p>
          <h1 className="mt-2 text-6xl leading-[0.95] md:text-7xl">{restaurant.name}</h1>
          <p className="mt-3 text-lg text-ink/80">Pizza la cuptor și paste, pe {restaurant.street}, în {restaurant.town}.</p>
          <div className="mt-4">
            <OpeningStatus />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <CallButton />
            <Link to="/meniu" className={secondaryButton}>
              Vezi meniul
            </Link>
          </div>
        </div>
        <div className="rounded-[1.75rem] bg-white p-2 shadow-xl shadow-ink/10 ring-1 ring-ink/5 md:rotate-1">
          {/* PLANTED P-01, PLANTED P-03: the full-size hero photo, with no alt, width, height or lazy loading */}
          <img src={`/img/${heroPhoto.file}`} className="block h-auto w-full rounded-[1.25rem]" />
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
          <h2 className="text-3xl">Program</h2>
          <p className="mt-1 text-muted">Luni ne odihnim. În restul săptămânii te așteptăm la masă.</p>
          <div className="mt-4">
            <HoursTable />
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
          <h2 className="text-3xl">Unde ne găsești</h2>
          <p className="mt-1 text-muted">
            {restaurant.street}, {restaurant.town}
          </p>
          <div className="mt-4">
            <TownMap />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-5xl px-4">
        <div className="flex flex-col gap-4 rounded-3xl bg-tomato px-6 py-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl">Vii cu prietenii?</h2>
            <p className="mt-1 text-white/90">Rezervă o masă și o pregătim pentru voi.</p>
          </div>
          <Link
            to="/rezervare"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-cream px-6 py-3 font-semibold text-ink transition-colors hover:bg-white"
          >
            Rezervă o masă
          </Link>
        </div>
      </section>
    </>
  );
}
