import { restaurant } from "../content/restaurant";

export default function CallButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={restaurant.phoneHref}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-tomato px-6 py-3.5 text-base font-semibold text-white shadow-[0_3px_0_#7a2410] transition-colors hover:bg-tomato-dark focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
      </svg>
      Sună acum
    </a>
  );
}
