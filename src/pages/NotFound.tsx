import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p aria-hidden="true" className="font-display text-8xl font-semibold leading-none tracking-tight text-tomato">
        404
      </p>
      <h1 className="mt-4 text-4xl">Pagina nu există</h1>
      <p className="mt-3 text-muted">Poate s-a schimbat adresa sau s-a strecurat o greșeală de scriere. Hai înapoi la ceva bun.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-tomato px-6 py-3 font-semibold text-white transition-colors hover:bg-tomato-dark"
        >
          Înapoi la prima pagină
        </Link>
        <Link
          to="/meniu"
          className="inline-flex items-center justify-center rounded-full border-2 border-ink px-6 py-3 font-semibold transition-colors hover:bg-ink hover:text-cream"
        >
          Vezi meniul
        </Link>
      </div>
    </div>
  );
}
