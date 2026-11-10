import { Link, NavLink } from "react-router-dom";
import { restaurant } from "../content/restaurant";
import CatLogo from "./CatLogo";

const navLink = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center rounded-full px-3.5 py-2 text-[15px] font-semibold transition-colors ${
    isActive ? "bg-ink text-cream" : "text-ink hover:bg-ink/5"
  }`;

export default function Header() {
  return (
    <header className="bg-cream">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5 rounded-lg">
          <CatLogo />
          <span className="font-display text-xl font-semibold leading-none tracking-tight">
            {restaurant.name}
          </span>
        </Link>
        <nav aria-label="Principal">
          <ul className="flex items-center gap-1">
            <li>
              <NavLink to="/meniu" className={navLink}>
                Meniu
              </NavLink>
            </li>
            <li>
              <NavLink to="/rezervare" className={navLink}>
                Rezervă
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="gingham h-3.5" aria-hidden="true" />
    </header>
  );
}
